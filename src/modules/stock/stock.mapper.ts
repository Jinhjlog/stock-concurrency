import { StockModel } from './repository/stock.repository';
import { Stock } from './domain/Stock';

export class StockMapper {
  static toEntity(stock: Stock): StockModel {
    return {
      id: stock.id,
      productId: stock.productId,
      quantity: stock.quantity,
    };
  }

  static toDomain(payload: StockModel): Stock {
    return Stock.create({
      id: payload.id,
      productId: payload.productId,
      quantity: payload.quantity,
    });
  }
}
