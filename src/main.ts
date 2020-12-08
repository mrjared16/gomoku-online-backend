import { NestFactory } from '@nestjs/core';
import { DocumentBuilder } from '@nestjs/swagger/dist/document-builder';
import { SwaggerModule } from '@nestjs/swagger/dist/swagger-module';
import { AppModule } from './app.module';
import { Config } from './shared/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  const options = new DocumentBuilder()
    .setTitle('Gomoku online')
    .setDescription('The Gomoku online API description')
    .setVersion('1.0')
    .addBearerAuth()
    .addOAuth2()
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('document', app, document);

  await app.listen(Config.getCurrentHost().port);
}
bootstrap();
