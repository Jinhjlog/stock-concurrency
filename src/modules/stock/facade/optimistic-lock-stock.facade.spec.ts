import { Test, TestingModule } from '@nestjs/testing';
import { PrismaClient } from '@prisma/client';
import { PrismaService } from '@core/database/prisma.service';
import { PRISMA_CLIENT } from '@core/database/prisma.di-tokens';
import { StockRepository } from '../repository/stock.repository';
import { STOCK_REPOSITORY } from '../stock.di-tokens';
import { OptimisticLockStockFacade } from './optimistic-lock-stock.facade';
import { StockOptimisticService } from '../stock-optimistic.service';

describe('StockService', () => {
  let optimisticLockStockFacade: OptimisticLockStockFacade;
  let stockOptimisticService: StockOptimisticService;
  let prismaService: PrismaService;
  let stockRepository: StockRepository;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StockOptimisticService,
        OptimisticLockStockFacade,
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

    stockOptimisticService = module.get<StockOptimisticService>(
      StockOptimisticService,
    );
    optimisticLockStockFacade =  new OptimisticLockStockFacade(stockOptimisticService);
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
    it('재고 감소를 동시에 100개를 요청합니다.', async () => {
      // given
      const stockId = 1;
      const quantity = 1;
      const decreaseRequests = Array.from(
        { length: 100 },
        () =>  optimisticLockStockFacade.decrease(stockId, quantity),
      );
      // when
      await Promise.all(decreaseRequests.map((request) => request));
      // then
      const stock = await stockRepository.findById(1);

      console.log(stock.getQuantity());

      expect(stock.getQuantity()).toEqual(0);
    });
  });
});
