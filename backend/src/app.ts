import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as express from 'express';

import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/allException.filter';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { CustomValidationPipe } from './common/pipes/validation-pipe';
import { join } from 'path';
import { CustomLogger } from './common/modules/logger/customerLogger.service';
import { JwtAuthGuard } from './modules/auth/guards/jwtAuth.guard';

export async function createApp(): Promise<NestExpressApplication> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.use('/public', express.static(join(__dirname, '../', 'public')));
  app.useLogger(app.get(CustomLogger));

  // Enable CORS
  app.enableCors();

  // Enable Shutdown Hooks
  app.enableShutdownHooks();

  // Uses Validation Pipes
  app.useGlobalPipes(new CustomValidationPipe());
  app.useGlobalPipes(
    new ValidationPipe({
      // whitelist: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true
      }
    })
  );

  // Add a route prefix 'api'
  app.setGlobalPrefix('api/v1');

  // Versioning API using MEDIA_TYPE
  app.enableVersioning({
    type: VersioningType.URI
  });

  // Request Body Parser
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const bodyParser = require('body-parser');

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const cookieParse = require('cookie-parser');

  // Add limitations to Request Body
  app.use(bodyParser.json({ limit: '5mb' }));
  app.use(bodyParser.urlencoded({ limit: '5mb', extended: true }));
  app.use(cookieParse());

  // Apply Global Exception Filters
  app.useGlobalFilters(new AllExceptionsFilter());

  // Apply Global Auth Guard
  const jwtAuthGuard = app.get(JwtAuthGuard);
  app.useGlobalGuards(jwtAuthGuard);

  // /** End Security **/
  // Swagger Documentation
  const options = new DocumentBuilder().setTitle('Traxx Hosed Page API').setDescription('Traxx Hosed Page API').setVersion('1').addBearerAuth().build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api-docs', app, document);

  return app;
}
