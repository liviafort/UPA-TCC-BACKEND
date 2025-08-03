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