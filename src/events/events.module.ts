import { Module } from '@nestjs/common';
import { EventsController } from './events.controller';
import { EventsGateway } from './events.gateway';
import { QueueModule } from '../queue/queue.module';
import { AuthModule } from '../auth/auth.module';
import { UpasModule } from '../upa/upas.module';
import { EventsService } from './events.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    QueueModule,
    UpasModule,
    AuthModule,
  ],
  controllers: [EventsController],
  providers: [EventsService, EventsGateway],
  exports: [EventsGateway, EventsService],
})
export class EventsModule {}