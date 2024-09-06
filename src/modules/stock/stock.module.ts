import { Module } from '@nestjs/common';
import { StockService } from './stock.service';
import { STOCK_REPOSITORY } from './stock.di-tokens';
import { StockRepository } from './repository/stock.repository';

@Module({
  // imports: [],
  providers: [
    StockService,
    {
      provide: STOCK_REPOSITORY,
      useClass: StockRepository,
    },
  ],
})
export class StockModule {}
