import { Inject, Injectable } from '@nestjs/common';
import { STOCK_REPOSITORY } from './stock.di-tokens';
import { StockRepository } from './repository/stock.repository';

@Injectable()
export class StockOptimisticService {
  constructor(
    @Inject(STOCK_REPOSITORY) private readonly stockRepository: StockRepository,
  ) {}

  async decrease(id: number, quantity: number): Promise<void> {
    const stock = await this.stockRepository.findByIdWithOptimisticLock(id);

    if (!stock) {
      throw new Error('재고를 찾을 수 없습니다.');
    }

    stock.decrease(quantity);

    if (stock.getQuantity() < 0) {
      throw new Error('재고는 0개 미만으로 감소시킬 수 없습니다.');
    }

    await this.stockRepository.updateWithOptimisticLock(stock);
  }
}
