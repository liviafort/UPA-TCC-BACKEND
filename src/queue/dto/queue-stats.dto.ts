import { ApiProperty } from '@nestjs/swagger';
import { ClassificacaoTriagem } from '@prisma/client';

export class ClassificacaoStatsDto {
  @ApiProperty({ example: 5 })
  verde: number;

  @ApiProperty({ example: 8 })
  amarelo: number;

  @ApiProperty({ example: 2 })
  vermelho: number;

  @ApiProperty({ example: 1 })
  azul: number;

  @ApiProperty({ example: 4 })
  sem_triagem: number;
}

export class UpaQueueDataDto {
  @ApiProperty({ example: 'Dinamérica' })
  upa_id: string;

  @ApiProperty({ example: 23 })
  total_pacientes: number;

  @ApiProperty({ example: 15 })
  aguardando_triagem: number;

  @ApiProperty({ example: 8 })
  aguardando_atendimento: number;

  @ApiProperty({ type: ClassificacaoStatsDto })
  por_classificacao: ClassificacaoStatsDto;

  @ApiProperty({ example: 45 })
  tempo_medio_espera_minutos: number;

  @ApiProperty({ example: 120 })
  tempo_medio_triagem_minutos: number;

  @ApiProperty({ example: 'media', enum: ['baixa', 'media', 'alta'] })
  status_ocupacao: 'baixa' | 'media' | 'alta';

  @ApiProperty({ example: '2024-05-20T14:30:00Z' })
  ultima_atualizacao: string;

  @ApiProperty({ example: ['Centro', 'Catole', 'Bodocongó'] })
  bairros_atendidos: string[];
}