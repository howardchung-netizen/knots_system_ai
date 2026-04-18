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
import { ClientContacts } from "../clientContacts/clientContacts.entity";

@ObjectType()
@Entity()
export class ContactFile extends BaseEntity {
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
    type: 'string',
    name: 'contact_id',
  })
  contactId: string;

  @Field(
    type => ClientContacts,
  )
  @ManyToOne(
    type => ClientContacts,
  )
  @JoinColumn({
    name: 'contact_id',
  })
  contact: Promise<ClientContacts>;

  @Field()
  @Column()
  deleted: boolean;
}
