import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '../backend/.env') });

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

import * as express from 'express';
import { TelephonyGateway } from './telephony/telephony.gateway';

// Import the refactored legacy express application and initialization hook
const legacyModule = require('./legacy/index.js');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());

  app.enableCors({ origin: '*' });

  app.enableShutdownHooks();

  // Retrieve the underlying Express instance used by NestJS
  const expressInstance = app.getHttpAdapter().getInstance();
  
  // Attach the Legacy Express Routes onto the NestJS Server
  expressInstance.use(legacyModule.app);

  // Allow NestJS to bind before we pass its WebSocket server
  const server = await app.listen(4000);
  console.log(`[Unified Backend] Running on Port 4000`);

  // Retrieve the Socket.IO server initialized by NestJS
  try {
    const telephonyGateway = app.get(TelephonyGateway);
    const io = telephonyGateway.server;

    // Initialize legacy WebSockets, WebRTC, and Cron Jobs
    legacyModule.mountLegacyApp(legacyModule.app, io);
    console.log(`[Legacy Service] successfully mounted and initialized.`);
  } catch (err) {
    console.error(`[Legacy Service] failed to initialize.`, err);
  }
}
bootstrap();
