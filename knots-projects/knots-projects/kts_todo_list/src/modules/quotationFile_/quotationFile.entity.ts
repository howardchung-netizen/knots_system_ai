import { Field, ID, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from "typeorm";
import { Quotation } from "../quotation/quotation.entity";

@ObjectType()
@Entity()
export class QuotationFile extends BaseEntity {
  @Field(type => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Field()
  @CreateDateColumn({ name: 'created_at', precision: 6, })
  createdAt: Date;

  @Index()
  @Field()
  @UpdateDateColumn({ name: 'updated_at', precision: 6, })
  updatedAt: Date;

  @Column({ type: 'varchar', name: 'file_path', nullable: true })
  filePath?: string;

  @Field({ nullable: true })
  fileUrl?: string;

  @Field({ nullable: true })
  @Column({ name: "file_mime_type", nullable: true })
  fileMimeType?: string;

  @Index()
  @Column({
    type: 'string',
    name: 'quotation_id',
  })
  quotationId: string;

  @Field(
    type => Quotation,
  )
  @ManyToOne(
    type => Quotation,
  )
  @JoinColumn({
    name: 'quotation_id',
  })
  quotation: Promise<Quotation>;

  @Field()
  @Column()
  deleted: boolean;
}
