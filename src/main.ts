import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');

  const shouldEnableSwagger = process.env.NODE_ENV !== 'production';

  if (shouldEnableSwagger) {
    const config = new DocumentBuilder()
      .setTitle('NoteJS Tutorial API')
      .setDescription('API documentation for NoteJS Tutorial')
      .setVersion('1.0')
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

  const portValue = process.env.PORT;
  const parsedPort = portValue ? Number(portValue) : NaN;
  const port =
    Number.isFinite(parsedPort) && Number.isInteger(parsedPort)
      ? parsedPort
      : 3000;

  await app.listen(port);
}
void bootstrap();
