import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { EventDto } from './dto/event.dto';
import { QueueService } from '../queue/queue.service';
import { EventsGateway } from './events.gateway';
import { PrismaClient, EventType, ClassificacaoTriagem, PatientStatusEnum } from '@prisma/client';
import { UpasService } from 'src/upa/upa.service';

@Injectable()
export class EventsService {
  private readonly logger = new Logger(EventsService.name);
  private prisma: PrismaClient;

  constructor(
    private upasService: UpasService,
    private queueService: QueueService,
    private eventsGateway: EventsGateway,
    prisma: PrismaClient
  ) {
    this.prisma = prisma;
  }

  async processEvent(eventDto: EventDto): Promise<void> {
    this.logger.log(`Processando evento: ${eventDto.event_type} para paciente ${eventDto.patient_id} na UPA ${eventDto.upa_id}`);

    // Verificar se a UPA existe
    await this.upasService.findByName(eventDto.upa_id);

    // Validar sequência de eventos
    await this.validateEventSequence(eventDto);

    // Salvar evento
    const event = await this.saveEvent(eventDto);

    // Atualizar status do paciente
    await this.updatePatientStatus(eventDto);

    // Emitir dados atualizados via WebSocket
    const queueData = await this.queueService.getUpaQueueData(eventDto.upa_id);
    this.eventsGateway.emitQueueUpdate(eventDto.upa_id, queueData);

    this.logger.log(`Evento processado com sucesso: ${event.id}`);
  }

  private async validateEventSequence(eventDto: EventDto): Promise<void> {
    const existingEvents = await this.prisma.patientEvent.findMany({
      where: {
        patient_id: eventDto.patient_id,
        upa_id: eventDto.upa_id,
      },
      orderBy: { timestamp: 'asc' },
    });

    const eventTimestamp = new Date(eventDto.timestamp);

    switch (eventDto.event_type) {
      case EventType.ENTRADA:
        // Verificar se já existe entrada para este paciente nesta UPA
        const existingEntrada = existingEvents.find(e => e.event_type === EventType.ENTRADA);
        if (existingEntrada) {
          throw new BadRequestException(
            `Paciente ${eventDto.patient_id} já possui evento de entrada na UPA ${eventDto.upa_id}`
          );
        }
        break;

      case EventType.TRIAGEM:
        // Deve existir evento de entrada
        const entradaEvent = existingEvents.find(e => e.event_type === EventType.ENTRADA);
        if (!entradaEvent) {
          throw new BadRequestException(
            `Evento de triagem requer evento de entrada prévio para paciente ${eventDto.patient_id}`
          );
        }

        // Triagem deve ser posterior à entrada
        if (eventTimestamp <= entradaEvent.timestamp) {
          throw new BadRequestException(
            'Evento de triagem deve ser posterior ao evento de entrada'
          );
        }

        // Verificar se já existe triagem
        const existingTriagem = existingEvents.find(e => e.event_type === EventType.TRIAGEM);
        if (existingTriagem) {
          throw new BadRequestException(
            `Paciente ${eventDto.patient_id} já possui evento de triagem na UPA ${eventDto.upa_id}`
          );
        }

        // Validar se classificação está presente
        if (!eventDto.classificacao) {
          throw new BadRequestException('Evento de triagem requer classificacao');
        }
        break;

      case EventType.ATENDIMENTO:
        // Deve existir evento de triagem
        const triagemEvent = existingEvents.find(e => e.event_type === EventType.TRIAGEM);
        if (!triagemEvent) {
          throw new BadRequestException(
            `Evento de atendimento requer evento de triagem prévio para paciente ${eventDto.patient_id}`
          );
        }

        // Atendimento deve ser posterior à triagem
        if (eventTimestamp <= triagemEvent.timestamp) {
          throw new BadRequestException(
            'Evento de atendimento deve ser posterior ao evento de triagem'
          );
        }

        // Verificar se já existe atendimento
        const existingAtendimento = existingEvents.find(e => e.event_type === EventType.ATENDIMENTO);
        if (existingAtendimento) {
          throw new BadRequestException(
            `Paciente ${eventDto.patient_id} já possui evento de atendimento na UPA ${eventDto.upa_id}`
          );
        }
        break;
    }
  }

  private async saveEvent(eventDto: EventDto) {
    return await this.prisma.patientEvent.create({
      data: {
        patient_id: eventDto.patient_id,
        upa_id: eventDto.upa_id,
        event_type: eventDto.event_type,
        bairro: eventDto.bairro,
        classificacao: eventDto.classificacao,
        timestamp: new Date(eventDto.timestamp),
      },
    });
  }

  private async updatePatientStatus(eventDto: EventDto): Promise<void> {
    let patientStatus = await this.prisma.patientStatus.findFirst({
      where: {
        patient_id: eventDto.patient_id,
        upa_id: eventDto.upa_id,
      },
    });

    const eventTimestamp = new Date(eventDto.timestamp);

    switch (eventDto.event_type) {
      case EventType.ENTRADA:
        await this.prisma.patientStatus.create({
          data: {
            patient_id: eventDto.patient_id,
            upa_id: eventDto.upa_id,
            bairro: eventDto.bairro,
            status: PatientStatusEnum.WAITING_TRIAGE,
            entrada_timestamp: eventTimestamp,
          },
        });
        break;

      case EventType.TRIAGEM:
        if (patientStatus && eventDto.classificacao) {
          await this.prisma.patientStatus.update({
            where: { id: patientStatus.id },
            data: {
              status: PatientStatusEnum.WAITING_CARE,
              classificacao: eventDto.classificacao,
              triagem_timestamp: eventTimestamp,
            },
          });
        }
        break;

      case EventType.ATENDIMENTO:
        if (patientStatus) {
          await this.prisma.patientStatus.update({
            where: { id: patientStatus.id },
            data: {
              status: PatientStatusEnum.COMPLETED,
              atendimento_timestamp: eventTimestamp,
            },
          });
        }
        break;
    }
  }

  async getEventHistory(patientId: string, upaId: string) {
    return await this.prisma.patientEvent.findMany({
      where: { patient_id: patientId, upa_id: upaId },
      orderBy: { timestamp: 'asc' },
    });
  }
}