import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request, { Response } from 'supertest';
import { DataSource } from 'typeorm';
import { AppModule } from './../src/app.module';

type UserResponseBody = {
  user: {
    email: string;
    token: string;
    username: string;
    bio: string | null;
    image: string | null;
  };
};

function parseUserResponse(response: Response): UserResponseBody {
  const parsed = JSON.parse(response.text) as unknown;
  if (
    typeof parsed !== 'object' ||
    parsed === null ||
    !('user' in parsed) ||
    typeof (parsed as { user?: unknown }).user !== 'object' ||
    (parsed as { user?: unknown }).user === null
  ) {
    throw new Error('Invalid user response shape');
  }

  return parsed as UserResponseBody;
}

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

describe('Users API (e2e)', () => {
  let app: INestApplication;

  const createUniqueEmail = () =>
    `user.${Date.now()}.${Math.random().toString(36).slice(2)}@example.com`;
  const createUniqueUsername = () =>
    `user_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const password = 'Password123!';

  beforeAll(async () => {
    app = await createTestApp();
  });

  beforeEach(async () => {
    await resetTestDatabase(app);
  });

  it('POST /api/users and POST /api/users/login succeed', async () => {
    const email = createUniqueEmail();
    const username = createUniqueUsername();

    const registerResponse = (await request(app.getHttpServer())
      .post('/api/users')
      .send({
        user: {
          username,
          email,
          password,
        },
      })
      .expect(201)) as Response;

    const registerBody = parseUserResponse(registerResponse);
    expect(registerBody.user).toMatchObject({
      email,
      username,
    });
    expect(typeof registerBody.user.token).toBe('string');

    const loginResponse = (await request(app.getHttpServer())
      .post('/api/users/login')
      .send({ user: { email, password } })
      .expect(200)) as Response;

    const loginBody = parseUserResponse(loginResponse);
    expect(loginBody.user).toMatchObject({
      email,
      username,
    });
    expect(typeof loginBody.user.token).toBe('string');
  });

  it('POST /api/users returns 409 for duplicate email', async () => {
    const email = createUniqueEmail();
    const username = createUniqueUsername();

    await request(app.getHttpServer())
      .post('/api/users')
      .send({ user: { username, email, password } })
      .expect(201);

    await request(app.getHttpServer())
      .post('/api/users')
      .send({
        user: {
          username: createUniqueUsername(),
          email,
          password,
        },
      })
      .expect(409);
  });

  it('POST /api/users/login returns 401 for wrong password', async () => {
    const email = createUniqueEmail();
    const username = createUniqueUsername();

    await request(app.getHttpServer())
      .post('/api/users')
      .send({ user: { username, email, password } })
      .expect(201);

    await request(app.getHttpServer())
      .post('/api/users/login')
      .send({ user: { email, password: 'WrongPassword123!' } })
      .expect(401);
  });

  it('GET /api/user requires a valid token auth header', async () => {
    const email = createUniqueEmail();
    const username = createUniqueUsername();

    await request(app.getHttpServer())
      .post('/api/users')
      .send({ user: { username, email, password } })
      .expect(201);

    const loginResponse = (await request(app.getHttpServer())
      .post('/api/users/login')
      .send({ user: { email, password } })
      .expect(200)) as Response;

    const loginBody = parseUserResponse(loginResponse);
    const token = loginBody.user.token;

    await request(app.getHttpServer()).get('/api/user').expect(401);

    const meResponse = (await request(app.getHttpServer())
      .get('/api/user')
      .set('Authorization', `Token ${token}`)
      .expect(200)) as Response;

    const meBody = parseUserResponse(meResponse);
    expect(meBody.user).toMatchObject({
      email,
      username,
    });
    expect(typeof meBody.user.token).toBe('string');
  });

  it('PUT /api/user updates username, bio, image and password', async () => {
    const email = createUniqueEmail();
    const username = createUniqueUsername();

    await request(app.getHttpServer())
      .post('/api/users')
      .send({ user: { username, email, password } })
      .expect(201);

    const loginResponse = (await request(app.getHttpServer())
      .post('/api/users/login')
      .send({ user: { email, password } })
      .expect(200)) as Response;

    const loginBody = parseUserResponse(loginResponse);
    const token = loginBody.user.token;
    const updatedUsername = createUniqueUsername();
    const newPassword = 'NewPassword123!';

    const updateResponse = (await request(app.getHttpServer())
      .put('/api/user')
      .set('Authorization', `Token ${token}`)
      .send({
        user: {
          username: updatedUsername,
          bio: 'I like to skateboard',
          image: 'https://i.stack.imgur.com/xHWG8.jpg',
          password: newPassword,
        },
      })
      .expect(200)) as Response;

    const updateBody = parseUserResponse(updateResponse);
    expect(updateBody.user).toMatchObject({
      email,
      username: updatedUsername,
      bio: 'I like to skateboard',
      image: 'https://i.stack.imgur.com/xHWG8.jpg',
    });
    expect(typeof updateBody.user.token).toBe('string');

    await request(app.getHttpServer())
      .post('/api/users/login')
      .send({ user: { email, password } })
      .expect(401);

    await request(app.getHttpServer())
      .post('/api/users/login')
      .send({ user: { email, password: newPassword } })
      .expect(200);
  });

  afterAll(async () => {
    await app.close();
  });
});
