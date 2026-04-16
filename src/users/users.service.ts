import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findAll(): Promise<User[]> {
    return this.userRepository.find({ order: { createdAt: 'DESC' } });
  }

  async findById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
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
      throw new BadRequestException('Username is required');
    }

    const [existingEmail, existingUsername] = await Promise.all([
      this.findByEmail(emailNormalized),
      this.findByUsername(usernameNormalized),
    ]);

    if (existingEmail || existingUsername) {
      throw new ConflictException('Email or username already used');
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
        throw new ConflictException('Email or username already used');
      }
      throw error;
    }
  }

  async updateCurrentUser(
    userId: string,
    patch: {
      email?: string;
      username?: string;
      passwordHash?: string;
      bio?: string | null;
      image?: string | null;
    },
  ): Promise<User> {
    const user = await this.findById(userId);

    const nextEmail =
      patch.email !== undefined ? patch.email.trim().toLowerCase() : undefined;
    const nextUsername =
      patch.username !== undefined ? patch.username.trim() : undefined;

    if (nextUsername !== undefined && nextUsername.length === 0) {
      throw new BadRequestException('Username cannot be empty');
    }

    if (nextEmail && nextEmail !== user.email) {
      const existingEmailUser = await this.findByEmail(nextEmail);
      if (existingEmailUser && existingEmailUser.id !== user.id) {
        throw new ConflictException('Email or username already used');
      }
      user.email = nextEmail;
    }

    if (nextUsername && nextUsername !== user.username) {
      const existingUsernameUser = await this.findByUsername(nextUsername);
      if (existingUsernameUser && existingUsernameUser.id !== user.id) {
        throw new ConflictException('Email or username already used');
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
      return await this.userRepository.save(user);
    } catch (error) {
      if (this.isDuplicateKeyError(error)) {
        throw new ConflictException('Email or username already used');
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
