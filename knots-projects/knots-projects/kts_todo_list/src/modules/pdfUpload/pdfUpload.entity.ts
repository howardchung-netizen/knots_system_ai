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
import { PdfSourcePage } from '../pdfSourcePage/pdfSourcePage.entity';
import { PdfSourcePageVersion } from '../pdfSourcePageVersion/pdfSourcePageVersion.entity';
import { User } from '../user/user.entity';

@ObjectType({ implements: Node })
@Entity()
export class PdfUpload extends BaseEntity implements Node {
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

  @Column({
    name: 'deleted',
    default: false,
  })
  deleted: Boolean;

  @Field()
  isDeleted: Boolean;

  @Field(type=> User, {nullable: true})
  @ManyToOne(type=> User, { onDelete: 'CASCADE' })
  @JoinColumn({name : 'created_by'})
  createdBy: Promise<User>;

  @Index()
  @Column({ name: 'created_by', nullable: true})
  createdById: string;

  @Column({nullable:true})
  ip?: string;

  @Field(type => [PdfSourcePageVersion], { nullable: true })
  @OneToMany(
    type => PdfSourcePageVersion, pdfSourcePageVersion => pdfSourcePageVersion.pdfUpload,
    {cascade: true, orphanedRowAction: 'delete', onUpdate: 'CASCADE', onDelete: 'CASCADE'}
  )
  pdfSourcePageVersions: Promise<PdfSourcePageVersion[]>;

}
