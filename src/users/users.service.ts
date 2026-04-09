import {
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
    if (options?.includePasswordHash) {
      return this.userRepository
        .createQueryBuilder('user')
        .addSelect('user.passwordHash')
        .where('user.email = :email', { email })
        .getOne();
    }

    return this.userRepository.findOne({ where: { email } });
  }

  async create(email: string, passwordHash: string): Promise<User> {
    const emailNormalized = email.trim().toLowerCase();
    const existingUser = await this.findByEmail(emailNormalized);
    if (existingUser) {
      throw new ConflictException('Email already used');
    }
    const user = this.userRepository.create({
      email: emailNormalized,
      passwordHash,
    });

    try {
      return await this.userRepository.save(user);
    } catch (error) {
      if (this.isDuplicateKeyError(error)) {
        throw new ConflictException('Email already used');
      }
      throw error;
    }
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
