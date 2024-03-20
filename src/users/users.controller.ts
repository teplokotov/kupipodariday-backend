import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { UserProfileResponseDto } from './dto/user-profile-response.dto';
import { UserPublicProfileResponseDto } from './dto/user-public-profile-response.dto';
import { AuthUser } from 'src/common/decorators/user.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  @Get()
  findAll(): Promise<User[]> {
    return this.usersService.findAll();
  }

  @Get('me')
  async findOne(@AuthUser() user: User): Promise<User> {
    const { id } = user;
    return this.usersService.findOne({
      where: { id },
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
  }

  @Patch('me')
  async update(@AuthUser() user: User, @Body() dto: UpdateUserDto) {
    const { id } = user;
    return this.usersService.updateOne(id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id') id: string, @Body() dto: UserProfileResponseDto) {
    return this.usersService.removeOne(+id, dto);
  }
}
