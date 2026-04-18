import { Field, ObjectType } from 'type-graphql';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ClockInContactFile } from '../clockInContactFile/clockInContactFile.entity';

export interface FileUpload {
  filename: string;
  mimetype: string;
  encoding: string;
}

export type File = Promise<FileUpload>;

@ObjectType()
@Entity({ name: 'clock_in_contact' })
export class ClockInContact extends BaseEntity {

  @Field()
  @PrimaryColumn()
  tel: string;

  @Index()
  @Field()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Index()
  @Field()
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Field(type=> String, { nullable: true })
  @Column({
    default: null
  })
  name?: string;

  @Field(type=> String, { nullable: true })
  @Column({
    default: null
  })
  nameEng?: string;
  
  @Field(type=> String, { nullable: true })
  @Column({
    default: null
  })
  address?: string;

  @Field(type=> String, { nullable: true })
  @Column()
  remark?: string;

  @Field()
  @Column({
    name: 'is_deleted',
    default: false,
  })
  isDeleted: boolean;

  @Field(type => [ClockInContactFile],
    {nullable: true},
  )
  clockInContactFiles?: Promise<ClockInContactFile[]>;

}

