import {
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsString,
  IsUrl,
  Length,
  Min,
} from 'class-validator';
import { User } from 'src/users/entities/user.entity';

export class WishDto {
  @IsNumber()
  @IsNotEmpty()
  id: number;

  @IsDate()
  @IsNotEmpty()
  createdAt: Date;

  @IsDate()
  @IsNotEmpty()
  updatedAt: Date;

  @IsString()
  @Length(1, 250)
  @IsNotEmpty()
  name: string;

  @IsUrl()
  @Length(0, 200)
  @IsNotEmpty()
  link: string;

  @IsUrl()
  @Length(0, 200)
  @IsNotEmpty()
  image: string;

  @IsNumber()
  @Min(1)
  @IsNotEmpty()
  price: number;

  @IsNumber()
  @Min(1)
  @IsNotEmpty()
  raised: number;

  @IsNotEmpty()
  owner: User;

  @IsString()
  @Length(1, 1024)
  @IsNotEmpty()
  description: string;

  @IsNotEmpty()
  offers: number[];

  @IsNotEmpty()
  copied: number;
}
