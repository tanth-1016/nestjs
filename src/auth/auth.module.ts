import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import type { StringValue } from 'ms';
import { UsersModule } from '../users/users.module';
import { JwtStrategy } from './strategies/jwt.strategy';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [
    ConfigModule,
    UsersModule,
    PassportModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const getRequiredJwtEnv = (name: string): string => {
          const value = config.getOrThrow<string>(name).trim();
          if (!value) {
            throw new Error(`Missing required environment variable: ${name}`);
          }
          return value;
        };

        return {
          secret: getRequiredJwtEnv('JWT_SECRET'),
          signOptions: {
            expiresIn: getRequiredJwtEnv('JWT_EXPIRES_IN') as StringValue,
          },
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
})
export class AuthModule {}
