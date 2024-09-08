import { StockModel, StockPayload } from './repository/stock.repository';
import { Stock } from './domain/Stock';

export class StockMapper {
  static toEntity(stock: Stock): StockModel {
    return {
      id: stock.id,
      productId: stock.productId,
      quantity: stock.quantity,
      version: stock.version,
    };
  }

  static rawQueryToDomain(payload: StockPayload): Stock {
    return Stock.create({
      id: payload.stock_id,
      productId: payload.product_id,
      quantity: payload.quantity,
      version: payload.version,
    });
  }

  static toDomain(payload: StockModel): Stock {
    return Stock.create({
      id: payload.id,
      productId: payload.productId,
      quantity: payload.quantity,
      version: payload.version,
    });
  }
}
