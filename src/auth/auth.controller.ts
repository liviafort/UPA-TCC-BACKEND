import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login para obter token JWT' })
  @ApiResponse({ status: 200, description: 'Token JWT gerado com sucesso' })
  @ApiResponse({ status: 401, description: 'Credenciais inválidas' })
  async login(@Body() credentials: { token: string }) {
    const authToken = await this.authService.validateToken(credentials.token);
    const payload = { 
      sub: authToken.id,
      name: authToken.name,
      institution: authToken.institution,
      permissions: authToken.permissions
    };
    return {
      access_token: this.authService.generateJWT(payload),
    };
  }
}