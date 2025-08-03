import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private prisma: PrismaClient;

  constructor(
    private jwtService: JwtService,
    prisma: PrismaClient
  ) {
    this.prisma = prisma;
  }

  async validateToken(token: string) {
    const authToken = await this.prisma.authToken.findFirst({
      where: { 
        token,
        is_active: true,
      },
    });

    if (!authToken) {
      throw new UnauthorizedException('Token de acesso inválido ou inativo');
    }

    // Verificar se o token não expirou
    if (authToken.expires_at && authToken.expires_at < new Date()) {
      throw new UnauthorizedException('Token de acesso expirado');
    }

    this.logger.log(`Token validado para: ${authToken.name} (${authToken.institution})`);
    return authToken;
  }

  async createToken(data: {
    token: string;
    name: string;
    institution: string;
    permissions?: string[];
    expires_at?: Date;
  }) {
    const hashedToken = await bcrypt.hash(data.token, 10);
    
    const authToken = await this.prisma.authToken.create({
      data: {
        token: data.token, // Armazenar sem hash para facilitar validação
        name: data.name,
        institution: data.institution,
        permissions: data.permissions || ['events:create'],
        expires_at: data.expires_at,
      },
    });

    return authToken;
  }

  async deactivateToken(token: string): Promise<void> {
    await this.prisma.authToken.updateMany({
      where: { token },
      data: { is_active: false }
    });
  }

  generateJWT(payload: any): string {
    return this.jwtService.sign(payload);
  }
}