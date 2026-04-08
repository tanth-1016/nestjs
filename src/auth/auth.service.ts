import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const email = dto.email.trim().toLowerCase();
    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await this.usersService.create(email, passwordHash);
    const payload = { sub: user.id, email: user.email };
    const accessToken = await this.jwtService.signAsync(payload);
    return {
      user: { id: user.id, email: user.email, createdAt: user.createdAt },
      accessToken,
    };
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(
      dto.email.trim().toLowerCase(),
      { includePasswordHash: true },
    );
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (
      typeof user.passwordHash !== 'string' ||
      user.passwordHash.length === 0
    ) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const ok = await bcrypt.compare(dto.password, user.passwordHash);
    if (!ok) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: user.id, email: user.email };
    const accessToken = await this.jwtService.signAsync(payload);
    return { accessToken };
  }
}
