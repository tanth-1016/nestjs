import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { AppModule } from './../src/app.module';

async function createTestApp(): Promise<INestApplication> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleFixture.createNestApplication();
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  await app.init();
  return app;
}

async function resetTestDatabase(app: INestApplication): Promise<void> {
  const dataSource = app.get(DataSource);
  await dataSource.dropDatabase();
  await dataSource.synchronize();
}

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  beforeEach(async () => {
    await resetTestDatabase(app);
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

describe('Auth (e2e)', () => {
  let app: INestApplication;

  const createUniqueEmail = () =>
    `user.${Date.now()}.${Math.random().toString(36).slice(2)}@example.com`;
  const password = 'Password123!';

  beforeAll(async () => {
    app = await createTestApp();
  });

  beforeEach(async () => {
    await resetTestDatabase(app);
  });

  it('POST /api/auth/register and POST /api/auth/login succeed', async () => {
    const email = createUniqueEmail();

    const registerResponse = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({ email, password })
      .expect(201);

    expect(registerResponse.body.user).toMatchObject({ email });
    expect(registerResponse.body.accessToken).toEqual(expect.any(String));

    const loginResponse = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email, password })
      .expect(200);

    expect(loginResponse.body.accessToken).toEqual(expect.any(String));
  });

  it('POST /api/auth/register returns 409 for duplicate email', async () => {
    const email = createUniqueEmail();

    await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({ email, password })
      .expect(201);

    await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({ email, password })
      .expect(409);
  });

  it('POST /api/auth/login returns 401 for wrong password', async () => {
    const email = createUniqueEmail();

    await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({ email, password })
      .expect(201);

    await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email, password: 'WrongPassword123!' })
      .expect(401);
  });

  it('GET /api/auth/me requires a valid bearer token', async () => {
    const email = createUniqueEmail();

    await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({ email, password })
      .expect(201);

    const loginResponse = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email, password })
      .expect(200);

    const token = loginResponse.body.accessToken as string;

    await request(app.getHttpServer()).get('/api/auth/me').expect(401);

    const meResponse = await request(app.getHttpServer())
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(meResponse.body).toMatchObject({ email });
  });

  afterAll(async () => {
    await app.close();
  });
});
