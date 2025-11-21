import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import type { INestApplication } from '@nestjs/common';
import type { IncomingMessage, ServerResponse } from 'http';

let cachedApp: INestApplication | null = null;

async function getApp(): Promise<INestApplication> {
  if (!cachedApp) {
    cachedApp = await NestFactory.create(AppModule, { cors: true });
    
    cachedApp.enableCors({
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
    });
    
    await cachedApp.init();
  }
  return cachedApp;
}

async function bootstrap() {
  const app = await getApp();
  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`🚀 Backend rodando em http://localhost:${port}`);
}

// Export handler for Vercel serverless
export default async function handler(req: IncomingMessage, res: ServerResponse) {
  const app = await getApp();
  const server = app.getHttpAdapter().getInstance();
  return server(req, res);
}

// Start local server if run directly
if (require.main === module) {
  bootstrap();
}
