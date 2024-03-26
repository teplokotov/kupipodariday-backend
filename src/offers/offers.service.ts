import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateOfferDto } from './dto/create-offer.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Offer } from './entities/offer.entity';
import { DataSource, Repository } from 'typeorm';
import { WishesService } from 'src/wishes/wishes.service';
import { User } from 'src/users/entities/user.entity';
import { Wish } from 'src/wishes/entities/wish.entity';

@Injectable()
export class OffersService {
  constructor(
    @InjectRepository(Offer)
    private offersRepository: Repository<Offer>,
    private wishesService: WishesService,
    private readonly dataSource: DataSource,
  ) {}

  async create(user: User, dto: CreateOfferDto): Promise<Offer> {
    const wish = await this.wishesService.findOne({
      where: { id: dto.itemId },
      relations: {
        owner: true,
        offers: true,
      },
    });

    if (!wish) {
      throw new NotFoundException('Wish not found');
    }

    if (wish.owner.id === user.id) {
      throw new ForbiddenException('You can not offer your own wish');
    }

    if (Number(wish.price) < Number(wish.raised) + Number(dto.amount)) {
      throw new ForbiddenException('You can not raise more than wish price');
    }

    const offer = this.offersRepository.create({
      ...dto,
      user,
      item: wish,
    });

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager.update(Wish, dto.itemId, {
        raised: Number(wish.raised) + Number(dto.amount),
      });
      await queryRunner.manager.insert(Offer, offer);
      await queryRunner.commitTransaction();
    } catch (err) {
      console.log(err);
      await queryRunner.rollbackTransaction();
      throw new BadRequestException('Offer not created');
    } finally {
      await queryRunner.release();
    }

    return offer;
  }

  async findAll(): Promise<Offer[]> {
    const offers = await this.offersRepository.find({
      relations: {
        user: true,
        item: true,
      },
    });

    return offers;
  }

  async findOne(id: number): Promise<Offer> {
    const offer = await this.offersRepository.findOne({
      where: { id },
      relations: {
        user: true,
        item: true,
      },
    });

    if (!offer) {
      throw new NotFoundException('Offer not found');
    }

    return offer;
  }
}
