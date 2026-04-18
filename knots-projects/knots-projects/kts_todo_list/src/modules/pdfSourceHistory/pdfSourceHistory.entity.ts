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
  UpdateDateColumn,
} from 'typeorm';
import { Node } from '../node/node.interface';
import { PdfSource } from '../pdfSource/pdfSource.entity';

@ObjectType({ implements: Node })
@Entity()
export class PdfSourceHistory extends BaseEntity implements Node {
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
  @Column({ name: 'pdf_source_id'})
  pdfSourceId: string;

  @Field(type=> PdfSource)
  @ManyToOne(type=> PdfSource, pdfSource => pdfSource.pdfSourceHistories, {
    onDelete: 'CASCADE',
    onUpdate: "CASCADE",
    orphanedRowAction: "delete",
  })
  @JoinColumn({name : 'pdf_source_id'})
  pdfSource: Promise<PdfSource>;

  @Column({type: 'varchar', name: 'file_path'})
  filePath: string;

  @Field()
  fileUrl: string;

  @Column({
    type: 'varchar',
    name: 'compare_path',
    nullable: true,
  })
  comparePath?: string;

  @Field({
    nullable: true,
  })
  compareUrl?: string;

  @Field()
  @Column({
    default: 0,
  })
  pages: number;

  @Field()
  @Column({
    default: 1,
  })
  version: number;

}
