import { Injectable, Logger } from '@nestjs/common';
import { UpaQueueDataDto, ClassificacaoStatsDto } from './dto/queue-stats.dto';
import { PrismaClient, PatientStatusEnum, ClassificacaoTriagem } from '@prisma/client';
import { Classification, QueueDistribution, QueueEvolutionData, QueueResponse } from './types/types';

@Injectable()
export class QueueService {
  private readonly logger = new Logger(QueueService.name);
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async getUpaQueueData(upaId: string): Promise<UpaQueueDataDto> {
    this.logger.log(`Gerando dados da fila para UPA: ${upaId}`);

    const patientsInQueue = await this.prisma.patientStatus.findMany({
      where: {
        upa_id: upaId,
        status: {
          in: [PatientStatusEnum.WAITING_TRIAGE, PatientStatusEnum.WAITING_CARE],
        },
      },
    });

    const classificacoes: ClassificacaoStatsDto = {
      verde: 0,
      amarelo: 0,
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

  async getQueueDistribution(upaId: string): Promise<QueueResponse & { distribution: QueueDistribution }> {
    const patients = await this.prisma.patientStatus.findMany({
      where: { 
        upa_id: upaId,
        OR: [
          { status: 'WAITING_TRIAGE' },
          { status: 'WAITING_CARE' }
        ]
      }
    });

    const distribution = patients.reduce((acc: Record<Classification, { count: number; total_wait: number }>, patient) => {
      const classification = (patient.classificacao as Classification) || 'NAO_TRIADO';
      
      if (!acc[classification]) {
        acc[classification] = { count: 0, total_wait: 0 };
      }
      
      acc[classification].count++;
      
      const startTime = patient.status === 'WAITING_TRIAGE' 
        ? patient.entrada_timestamp 
        : patient.triagem_timestamp;
      
      if (startTime) {
        const waitMinutes = (Date.now() - startTime.getTime()) / (1000 * 60);
        acc[classification].total_wait += waitMinutes;
      }
      
      return acc;
    }, {} as Record<Classification, { count: number; total_wait: number }>);

    const result = Object.fromEntries(
      Object.entries(distribution).map(([classification, data]) => [
        classification,
        {
          count: data.count,
          average_wait: data.count > 0 ? Math.round(data.total_wait / data.count) : 0
        }
      ])
    ) as QueueDistribution;

    return {
      upa_id: upaId,
      distribution: result,
      last_updated: new Date().toISOString()
    };
  }

  async getQueuePercentages(upaId: string) {
    const { distribution } = await this.getQueueDistribution(upaId);
    const total = Object.values(distribution).reduce((sum, item) => sum + item.count, 0);
    
    const percentages = Object.fromEntries(
      Object.entries(distribution).map(([classification, data]) => [
        classification,
        parseFloat(((data.count / total) * 100).toFixed(1))
      ])
    );
    
    return {
      upa_id: upaId,
      percentages,
      total_patients: total,
      last_updated: new Date().toISOString()
    };
  }

  async getQueueEvolution(upaId: string, days: number = 7): Promise<QueueResponse & { period: string; data: QueueEvolutionData[] }> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);

    const events = await this.prisma.patientEvent.findMany({
      where: {
        upa_id: upaId,
        timestamp: {
          gte: startDate,
          lte: endDate
        }
      },
      orderBy: {
        timestamp: 'asc'
      }
    });

    const dailyData = events.reduce((acc: Record<string, Omit<QueueEvolutionData, 'date'> & { wait_times: number[] }>, event) => {
      const dateStr = event.timestamp.toISOString().split('T')[0];
      
      if (!acc[dateStr]) {
        acc[dateStr] = {
          entradas: 0,
          triagens: 0,
          atendimentos: 0,
          max_wait_time: 0,
          wait_times: []
        };
      }
      
      if (event.event_type === 'ENTRADA') acc[dateStr].entradas++;
      if (event.event_type === 'TRIAGEM') acc[dateStr].triagens++;
      if (event.event_type === 'ATENDIMENTO') acc[dateStr].atendimentos++;
      
      if (event.event_type === 'ATENDIMENTO') {
        const entradaEvent = events.find(e => 
          e.patient_id === event.patient_id && 
          e.event_type === 'ENTRADA'
        );
        
        if (entradaEvent) {
          const waitTime = (event.timestamp.getTime() - entradaEvent.timestamp.getTime()) / (1000 * 60);
          acc[dateStr].wait_times.push(waitTime);
        }
      }
      
      return acc;
    }, {});

    const response = Object.entries(dailyData).map(([date, data]) => ({
      date,
      entradas: data.entradas,
      triagens: data.triagens,
      atendimentos: data.atendimentos,
      max_wait_time: data.wait_times.length > 0 
        ? Math.round(Math.max(...data.wait_times))
        : 0
    }));

    return {
      upa_id: upaId,
      period: `${days} days`,
      data: response,
      last_updated: new Date().toISOString()
    };
  }

  async getCurrentWaitTimes(upaId: string) {
    const { distribution } = await this.getQueueDistribution(upaId);
    
    const waitTimes = Object.fromEntries(
      Object.entries(distribution).map(([classification, data]) => [
        classification,
        data.average_wait
      ])
    );
    
    return {
      upa_id: upaId,
      wait_times: waitTimes,
      last_updated: new Date().toISOString()
    };
  }


}