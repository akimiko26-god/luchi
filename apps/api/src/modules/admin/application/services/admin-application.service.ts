import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../shared/infrastructure/database/prisma.service';
import { LedgerApplicationService } from '../../../ledger/application/services/ledger-application.service';
import { UpdateUserDto, UpsertOrganizationDto, UpsertProductDto } from '../dto/admin.dto';

const ACTIVITY_DAYS = 14;

@Injectable()
export class AdminApplicationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ledgerService: LedgerApplicationService,
  ) {}

  async getDashboard() {
    const [users, activeUsers, pendingDeeds, approvedDeeds, products, orders, reports] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { status: 'ACTIVE' } }),
      this.prisma.deedSubmission.count({ where: { status: 'PENDING' } }),
      this.prisma.deedSubmission.count({ where: { status: 'APPROVED' } }),
      this.prisma.product.count({ where: { status: 'ACTIVE' } }),
      this.prisma.storeOrder.count(),
      this.getReports(),
    ]);

    const systemBalance = await this.ledgerService.getBalance(
      '00000000-0000-0000-0000-000000000001',
      'SYSTEM',
    );

    const credited = await this.prisma.ledgerEntry.aggregate({
      where: { entryType: 'CREDIT', status: 'POSTED', account: { ownerType: 'USER' } },
      _sum: { amount: true },
    });

    return {
      users,
      activeUsers,
      pendingDeeds,
      approvedDeeds,
      products,
      orders,
      raysInCirculation: credited._sum.amount ?? 0,
      systemPoolBalance: systemBalance,
      charts: reports,
    };
  }

  async getReports() {
    const since = new Date();
    since.setDate(since.getDate() - (ACTIVITY_DAYS - 1));
    since.setHours(0, 0, 0, 0);

    const [deedsByStatus, categoryRows, raysByType, recentDeeds, recentCredits] = await Promise.all([
      this.prisma.deedSubmission.groupBy({
        by: ['status'],
        _count: { _all: true },
      }),
      this.prisma.deedSubmission.findMany({
        include: { task: { include: { category: true } } },
      }),
      this.prisma.ledgerTransaction.groupBy({
        by: ['transactionType'],
        _count: { _all: true },
      }),
      this.prisma.deedSubmission.findMany({
        where: { createdAt: { gte: since } },
        select: { createdAt: true, status: true },
      }),
      this.prisma.ledgerEntry.findMany({
        where: {
          entryType: 'CREDIT',
          status: 'POSTED',
          createdAt: { gte: since },
          account: { ownerType: 'USER' },
        },
        select: { amount: true, createdAt: true },
      }),
    ]);

    const categoryMap = new Map<string, number>();
    for (const row of categoryRows) {
      const name = row.task.category.name;
      categoryMap.set(name, (categoryMap.get(name) ?? 0) + 1);
    }

    const activity: Array<{ date: string; deeds: number; rays: number }> = [];
    for (let i = 0; i < ACTIVITY_DAYS; i += 1) {
      const day = new Date(since);
      day.setDate(since.getDate() + i);
      const key = day.toISOString().slice(0, 10);
      activity.push({
        date: key,
        deeds: recentDeeds.filter((item) => item.createdAt.toISOString().slice(0, 10) === key).length,
        rays: recentCredits
          .filter((item) => item.createdAt.toISOString().slice(0, 10) === key)
          .reduce((sum, item) => sum + item.amount, 0),
      });
    }

    return {
      deedsByStatus: deedsByStatus.map((row) => ({ label: row.status, value: row._count._all })),
      deedsByCategory: [...categoryMap.entries()].map(([label, value]) => ({ label, value })),
      raysByType: raysByType.map((row) => ({ label: row.transactionType, value: row._count._all })),
      activity,
    };
  }

  async listUsers() {
    const users = await this.prisma.user.findMany({
      include: { userRoles: { include: { role: true } } },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    const balances = await Promise.all(users.map((user) => this.ledgerService.getBalance(user.id)));

    return users.map((user, index) => ({
      id: user.id,
      email: user.email,
      username: user.username,
      displayName: user.displayName,
      city: user.city,
      status: user.status,
      level: user.level,
      roles: user.userRoles.map((row) => row.role.displayName),
      roleCodes: user.userRoles.map((row) => row.role.name),
      rays: balances[index],
      createdAt: user.createdAt.toISOString(),
    }));
  }

  async listRoles() {
    return this.prisma.role.findMany({
      where: { name: { not: 'guest' } },
      orderBy: { name: 'asc' },
      select: { id: true, name: true, displayName: true },
    });
  }

  async updateUser(userId: string, dto: UpdateUserDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (dto.status) {
      await this.prisma.user.update({
        where: { id: userId },
        data: { status: dto.status },
      });
    }

    if (dto.role) {
      const role = await this.prisma.role.findUnique({ where: { name: dto.role } });
      if (!role) {
        throw new NotFoundException('Role not found');
      }
      await this.prisma.$transaction([
        this.prisma.userRole.deleteMany({ where: { userId } }),
        this.prisma.userRole.create({
          data: { userId, roleId: role.id },
        }),
      ]);
    }

    return { id: userId, status: dto.status ?? user.status, role: dto.role };
  }

  async listOrganizations() {
    return this.prisma.organization.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async createOrganization(ownerUserId: string, dto: UpsertOrganizationDto) {
    return this.prisma.organization.create({
      data: {
        ownerUserId,
        name: dto.name.trim(),
        slug: dto.slug.trim().toLowerCase(),
        description: dto.description,
        city: dto.city,
        verificationStatus: dto.verificationStatus ?? 'VERIFIED',
      },
    });
  }

  async updateOrganization(id: string, dto: UpsertOrganizationDto) {
    const existing = await this.prisma.organization.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Organization not found');
    }
    return this.prisma.organization.update({
      where: { id },
      data: {
        name: dto.name.trim(),
        slug: dto.slug.trim().toLowerCase(),
        description: dto.description,
        city: dto.city,
        verificationStatus: dto.verificationStatus ?? existing.verificationStatus,
      },
    });
  }

  async listProducts() {
    return this.prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async createProduct(dto: UpsertProductDto) {
    return this.prisma.product.create({
      data: {
        name: dto.name.trim(),
        description: dto.description,
        imageEmoji: dto.imageEmoji,
        imageUrl: dto.imageUrl,
        priceRays: dto.priceRays,
        stock: dto.stock,
        productType: dto.productType ?? 'PHYSICAL',
        status: dto.status ?? 'ACTIVE',
      },
    });
  }

  async updateProduct(id: string, dto: UpsertProductDto) {
    const existing = await this.prisma.product.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Product not found');
    }
    return this.prisma.product.update({
      where: { id },
      data: {
        name: dto.name.trim(),
        description: dto.description,
        imageEmoji: dto.imageEmoji,
        imageUrl: dto.imageUrl,
        priceRays: dto.priceRays,
        stock: dto.stock,
        productType: dto.productType ?? existing.productType,
        status: dto.status ?? existing.status,
      },
    });
  }

  async listTransactions() {
    return this.ledgerService.listRecent(60);
  }
}
