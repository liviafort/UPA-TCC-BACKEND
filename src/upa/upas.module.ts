import { Module } from '@nestjs/common';
import { UpasService } from './upa.service';
import { UpasController } from './upa.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [UpasController],
  providers: [UpasService],
  exports: [UpasService],
})
export class UpasModule {}