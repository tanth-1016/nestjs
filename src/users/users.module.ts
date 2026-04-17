import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import type { StringValue } from 'ms';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { UsersAuthService } from './users-auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([User]),
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
  controllers: [UsersController],
  providers: [UsersService, UsersAuthService, JwtStrategy],
  exports: [UsersService],
})
export class UsersModule {}
