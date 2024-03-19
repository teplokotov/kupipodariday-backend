import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { FindOneOptions, Repository } from 'typeorm';
import bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const { username, email, password } = createUserDto;
    const isUserExists = await this.usersRepository.findOneBy({
      username,
      email,
    });

    if (isUserExists) {
      throw new ForbiddenException('User already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    return this.usersRepository.save({
      ...createUserDto,
      password: hashedPassword,
    });
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  async findOne(query: FindOneOptions<User>): Promise<User> {
    return this.usersRepository.findOne(query);
  }

  async updateOne(id: number, updateUserDto: UpdateUserDto, user: User) {
    const { password } = updateUserDto;
    const userToUpdate = await this.usersRepository.findOneBy({ id });

    if (!userToUpdate) {
      throw new NotFoundException('User not found');
    }

    if (userToUpdate.id !== user.id) {
      throw new ForbiddenException('You can update only your profile');
    }

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      return this.usersRepository.save({
        ...userToUpdate,
        password: hashedPassword,
      });
    }

    return this.usersRepository.save(updateUserDto);
  }

  async removeOne(id: number, user: User) {
    const userToRemove = await this.usersRepository.findOneBy({ id });

    if (!userToRemove) {
      throw new NotFoundException('User not found');
    }

    if (userToRemove.id !== user.id) {
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
