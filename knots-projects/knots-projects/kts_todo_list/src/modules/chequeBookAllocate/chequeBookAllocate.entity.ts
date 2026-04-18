import { Field, Float, ID, ObjectType } from 'type-graphql';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Node } from '../node/node.interface';
import { ChequeBook } from '../chequeBook/chequeBook.entity';

@ObjectType({ implements: Node })
@Entity()
export class ChequeBookAllocate extends BaseEntity implements Node {
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
  @Column({ name: 'cheque_book_id' })
  chequeBookId: string;

  @Field(type => ChequeBook)
  @ManyToOne(type => ChequeBook, chequeBook => chequeBook.allocates)
  @JoinColumn({ name: 'cheque_book_id' })
  chequeBook: Promise<ChequeBook>;

  @Field()
  @Column()
  project: string;

  @Index()
  @Column({ name: 'project_id' })
  projectId: string;

  @Field(type => Float)
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0.0 })
  amount: number;

  @Field({ nullable: true })
  @Column({ nullable: true })
  desc?: string;

  @Index()
  @Field()
  @Column({ default: false })
  deleted: boolean;
}
