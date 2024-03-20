import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserProfileResponseDto } from './dto/user-profile-response.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { FindOneOptions, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UserPublicProfileResponseDto } from './dto/user-public-profile-response.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(dto: CreateUserDto): Promise<User> {
    const { username, email, password } = dto;
    const isUserExists = await this.usersRepository.findOneBy([
      { username },
      { email },
    ]);

    if (isUserExists) {
      throw new ForbiddenException('User already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await this.usersRepository.save({
      ...dto,
      password: hashedPassword,
    });

    const {
      password: _password,
      email: _email,
      ...rest
    } = JSON.parse(JSON.stringify(user));

    return rest;
  }

  async findAll(): Promise<User[]> {
    const users = await this.usersRepository.find();

    if (users.length === 0) {
      throw new NotFoundException('Users not found');
    }

    return users;
  }

  async findOne(query: FindOneOptions<User>): Promise<User> {
    const user = await this.usersRepository.findOne(query);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async updateOne(id: number, dto: UpdateUserDto): Promise<User> {
    const { password } = dto;
    const user = await this.usersRepository.findOneBy({ id });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      return this.usersRepository.save({
        ...dto,
        id,
        password: hashedPassword,
      });
    }

    return this.usersRepository.save({ ...dto, id });
  }

  async removeOne(id: number, userId: number) {
    const user = await this.usersRepository.findOneBy({ id });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.id !== userId) {
      throw new ForbiddenException('You can remove only your profile');
    }

    return this.usersRepository.delete(id);
  }

  async findMany(query: string): Promise<User | User[]> {
    const users = await this.usersRepository.find({
      where: [{ username: query }, { email: query }],
      select: {
        id: true,
        createdAt: true,
        updatedAt: true,
        username: true,
        about: true,
        avatar: true,
        email: true,
      },
    });

    if (users.length === 0) {
      throw new NotFoundException('User not found');
    }

    return users;
  }
}
