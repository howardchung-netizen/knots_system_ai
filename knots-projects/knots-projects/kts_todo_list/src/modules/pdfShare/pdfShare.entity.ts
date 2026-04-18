import { Field, ID, ObjectType } from 'type-graphql';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Node } from '../node/node.interface';
import { Pdf } from '../pdf/pdf.entity';

@ObjectType({ implements: Node })
@Entity()
export class PdfShare extends BaseEntity implements Node {
  @Field(type => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Field()
  @CreateDateColumn({
    name: "created_at",
  })
  createdAt: Date;

  @Index()
  @Column({
    type: 'uuid',
    name: 'pdf_id',
    length: 36,
  })
  pdfId: string;

  @Field(
    type => Pdf,
  )
  @ManyToOne(type => Pdf, pdf => pdf.pdfShares, {
    onDelete: 'CASCADE',
    onUpdate: "CASCADE",
    orphanedRowAction: "delete",
  })
  @JoinColumn({ name: "pdf_id" })
  pdf: Promise<Pdf>;

  @Field()
  @Column({name: 'expired_time'})
  expiredTime: Date;

  @Index()
  @Field(type => String)
  @Column()
  code: string;

  @Field(type => String)
  @Column()
  remark: string;

  @Index()
  @Field()
  @Column({
    name: 'is_deleted',
    default: false,
  })
  isDeleted: Boolean;
}
