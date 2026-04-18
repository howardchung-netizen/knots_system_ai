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
import { PdfShare } from '../pdfShare/pdfShare.entity';
import { PdfSource } from '../pdfSource/pdfSource.entity';
import { PdfUpload } from '../pdfUpload/pdfUpload.entity';
import { Project } from '../project/project.entity';

@ObjectType({ implements: Node })
@Entity()
export class Pdf extends BaseEntity implements Node {
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
  @Column({ name: 'project_id'})
  projectId: number;

  @Field(type => Project, { nullable: true })
  @ManyToOne(type => Project)
  @JoinColumn({ name: 'project_id'})
  project?: Promise<Project>;

  @Field()
  @Column({ name: 'name' })
  name: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  remarks?: string;

  @Field()
  @Column({ name: 'deleted', default: false })
  deleted: boolean;

  @Field()
  isDeleted: boolean;

  @Field(type => [PdfUpload], { nullable: true })
  @OneToMany(
    type => PdfUpload, pdfUpload => pdfUpload.pdf,
    {cascade: true, orphanedRowAction: 'delete', onUpdate: 'CASCADE', onDelete: 'CASCADE'}
  )
  pdfUploads: Promise<PdfUpload[]>;

  @Field(type => [PdfSource], { nullable: true })
  @OneToMany(
    type => PdfSource, pdfSource => pdfSource.pdf,
    {cascade: true, orphanedRowAction: 'delete', onUpdate: 'CASCADE', onDelete: 'CASCADE'}
  )
  pdfSources: Promise<PdfSource[]>;

  @Field(
    type => [PdfShare],
    {nullable: true}
  )
  @OneToMany(type => PdfShare, pdfShare => pdfShare.pdf, { cascade: true, orphanedRowAction: 'delete', onUpdate: 'CASCADE' })
  pdfShares?: Promise<PdfShare[]>;

}
