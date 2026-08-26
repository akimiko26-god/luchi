import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../shared/infrastructure/database/prisma.service';
import { LedgerApplicationService } from '../../../ledger/application/services/ledger-application.service';

@Injectable()
export class CabinetApplicationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ledgerService: LedgerApplicationService,
  ) {}

  async getOverview(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { userRoles: { include: { role: true } } },
    });
    if (!user) {
      return null;
    }

    const [balance, deedsDone, pendingDeeds, ordersCount, postsCount] = await Promise.all([
      this.ledgerService.getBalance(userId),
      this.prisma.deedSubmission.count({ where: { userId, status: 'APPROVED' } }),
      this.prisma.deedSubmission.count({ where: { userId, status: 'PENDING' } }),
      this.prisma.storeOrder.count({ where: { userId } }),
      this.prisma.post.count({ where: { authorId: userId, status: 'ACTIVE' } }),
    ]);

    const recentSubmissions = await this.prisma.deedSubmission.findMany({
      where: { userId },
      include: { task: true },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    return {
      id: user.id,
      email: user.email,
      username: user.username,
      displayName: user.displayName,
      bio: user.bio,
      city: user.city,
      country: user.country,
      level: user.level,
      experiencePoints: user.experiencePoints,
      roles: user.userRoles.map((row) => row.role.name),
      raysBalance: balance,
      stats: {
        deedsApproved: deedsDone,
        deedsPending: pendingDeeds,
        orders: ordersCount,
        posts: postsCount,
      },
      recentDeeds: recentSubmissions.map((row) => ({
        id: row.id,
        title: row.task.title,
        status: row.status,
        rewardAmount: row.rewardAmount,
        createdAt: row.createdAt.toISOString(),
      })),
    };
  }
}
