import { Injectable, Logger } from '@nestjs/common';
import { UpaQueueDataDto, ClassificacaoStatsDto } from './dto/queue-stats.dto';
import { PrismaClient, PatientStatusEnum, ClassificacaoTriagem } from '@prisma/client';

@Injectable()
export class QueueService {
  private readonly logger = new Logger(QueueService.name);
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async getUpaQueueData(upaId: string): Promise<UpaQueueDataDto> {
    this.logger.log(`Gerando dados da fila para UPA: ${upaId}`);

    // Buscar pacientes em espera
    const patientsInQueue = await this.prisma.patientStatus.findMany({
      where: {
        upa_id: upaId,
        status: {
          in: [PatientStatusEnum.WAITING_TRIAGE, PatientStatusEnum.WAITING_CARE],
        },
      },
    });

    // Estatísticas por classificação
    const classificacoes: ClassificacaoStatsDto = {
      verde: 0,
      amarelo: 0,
      laranja: 0,
      vermelho: 0,
      azul: 0,
      sem_triagem: 0,
    };

    let totalTempoEspera = 0;
    let totalTempoTriagem = 0;
    let countTempoTriagem = 0;
    const agora = new Date();
    const bairrosSet = new Set<string>();

    let aguardandoTriagem = 0;
    let aguardandoAtendimento = 0;

    patientsInQueue.forEach(patient => {
      // Contabilizar por status
      if (patient.status === PatientStatusEnum.WAITING_TRIAGE) {
        aguardandoTriagem++;
      } else if (patient.status === PatientStatusEnum.WAITING_CARE) {
        aguardandoAtendimento++;
      }

      // Contabilizar por classificação
      if (patient.classificacao) {
        classificacoes[patient.classificacao.toLowerCase() as keyof ClassificacaoStatsDto]++;
      } else {
        classificacoes.sem_triagem++;
      }

      // Tempo de espera (desde a entrada)
      if (patient.entrada_timestamp) {
        totalTempoEspera += agora.getTime() - patient.entrada_timestamp.getTime();
      }

      // Tempo de triagem (entrada até triagem)
      if (patient.triagem_timestamp && patient.entrada_timestamp) {
        totalTempoTriagem += patient.triagem_timestamp.getTime() - patient.entrada_timestamp.getTime();
        countTempoTriagem++;
      }

      // Bairros atendidos
      if (patient.bairro) {
        bairrosSet.add(patient.bairro);
      }
    });

    const totalPacientes = patientsInQueue.length;
    const tempoMedioEspera = totalPacientes > 0 
      ? Math.round(totalTempoEspera / totalPacientes / (1000 * 60)) 
      : 0;

    const tempoMedioTriagem = countTempoTriagem > 0
      ? Math.round(totalTempoTriagem / countTempoTriagem / (1000 * 60))
      : 0;

    // Determinar status de ocupação
    let statusOcupacao: 'baixa' | 'media' | 'alta' = 'baixa';
    if (totalPacientes > 30) {
      statusOcupacao = 'alta';
    } else if (totalPacientes > 15) {
      statusOcupacao = 'media';
    }

    const queueData: UpaQueueDataDto = {
      upa_id: upaId,
      total_pacientes: totalPacientes,
      aguardando_triagem: aguardandoTriagem,
      aguardando_atendimento: aguardandoAtendimento, 
      por_classificacao: classificacoes,
      tempo_medio_espera_minutos: tempoMedioEspera,
      tempo_medio_triagem_minutos: tempoMedioTriagem,
      status_ocupacao: statusOcupacao,
      ultima_atualizacao: new Date().toISOString(),
      bairros_atendidos: Array.from(bairrosSet).sort(),
    };

    this.logger.log(`Dados gerados para UPA ${upaId}: ${totalPacientes} pacientes`);
    return queueData;
  }

  async getAllUpasData(): Promise<UpaQueueDataDto[]> {
    // Buscar todas as UPAs que têm pacientes
    const upasWithPatients = await this.prisma.patientStatus.groupBy({
      by: ['upa_id'],
      where: {
        status: {
          in: [PatientStatusEnum.WAITING_TRIAGE, PatientStatusEnum.WAITING_CARE],
        },
      },
    });

    const allUpasData = await Promise.all(
      upasWithPatients.map(upa => this.getUpaQueueData(upa.upa_id))
    );

    this.logger.log(`Dados globais gerados para ${allUpasData.length} UPAs`);
    return allUpasData;
  }

  async getPatientCurrentStatus(patientId: string, upaId: string) {
    return await this.prisma.patientStatus.findFirst({
      where: { patient_id: patientId, upa_id: upaId },
    });
  }

  async getUpaStatistics(upaId: string, startDate?: Date, endDate?: Date) {
    const where: any = {
      upa_id: upaId,
    };

    if (startDate) {
      where.timestamp = { gte: startDate };
    }

    if (endDate) {
      where.timestamp = { ...where.timestamp, lte: endDate };
    }

    const events = await this.prisma.patientEvent.findMany({
      where,
    });

    // Calcular estatísticas básicas
    const totalEventos = events.length;
    const entradas = events.filter(e => e.event_type === 'ENTRADA').length;
    const triagens = events.filter(e => e.event_type === 'TRIAGEM').length;
    const atendimentos = events.filter(e => e.event_type === 'ATENDIMENTO').length;

    return {
      upa_id: upaId,
      periodo: {
        inicio: startDate?.toISOString(),
        fim: endDate?.toISOString(),
      },
      total_eventos: totalEventos,
      entradas,
      triagens,
      atendimentos,
      taxa_conclusao: entradas > 0 ? Math.round((atendimentos / entradas) * 100) : 0,
    };
  }
}