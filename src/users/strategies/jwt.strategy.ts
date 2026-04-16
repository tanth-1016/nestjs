// Created by tran.huu.tan
import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { UsersService } from '../users.service';

export type JwtPayload = {
  sub: string;
  email: string;
};

export type JwtValidatedUser = {
  id: string;
  email: string;
  createdAt: Date;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly config: ConfigService,
    private readonly usersService: UsersService,
  ) {
    const extractJwtFromAuthorizationHeader = (req: Request): string | null => {
      const authorization = req?.headers?.authorization;
      if (typeof authorization !== 'string') {
        return null;
      }

      const header = authorization.trim();
      if (!header) {
        return null;
      }

      const tokenWithScheme = header.match(/^(Bearer|Token)\s+(.+)$/i);
      if (tokenWithScheme) {
        return tokenWithScheme[2].trim() || null;
      }

      // Accept raw JWT in Authorization header for clients that only send the token value.
      if (!header.includes(' ')) {
        return header;
      }

      return null;
    };

    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        extractJwtFromAuthorizationHeader,
      ]),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>('JWT_SECRET'),
    });
  }

  async validate(payload: JwtPayload): Promise<JwtValidatedUser> {
    if (!payload?.sub) {
      throw new UnauthorizedException('Invalid token');
    }

    try {
      const user = await this.usersService.findById(payload.sub);
      return {
        id: user.id,
        email: user.email,
        createdAt: user.createdAt,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new UnauthorizedException('Invalid token');
      }
      throw error;
    }
  }
}
