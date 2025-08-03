import { Module, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Module({
  providers: [PrismaClient],
  exports: [PrismaClient],
})
export class PrismaModule extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }
}