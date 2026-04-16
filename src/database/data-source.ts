import 'dotenv/config';
import { join } from 'node:path';
import { DataSource } from 'typeorm';

const getRequiredEnv = (name: string): string => {
  const value = process.env[name];
  if (!value || value.trim() === '') {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
};
const parsePortWithDefault = (name: string, defaultValue: number): number => {
  const value = process.env[name]?.trim() || String(defaultValue);
  const port = Number(value);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error(`Invalid ${name} value: ${value}`);
  }
  return port;
};
const dbHost = getRequiredEnv('DB_HOST');
const dbPort = parsePortWithDefault('DB_PORT', 3306);
const dbUser = getRequiredEnv('DB_USER');
const dbPassword = getRequiredEnv('DB_PASSWORD');
const dbName = getRequiredEnv('DB_NAME');

export default new DataSource({
  type: 'mysql',
  host: dbHost,
  port: dbPort,
  username: dbUser,
  password: dbPassword,
  database: dbName,
  entities: [
    join(__dirname, '..', '**', '*.entity.{ts,js}').replace(/\\/g, '/'),
  ],
  migrations: [join(__dirname, 'migrations', '*.{ts,js}').replace(/\\/g, '/')],
  synchronize: false,
  logging: false,
});
