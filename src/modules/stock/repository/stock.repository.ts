import { Inject, Injectable } from '@nestjs/common';
import { Stock } from '../domain/Stock';
import { Prisma } from '@prisma/client';
import { PRISMA_CLIENT } from '@core/database/prisma.di-tokens';
import { PrismaService } from '@core/database/prisma.service';
import { StockMapper } from '../stock.mapper';

export type StockModel = Prisma.StockGetPayload<typeof validation>;
export type StockPayload = {
  stock_id: number;
  product_id: number;
  quantity: number;
  version: number;
};

const validation = Prisma.validator<Prisma.StockDefaultArgs>()({
  select: {
    id: true,
    productId: true,
    quantity: true,
    version: true,
     
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

  async findByIdWithPessimisticLock(id: number, prisma: Prisma.TransactionClient): Promise<Stock | null> {
    const stock: StockPayload[] =  await prisma
      .$queryRaw`SELECT * FROM stocks s WHERE s.stock_id = ${id} FOR UPDATE`;

    return stock.length ? StockMapper.rawQueryToDomain(stock[0]) : null;
  }

  async findByIdWithOptimisticLock(id: number): Promise<Stock | null> {
    const query = await this.prisma.stock.findUnique({
      where: { id }
    })

    return query ? StockMapper.toDomain(query) : null;
  }

  async update(stock: Stock): Promise<void> {
    await this.prisma.stock.update({
      where: { id: stock.id },
      data: StockMapper.toEntity(stock),
    });
  }

  async updateWithPessimisticLock(stock: Stock, prisma: Prisma.TransactionClient): Promise<void> {
    await prisma.stock.update({
      where: { id: stock.id },
      data: StockMapper.toEntity(stock),
    });
  }

  async updateWithOptimisticLock(stock: Stock): Promise<void> {
    const currentVersion = stock.getVersion();

    const result = await this.prisma.stock.updateMany({
      where: {
        id: stock.id,
        version: currentVersion,
      },
      data: {
        ...StockMapper.toEntity(stock),
        version: currentVersion + 1,
      },
    });

    if (result.count === 0) {
      throw new Error('Optimistic lock error')
    }
  }

  async create(stock: Stock): Promise<void> {
    await this.prisma.stock.create({
      data: StockMapper.toEntity(stock),
    });
  }

  async transaction<T>(
    fn: (prisma: Prisma.TransactionClient) => Promise<T>
  ): Promise<T> {
    return this.prisma.$transaction(fn, {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable
    });
  }
}
