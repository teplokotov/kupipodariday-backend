import { ApiProperty } from '@nestjs/swagger';
import {
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsString,
  IsUrl,
  Length,
} from 'class-validator';
import { User } from 'src/users/entities/user.entity';
import { Wish } from 'src/wishes/entities/wish.entity';

export class WishlistDto {
  @IsNumber()
  @IsNotEmpty()
  id: number;

  @IsDate()
  @IsNotEmpty()
  createdAt: Date;

  @IsDate()
  @IsNotEmpty()
  updatedAt: Date;

  @ApiProperty({ example: 'Мой вишлист' })
  @IsString()
  @Length(1, 250)
  @IsNotEmpty()
  name: string;

  @IsString()
  @Length(0, 1500)
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: 'https://i.pravatar.cc/150?img=3' })
  @IsString()
  @IsUrl()
  @IsNotEmpty()
  image: string;

  @IsNotEmpty()
  items: Wish[];

  @IsNotEmpty()
  owner: User;

  @ApiProperty({ example: [1] })
  @IsNumber({}, { each: true })
  @IsNotEmpty()
  itemsId: number[];
}
