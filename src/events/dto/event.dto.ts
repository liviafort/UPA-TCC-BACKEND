import { IsString, IsEnum, IsISO8601, IsNotEmpty, IsOptional, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { EventType, ClassificacaoTriagem } from '@prisma/client';

export class EventDto {
  @ApiProperty({ 
    example: 'Dinamérica',
    description: 'Nome da UPA onde ocorreu o evento'
  })
  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  upa_id: string;

  @ApiProperty({ 
    enum: EventType,
    description: 'Tipo do evento'
  })
  @IsEnum(EventType)
  event_type: EventType;

  @ApiProperty({ 
    example: 'ABC123',
    description: 'ID único e anonymizado do paciente'
  })
  @IsString()
  @IsNotEmpty()
  @Length(1, 50)
  patient_id: string;

  @ApiProperty({ 
    example: 'Centro',
    required: false,
    description: 'Bairro de origem do paciente (apenas para evento de entrada)'
  })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  bairro?: string;

  @ApiProperty({ 
    enum: ClassificacaoTriagem,
    required: false,
    description: 'Classificação de risco (apenas para evento de triagem)'
  })
  @IsOptional()
  @IsEnum(ClassificacaoTriagem)
  classificacao?: ClassificacaoTriagem;

  @ApiProperty({ 
    example: '2024-05-20T14:30:00Z',
    description: 'Timestamp do evento no formato ISO 8601'
  })
  @IsOptional()
  @IsISO8601()
  timestamp?: string;
}