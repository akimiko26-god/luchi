import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../shared/infrastructure/database/prisma.service';
import { LedgerApplicationService } from '../../../ledger/application/services/ledger-application.service';
import { InsufficientRaysException } from '../../../ledger/domain/exceptions/ledger.exceptions';
import { PurchaseDto } from '../dto/store.dto';

@Injectable()
export class StoreApplicationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ledgerService: LedgerApplicationService,
  ) {}

  async listProducts() {
    const products = await this.prisma.product.findMany({
      where: { status: 'ACTIVE' },
      orderBy: { priceRays: 'asc' },
    });
    return products.map((product) => ({
      id: product.id,
      name: product.name,
      description: product.description,
      imageEmoji: product.imageEmoji,
      imageUrl: product.imageUrl,
      priceRays: product.priceRays,
      stock: product.stock,
      productType: product.productType,
    }));
  }

  async purchase(userId: string, dto: PurchaseDto) {
    const product = await this.prisma.product.findUnique({ where: { id: dto.productId } });
    if (!product || product.status !== 'ACTIVE' || product.stock <= 0) {
      throw new NotFoundException('Product is unavailable');
    }

    const balance = await this.ledgerService.getBalance(userId);
    if (balance < product.priceRays) {
      throw new InsufficientRaysException();
    }

    const order = await this.prisma.storeOrder.create({
      data: {
        userId,
        status: 'PAID',
        totalRays: product.priceRays,
        items: {
          create: {
            productId: product.id,
            quantity: 1,
            priceRays: product.priceRays,
          },
        },
      },
    });

    const transactionId = await this.ledgerService.debitPurchase({
      userId,
      amount: product.priceRays,
      reason: `Покупка: ${product.name}`,
      sourceType: 'store_order',
      sourceId: order.id,
    });

    await this.prisma.$transaction([
      this.prisma.storeOrder.update({
        where: { id: order.id },
        data: { transactionId },
      }),
      this.prisma.product.update({
        where: { id: product.id },
        data: { stock: { decrement: 1 } },
      }),
    ]);

    return { id: order.id, totalRays: product.priceRays, productName: product.name };
  }

  async myOrders(userId: string) {
    const orders = await this.prisma.storeOrder.findMany({
      where: { userId },
      include: { items: { include: { product: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return orders.map((order) => ({
      id: order.id,
      status: order.status,
      totalRays: order.totalRays,
      createdAt: order.createdAt.toISOString(),
      items: order.items.map((item) => ({
        name: item.product.name,
        emoji: item.product.imageEmoji,
        priceRays: item.priceRays,
      })),
    }));
  }
}
