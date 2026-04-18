import { Field, ID, Int, ObjectType } from 'type-graphql';
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
import { PdfSourcePage } from '../pdfSourcePage/pdfSourcePage.entity';

@ObjectType({ implements: Node })
@Entity()
export class PdfSourcePageHistory extends BaseEntity implements Node {
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
  @Column({ name: 'pdf_source_page_id'})
  pdfSourcePageId: string;

  @Field(type=> PdfSourcePage)
  @ManyToOne(type=> PdfSourcePage, pdfSourcePage => pdfSourcePage.pdfSourcePageHistories, {
    onDelete: 'CASCADE',
    onUpdate: "CASCADE",
    orphanedRowAction: "delete",
  })
  @JoinColumn({name : 'pdf_source_page_id'})
  pdfSourcePage: Promise<PdfSourcePage>;

  @Column({type: 'varchar', name: 'file_path'})
  filePath: string;

  @Field()
  fileUrl: string;

  @Column({type: 'varchar', name: 'compare_path', nullable: true})
  comparePath?: string;

  @Field({
    nullable: true,
  })
  compareUrl?: string;

  @Field(type => Int)
  @Column({
    name: 'last_version',
    default: 1,
  })
  lastVersion: number;

}
