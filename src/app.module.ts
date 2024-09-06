import { Module } from '@nestjs/common';
import { CoreModule } from './core/core.module';
import { StockModule } from './modules/stock/stock.module';

@Module({
  imports: [CoreModule, StockModule],
})
export class AppModule {}
