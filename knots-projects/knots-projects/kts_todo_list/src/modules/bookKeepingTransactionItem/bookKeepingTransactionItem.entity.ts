import { ObjectType, Field, Float, ID } from 'type-graphql';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, Index, UpdateDateColumn, JoinColumn, BaseEntity } from 'typeorm';
import { Node } from '../node/node.interface';
import { BookKeepingTransaction } from '../bookKeepingTransaction/bookKeepingTransaction.entity';
import { BookKeepingAccount } from '../bookKeepingAccount/bookKeepingAccount.entity';

@ObjectType({ implements: Node })
@Entity()
export class BookKeepingTransactionItem extends BaseEntity implements Node {
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

  @Field(type => BookKeepingTransaction)
  @ManyToOne(type => BookKeepingTransaction, transaction => transaction.transactionItems)
  @JoinColumn({ name: 'transaction_id' })
  transaction: Promise<BookKeepingTransaction>;

  @Index()
  @Column({ name: 'transaction_id', type: 'uuid', length: 36 })
  transactionId: string;

  @Field(type => BookKeepingAccount)
  @ManyToOne(type => BookKeepingAccount)
  @JoinColumn({ name: 'account_id' })
  account: Promise<BookKeepingAccount>;

  @Index()
  @Column({ name: 'account_id', type: 'uuid', length: 36 })
  accountId: string;

  @Field()
  @Column()
  desc: string;

  @Field(type => Float)
  @Column({ type: 'decimal', default: 0, precision: 10, scale: 2 })
  amount: number;

  @Index()
  @Field()
  @Column({ default: false, name: 'is_debit' })
  isDebit: boolean;

  @Index()
  @Field(type => Boolean)
  @Column({ default: false, name: 'is_opening_balance' })
  isOpeningBalance: boolean;

  @Index()
  @Field(type => Boolean)
  @Column({ default: false })
  deleted: boolean;
}
