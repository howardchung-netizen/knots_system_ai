import {Field, ID, ObjectType} from 'type-graphql';
import {
  BaseEntity,
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import {Node} from '../node/node.interface';
import { ChequeBookAllocate } from '../chequeBookAllocate/chequeBookAllocate.entity';
import { User } from '../user/user.entity';
import { BookKeepingAccount } from '../bookKeepingAccount/bookKeepingAccount.entity';
import { BookKeepingCompany } from '../bookKeepingCompany/bookKeepingCompany.entity';
import { BookKeepingTransaction } from '../bookKeepingTransaction/bookKeepingTransaction.entity';

@ObjectType({implements: Node})
@Entity({name: 'cheque_book'})
export class ChequeBook extends BaseEntity implements Node {
  @Field(type => ID)
  @PrimaryGeneratedColumn()
  id: string;

  @Index()
  @Field({ nullable: true })
  @Column({
    type: 'varchar',
    name: 'cheque_no',
    length: 45,
    nullable: true,
  })
  chequeNo?: string;

  @Index()
  @Field()
  @Column({
    type: 'int',
    name: 'confirm',
    default: false,
  })
  confirmTransfer: boolean;

  @Index()
  @Field()
  @Column({
    type: 'int',
    name: 'credit',
    default: true,
  })
  isCredit: boolean;

  @Index()
  @Field({nullable:true})
  @Column({
    type: 'varchar',
    length: 10,
    nullable: true,
  })
  date?: string;

  @Index()
  @Field({nullable:true})
  @Column({
    type: 'varchar',
    length: 256,
    nullable: true,
  })
  receiver?: string;

  @Index()
  @Field()
  @Column({
    type: 'float',
    default: 0,
  })
  amount: number;

  @Field({nullable:true})
  @Column({
    type: 'text',
    nullable: true,
  })
  allocate?: string;

  @Field(type => [ChequeBookAllocate])
  @OneToMany(type => ChequeBookAllocate, chequeBookAllocate => chequeBookAllocate.chequeBook)
  allocates: Promise<ChequeBookAllocate[]>;

  @Field({nullable:true})
  @Column({
    type: 'text',
    name: 'project_id',
    nullable: true,
  })
  projectId?: string;

  @Field({nullable:true})
  @Column({
    type: 'text',
    nullable: true,
  })
  desc?: string;

  @Field({ nullable: true })
  @Column({
    type: 'longtext',
    nullable: true,
  })
  remark?: string;

  @Index()
  @Field({
    nullable: true,
  })
  @Column({ name: 'createAt', type: 'bigint', nullable: true, })
  createAt: number;

  @Field({ nullable: true })
  @Column({
    type: 'varchar',
    length: 45,
    name: 'createFrom',
    nullable: true,
  })
  createFrom?: string;

  @Index()
  @Field({
    nullable: true,
  })
  @Column({ name: 'editAt', type: 'bigint', nullable: true, })
  editAt: number;

  @Field({ nullable: true })
  @Column({
    type: 'varchar',
    length: 45,
    name: 'editFrom',
    nullable: true,
  })
  editFrom?: string;

  @Index()
  @Field()
  @Column({default: false})
  cancel: boolean;

  @Index()
  @Field()
  @Column({default: false})
  deleted: boolean;

  @Index()
  @Field()
  @Column({
    name: 'for_petty_cash',
    default: false,
  })
  forPettyCash?: boolean;

  @Index()
  @Column({ name: 'for_petty_cash_staff_id', nullable: true, type: 'int' })
  forPettyCashStaffId?: number;

  @Field(type => User, { nullable: true })
  @ManyToOne(type => User)
  @JoinColumn({
    name: "for_petty_cash_staff_id",
  })
  forPettyCashStaff?: Promise<User>;

  @Index()
  @Column({ name: 'category_account_id', nullable: true, type: 'uuid', length: 36 })
  categoryAccountId?: string;

  @Field(type => BookKeepingAccount, { nullable: true })
  @ManyToOne(type => BookKeepingAccount)
  @JoinColumn({
    name: "category_account_id",
  })
  categoryAccount?: Promise<BookKeepingAccount>;

  @Index()
  @Column({ name: 'charge_account_id', nullable: true, type: 'uuid', length: 36 })
  chargeAccountId?: string;

  @Field(type => BookKeepingAccount, { nullable: true })
  @ManyToOne(type => BookKeepingAccount)
  @JoinColumn({ name: 'charge_account_id' })
  chargeAccount?: Promise<BookKeepingAccount>;

  @Field(type => BookKeepingCompany, { nullable: true })
  @ManyToOne(type => BookKeepingCompany)
  @JoinColumn({ name: 'company_id' })
  company?: Promise<BookKeepingCompany>;

  @Index()
  @Column({ name: 'company_id', nullable: true, type: 'uuid', length: 36 })
  companyId?: string;

  @Field(type => BookKeepingTransaction, { nullable: true })
  @ManyToOne(type => BookKeepingTransaction)
  @JoinColumn({ name: 'transaction_id' })
  transaction: Promise<BookKeepingTransaction>;

  @Index()
  @Column({ name: 'transaction_id', nullable: true, type: 'uuid', length: 36})
  transactionId?: string;

  @Field()
  @Column({ nullable: true })
  transactionDesc?: string;
}
