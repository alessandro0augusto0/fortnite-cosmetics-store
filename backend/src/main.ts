import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });

  app.enableCors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  });

  const port = process.env.PORT ?? 4000;
  await app.listen(port);
  console.log(`🚀 Backend rodando em http://localhost:${port}`);
}
bootstrap();
