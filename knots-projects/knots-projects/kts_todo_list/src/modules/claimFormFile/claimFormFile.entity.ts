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
import { ClaimForm } from "../claimForm/claimForm.entity";

@ObjectType()
@Entity()
export class ClaimFormFile extends BaseEntity {
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
    type: 'uuid',
    name: 'claim_form_id',
  })
  claimFormId: string;

  @Field(
    type => ClaimForm,
  )
  @ManyToOne(
    type => ClaimForm,
  )
  @JoinColumn({
    name: 'claimFormId',
  })
  claimForm: Promise<ClaimForm>;

  @Field()
  @Column()
  deleted: boolean;
}
