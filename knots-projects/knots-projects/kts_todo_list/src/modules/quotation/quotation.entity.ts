import {Field, Float, ID, Int, ObjectType} from 'type-graphql';
import {
  BaseEntity,
  Column,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';
import {Node} from '../node/node.interface';
import { QuotationStatus } from '../quotationStatus/quotationStatus.entity';
import { Project } from '../project/project.entity';
import { Client } from '../client/client.entity';
import { ClientContacts } from '../clientContacts/clientContacts.entity';
import { QuotationFile } from '../quotationFile /quotationFile.entity';

@ObjectType({implements: Node})
@Entity({name: 'quotation_info'})
@Index(['year', 'month', 'sequenceNumber', 'clientPrefix'], {unique: true})
export class Quotation extends BaseEntity implements Node {
  @Field(type => ID)
  @PrimaryGeneratedColumn()
  id: string;

  @Index()
  @Field(type=>String,{nullable: true})
  @Column({nullable: true, type: 'varchar', length: 45, name: 'code'})
  code?: string;

  @Index()
  @Field({ nullable: true })
  @Column({nullable: true, type: 'int', name: 'year'})
  year?: number;

  @Index()
  @Field({ nullable: true })
  @Column({nullable: true, type: 'int', name: 'month'})
  month?: number;

  @Index()
  @Field({ nullable: true })
  @Column({nullable: true, type: 'int', name: 'sequence_number'})
  sequenceNumber?: number;

  @Index()
  @Column({nullable: true, type: 'varchar', length: 45, name: 'project_id'})
  projectId?: string;

  @Field(type => Project, { nullable: true })
  project?: Promise<Project>;

  @Index()
  @Field(type=>String,{nullable: true})
  @Column({nullable: true, type: 'varchar', length: 45, name: 'quote_id'})
  quoteId?: string;

  @Index()
  @Field({nullable: true})
  @Column({nullable: true, type: 'int', name: 'status', default: 1})
  status?: boolean;

  @Index()
  @Field({ nullable: true })
  @Column({nullable: true, type: 'varchar', length: 250, name: 'title'})
  title?: string;

  @Index()
  @Column({nullable: true, type: 'int', name: 'progress'})
  progressId?: number;

  @Field(type => QuotationStatus, { nullable: true })
  progress?: Promise<QuotationStatus>;

  @Field(type=>String,{nullable: true})
  @Column({nullable: true, type: 'longtext', name: 'cmsRemark'})
  cmsRemark?: string;

  @Field(type=>String,{nullable: true})
  @Column({nullable: true, type: 'longtext', name: 'remark'})
  remark?: string;

  @Index()
  @Column({nullable: true, type: 'int', name: 'client_id', default: 0})
  clientId?: number;

  @Index()
  @Field(type=>String,{nullable: true})
  @Column({ nullable: true, type: 'varchar', name: 'client_prefix', length: 5 })
  clientPrefix?: string;

  @Field(type => Client, { nullable: true })
  client?: Promise<Client>;

  @Index()
  @Column({nullable: true, type: 'int', name: 'main_contacts_id', default: 0})
  mainContacts_id?: number;

  @Field(type => ClientContacts, { nullable: true })
  mainContact?: Promise<ClientContacts>;

  @Field(type=>String,{nullable: true})
  @Column({nullable: true, type: 'varchar', length: 200, name: 'sendFrom'})
  sendFrom?: string;

  @Field(type=>String,{nullable: true})
  @Column({nullable: true, type: 'varchar', length: 200, name: 'sendTo'})
  sendTo?: string;

  @Field(type=>String,{nullable: true})
  @Column({nullable: true, type: 'varchar', length: 200, name: 'attn'})
  attn?: string;

  @Field(type=>String,{nullable: true})
  @Column({nullable: true, type: 'varchar', length: 200, name: 'email'})
  email?: string;

  @Field(type=>String,{nullable: true})
  @Column({nullable: true, type: 'varchar', length: 500, name: 'address'})
  address?: string;

  @Index()
  @Field(type=>String,{nullable: true})
  @Column({nullable: true, type: 'varchar', length: 20, name: 'date'})
  date?: string;

  @Field(type=>String,{nullable: true})
  @Column({nullable: true, type: 'text', name: 'company_info'})
  companyInfo?: string;

  @Index()
  @Field(type=>Int, { nullable: true })
  @Column({type: 'int', name: 'currency_id'})
  currencyId: number;

  @Index()
  @Field(type=>String,{nullable: true})
  @Column({nullable: true, type: 'varchar', length: 45, name: 'currency', default: 'HK$'})
  currency?: string;

  @Field(type=>Float)
  @Column({type: 'float', name: 'budget', default: 0})
  budget: number;

  @Field(type=>Float)
  @Column({type: 'float', name: 'budget_max', default: 0})
  budgetMax: number;

  @Field({nullable: true})
  @Column({nullable:true, type: 'longtext'})
  form?: string;

  @Field(type=>Int, { nullable: true })
  @Column({nullable: true, type: 'int', name: 'markup', default: 0})
  markup?: number;

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

  @Field(type=>String, { nullable: true })
  @Column({nullable: true, type: 'longtext', name: 'term'})
  term?: string;

  @Field(type=>String, { nullable: true })
  @Column({nullable: true, type: 'longtext', name: 'inUsed'})
  inUsed?: string;

  @Field(type=>String, { nullable: true })
  @Column({nullable: true, type: 'varchar', length: 45, name: 'workOrder_No'})
  workOrderNo?: string;

  @Index()
  @Field({ nullable: true })
  @Column({nullable:true, default: false})
  deleted?: boolean;

  @Index()
  @Field({
    nullable: true,
  })
  @Column({ name: 'createAt', type: 'bigint', nullable: true, })
  createAt: number;

  @Index()
  @Field({
    nullable: true,
  })
  @Column({ name: 'editAt', type: 'bigint', nullable: true, })
  editAt: number;

  @Field(type => [QuotationFile],
    {nullable: true},
  )
  quotationFiles?: Promise<QuotationFile[]>;

}
