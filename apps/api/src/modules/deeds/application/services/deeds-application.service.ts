import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../shared/infrastructure/database/prisma.service';
import { UserNotFoundException } from '../../../iam/domain/exceptions/iam.exceptions';
import { LedgerApplicationService } from '../../../ledger/application/services/ledger-application.service';
import {
  AttachmentRequiredException,
  BeneficiaryRequiredException,
  ConfirmationPendingException,
  TaskFullException,
} from '../../domain/exceptions/deeds.exceptions';
import { CreateTaskDto, ReviewDeedDto, SubmitDeedDto } from '../dto/deeds.dto';

@Injectable()
export class DeedsApplicationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ledgerService: LedgerApplicationService,
  ) {}

  async listTasks() {
    const tasks = await this.prisma.deedTask.findMany({
      where: { status: 'ACTIVE' },
      include: { category: true, organization: true },
      orderBy: { createdAt: 'desc' },
    });
    return tasks.map((task) => this.toTaskDto(task));
  }

  async getTask(id: string) {
    const task = await this.prisma.deedTask.findUnique({
      where: { id },
      include: { category: true, organization: true },
    });
    if (!task) {
      throw new NotFoundException('Task not found');
    }
    return this.toTaskDto(task);
  }

  async listCategories() {
    return this.prisma.deedCategory.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async createTask(createdBy: string, dto: CreateTaskDto) {
    const created = await this.prisma.deedTask.create({
      data: {
        title: dto.title,
        description: dto.description,
        categoryId: dto.categoryId,
        organizationId: dto.organizationId,
        rewardMin: dto.rewardMin,
        rewardMax: dto.rewardMax,
        locationCity: dto.locationCity,
        maxParticipants: dto.maxParticipants,
        createdBy,
      },
      include: { category: true, organization: true },
    });
    return this.toTaskDto(created);
  }

  async listMySubmissions(userId: string) {
    const rows = await this.prisma.deedSubmission.findMany({
      where: { userId },
      include: {
        task: { include: { category: true } },
        attachments: true,
        confirmations: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map((row) => this.toSubmissionDto(row));
  }

  async listPendingConfirmations(userId: string) {
    const rows = await this.prisma.beneficiaryConfirmation.findMany({
      where: { beneficiaryUserId: userId, status: 'PENDING' },
      include: {
        submission: {
          include: { task: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    const volunteerIds = [...new Set(rows.map((row) => row.submission.userId))];
    const volunteers = await this.prisma.user.findMany({
      where: { id: { in: volunteerIds } },
      select: { id: true, displayName: true, username: true },
    });
    const byId = new Map(volunteers.map((user) => [user.id, user]));
    return rows.map((row) => ({
      id: row.id,
      taskTitle: row.submission.task.title,
      taskId: row.submission.taskId,
      volunteer: byId.get(row.submission.userId) ?? {
        displayName: 'Волонтёр',
        username: 'user',
      },
      description: row.submission.description,
      createdAt: row.createdAt.toISOString(),
    }));
  }

  async respondConfirmation(userId: string, confirmationId: string, accept: boolean) {
    const row = await this.prisma.beneficiaryConfirmation.findUnique({
      where: { id: confirmationId },
    });
    if (!row || row.beneficiaryUserId !== userId) {
      throw new NotFoundException('Confirmation not found');
    }
    await this.prisma.beneficiaryConfirmation.update({
      where: { id: confirmationId },
      data: {
        status: accept ? 'CONFIRMED' : 'DENIED',
        respondedAt: new Date(),
      },
    });
    return { id: confirmationId, status: accept ? 'CONFIRMED' : 'DENIED' };
  }

  async submit(userId: string, dto: SubmitDeedDto) {
    if (dto.attachments.length === 0) {
      throw new AttachmentRequiredException();
    }
    if (dto.helpedUsernames.length === 0) {
      throw new BeneficiaryRequiredException();
    }

    const task = await this.prisma.deedTask.findUnique({ where: { id: dto.taskId } });
    if (!task || task.status !== 'ACTIVE') {
      throw new NotFoundException('Task not found');
    }
    if (task.maxParticipants != null && task.currentParticipants >= task.maxParticipants) {
      throw new TaskFullException();
    }

    const uniqueNames = [...new Set(dto.helpedUsernames.map((name) => name.trim().toLowerCase()).filter(Boolean))];
    const beneficiaries = await this.prisma.user.findMany({
      where: { username: { in: uniqueNames }, deletedAt: null },
    });
    if (beneficiaries.length === 0) {
      throw new UserNotFoundException();
    }

    const created = await this.prisma.$transaction(async (tx) => {
      const submission = await tx.deedSubmission.create({
        data: {
          taskId: dto.taskId,
          userId,
          description: dto.description.trim(),
          status: 'PENDING',
          attachments: {
            create: dto.attachments.map((file) => ({
              url: file.url,
              kind: file.kind,
              originalName: file.originalName,
              mimeType: file.mimeType ?? 'application/octet-stream',
            })),
          },
          confirmations: {
            create: beneficiaries.map((user) => ({
              beneficiaryUserId: user.id,
            })),
          },
        },
      });
      await tx.deedTask.update({
        where: { id: task.id },
        data: { currentParticipants: { increment: 1 } },
      });
      return submission;
    });

    return { id: created.id, status: created.status, taskId: created.taskId };
  }

  async listQueue() {
    const rows = await this.prisma.deedSubmission.findMany({
      where: { status: { in: ['PENDING', 'IN_REVIEW'] } },
      include: {
        task: { include: { category: true } },
        attachments: true,
        confirmations: true,
      },
      orderBy: { createdAt: 'asc' },
    });
    const userIds = [
      ...new Set([
        ...rows.map((row) => row.userId),
        ...rows.flatMap((row) => row.confirmations.map((item) => item.beneficiaryUserId)),
      ]),
    ];
    const users = await this.prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, displayName: true, username: true },
    });
    const byId = new Map(users.map((user) => [user.id, user]));
    return rows.map((row) => ({
      ...this.toSubmissionDto(row),
      user: byId.get(row.userId) ?? { id: row.userId, displayName: 'Участник', username: 'user' },
      confirmations: row.confirmations.map((item) => ({
        id: item.id,
        status: item.status,
        user: byId.get(item.beneficiaryUserId) ?? {
          displayName: 'Человек',
          username: 'user',
        },
      })),
    }));
  }

  async approve(submissionId: string, reviewerId: string, override = false) {
    const submission = await this.prisma.deedSubmission.findUnique({
      where: { id: submissionId },
      include: { task: true, confirmations: true },
    });
    if (!submission) {
      throw new NotFoundException('Submission not found');
    }
    if (submission.status === 'APPROVED') {
      return { id: submission.id, status: submission.status };
    }
    const confirmed = submission.confirmations.some((item) => item.status === 'CONFIRMED');
    if (!confirmed && !override) {
      throw new ConfirmationPendingException();
    }

    const reward = submission.task.rewardMin;
    const transactionId = await this.ledgerService.creditReward({
      userId: submission.userId,
      amount: reward,
      reason: `Доброе дело: ${submission.task.title}`,
      initiatedBy: reviewerId,
      sourceType: 'deed_submission',
      sourceId: submission.id,
    });

    await this.prisma.deedSubmission.update({
      where: { id: submissionId },
      data: {
        status: 'APPROVED',
        rewardAmount: reward,
        reviewedBy: reviewerId,
        reviewedAt: new Date(),
        transactionId,
      },
    });

    await this.prisma.user.update({
      where: { id: submission.userId },
      data: { experiencePoints: { increment: reward * 10 } },
    });

    return { id: submissionId, status: 'APPROVED', reward };
  }

  async reject(submissionId: string, reviewerId: string, dto: ReviewDeedDto) {
    const submission = await this.prisma.deedSubmission.findUnique({
      where: { id: submissionId },
    });
    if (!submission) {
      throw new NotFoundException('Submission not found');
    }
    await this.prisma.$transaction([
      this.prisma.deedSubmission.update({
        where: { id: submissionId },
        data: {
          status: 'REJECTED',
          reviewedBy: reviewerId,
          reviewedAt: new Date(),
          rejectionReason: dto.reason ?? 'Недостаточно подтверждения',
        },
      }),
      this.prisma.deedTask.updateMany({
        where: { id: submission.taskId, currentParticipants: { gt: 0 } },
        data: { currentParticipants: { decrement: 1 } },
      }),
    ]);
    return { id: submissionId, status: 'REJECTED' };
  }

  private toTaskDto(task: {
    id: string;
    title: string;
    description: string;
    rewardMin: number;
    rewardMax: number;
    locationCity: string | null;
    maxParticipants: number | null;
    currentParticipants: number;
    category: { name: string; icon: string | null; color: string | null };
    organization: { name: string } | null;
  }) {
    const spotsLeft =
      task.maxParticipants == null ? null : Math.max(task.maxParticipants - task.currentParticipants, 0);
    return {
      id: task.id,
      title: task.title,
      description: task.description,
      rewardMin: task.rewardMin,
      rewardMax: task.rewardMax,
      locationCity: task.locationCity,
      maxParticipants: task.maxParticipants,
      currentParticipants: task.currentParticipants,
      spotsLeft,
      url: `/deeds/${task.id}`,
      category: {
        name: task.category.name,
        icon: task.category.icon,
        color: task.category.color,
      },
      organization: task.organization?.name ?? 'ЛУЧИ',
    };
  }

  private toSubmissionDto(row: {
    id: string;
    taskId: string;
    status: string;
    description: string | null;
    rewardAmount: number | null;
    rejectionReason: string | null;
    createdAt: Date;
    task: { title: string; category: { name: string; icon: string | null } };
    attachments: Array<{ id: string; url: string; kind: string; originalName: string }>;
    confirmations: Array<{ status: string }>;
  }) {
    return {
      id: row.id,
      taskId: row.taskId,
      status: row.status,
      description: row.description,
      rewardAmount: row.rewardAmount,
      rejectionReason: row.rejectionReason,
      createdAt: row.createdAt.toISOString(),
      taskTitle: row.task.title,
      taskUrl: `/deeds/${row.taskId}`,
      category: row.task.category.name,
      icon: row.task.category.icon,
      attachments: row.attachments,
      confirmedCount: row.confirmations.filter((item) => item.status === 'CONFIRMED').length,
      pendingCount: row.confirmations.filter((item) => item.status === 'PENDING').length,
    };
  }
}
