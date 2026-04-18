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
import { PdfUpload } from '../pdfUpload/pdfUpload.entity';

@ObjectType({ implements: Node })
@Entity()
export class PdfSourcePageVersion extends BaseEntity implements Node {
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

  @Column({type: 'varchar', name: 'file_path'})
  filePath: string;

  @Field()
  fileUrl: string;

  @Column({type: 'varchar', name: 'image_path', nullable: true})
  imagePath?: string;

  @Field({
    nullable: true,
  })
  imageUrl?: string;

  @Field()
  @Column({
    default: 1,
  })
  version: number;

  @Column({
    name: 'pdf_upload_id',
  })
  pdfUploadId: string;

  @Field(type=> PdfUpload)
  @ManyToOne(type=> PdfUpload, pdfUpload => pdfUpload.pdfSourcePageVersions, {
    onDelete: 'CASCADE',
    onUpdate: "CASCADE",
    orphanedRowAction: "delete",
  })
  @JoinColumn({name : 'pdf_upload_id'})
  pdfUpload: Promise<PdfUpload>;

  @Field()
  @Column({
    name: 'upload_page',
  })
  uploadPage: number;

  @Column({
    name: 'deleted',
    default: false,
  })
  deleted: Boolean;

  @Field()
  isDeleted: Boolean;

}
