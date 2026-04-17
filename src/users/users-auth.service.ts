import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { I18nService } from 'nestjs-i18n';
import * as bcrypt from 'bcrypt';
import { UsersService } from './users.service';
import { LoginDto, RegisterDto, UpdateCurrentUserDto } from './dto';
import { UserSerializer } from './serializers/user.serializer';
import type {
  BasicInfoUserResponse,
  LoginResponse,
} from './serializers/user.serializer';

@Injectable()
export class UsersAuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly i18n: I18nService,
  ) {}

  async register(dto: RegisterDto): Promise<BasicInfoUserResponse> {
    const passwordHash = await bcrypt.hash(dto.user.password, 10);

    const createdUser = await this.usersService.create({
      username: dto.user.username,
      email: dto.user.email,
      passwordHash,
    });

    return this.buildBasicInfoResponse(createdUser);
  }

  async login(dto: LoginDto): Promise<LoginResponse> {
    const user = await this.usersService.findByEmail(
      dto.user.email.trim().toLowerCase(),
      { includePasswordHash: true },
    );
    if (!user) {
      throw new UnauthorizedException(
        this.i18n.translate('common.USERS.INVALID_CREDENTIALS'),
      );
    }

    if (
      typeof user.passwordHash !== 'string' ||
      user.passwordHash.length === 0
    ) {
      throw new UnauthorizedException(
        this.i18n.translate('common.USERS.INVALID_CREDENTIALS'),
      );
    }

    const ok = await bcrypt.compare(dto.user.password, user.passwordHash);
    if (!ok) {
      throw new UnauthorizedException(
        this.i18n.translate('common.USERS.INVALID_CREDENTIALS'),
      );
    }

    return this.buildLoginResponse(user);
  }

  async getCurrentUser(userId: string): Promise<BasicInfoUserResponse> {
    const user = await this.usersService.findById(userId);
    return this.buildBasicInfoResponse(user);
  }

  async updateCurrentUser(userId: string, dto: UpdateCurrentUserDto) {
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

    return {
      user,
    };
  }

  private buildBasicInfoResponse(user: {
    id: string;
    email: string;
    username: string;
    bio?: string | null;
    image?: string | null;
  }): BasicInfoUserResponse {
    const serializedUser = new UserSerializer(
      {
        email: user.email,
        username: user.username,
        bio: user.bio ?? null,
        image: user.image ?? null,
      },
      { type: 'BASIC_INFO' },
    ).serialize();

    return {
      user: serializedUser,
    };
  }

  private async buildLoginResponse(user: {
    id: string;
    email: string;
    username: string;
    bio?: string | null;
    image?: string | null;
  }): Promise<LoginResponse> {
    const token = await this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
    });

    return {
      ...this.buildBasicInfoResponse(user),
      token,
    };
  }
}
