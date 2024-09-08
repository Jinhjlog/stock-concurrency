import { Test, TestingModule } from '@nestjs/testing';
import { StockRepository } from './repository/stock.repository';
import { StockService } from './stock.service';
import { PrismaClient } from '@prisma/client';
import { PrismaService } from '@core/database/prisma.service';
import { STOCK_REPOSITORY } from './stock.di-tokens';
import { PRISMA_CLIENT } from '@core/database/prisma.di-tokens';
import { StockPessimisticService } from './stock-pessimistic.service';

describe('StockService', () => {
  let stockPerssimisticService: StockPessimisticService;
  let prismaService: PrismaService;
  let stockRepository: StockRepository;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StockService,
        StockPessimisticService,
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

    stockPerssimisticService = module.get<StockPessimisticService>(
      StockPessimisticService,
    );
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
      expect(stockPerssimisticService.decrease(stockId, quantity)).rejects.toThrowError();
    });

    it('재고 감소를 동시에 100개를 요청합니다.', async () => {
      // given
      const stockId = 1;
      const quantity = 1;
      const decreaseRequests = Array.from(
        { length: 100 },
        () =>  stockPerssimisticService.decrease(stockId, quantity),
      );
      // when
      await Promise.all(decreaseRequests.map((request) => request));
      // then
      const stock = await stockRepository.findById(1);

      expect(stock.getQuantity()).toEqual(0);
    });

    it('상품의 재고를 감소시킵니다.', async () => {
      // given
      const stockId = 1;
      const quantity = 1;
      // when
      await stockPerssimisticService.decrease(stockId, quantity);
      // then
      const stock = await stockRepository.findById(stockId);
      expect(stock.getQuantity()).toEqual(99);
    });
  });
});
