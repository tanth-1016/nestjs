import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();
  });

  it('GET /api/hello/hello-world returns vi by x-lang header', () => {
    return request(app.getHttpServer())
      .get('/api/hello/hello-world')
      .set('x-lang', 'vi')
      .expect(200)
      .expect('Xin chào thế giới');
  });

  it('GET /api/hello/hello-world returns en by x-lang header', () => {
    return request(app.getHttpServer())
      .get('/api/hello/hello-world')
      .set('x-lang', 'en')
      .expect(200)
      .expect('Hello World');
  });

  it('GET /api/hello/hello-world uses fallback en', () => {
    return request(app.getHttpServer())
      .get('/api/hello/hello-world')
      .expect(200)
      .expect('Hello World');
  });

  it('GET /api/hello/hello-world returns vi by Accept-Language header', () => {
    return request(app.getHttpServer())
      .get('/api/hello/hello-world')
      .set('Accept-Language', 'vi')
      .expect(200)
      .expect('Xin chào thế giới');
  });

  it('GET /api/hello/hello-world returns en by Accept-Language header', () => {
    return request(app.getHttpServer())
      .get('/api/hello/hello-world')
      .set('Accept-Language', 'en')
      .expect(200)
      .expect('Hello World');
  });

  it('GET /api/hello/hello-world returns vi by ?locale query', () => {
    return request(app.getHttpServer())
      .get('/api/hello/hello-world?locale=vi')
      .expect(200)
      .expect('Xin chào thế giới');
  });

  it('GET /api/hello/hello-world returns en by ?locale query', () => {
    return request(app.getHttpServer())
      .get('/api/hello/hello-world?locale=en')
      .expect(200)
      .expect('Hello World');
  });

  afterAll(async () => {
    await app.close();
  });
});
