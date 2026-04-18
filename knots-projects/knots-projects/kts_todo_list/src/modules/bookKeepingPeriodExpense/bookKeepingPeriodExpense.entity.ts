import { ObjectType, Field, ID, registerEnumType } from 'type-graphql';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, OneToMany, Index, JoinColumn, BaseEntity } from 'typeorm';
import { Node } from '../node/node.interface';
import { User } from '../user/user.entity';
import { BookKeepingAccount } from '../bookKeepingAccount/bookKeepingAccount.entity';
import { BookKeepingCompany } from '../bookKeepingCompany/bookKeepingCompany.entity';

export enum BookKeepingPeriodExpenseType {
  Monthly = 'monthly',
  Weekly = 'weekly',
  Quarterly = 'quarterly',
  Yearly = 'yearly',
}

registerEnumType(BookKeepingPeriodExpenseType, {
  name: 'BookKeepingPeriodExpenseType',
});

@ObjectType({ implements: Node })
@Entity()
export class BookKeepingPeriodExpense extends BaseEntity implements Node {
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

  @Field(type => BookKeepingCompany)
  @ManyToOne(type => BookKeepingCompany)
  @JoinColumn({ name: 'company_id' })
  company: Promise<BookKeepingCompany>;

  @Index()
  @Column({ name: 'company_id', type: 'uuid', length: 36 })
  companyId: string;

  @Index()
  @Field({ nullable: true })
  @Column({ type: 'date', name: 'from_date' })
  fromDate: string;

  @Index()
  @Field({ nullable: true })
  @Column({ type: 'date', name: 'to_date' })
  toDate: string;

  @Index()
  @Field()
  @Column({ type: 'enum', enum: BookKeepingPeriodExpenseType })
  period: BookKeepingPeriodExpenseType;

  @Index()
  @Field()
  @Column({ name: 'period_day' })
  periodDay: number;

  @Field()
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Index()
  @Column({ name: 'category_account_id', type: 'uuid', length: 36 })
  categoryAccountId: string;

  @Field(type => BookKeepingAccount)
  @ManyToOne(type => BookKeepingAccount)
  @JoinColumn({ name: 'category_account_id' })
  categoryAccount: Promise<BookKeepingAccount>;

  @Index()
  @Column({ name: 'person_in_charge_id', nullable: true, type: 'int' })
  personInChargeId?: number;

  @Field(type => User, { nullable: true })
  @ManyToOne(type => User, { nullable: true })
  @JoinColumn({ name: 'person_in_charge_id' })
  personInCharge?: Promise<User>;

  @Index()
  @Column({ name: 'charge_account_id', type: 'uuid' })
  chargeAccountId: string;

  @Field(type => BookKeepingAccount)
  @ManyToOne(type => BookKeepingAccount)
  @JoinColumn({ name: 'charge_account_id' })
  chargeAccount: Promise<BookKeepingAccount>;

  @Field({ nullable: true})
  @Column()
  desc: string;

  @Field({ nullable: true})
  @Column({ nullable: true })
  remark?: string;

  @Index()
  @Field()
  @Column({ default: false })
  deleted: boolean;
}
