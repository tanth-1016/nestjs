import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { I18nService } from 'nestjs-i18n';
import * as bcrypt from 'bcrypt';
import { User } from './user.entity';
import { UsersService } from './users.service';
import { LoginDto, RegisterDto, UpdateCurrentUserDto } from './dto';
import { UserSerializer } from './serializers/user.serializer';
import type { BasicInfoUserResponse } from './serializers/user.serializer';

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

    return this.buildUserResponse(createdUser);
  }

  async login(dto: LoginDto): Promise<BasicInfoUserResponse> {
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

    return this.buildUserResponse(user);
  }

  async getCurrentUser(userId: string): Promise<BasicInfoUserResponse> {
    const user = await this.usersService.findById(userId);
    return this.buildUserResponse(user);
  }

  async updateCurrentUser(
    userId: string,
    dto: UpdateCurrentUserDto,
  ): Promise<BasicInfoUserResponse> {
    const currentUser = await this.usersService.findById(userId);

    if (
      dto.user.password !== undefined &&
      typeof dto.user.password !== 'string'
    ) {
      throw new BadRequestException(
        this.i18n.translate('common.USERS.PASSWORD_MUST_BE_STRING'),
      );
    }

    const passwordHash =
      typeof dto.user.password === 'string'
        ? await bcrypt.hash(dto.user.password, 10)
        : undefined;

    const nextEmail = dto.user.email;
    const nextUsername = dto.user.username;
    const nextBio = dto.user.bio;
    const nextImage = dto.user.image;

    const hasEmailChange =
      nextEmail !== undefined && nextEmail !== currentUser.email;
    const hasUsernameChange =
      nextUsername !== undefined && nextUsername !== currentUser.username;
    const hasPasswordChange = passwordHash !== undefined;
    const hasBioChange = nextBio !== undefined && nextBio !== currentUser.bio;
    const hasImageChange =
      nextImage !== undefined && nextImage !== currentUser.image;

    if (
      !hasEmailChange &&
      !hasUsernameChange &&
      !hasPasswordChange &&
      !hasBioChange &&
      !hasImageChange
    ) {
      return this.buildUserResponse(currentUser);
    }

    const patch = {
      email: hasEmailChange ? nextEmail : undefined,
      username: hasUsernameChange ? nextUsername : undefined,
      passwordHash: hasPasswordChange ? passwordHash : undefined,
      bio: hasBioChange ? nextBio : undefined,
      image: hasImageChange ? nextImage : undefined,
    };

    const user = await this.usersService.updateCurrentUser(userId, patch);
    return this.buildUserResponse(user);
  }

  private async buildUserResponse(user: User): Promise<BasicInfoUserResponse> {
    const token = await this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
    });

    const serializedUser = new UserSerializer(
      {
        email: user.email,
        token,
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
}
