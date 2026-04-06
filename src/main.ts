import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');

  const shouldEnableSwagger =
    process.env.NODE_ENV !== 'production' ||
    process.env.ENABLE_SWAGGER === 'true';

  if (shouldEnableSwagger) {
    const config = new DocumentBuilder()
      .setTitle('NoteJS Tutorial API')
      .setDescription('API documentation for NoteJS Tutorial')
      .setVersion('1.0')
      .addTag('hello')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document, {
      useGlobalPrefix: true,
      swaggerOptions: {
        persistAuthorization: true,
        displayRequestDuration: true,
        docExpansion: 'none',
      },
    });
  }

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
