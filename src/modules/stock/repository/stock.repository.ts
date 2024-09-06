import { Inject, Injectable } from '@nestjs/common';
import { Stock } from '../domain/Stock';
import { Prisma } from '@prisma/client';
import { PRISMA_CLIENT } from '@core/database/prisma.di-tokens';
import { PrismaService } from '@core/database/prisma.service';
import { StockMapper } from '../stock.mapper';

export type StockModel = Prisma.StockGetPayload<typeof validation>;

const validation = Prisma.validator<Prisma.StockDefaultArgs>()({
  select: {
    id: true,
    productId: true,
    quantity: true,
  },
});

@Injectable()
export class StockRepository {
  constructor(@Inject(PRISMA_CLIENT) private readonly prisma: PrismaService) {}

  async findById(id: number): Promise<Stock | null> {
    const stock = await this.prisma.stock.findUnique({
      where: { id },
    });

    return stock ? StockMapper.toDomain(stock) : null;
  }

  async update(stock: Stock): Promise<void> {
    await this.prisma.stock.update({
      where: { id: stock.id },
      data: StockMapper.toEntity(stock),
    });
  }

  async save(stock: Stock): Promise<void> {
    await this.prisma.stock.create({
      data: StockMapper.toEntity(stock),
    });
  }
}
