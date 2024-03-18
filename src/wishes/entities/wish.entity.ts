import { IsPositive, IsUrl, Length } from 'class-validator';
import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Offer } from 'src/offers/entities/offer.entity';
import { User } from 'src/users/entities/user.entity';
import { Wishlist } from 'src/wishlists/entities/wishlist.entity';

@Entity()
export class Wish {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  createdAt: Date;

  @Column()
  updatedAt: Date;

  @Column()
  @Length(1, 30)
  name: string;

  @Column()
  @IsUrl()
  link: string;

  @Column()
  @IsUrl()
  image: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  @IsPositive()
  price: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  @IsPositive()
  raised: number;

  @ManyToOne(() => User, (user) => user.wishes)
  @JoinTable()
  owner: User;

  @Column()
  @Length(1, 1024)
  description: string;

  @ManyToOne(() => Offer, (offer) => offer.item)
  offers: number[];

  @Column({ type: 'int', default: 0 })
  copied: number;

  @ManyToMany(() => Wishlist, (wishlist) => wishlist.items)
  wishlists: Wishlist[];
}
