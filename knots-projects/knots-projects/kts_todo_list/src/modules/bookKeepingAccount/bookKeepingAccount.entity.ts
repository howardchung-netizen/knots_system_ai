import { ObjectType, Field, ID, Float } from 'type-graphql';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Index, CreateDateColumn, UpdateDateColumn, BaseEntity } from 'typeorm';
import { Node } from '../node/node.interface';
import { BookKeepingCompany } from '../bookKeepingCompany/bookKeepingCompany.entity';
import { BookKeepingAccountType } from '../bookKeepingAccountType/bookKeepingAccountType.entity';

@ObjectType({ implements: Node })
@Entity()
export class BookKeepingAccount extends BaseEntity implements Node {
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

  // Make companyId nullable in the database schema
  @Field(type => ID, { nullable: true })
  @Column({ name: 'company_id', type: 'uuid', length: 36, nullable: true })
  companyId?: string;

  // Define the ManyToOne relationship with BookKeepingCompany
  @Field(type => BookKeepingCompany, { nullable: true })
  @ManyToOne(type => BookKeepingCompany)
  @JoinColumn({ name: 'company_id' })
  company?: Promise<BookKeepingCompany>;

  @Column({ name: 'account_type_id', type: 'uuid', length: 36 })
  accountTypeId: string;

  @Field(type => BookKeepingAccountType)
  @ManyToOne(type => BookKeepingAccountType)
  @JoinColumn({ name: 'account_type_id' })
  accountType: Promise<BookKeepingAccountType>;

  @Column({ name: 'parent_account_id', nullable: true, type: 'uuid', length: 36 })
  parentAccountId?: string;

  @Field(type => BookKeepingAccount, { nullable: true })
  @ManyToOne(type => BookKeepingAccount, { nullable: true })
  @JoinColumn({ name: 'parent_account_id' })
  parentAccount?: Promise<BookKeepingAccount>;

  @Field()
  @Column({ name: 'name' })
  name: string;

  @Field(type => Float)
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0.0 })
  balance: number;

  @Field()
  @Column({ default: false, name: 'is_placeholder' })
  isPlaceholder: boolean;

  @Field()
  @Column({ default: false, name: 'is_claim' })
  isClaim: boolean;

  @Field()
  @Column({ default: false, name: 'is_bank' })
  isBank: boolean;

  @Field()
  @Column({ default: 0 })
  order: number;

  @Field(type => [BookKeepingAccount], { nullable: true })
  child?: BookKeepingAccount[] | null;

  @Field()
  @Column({ default: false })
  deleted: boolean;
}
