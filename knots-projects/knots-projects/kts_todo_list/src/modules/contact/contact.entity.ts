import {Field, ID, Int, ObjectType} from 'type-graphql';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import {Node} from '../node/node.interface';
import { ContactFile } from '../contactFile/contactFile.entity';

@ObjectType({implements: Node})
@Entity()
export class Contact extends BaseEntity implements Node {
  @Field(type => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Field({ nullable: true })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Index()
  @Field({ nullable: true })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Index()
  @Field({ nullable: true })
  @Column({ name: 'contact_name'})
  contactName?: string;

  @Index()
  @Field({
    nullable: true,
  })
  @Column({
    nullable: true,
    name: 'tel'
  })
  tel: string;

  @Field(type=>Int, {nullable: true})
  @Column({
    default: 9,
    name:'daily_remind_time',
    unsigned: true,
    type: "tinyint",
  })
  dailyRemindTime: number;

  @Field(type => [ContactFile],
    {nullable: true},
  )
  contactFiles?: Promise<ContactFile[]>;

}
