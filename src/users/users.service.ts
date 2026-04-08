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

  async findByEmail(email: string): Promise<User | null> {
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
    return this.userRepository.save(user);
  }
}
