import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();

  const config = new DocumentBuilder()
    .setTitle('Diet API')
    .setDescription('Diet Management System API')
    .setVersion('v1')
    .addBearerAuth()
    .build();

  const doc = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('/api/docs', app, doc);

  await app.listen(3001);
  console.log('API running at http://localhost:3001');
}
bootstrap();
