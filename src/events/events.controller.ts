import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { EventsService } from './events.service';
import { EventDto } from './dto/event.dto';
import { AuthGuard } from '../auth/auth.guard';

@ApiTags('events')
@Controller('events')
@ApiBearerAuth()
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Receber evento de UPA' })
  @ApiResponse({ status: 200, description: 'Evento processado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos ou incompletos' })
  @ApiResponse({ status: 401, description: 'Token de acesso inválido ou ausente' })
  async receiveEvent(@Body() eventDto: EventDto) {
    await this.eventsService.processEvent(eventDto);
    return { message: 'Evento processado com sucesso' };
  }
}