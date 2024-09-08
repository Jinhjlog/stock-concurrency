interface Props {
  id: number;
  productId: number;
  quantity: number;
  version: number;
}

export class Stock implements Props {
  id: number;
  productId: number;
  quantity: number;
  version: number;

  constructor(props: Props) {
    this.id = props.id;
    this.productId = props.productId;
    this.quantity = props.quantity;
    this.version = props.version;
  }

  static create({
    id,
    productId,
    quantity,
    version,
  }: {
    id: number;
    productId: number;
    quantity: number;
    version: number;
  }): Stock {
    return new Stock({ id, productId, quantity, version });
  }

  getQuantity(): number {
    return this.quantity;
  }

  decrease(quantity: number): void {
    this.quantity -= quantity;
  }

  getVersion(): number {
    return this.version;
  }
}
