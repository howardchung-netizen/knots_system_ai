import { Field, Float, ID, ObjectType } from 'type-graphql';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Node } from '../node/node.interface';
import { User } from '../user/user.entity';
import { BookKeepingAccount } from '../bookKeepingAccount/bookKeepingAccount.entity';
import { BookKeepingTransaction } from '../bookKeepingTransaction/bookKeepingTransaction.entity';
import { ClaimFormFile } from '../claimFormFile/claimFormFile.entity';
import { ProjectOrder } from '../projectOrder/projectOrder.entity';
import { Project } from '../project/project.entity';

@ObjectType({ implements: Node })
@Entity()
export class ClaimForm extends BaseEntity implements Node {
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
  @Column({
    type: 'varchar',
    length: 20,
    name: 'project_id',
    nullable: true,
  })
  projectId?: string | null;

  @Field(type => Project, { nullable: true })
  project?: Promise<Project>;

  @Index()
  @Column({ name: 'staff_id', type: 'int' })
  staffId: number;

  @Field(type => User)
  @ManyToOne(type => User)
  @JoinColumn({
    name: "staff_id",
  })
  staff: Promise<User>;

  @Index()
  @Field({ nullable: true })
  @Column({ nullable: true })
  vendor?: string;

  @Index()
  @Field()
  @Column({ name: 'purchased_date', type: 'date' })
  purchasedDate: string;

  @Field(type => Float)
  @Column({ type: 'decimal', default: 0, precision: 10, scale: 2 })
  amount: number;

  @Index()
  @Field({ nullable: true})
  @Column({ name: 'cheque_no', nullable: true })
  chequeNo?: string;

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

  @Column({ type: 'varchar', name: 'file_path', nullable: true })
  filePath?: string;

  @Field({ nullable: true })
  fileUrl?: string;

  @Index()
  @Field()
  @Column({ default: false })
  settlement: boolean;

  @Index()
  @Field(type => Boolean)
  @Column({ default: false })
  deleted: boolean;

  @Index()
  @Column({ name: 'transaction_id', nullable: true, type: 'uuid', length: 36})
  transactionId?: string;

  @Field(type => BookKeepingTransaction, { nullable: true })
  @ManyToOne(type => BookKeepingTransaction)
  @JoinColumn({ name: 'transaction_id' })
  transaction: Promise<BookKeepingTransaction>;

  @Field(type => [ClaimFormFile],
    {nullable: true},
  )
  files?: Promise<ClaimFormFile[]>;

  @Field({ nullable: true })
  @Column({ name: 'project_order_id', nullable: true })
  projectOrderId?: string;

  @Field(type => ProjectOrder, { nullable: true })
  @OneToOne(type => ProjectOrder)
  @JoinColumn({ name: 'project_order_id' })
  projectOrder: Promise<ProjectOrder>;
  
}
