process.env.NODE_ENV = 'test';
if (!process.env.JWT_SECRET?.trim()) {
  process.env.JWT_SECRET = 'test-jwt-secret';
}
if (!process.env.JWT_EXPIRES_IN?.trim()) {
  process.env.JWT_EXPIRES_IN = '1h';
}
if (!process.env.DB_HOST?.trim()) {
  process.env.DB_HOST = '127.0.0.1';
}
if (!process.env.DB_PORT?.trim()) {
  process.env.DB_PORT = '3306';
}
if (!process.env.DB_USER?.trim()) {
  process.env.DB_USER = 'test_user';
}
if (!process.env.DB_PASSWORD?.trim()) {
  process.env.DB_PASSWORD = 'test_password';
}
if (!process.env.DB_NAME?.trim()) {
  process.env.DB_NAME = 'notejs_tutorial_test';
}
