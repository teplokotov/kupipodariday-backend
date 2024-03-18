import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, IsUrl, Length } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ example: 'exampleuser' })
  @IsString()
  @Length(1, 64)
  username: string;

  @ApiProperty({ example: 'exampleuser' })
  @IsString()
  @Length(0, 200)
  about: string;

  @ApiProperty({ example: 'https://i.pravatar.cc/150?img=3' })
  @IsUrl()
  @Length(0, 200)
  avatar: string;

  @ApiProperty({ example: 'user@yandex.ru' })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'somestrongpassword' })
  @Length(2)
  password: string;
}
