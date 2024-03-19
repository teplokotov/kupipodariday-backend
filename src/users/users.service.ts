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
    return this.usersRepository.find();
  }

  async findOne(query: FindOneOptions<User>): Promise<User> {
    return this.usersRepository.findOne(query);
  }

  async updateOne(id: number, dto: UpdateUserDto, user?: User) {
    const { password } = dto;
    const userToUpdate = await this.usersRepository.findOneBy({ id });

    if (!userToUpdate) {
      throw new NotFoundException('User not found');
    }

    // if (userToUpdate.id !== user.id) {
    //   throw new ForbiddenException('You can update only your profile');
    // }

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      return this.usersRepository.save({
        ...userToUpdate,
        password: hashedPassword,
      });
    }

    return this.usersRepository.save(dto);
  }

  async removeOne(id: number, dto: UserProfileResponseDto) {
    const userToRemove = await this.usersRepository.findOneBy({ id });

    if (!userToRemove) {
      throw new NotFoundException('User not found');
    }

    if (userToRemove.id !== dto.id) {
      throw new ForbiddenException('You can remove only your profile');
    }

    return this.usersRepository.delete(id);
  }

  async findMany(query: string): Promise<User | User[]> {
    return this.usersRepository.find({
      where: [{ username: query }, { email: query }],
    });
  }
}
