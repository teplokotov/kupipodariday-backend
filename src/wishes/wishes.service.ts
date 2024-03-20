import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateWishDto } from './dto/create-wish.dto';
import { UpdateWishDto } from './dto/update-wish.dto';
import { User } from 'src/users/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Wish } from './entities/wish.entity';
import { Repository } from 'typeorm';

@Injectable()
export class WishesService {
  constructor(
    @InjectRepository(Wish)
    private wishesRepository: Repository<Wish>,
  ) {}

  create(dto: CreateWishDto, user: User) {
    return this.wishesRepository.save({ ...dto, user });
  }

  async findAll(): Promise<Wish[]> {
    const wishes = await this.wishesRepository.find();

    if (wishes.length === 0) {
      throw new NotFoundException('Wishes not found');
    }

    return wishes;
  }

  findOne(id: number): Promise<Wish> {
    return this.wishesRepository.findOne({
      where: { id },
      relations: ['owner', 'offers'],
    });
  }

  async update(id: number, dto: UpdateWishDto, userId: number) {
    if (userId !== id) {
      throw new ForbiddenException('You can update only your wish');
    }

    const wish = await this.wishesRepository.findOneBy({ id });

    if (!wish) {
      throw new NotFoundException('Wish not found');
    }

    if (wish.offers.length > 0) {
      throw new BadRequestException('You can not update wish with offers');
    }

    return this.wishesRepository.save({ ...dto, id });
  }

  async remove(id: number, userId: number) {
    if (userId !== id) {
      throw new ForbiddenException('You can delete only your wish');
    }

    const wish = await this.wishesRepository.findOneBy({ id });

    if (!wish) {
      throw new NotFoundException('Wish not found');
    }

    return this.wishesRepository.delete(id);
  }
}
