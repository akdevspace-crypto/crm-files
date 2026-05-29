import * as dotenv from 'dotenv';

dotenv.config();

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

import * as express from 'express';
import { TelephonyGateway } from './telephony/telephony.gateway';

// Import legacy express application
const legacyModule = require('./legacy/index.js');

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule);

    app.use(express.urlencoded({ extended: true }));
    app.use(express.json());

    app.enableCors({
      origin: '*',
      credentials: true,
    });

    app.enableShutdownHooks();

    // Get underlying Express instance
    const expressInstance = app.getHttpAdapter().getInstance();

    // Mount legacy Express routes
    expressInstance.use(legacyModule.app);

    // Render provides PORT automatically
    const port = Number(process.env.PORT) || 4000;

    // Important for Render
    await app.listen(port, '0.0.0.0');

    console.log(`🚀 Unified Backend running on port ${port}`);

    // Initialize Socket.IO / Telephony Gateway
    try {
      const telephonyGateway = app.get(TelephonyGateway);

      if (telephonyGateway?.server) {
        const io = telephonyGateway.server;

        legacyModule.mountLegacyApp(
          legacyModule.app,
          io,
        );

        console.log(
          '✅ Legacy Service successfully mounted and initialized.',
        );
      } else {
        console.warn(
          '⚠️ TelephonyGateway server not available.',
        );
      }
    } catch (err) {
      console.error(
        '❌ Legacy Service failed to initialize:',
        err,
      );
    }
  } catch (error) {
    console.error(
      '❌ Application bootstrap failed:',
      error,
    );
    process.exit(1);
  }
}

bootstrap();
