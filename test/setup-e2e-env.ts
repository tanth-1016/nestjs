process.env.NODE_ENV = 'test';
if (!process.env.JWT_SECRET?.trim()) {
  process.env.JWT_SECRET = 'test-jwt-secret';
}
if (!process.env.JWT_EXPIRES_IN?.trim()) {
  process.env.JWT_EXPIRES_IN = '1h';
}
