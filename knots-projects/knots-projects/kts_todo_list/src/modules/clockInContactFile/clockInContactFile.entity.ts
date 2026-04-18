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
import { ClockInContact } from "../clockInContact/clockInContact.entity";

@ObjectType()
@Entity()
export class ClockInContactFile extends BaseEntity {
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

  @Column({ type: 'varchar', name: 'clock_in_contac_file_path', nullable: true })
  clockInContactFilePath?: string;

  @Field({ nullable: true })
  clockInContactFileUrl?: string;

  @Field({ nullable: true })
  @Column({ name: "file_mime_type", nullable: true })
  fileMimeType?: string;

  @Index()
  @Column({
    type: 'string',
    name: 'tel',
  })
  tel: string;

  @Field(
    type => ClockInContact,
  )
  @ManyToOne(
    type => ClockInContact,
  )
  @JoinColumn({
    name: 'tel',
  })
  clockInContact: Promise<ClockInContact>;

  @Field()
  @Column()
  deleted: boolean;
}
