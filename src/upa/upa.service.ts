import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaClient, Upa } from '@prisma/client';

@Injectable()
export class UpasService {
  private readonly logger = new Logger(UpasService.name);
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async findAll(): Promise<Upa[]> {
    return await this.prisma.upa.findMany({
      where: { is_active: true },
      orderBy: { name: 'asc' },
    });
  }

  async findByName(name: string): Promise<Upa> {
    const upa = await this.prisma.upa.findFirst({
      where: { name, is_active: true },
    });

    if (!upa) {
      throw new NotFoundException(`UPA '${name}' não encontrada`);
    }

    return upa;
  }

  async findById(id: string): Promise<Upa> {
  this.logger.debug(`Iniciando busca por UPA: ${id}`);
  
  try {
    // Primeiro, verificar se existe (independente do is_active)
    const upaRaw = await this.prisma.upa.findUnique({
      where: { id }
    });
    
    this.logger.debug(`Resultado da busca única: ${JSON.stringify(upaRaw)}`);
    
    if (!upaRaw) {
      this.logger.error(`UPA não encontrada no banco: ${id}`);
      throw new NotFoundException(`UPA '${id}' não encontrada no banco de dados`);
    }
    
    if (!upaRaw.is_active) {
      this.logger.error(`UPA encontrada mas inativa: ${id}`);
      throw new NotFoundException(`UPA '${id}' está inativa`);
    }
    
    this.logger.debug(`UPA encontrada e ativa: ${upaRaw.name}`);
    return upaRaw;
    
  } catch (error) {
    this.logger.error(`Erro ao buscar UPA ${id}:`, error);
    throw error;
  }
}

  async createUpa(data: {
    name: string;
    address: string;
    latitude: number;
    longitude: number;
    operating_hours?: any;
  }): Promise<Upa> {
    const upa = await this.prisma.upa.create({
      data,
    });
    
    this.logger.log(`UPA criada: ${upa.name}`);
    return upa;
  }
}