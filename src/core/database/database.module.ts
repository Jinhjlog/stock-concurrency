import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { PRISMA_CLIENT } from './prisma.di-tokens';

const prismaService = {
  provide: PRISMA_CLIENT,
  useClass: PrismaService,
};

@Global()
@Module({
  providers: [prismaService],
  exports: [prismaService],
})
export class DatabaseModule {}
