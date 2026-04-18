import { ObjectType, Field, ID } from 'type-graphql';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, OneToMany, Index, JoinColumn, BaseEntity } from 'typeorm';
import { Node } from '../node/node.interface';
import { BookKeepingCompany } from '../bookKeepingCompany/bookKeepingCompany.entity';
import { BookKeepingTransactionItem } from '../bookKeepingTransactionItem/bookKeepingTransactionItem.entity';
import { ChequeBook } from '../chequeBook/chequeBook.entity';
import { ProjectInvoice } from '../projectInvoice/projectInvoice.entity';
import { ClaimForm } from '../claimForm/claimForm.entity';
import { ProjectOrder } from '../projectOrder/projectOrder.entity';

@ObjectType({ implements: Node })
@Entity()
@Index(['financialYearStart', 'financialYearEnd'])
export class BookKeepingTransaction extends BaseEntity implements Node {
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
  @Field()
  @Column({ name: 'transaction_date', type: 'date' })
  transactionDate: string;

  @Index()
  @Field()
  @Column({ name: 'financial_year_start' })
  financialYearStart: number;

  @Index()
  @Field()
  @Column({ name: 'financial_year_end' })
  financialYearEnd: number;

  @Field(type => [BookKeepingTransactionItem])
  @OneToMany(type => BookKeepingTransactionItem, transactionItem => transactionItem.transaction)
  transactionItems: Promise<BookKeepingTransactionItem[]>;

  @Index()
  @Field(type => Boolean)
  @Column({ default: false })
  deleted: boolean;

  @Index()
  @Column({
    type: 'uuid',
    name: 'cheque_book_id',
    nullable: true,
    length: 36,
  })
  chequeBookId?: string;

  @Field(type => ChequeBook, { nullable: true })
  chequeBook?: Promise<ChequeBook>;

  @Index()
  @Column({
    type: 'uuid',
    name: 'invoice_id',
    nullable: true,
    length: 36,
  })
  invoiceId?: string;

  @Field(type => ProjectInvoice, { nullable: true })
  invoice?: Promise<ProjectInvoice>;

  @Index()
  @Column({
    type: 'uuid',
    name: 'claim_form_id',
    nullable: true,
    length: 36,
  })
  claimFormId?: string;

  @Field(type => ClaimForm, { nullable: true })
  claimForm?: Promise<ClaimForm>;

  @Index()
  @Column({
    type: 'uuid',
    name: 'order_id',
    nullable: true,
    length: 36,
  })
  orderId?: string;

  @Field(type => ProjectOrder, { nullable: true })
  order?: Promise<ProjectOrder>;
}
