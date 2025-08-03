import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { QueueService } from './queue.service';
import { UpaQueueDataDto } from './dto/queue-stats.dto';

@ApiTags('queue')
@Controller('queue')
export class QueueController {
  constructor(private readonly queueService: QueueService) {}

  @Get()
  @ApiOperation({ summary: 'Obter dados de filas de todas as UPAs' })
  @ApiResponse({ 
    status: 200, 
    description: 'Dados das filas de todas as UPAs',
    type: [UpaQueueDataDto]
  })
  async getAllQueues(): Promise<UpaQueueDataDto[]> {
    return await this.queueService.getAllUpasData();
  }

  @Get(':upaId')
  @ApiOperation({ summary: 'Obter dados da fila de uma UPA específica' })
  @ApiResponse({ 
    status: 200, 
    description: 'Dados da fila da UPA',
    type: UpaQueueDataDto
  })
  async getUpaQueue(@Param('upaId') upaId: string): Promise<UpaQueueDataDto> {
    return await this.queueService.getUpaQueueData(upaId);
  }

  @Get(':upaId/patient/:patientId')
  @ApiOperation({ summary: 'Obter status atual de um paciente' })
  async getPatientStatus(
    @Param('upaId') upaId: string,
    @Param('patientId') patientId: string,
  ) {
    return await this.queueService.getPatientCurrentStatus(patientId, upaId);
  }

  @Get(':upaId/statistics')
  @ApiOperation({ summary: 'Obter estatísticas de uma UPA' })
  @ApiQuery({ name: 'startDate', required: false, type: Date })
  @ApiQuery({ name: 'endDate', required: false, type: Date })
  async getUpaStatistics(
    @Param('upaId') upaId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    
    return await this.queueService.getUpaStatistics(upaId, start, end);
  }
}