import {Field, Float, ID, ObjectType} from 'type-graphql';
import {
  BaseEntity,
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import {Node} from '../node/node.interface';
import { Client } from '../client/client.entity';
import { ClientContacts } from '../clientContacts/clientContacts.entity';
import {JSONResolver} from "graphql-scalars";
import { BookKeepingAccount } from '../bookKeepingAccount/bookKeepingAccount.entity';
import { BookKeepingTransaction } from '../bookKeepingTransaction/bookKeepingTransaction.entity';

@ObjectType({implements: Node})
@Entity({name: 'invoice'})
export class ProjectInvoice extends BaseEntity implements Node {
  @Field(type => ID)
  @PrimaryGeneratedColumn()
  id: string;

  @Index()
  @Field({ nullable: true })
  @Column({
    type: 'varchar',
    length: 10,
    nullable: true,
  })
  date?: string;

  @Index()
  @Field({nullable:true})
  @Column({
    type: 'int',
    name: 'financial_year',
    nullable: true,
  })
  financialYear?: number;

  @Index()
  @Field()
  @Column({ name: 'financial_year_start' })
  financialYearStart: number;

  @Index()
  @Field()
  @Column({ name: 'financial_year_end' })
  financialYearEnd: number;
  
  @Index()
  @Field({nullable:true})
  @Column({
    type: 'int',
    name: 'year_case',
    nullable: true,
  })
  yearCase?: number;

  @Index()
  @Field({nullable:true})
  @Column({
    type: 'varchar',
    length: 256,
    name: 'inv_id',
    nullable: true,
  })
  invId?: string;

  @Index()
  @Field()
  @Column({
    default: true,
  })
  status: boolean;

  @Index()
  @Field()
  @Column({
    default: false,
  })
  sent: boolean;

  @Field({ nullable: true })
  @Column({
    type: 'text',
    name: 'works_order',
    nullable: true,
  })
  worksOrder?: string;

  @Index()
  @Field({ nullable: true })
  @Column({
    type: 'varchar',
    length: 256,
    name: 'quotation_no',
    nullable: true,
  })
  quotationNo?: string;

  @Field({ nullable: true })
  @Column({
    type: 'text',
    nullable: true,
  })
  remark?: string;

  @Index()
  @Field({ nullable: true })
  @Column({
    type: 'varchar',
    length: 256,
    name: 'project_id',
    nullable: true,
  })
  projectId?: string;

  @Index()
  @Field({ nullable: true })
  @Column({
    type: 'varchar',
    length: 256,
    nullable: true,
  })
  project?: string;

  @Field({ nullable: true })
  @Column({
    type: 'longtext',
    nullable: true,
  })
  invoice?: string;

  @Field({ nullable: true })
  @Column({
    type: 'float',
    default: 0,
  })
  balance?: number;

  @Index()
  @Field({ nullable: true })
  @Column({
    type: 'varchar',
    length: 10,
    nullable: true,
  })
  paid?: string;

  @Field( { nullable: true })
  @Column({
    type: 'text',
    nullable: true,
  })
  remarks?: string;

  @Index()
  @Field({ nullable: true })
  @Column({
    type: 'varchar',
    name: 'submit_form',
    length: 10,
    nullable: true,
  })
  submitForm?: string;

  @Index()
  @Field({ nullable: true })
  @Column({
    type: 'varchar',
    name: 'signed_form',
    length: 10,
    nullable: true,
  })
  signedForm?: string;

  @Field({ nullable: true })
  @Column({
    type: 'text',
    name: 'client_info',
    nullable: true,
  })
  clientInfo?: string;

  @Index()
  @Column({nullable: true, type: 'int', name: 'client_id', default: 0})
  clientId?: number;

  @Field(type => Client, { nullable: true })
  client?: Promise<Client>;

  @Index()
  @Column({nullable: true, type: 'int', name: 'main_contacts_id', default: 0})
  mainContacts_id?: number;

  @Field(type => ClientContacts, { nullable: true })
  mainContact?: Promise<ClientContacts>;

  @Field({ nullable: true })
  @Column({
    type: 'text',
    name: 'company_info',
    nullable: true,
  })
  companyInfo?: string;

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
  @Field(type=>Float, { nullable: true })
  @Column({nullable: true, type: 'float', name: 'totalAmount', default: 0})
  totalAmount?: number;

  @Field(type=>Float, { nullable: true })
  @Column({nullable: true, type: 'float', name: 'discountRatio', default: 0})
  discountRatio?: number;

  @Field(type=>Float, { nullable: true })
  @Column({nullable: true, type: 'float', name: 'ratioDiscount', default: 0})
  ratioDiscount?: number;

  @Field(type=>Float, { nullable: true })
  @Column({nullable: true, type: 'float', name: 'discount', default: 0})
  discount?: number;

  @Field(type=>Float, { nullable: true })
  @Column({nullable: true, type: 'float', name: 'grandTotal', default: 0})
  grandTotal?: number;

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

  @Field(type => JSONResolver, { nullable: true })
  @Column({
    type: "json",
    nullable: true,
  })
  term?: object;

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
  @Column({ name: 'bank_account_id', nullable: true, type: 'uuid', length: 36 })
  bankAccountId?: string;

  @Field(type => BookKeepingAccount, { nullable: true })
  @ManyToOne(type => BookKeepingAccount)
  @JoinColumn({
    name: "bank_account_id",
  })
  bankAccount?: Promise<BookKeepingAccount>;

  @Index()
  @Column({ name: 'transaction_id', nullable: true, type: 'uuid', length: 36})
  transactionId?: string;

  @Field(type => BookKeepingTransaction, { nullable: true })
  @ManyToOne(type => BookKeepingTransaction)
  @JoinColumn({ name: 'transaction_id' })
  transaction: Promise<BookKeepingTransaction>;

  @Index()
  @Field()
  @Column({ default: false })
  settlement: boolean;

  @Field()
  @Column({nullable:true, default: false})
  deleted?: boolean;

}
