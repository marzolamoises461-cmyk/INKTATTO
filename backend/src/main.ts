import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import type { RequestHandler } from 'express';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);
  app.setGlobalPrefix('api');
  const securityHeaders = helmet();
  const swaggerSecurityHeaders = helmet({ contentSecurityPolicy: false });
  const applySecurityHeaders: RequestHandler = (request, response, next) => {
    const middleware = request.path.startsWith('/api/docs') ? swaggerSecurityHeaders : securityHeaders;
    middleware(request, response, next);
  };
  app.use(applySecurityHeaders);

  const corsOrigins = config.getOrThrow<string>('CORS_ORIGIN')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
  app.enableCors({ origin: corsOrigins });

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  const swaggerConfig = new DocumentBuilder()
    .setTitle('INKTATTO API')
    .setDescription('API de autenticación, usuarios, artistas, citas, contacto y favoritos.')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  SwaggerModule.setup('api/docs', app, SwaggerModule.createDocument(app, swaggerConfig));

  const port = Number(config.getOrThrow<string>('PORT'));
  await app.listen(port, '0.0.0.0');
}

void bootstrap();
