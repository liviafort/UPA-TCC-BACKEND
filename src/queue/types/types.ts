export type Classification = 'VERDE' | 'AMARELO'| 'VERMELHO' | 'AZUL' | 'NAO_TRIADO';

export interface QueueDistribution {
  [key: string]: {
    count: number;
    average_wait: number;
  };
}

export interface QueueEvolutionData {
  date: string;
  entradas: number;
  triagens: number;
  atendimentos: number;
  max_wait_time: number;
}

export interface QueueResponse {
  upa_id: string;
  last_updated: string;
}