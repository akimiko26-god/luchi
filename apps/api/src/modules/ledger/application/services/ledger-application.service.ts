import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { PrismaService } from '../../../../shared/infrastructure/database/prisma.service';
import { UserRepository } from '../../../iam/infrastructure/repositories/user.repository';
import {
  ACCOUNT_TYPE,
  ENTRY_TYPE,
  OWNER_TYPE,
  SYSTEM_OWNER_ID,
  TRANSACTION_STATUS,
  TRANSACTION_TYPE,
} from '../../domain/constants/ledger.constants';
import {
  AccountNotFoundException,
  InsufficientRaysException,
  InvalidRayAmountException,
  TransferToSelfException,
} from '../../domain/exceptions/ledger.exceptions';
import { UserNotFoundException } from '../../../iam/domain/exceptions/iam.exceptions';
import type { RayHistoryItem, RayWalletDto, TransferRaysDto } from '../dto/ledger.dto';

const HISTORY_LIMIT = 50;

@Injectable()
export class LedgerApplicationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly userRepository: UserRepository,
  ) {}

  async getBalance(ownerId: string, ownerType: string = OWNER_TYPE.USER): Promise<number> {
    const account = await this.findMainAccount(ownerId, ownerType);
    if (!account) {
      return 0;
    }
    return this.sumBalance(account.id);
  }

  async getWallet(userId: string): Promise<RayWalletDto> {
    const account = await this.requireMainAccount(userId, OWNER_TYPE.USER);
    const balance = await this.sumBalance(account.id);
    const entries = await this.prisma.ledgerEntry.findMany({
      where: { accountId: account.id, status: TRANSACTION_STATUS.POSTED },
      include: { transaction: true },
      orderBy: { createdAt: 'desc' },
      take: HISTORY_LIMIT,
    });

    const history: RayHistoryItem[] = entries.map((entry) => ({
      id: entry.transactionId,
      type: entry.transaction.transactionType,
      amount: entry.amount,
      direction: entry.entryType === ENTRY_TYPE.CREDIT ? 'in' : 'out',
      reason: entry.transaction.reason,
      createdAt: entry.createdAt.toISOString(),
    }));

    return { balance, history };
  }

  async transfer(fromUserId: string, dto: TransferRaysDto): Promise<RayWalletDto> {
    const recipient = await this.userRepository.findByUsername(dto.toUsername.toLowerCase());
    if (!recipient) {
      throw new UserNotFoundException();
    }
    if (recipient.id === fromUserId) {
      throw new TransferToSelfException();
    }

    await this.postDoubleEntry({
      type: TRANSACTION_TYPE.TRANSFER,
      amount: dto.amount,
      reason: dto.reason ?? `Перевод @${recipient.username}`,
      initiatedBy: fromUserId,
      debitOwnerId: fromUserId,
      debitOwnerType: OWNER_TYPE.USER,
      creditOwnerId: recipient.id,
      creditOwnerType: OWNER_TYPE.USER,
      sourceType: 'transfer',
    });

    return this.getWallet(fromUserId);
  }

  async creditReward(params: {
    userId: string;
    amount: number;
    reason: string;
    initiatedBy: string;
    sourceType: string;
    sourceId?: string;
  }): Promise<string> {
    return this.postDoubleEntry({
      type: TRANSACTION_TYPE.REWARD,
      amount: params.amount,
      reason: params.reason,
      initiatedBy: params.initiatedBy,
      debitOwnerId: SYSTEM_OWNER_ID,
      debitOwnerType: OWNER_TYPE.SYSTEM,
      creditOwnerId: params.userId,
      creditOwnerType: OWNER_TYPE.USER,
      sourceType: params.sourceType,
      sourceId: params.sourceId,
    });
  }

  async debitPurchase(params: {
    userId: string;
    amount: number;
    reason: string;
    sourceType: string;
    sourceId?: string;
  }): Promise<string> {
    return this.postDoubleEntry({
      type: TRANSACTION_TYPE.PURCHASE,
      amount: params.amount,
      reason: params.reason,
      initiatedBy: params.userId,
      debitOwnerId: params.userId,
      debitOwnerType: OWNER_TYPE.USER,
      creditOwnerId: SYSTEM_OWNER_ID,
      creditOwnerType: OWNER_TYPE.SYSTEM,
      sourceType: params.sourceType,
      sourceId: params.sourceId,
    });
  }

  async listRecent(limit = 40): Promise<
    Array<{
      id: string;
      type: string;
      reason: string;
      createdAt: string;
      initiatedBy: string;
      amount: number;
    }>
  > {
    const rows = await this.prisma.ledgerTransaction.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: { entries: true },
    });
    return rows.map((row) => ({
      id: row.id,
      type: row.transactionType,
      reason: row.reason,
      createdAt: row.createdAt.toISOString(),
      initiatedBy: row.initiatedBy,
      amount: row.entries.find((entry) => entry.entryType === ENTRY_TYPE.CREDIT)?.amount ?? 0,
    }));
  }

  private async postDoubleEntry(params: {
    type: string;
    amount: number;
    reason: string;
    initiatedBy: string;
    debitOwnerId: string;
    debitOwnerType: string;
    creditOwnerId: string;
    creditOwnerType: string;
    sourceType?: string;
    sourceId?: string;
  }): Promise<string> {
    if (!Number.isInteger(params.amount) || params.amount <= 0) {
      throw new InvalidRayAmountException();
    }

    const debitAccount = await this.requireMainAccount(params.debitOwnerId, params.debitOwnerType);
    const creditAccount = await this.requireMainAccount(params.creditOwnerId, params.creditOwnerType);

    if (params.debitOwnerType === OWNER_TYPE.USER) {
      const balance = await this.sumBalance(debitAccount.id);
      if (balance < params.amount) {
        throw new InsufficientRaysException();
      }
    }

    const transaction = await this.prisma.$transaction(async (tx) => {
      const created = await tx.ledgerTransaction.create({
        data: {
          idempotencyKey: randomUUID(),
          transactionType: params.type,
          status: TRANSACTION_STATUS.POSTED,
          reason: params.reason,
          sourceType: params.sourceType,
          sourceId: params.sourceId,
          initiatedBy: params.initiatedBy,
          postedAt: new Date(),
        },
      });

      await tx.ledgerEntry.createMany({
        data: [
          {
            transactionId: created.id,
            accountId: debitAccount.id,
            entryType: ENTRY_TYPE.DEBIT,
            amount: params.amount,
          },
          {
            transactionId: created.id,
            accountId: creditAccount.id,
            entryType: ENTRY_TYPE.CREDIT,
            amount: params.amount,
          },
        ],
      });

      return created;
    });

    return transaction.id;
  }

  private async sumBalance(accountId: string): Promise<number> {
    const [credits, debits] = await Promise.all([
      this.prisma.ledgerEntry.aggregate({
        where: { accountId, entryType: ENTRY_TYPE.CREDIT, status: TRANSACTION_STATUS.POSTED },
        _sum: { amount: true },
      }),
      this.prisma.ledgerEntry.aggregate({
        where: { accountId, entryType: ENTRY_TYPE.DEBIT, status: TRANSACTION_STATUS.POSTED },
        _sum: { amount: true },
      }),
    ]);
    return (credits._sum.amount ?? 0) - (debits._sum.amount ?? 0);
  }

  private async findMainAccount(ownerId: string, ownerType: string) {
    return this.prisma.account.findUnique({
      where: {
        ownerId_ownerType_accountType: {
          ownerId,
          ownerType,
          accountType: ACCOUNT_TYPE.MAIN,
        },
      },
    });
  }

  private async requireMainAccount(ownerId: string, ownerType: string) {
    const account = await this.findMainAccount(ownerId, ownerType);
    if (!account) {
      throw new AccountNotFoundException();
    }
    return account;
  }
}
