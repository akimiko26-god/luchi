import { Injectable } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { PrismaService } from '../../../../shared/infrastructure/database/prisma.service';

export type UserWithRoles = User & {
  userRoles: Array<{
    role: {
      name: string;
      rolePermissions: Array<{ permission: { code: string } }>;
    };
  }>;
};

@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findFirst({
      where: { email: email.toLowerCase(), deletedAt: null },
    });
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.prisma.user.findFirst({
      where: { username: username.toLowerCase(), deletedAt: null },
    });
  }

  async findById(id: string): Promise<UserWithRoles | null> {
    return this.prisma.user.findFirst({
      where: { id, deletedAt: null },
      include: {
        userRoles: {
          include: {
            role: {
              include: {
                rolePermissions: { include: { permission: true } },
              },
            },
          },
        },
      },
    });
  }

  async create(data: Prisma.UserCreateInput): Promise<User> {
    return this.prisma.user.create({ data });
  }

  async update(id: string, data: Prisma.UserUpdateInput): Promise<User> {
    return this.prisma.user.update({ where: { id }, data });
  }

  extractRoles(user: UserWithRoles): string[] {
    return user.userRoles.map((ur) => ur.role.name);
  }

  extractPermissions(user: UserWithRoles): string[] {
    const permissions = new Set<string>();
    for (const userRole of user.userRoles) {
      for (const rp of userRole.role.rolePermissions) {
        permissions.add(rp.permission.code);
      }
    }
    return [...permissions];
  }
}
