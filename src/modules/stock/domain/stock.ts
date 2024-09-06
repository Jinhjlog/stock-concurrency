interface Props {
  id: number;
  productId: number;
  quantity: number;
}

export class Stock implements Props {
  id: number;
  productId: number;
  quantity: number;

  constructor(props: Props) {
    this.id = props.id;
    this.productId = props.productId;
    this.quantity = props.quantity;
  }

  static create({
    id,
    productId,
    quantity,
  }: {
    id: number;
    productId: number;
    quantity: number;
  }): Stock {
    return new Stock({ id, productId, quantity });
  }

  getQuantity(): number {
    return this.quantity;
  }

  decrease(quantity: number): void {
    this.quantity -= quantity;
  }
}
