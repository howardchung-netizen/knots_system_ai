import { ObjectType, Field, ID } from 'type-graphql';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany, Index, CreateDateColumn, UpdateDateColumn, BaseEntity } from 'typeorm';
import { Node } from '../node/node.interface';
import { BookKeepingAccount } from '../bookKeepingAccount/bookKeepingAccount.entity';

@ObjectType({ implements: Node })
@Entity()
export class BookKeepingAccountType extends BaseEntity implements Node {
  @Field(type => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Field()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Index()
  @Field()
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Index()
  @Field()
  @Column()
  name: string;

  @Index()
  @Field()
  @Column({
    default: 0,
  })
  order: number;

  @Index()
  @Field()
  @Column({ default: false, name: 'increase_debit' })
  increaseDebit: boolean;

  @OneToMany(type => BookKeepingAccount, account => account.accountType)
  accounts: Promise<BookKeepingAccount[]>;

  @Index()
  @Field(type => Boolean)
  @Column({ default: false })
  deleted: boolean;
}
