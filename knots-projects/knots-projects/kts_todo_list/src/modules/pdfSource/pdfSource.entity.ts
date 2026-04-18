import { Field, ID, ObjectType } from 'type-graphql';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Node } from '../node/node.interface';
import { Pdf } from '../pdf/pdf.entity';
import { PdfSourceHistory } from '../pdfSourceHistory/pdfSourceHistory.entity';
import { PdfSourcePage } from '../pdfSourcePage/pdfSourcePage.entity';

@ObjectType({ implements: Node })
@Entity()
export class PdfSource extends BaseEntity implements Node {
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
  @Column({ name: 'pdf_id'})
  pdfId: string;

  @Field(type=> Pdf)
  @ManyToOne(type=> Pdf, pdf => pdf.pdfSources, {
    onDelete: 'CASCADE',
    onUpdate: "CASCADE",
    orphanedRowAction: "delete",
  })
  @JoinColumn({name : 'pdf_id'})
  pdf: Promise<Pdf>;

  @Column({type: 'varchar', name: 'file_path'})
  filePath: string;

  @Field()
  fileUrl: string;

  @Column({type: 'varchar', name: 'compare_path', nullable: true })
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

  @Column({
    name: 'deleted',
    default: false,
  })
  deleted: Boolean;

  @Field()
  isDeleted: Boolean;

  @Field(type => [PdfSourcePage], { nullable: true })
  @OneToMany(
    type => PdfSourcePage, pdfSourcePage => pdfSourcePage.pdfSource,
    {cascade: true, orphanedRowAction: 'delete', onUpdate: 'CASCADE', onDelete: 'CASCADE'}
  )
  pdfSourcePages: Promise<PdfSourcePage[]>;

  @Field(type => [PdfSourceHistory], { nullable: true })
  @OneToMany(
    type => PdfSourceHistory, pdfSourceHistories => pdfSourceHistories.pdfSource,
    {cascade: true, orphanedRowAction: 'delete', onUpdate: 'CASCADE', onDelete: 'CASCADE'}
  )
  pdfSourceHistories: Promise<PdfSourceHistory[]>;

}
