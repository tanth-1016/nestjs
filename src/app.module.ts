import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { join } from 'path';
import {
  AcceptLanguageResolver,
  HeaderResolver,
  I18nModule,
  I18nJsonLoader,
  QueryResolver,
} from 'nestjs-i18n';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './users/user.entity';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => {
        if (config.get<string>('NODE_ENV') === 'test') {
          return {
            type: 'sqlite',
            database: ':memory:',
            entities: [User],
            synchronize: true,
            logging: false,
          };
        }

        const getRequiredEnv = (name: string): string => {
          const value = config.getOrThrow<string>(name).trim();
          if (!value) {
            throw new Error(`Missing required environment variable: ${name}`);
          }
          return value;
        };

        const dbPortRaw = config.get<string>('DB_PORT') ?? '3306';
        const dbPort = Number(dbPortRaw);

        if (!Number.isInteger(dbPort) || dbPort < 1 || dbPort > 65535) {
          throw new Error(`Invalid DB_PORT value: ${dbPortRaw}`);
        }

        return {
          type: 'mysql',
          host: getRequiredEnv('DB_HOST'),
          port: dbPort,
          username: getRequiredEnv('DB_USER'),
          password: getRequiredEnv('DB_PASSWORD'),
          database: getRequiredEnv('DB_NAME'),
          entities: [User],
          synchronize: false,
          logging: false,
        };
      },
      inject: [ConfigService],
    }),
    I18nModule.forRoot({
      fallbackLanguage: 'en',
      loader: I18nJsonLoader,
      loaderOptions: {
        path: join(__dirname, 'i18n'),
        watch: process.env.NODE_ENV !== 'production',
      },
      resolvers: [
        { use: QueryResolver, options: ['lang', 'locale'] },
        new HeaderResolver(['x-lang']),
        AcceptLanguageResolver,
      ],
    }),
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
