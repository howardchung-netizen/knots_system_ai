import {Field, ID, Int, ObjectType} from 'type-graphql';
import {
  BaseEntity,
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import {Node} from '../node/node.interface';
import { GraphQLDate } from 'graphql-iso-date';
import { Project } from '../project/project.entity';
import { BookKeepingTransaction } from '../bookKeepingTransaction/bookKeepingTransaction.entity';
import { BookKeepingAccount } from '../bookKeepingAccount/bookKeepingAccount.entity';
import { ClaimForm } from '../claimForm/claimForm.entity';
import { ProjectOrderFile } from '../projectOrderFile/projectOrderFile.entity';

export interface FileUpload {
  filename: string;
  mimetype: string;
  encoding: string;
}

@ObjectType({implements: Node})
@Entity({name: 'order_form'})
export class ProjectOrder extends BaseEntity implements Node {
  @Field(type => ID)
  @PrimaryGeneratedColumn()
  id: string;

  @Field(type => String, { nullable: true })
  realId?: string;
  
  @Index()
  @Column({
    type: 'varchar',
    length: 20,
    name: 'project_id',
    nullable: true,
  })
  projectId?: string;

  @Field(type => Project, { nullable: true })
  project?: Promise<Project>;

  @Field({nullable:true})
  @Column({
    type: 'text',
    nullable: true,
  })
  year?: string;

  @Field({nullable:true})
  @Column({
    type: 'text',
    nullable: true,
  })
  case?: string;

  @Index()
  @Field()
  @Column({
    default: true,
  })
  status: boolean;

  @Field(type=>Int)
  @Column({
    type: 'int',
    name: 'supplier_id',
    default: 0,
  })
  supplierId: number;

  @Index()
  @Field({nullable:true})
  @Column({
    nullable: true,
  })
  supplier: string;

  @Index()
  @Field()
  @Column({
    type: 'float',
    default: 0,
  })
  amount: number;

  @Field(type=>String,{nullable: true})
  @Column({nullable: true, length: 45})
  tel?: string;

  @Field(type=>String,{nullable: true})
  @Column({nullable: true, type: 'text', name: 'desc'})
  desc?: string;

  @Field(type=>String,{nullable: true})
  @Column({nullable: true, type: 'text', name: 'desc_en'})
  descEn?: string;

  @Field(type=>String,{nullable: true})
  @Column({nullable: true, type: 'text', name: 'desc_cht'})
  descCht?: string;

  @Field({ nullable: true })
  @Column({
    nullable: true,
  })
  ordered?: boolean;

  @Index()
  @Field(type => GraphQLDate, { nullable: true })
  @Column({
    type: 'date',
    name: 'ordered_date',
    nullable: true,
  })
  orderedDate?: Date;

  @Index()
  @Field({ nullable: true })
  @Column({
    nullable: true,
  })
  delivery?: boolean;

  @Index()
  @Field(type => GraphQLDate, { nullable: true })
  @Column({
    type: 'date',
    name: 'delivery_date',
    nullable: true,
  })
  deliveryDate?: Date;

  @Index()
  @Field({ nullable: true })
  @Column({
    nullable: true,
  })
  payment?: boolean;

  @Index()
  @Field(type => String, { nullable: true })
  @Column({nullable:true})
  cheque?: string;

  @Field(type => String, { nullable: true })
  @Column({nullable:true, type: 'text', })
  remark?: string;

  @Field({ nullable: true })
  @Column({
    nullable: true,
  })
  cash?: boolean;

  @Column({ type: 'varchar', name: 'file_path', nullable: true })
  filePath?: string;

  @Field({ nullable: true })
  fileUrl?: string;

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
  @Field()
  @Column({ default: false })
  settlement: boolean;

  @Index()
  @Column({ name: 'transaction_id', nullable: true, type: 'uuid', length: 36})
  transactionId?: string;

  @Field(type => BookKeepingTransaction, { nullable: true })
  @ManyToOne(type => BookKeepingTransaction)
  @JoinColumn({ name: 'transaction_id' })
  transaction: Promise<BookKeepingTransaction>;

  @Index()
  @Column({ name: 'claim_form_id', nullable: true, type: 'uuid', length: 36})
  claimFormId?: string;

  @Field(type => ClaimForm, { nullable: true })
  claimForm?: ClaimForm;

  @Field({
    nullable: true,
  })
  @Column({ name: 'createAt', type: 'bigint', nullable: true, })
  createAt: number;

  @Field({
    nullable: true,
  })
  @Column({ name: 'editAt', type: 'bigint', nullable: true, })
  editAt: number;

  @Index()
  @Field()
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Field({ nullable: true })
  @Column({nullable:true, default: false})
  deleted?: boolean;

  @Field(type => [ProjectOrderFile],
    {nullable: true},
  )
  files?: Promise<ProjectOrderFile[]>;

}
