import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { UpasService } from './upa.service';
import { Upa } from '@prisma/client';

@ApiTags('upas')
@Controller('upas')
export class UpasController {
  constructor(private readonly upasService: UpasService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todas as UPAs ativas' })
  @ApiResponse({ status: 200, description: 'Lista de UPAs ativas' })
  async findAll(): Promise<Upa[]> {
    return await this.upasService.findAll();
  }

  @Get(':name')
  @ApiOperation({ summary: 'Obter UPA por nome' })
  @ApiResponse({ status: 200, description: 'Dados da UPA' })
  @ApiResponse({ status: 404, description: 'UPA não encontrada' })
  async findByName(@Param('name') name: string): Promise<Upa> {
    return await this.upasService.findByName(name);
  }

  @Post()
  @ApiOperation({ summary: 'Criar nova UPA' })
  @ApiBody({
    description: 'Dados da UPA',
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Dinamérica' },
        address: { type: 'string', example: 'Av. Dinamérica, 123' },
        latitude: { type: 'number', example: -7.12345678 },
        longitude: { type: 'number', example: -35.12345678 },
        operating_hours: { 
          type: 'object',
          example: { 
            weekdays: '08:00-18:00',
            weekends: '09:00-16:00' 
          }
        }
      },
      required: ['name', 'address', 'latitude', 'longitude']
    }
  })
  @ApiResponse({ status: 201, description: 'UPA criada com sucesso' })
  async createUpa(@Body() data: {
    name: string;
    address: string;
    latitude: number;
    longitude: number;
    operating_hours?: any;
  }): Promise<Upa> {
    return await this.upasService.createUpa(data);
  }
}