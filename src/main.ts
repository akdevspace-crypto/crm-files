import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '../backend/.env') });

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

import * as express from 'express';

import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as fs from 'fs';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());

  app.enableCors({ origin: '*' });

  const config = new DocumentBuilder()
    .setTitle('ElderCare CRM API')
    .setDescription('API documentation for the CRM Platform')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);
  
  // Save swagger JSON to file
  fs.writeFileSync('api-docs.json', JSON.stringify(document, null, 2));

  app.enableShutdownHooks();
  await app.listen(3005);
}
bootstrap();
