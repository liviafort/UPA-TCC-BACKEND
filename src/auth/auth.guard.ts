import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, Logger } from '@nestjs/common';
import { AuthService } from './auth.service';

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly logger = new Logger(AuthGuard.name);

  constructor(private authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      this.logger.warn('Token de acesso ausente ou formato inválido');
      throw new UnauthorizedException('Token de acesso ausente');
    }

    const token = authHeader.substring(7);
    
    try {
      const authToken = await this.authService.validateToken(token);
      request.user = authToken;
      return true;
    } catch (error) {
      this.logger.error(`Falha na autenticação: ${error.message}`);
      throw new UnauthorizedException('Token de acesso inválido');
    }
  }
}