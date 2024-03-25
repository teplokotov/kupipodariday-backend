import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateWishDto } from './dto/create-wish.dto';
import { UpdateWishDto } from './dto/update-wish.dto';
import { User } from 'src/users/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Wish } from './entities/wish.entity';
import { DataSource, FindOneOptions, Repository } from 'typeorm';

@Injectable()
export class WishesService {
  constructor(
    @InjectRepository(Wish)
    private wishesRepository: Repository<Wish>,
    private readonly dataSource: DataSource,
  ) {}

  async create(dto: CreateWishDto, user: User): Promise<Wish> {
    const insertResult = await this.wishesRepository.insert({
      ...dto,
      copied: 0,
      raised: 0,
      owner: user,
    });

    const id = insertResult.identifiers[0].id;
    const wish = await this.wishesRepository.findOneBy({ id });

    if (!wish) {
      throw new NotFoundException('Wish not created');
    }

    return wish;
  }

  async findAll(): Promise<Wish[]> {
    const wishes = await this.wishesRepository.find();

    if (wishes.length === 0) {
      throw new NotFoundException('Wishes not found');
    }

    return wishes;
  }

  async findOne(query: FindOneOptions<Wish>): Promise<Wish> {
    const wish = await this.wishesRepository.findOne(query);

    if (!wish) {
      throw new NotFoundException('Wish not found');
    }

    return wish;
  }

  async update(id: number, dto: Partial<UpdateWishDto>, userId: number) {
    const wish = await this.wishesRepository.findOneBy({ id });

    if (!wish) {
      throw new NotFoundException('Wish not found');
    }

    if (wish.owner.id !== userId) {
      throw new ForbiddenException('You can update only your wish');
    }

    if (wish.offers.length > 0) {
      throw new BadRequestException('You can not update wish with offers');
    }

    return this.wishesRepository.save({ ...dto, id });
  }

  async remove(id: number, userId: number) {
    const wish = await this.wishesRepository.findOneBy({ id });

    if (!wish) {
      throw new NotFoundException('Wish not found');
    }

    if (wish.owner.id !== userId) {
      throw new ForbiddenException('You can delete only your wish');
    }

    return this.wishesRepository.delete(id);
  }

  async findLast(): Promise<Wish[]> {
    return this.wishesRepository.find({
      take: 40,
      order: { createdAt: 'DESC' },
      relations: ['owner', 'offers'],
    });
  }

  async findTop(): Promise<Wish[]> {
    return this.wishesRepository.find({
      take: 10,
      order: { copied: 'ASC' },
      relations: ['owner', 'offers'],
    });
  }

  async copy(id: number, user: User) {
    const wish = await this.wishesRepository.findOne({
      where: { id },
      relations: ['owner'],
    });

    if (!wish) {
      throw new NotFoundException('Wish not found');
    }

    if (wish.owner.id === user.id) {
      throw new ForbiddenException('You can not copy your own wish');
    }

    const hasCopied = await this.wishesRepository.findOneBy({
      name: wish.name,
      link: wish.link,
      image: wish.image,
      price: wish.price,
      owner: { id: user.id },
    });

    if (hasCopied) {
      throw new ForbiddenException('You already have copied this wish');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await this.create(wish, user);
      await this.wishesRepository.update(id, { copied: wish.copied + 1 });
      return wish;
    } catch (err) {
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }
}
