import { BasicInfoUser, UserSerializer } from './serializers/user.serializer';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { I18nService } from 'nestjs-i18n';
import { User } from './user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly i18n: I18nService,
  ) {}

  async findAll(): Promise<User[]> {
    return this.userRepository.find({ order: { createdAt: 'DESC' } });
  }

  async findById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(
        this.i18n.translate('common.USERS.NOT_FOUND'),
      );
    }
    return user;
  }

  async findByEmail(
    email: string,
    options?: { includePasswordHash?: boolean },
  ): Promise<User | null> {
    const normalizedEmail = email.trim().toLowerCase();

    if (options?.includePasswordHash) {
      return this.userRepository
        .createQueryBuilder('user')
        .addSelect('user.passwordHash')
        .where('user.email = :email', { email: normalizedEmail })
        .getOne();
    }

    return this.userRepository.findOne({ where: { email: normalizedEmail } });
  }

  async create(input: {
    email: string;
    username: string;
    passwordHash: string;
  }): Promise<User> {
    const emailNormalized = input.email.trim().toLowerCase();
    const usernameNormalized = input.username.trim();

    if (!usernameNormalized) {
      throw new BadRequestException(
        this.i18n.translate('common.USERS.USERNAME_REQUIRED'),
      );
    }

    const [existingEmail, existingUsername] = await Promise.all([
      this.findByEmail(emailNormalized),
      this.findByUsername(usernameNormalized),
    ]);

    if (existingEmail || existingUsername) {
      throw new ConflictException(
        this.i18n.translate('common.USERS.EMAIL_OR_USERNAME_ALREADY_USED'),
      );
    }

    const user = this.userRepository.create({
      email: emailNormalized,
      username: usernameNormalized,
      passwordHash: input.passwordHash,
    });

    try {
      return await this.userRepository.save(user);
    } catch (error) {
      if (this.isDuplicateKeyError(error)) {
        throw new ConflictException(
          this.i18n.translate('common.USERS.EMAIL_OR_USERNAME_ALREADY_USED'),
        );
      }
      throw error;
    }
  }

  async updateCurrentUser(
    userId: string,
    patch: {
      email?: string | null;
      username?: string | null;
      passwordHash?: string;
      bio?: string | null;
      image?: string | null;
    },
  ): Promise<BasicInfoUser> {
    const user = await this.findById(userId);

    const nextEmail = patch.email;
    const nextUsername = patch.username;
    if (typeof nextEmail === 'string' && nextEmail !== user.email) {
      const existingEmailUser = await this.findByEmail(nextEmail);
      if (existingEmailUser && existingEmailUser.id !== user.id) {
        throw new ConflictException(
          this.i18n.translate('common.USERS.EMAIL_OR_USERNAME_ALREADY_USED'),
        );
      }
      user.email = nextEmail;
    }

    if (typeof nextUsername === 'string' && nextUsername !== user.username) {
      const existingUsernameUser = await this.findByUsername(nextUsername);
      if (existingUsernameUser && existingUsernameUser.id !== user.id) {
        throw new ConflictException(
          this.i18n.translate('common.USERS.EMAIL_OR_USERNAME_ALREADY_USED'),
        );
      }
      user.username = nextUsername;
    }

    if (patch.passwordHash !== undefined) {
      user.passwordHash = patch.passwordHash;
    }

    if (patch.bio !== undefined) {
      user.bio = patch.bio;
    }

    if (patch.image !== undefined) {
      user.image = patch.image;
    }

    try {
      const updatedUser = await this.userRepository.save(user);
      const serialized = new UserSerializer(
        { ...updatedUser },
        {
          type: 'BASIC_INFO',
        },
      ).serialize();
      return serialized;
    } catch (error) {
      if (this.isDuplicateKeyError(error)) {
        throw new ConflictException(
          this.i18n.translate('common.USERS.EMAIL_OR_USERNAME_ALREADY_USED'),
        );
      }
      throw error;
    }
  }

  private findByUsername(username: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { username } });
  }

  private isDuplicateKeyError(error: unknown): boolean {
    const dbError = error as { code?: string; errno?: number };
    return (
      dbError?.code === '23505' || // PostgreSQL unique_violation
      dbError?.code === 'ER_DUP_ENTRY' || // MySQL
      dbError?.errno === 1062 || // MySQL numeric errno
      dbError?.code === 'SQLITE_CONSTRAINT' || // SQLite constraint violation
      dbError?.code === 'SQLITE_CONSTRAINT_UNIQUE' || // SQLite unique constraint violation
      dbError?.errno === 19 // SQLite constraint violation errno
    );
  }
}
