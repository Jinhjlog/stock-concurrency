import { Inject, Injectable } from "@nestjs/common";
import { StockOptimisticService } from "../stock-optimistic.service";

async function delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

@Injectable()
export class OptimisticLockStockFacade {
    constructor(
        private readonly stockOptimisticService: StockOptimisticService,
    ) {}

    async decrease(id: number, quantity: number): Promise<void> {
        while (true) {
            try {
                await this.stockOptimisticService.decrease(id, quantity);

                break;
            } catch (error) {
                console.log(error);
                await delay(50);
            }
        }
    }
}