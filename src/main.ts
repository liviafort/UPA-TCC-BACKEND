import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  
  // Configuração CORS
  app.enableCors({
    origin: configService.get('CORS_ORIGIN', 'http://localhost:3000'),
    credentials: true,
  });

  // Validação global
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    transformOptions: {
      enableImplicitConversion: true,
    },
  }));

  // Swagger/OpenAPI
  const config = new DocumentBuilder()
    .setTitle('UPA Queue System API')
    .setDescription('API para Sistema Inteligente de Exibição de Filas em UPAs')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('auth', 'Autenticação')
    .addTag('events', 'Eventos de UPA')
    .addTag('queue', 'Filas e Estatísticas')
    .addTag('upas', 'Gestão de UPAs')
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = configService.get('PORT', 3000);
  await app.listen(port);
  
  logger.log(`🚀 API rodando em http://localhost:${port}`);
  logger.log(`📚 Documentação disponível em http://localhost:${port}/api`);
  logger.log(`🔌 WebSocket disponível em ws://localhost:${port}`);
}
bootstrap();