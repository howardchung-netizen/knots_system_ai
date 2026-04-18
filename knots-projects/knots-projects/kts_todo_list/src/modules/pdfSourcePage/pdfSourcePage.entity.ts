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
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Node } from '../node/node.interface';
import { PdfSource } from '../pdfSource/pdfSource.entity';
import { PdfSourcePageHistory } from '../pdfSourcePageHistory/pdfSourcePageHistory.entity';
import { PdfSourcePageVersion } from '../pdfSourcePageVersion/pdfSourcePageVersion.entity';

@ObjectType({ implements: Node })
@Entity()
export class PdfSourcePage extends BaseEntity implements Node {
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
  @ManyToOne(type=> PdfSource, pdfSource => pdfSource.pdfSourcePages, {
    onDelete: 'CASCADE',
    onUpdate: "CASCADE",
    orphanedRowAction: "delete",
  })
  @JoinColumn({name : 'pdf_source_id'})
  pdfSource: Promise<PdfSource>;

  @Column({
    name: 'pdf_source_page_version_id'
  })
  pdfSourcePageVersionId: string;

  @Field(type=> PdfSourcePageVersion)
  pdfSourcePageVersion: Promise<PdfSourcePageVersion>;

  @Field()
  @Column({
    default: 0,
  })
  page: number;

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

  @Field(type => [PdfSourcePageVersion], { nullable: true })
  historyVersions: Promise<PdfSourcePageVersion[]>;

  @Field(type => [PdfSourcePageHistory], { nullable: true })
  @OneToMany(
    type => PdfSourcePageHistory, pdfSourcePageHistories => pdfSourcePageHistories.pdfSourcePage,
    {cascade: true, orphanedRowAction: 'delete', onUpdate: 'CASCADE', onDelete: 'CASCADE'}
  )
  pdfSourcePageHistories: Promise<PdfSourcePageHistory[]>;
}
