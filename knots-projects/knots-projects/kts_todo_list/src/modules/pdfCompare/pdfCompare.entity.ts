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
import { PdfSourcePageVersion } from '../pdfSourcePageVersion/pdfSourcePageVersion.entity';
import { User } from '../user/user.entity';

@ObjectType({ implements: Node })
@Entity()
export class PdfCompare extends BaseEntity implements Node {
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
  @Column({ name: 'source_page_version_id'})
  sourcePageVersionId: string;

  @Field(type => PdfSourcePageVersion)
  @ManyToOne(type => PdfSourcePageVersion)
  @JoinColumn({ name: 'source_page_version_id'})
  sourcePageVersion: Promise<PdfSourcePageVersion>;

  @Index()
  @Column({ name: 'target_page_version_id'})
  targetPageVersionId: string;

  @Field(type => PdfSourcePageVersion)
  @ManyToOne(type => PdfSourcePageVersion)
  @JoinColumn({ name: 'target_page_version_id'})
  targetPageVersion: Promise<PdfSourcePageVersion>;

  @Column({type: 'varchar', name: 'file_path', nullable: true})
  filePath?: string;

  @Field({nullable: true})
  fileUrl?: string;

  @Field(type=> User, {nullable: true,})
  @ManyToOne(type=> User, { onDelete: 'CASCADE' })
  @JoinColumn({name : 'created_by'})
  createdBy: Promise<User>;

  @Index()
  @Column({ name: 'created_by', nullable: true})
  createdById: string;
}
