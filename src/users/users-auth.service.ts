import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from './user.entity';
import { UsersService } from './users.service';
import { LoginDto, RegisterDto, UpdateCurrentUserDto } from './dto';
import type { UserResponse } from './types/user-response.types';

@Injectable()
export class UsersAuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<UserResponse> {
    const passwordHash = await bcrypt.hash(dto.user.password, 10);

    const createdUser = await this.usersService.create({
      username: dto.user.username,
      email: dto.user.email,
      passwordHash,
    });

    return this.buildUserResponse(createdUser);
  }

  async login(dto: LoginDto): Promise<UserResponse> {
    const user = await this.usersService.findByEmail(
      dto.user.email.trim().toLowerCase(),
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

    const ok = await bcrypt.compare(dto.user.password, user.passwordHash);
    if (!ok) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.buildUserResponse(user);
  }

  async getCurrentUser(userId: string): Promise<UserResponse> {
    const user = await this.usersService.findById(userId);
    return this.buildUserResponse(user);
  }

  async updateCurrentUser(
    userId: string,
    dto: UpdateCurrentUserDto,
  ): Promise<UserResponse> {
    const hasAtLeastOneUpdatableField = [
      dto.user?.email,
      dto.user?.username,
      dto.user?.password,
      dto.user?.bio,
      dto.user?.image,
    ].some((value) => value !== undefined);

    if (!hasAtLeastOneUpdatableField) {
      throw new BadRequestException(
        'At least one field must be provided for update',
      );
    }

    if (
      dto.user.password !== undefined &&
      typeof dto.user.password !== 'string'
    ) {
      throw new BadRequestException('Password must be a string');
    }

    const passwordHash =
      typeof dto.user.password === 'string'
        ? await bcrypt.hash(dto.user.password, 10)
        : undefined;

    const patch = {
      email: dto.user.email,
      username: dto.user.username,
      passwordHash,
      bio: dto.user.bio,
      image: dto.user.image,
    };

    const user = await this.usersService.updateCurrentUser(userId, patch);
    return this.buildUserResponse(user);
  }

  private async buildUserResponse(user: User): Promise<UserResponse> {
    const token = await this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
    });

    return {
      user: {
        email: user.email,
        token,
        username: user.username,
        bio: user.bio ?? null,
        image: user.image ?? null,
      },
    };
  }
}
