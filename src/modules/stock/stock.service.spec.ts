import { Test, TestingModule } from '@nestjs/testing';
import { StockRepository } from './repository/stock.repository';
import { StockService } from './stock.service';
import { PrismaClient } from '@prisma/client';
import { PrismaService } from '@core/database/prisma.service';
import { STOCK_REPOSITORY } from './stock.di-tokens';
import { PRISMA_CLIENT } from '@core/database/prisma.di-tokens';

describe('StockService', () => {
  let stockService: StockService;
  let prismaService: PrismaService;
  let stockRepository: StockRepository;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StockService,
        PrismaService,
        {
          provide: STOCK_REPOSITORY,
          useClass: StockRepository,
        },
        {
          provide: PRISMA_CLIENT,
          useValue: new PrismaClient({
            datasources: {
              db: {
                url: process.env.DATABASE_URL,
              },
            },
          }),
        },
      ],
    }).compile();

    stockService = module.get<StockService>(StockService);
    prismaService = module.get<PrismaService>(PrismaService);
    stockRepository = module.get<StockRepository>(STOCK_REPOSITORY);
  });

  afterAll(async () => {
    await prismaService.$disconnect();
  });

  beforeEach(async () => {
    await prismaService.product.create({
      data: {
        id: 1,
        name: '테스트 상품',
        stocks: {
          create: {
            id: 1,
            quantity: 100,
          },
        },
      },
    });
  });

  afterEach(async () => {
    await prismaService.stock.deleteMany();
    await prismaService.product.deleteMany();
  });

  describe('decrease', () => {
    it('존재하지 않은 상품은 재고를 감소시킬 수 없습니다.', async () => {
      // given
      const stockId = 99;
      const quantity = 1;

      // when & then
      expect(stockService.decrease(stockId, quantity)).rejects.toThrowError();
    });

    it('재고 감소를 동시에 100개를 요청합니다.(실패)', async () => {
      // given
      const stockId = 1;
      const quantity = 1;
      const decreaseRequests = Array.from(
        { length: 100 },
        () => () => stockService.decrease(stockId, quantity),
      );

      // when
      await Promise.all(decreaseRequests.map((req) => req()));

      // then
      const stock = await stockRepository.findById(1);
      // 동시성 문제로 인해 목표 재고 수량에 도달하지 않습니다.
      expect(stock.getQuantity()).not.toEqual(0);
    });

    it('상품의 재고를 감소시킵니다.', async () => {
      // given
      const stockId = 1;
      const quantity = 1;

      // when
      await stockService.decrease(stockId, quantity);

      // then
      const stock = await stockRepository.findById(stockId);

      expect(stock.getQuantity()).toEqual(99);
    });
  });
});
