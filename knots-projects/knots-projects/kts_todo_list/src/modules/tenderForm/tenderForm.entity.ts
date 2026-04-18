import { Field, ID, ObjectType, GraphQLISODateTime } from 'type-graphql';
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
import { User } from '../user/user.entity';
import { GraphQLDate } from "graphql-iso-date";

@ObjectType({ implements: Node })
@Entity()
export class TenderForm extends BaseEntity implements Node {
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
  @Field(type => GraphQLDate, { nullable: true })
  @Column({
    type: 'date',
    name: 'received_date',
  })
  receivedDate: Date;

  @Index()
  @Field({ nullable: true})
  @Column({ name: 'client'})
  client: string;

  @Index()
  @Field({ nullable: true })
  @Column({
    name: 'tender_no',
    type: 'varchar',
    nullable: true,
  })
  tenderNo?: string;

  @Index()
  @Field(type => GraphQLISODateTime, { nullable: true })
  @Column({
    name: 'site_visit_time',
    nullable: true,
  })
  siteVisitTime?: Date;

  @Index()
  @Field(type => GraphQLISODateTime)
  @Column({
    name: 'deadline_time',
  })
  deadlineTime: Date;

  @Index()
  @Field()
  @Column({
    name: 'submit_method',
  })
  submitMethod: string;

  @Field()
  @Column({
    type: 'text',
  })
  details: string;

  @Field(type=> User, { nullable: true })
  @ManyToOne(type=> User, { onDelete: 'CASCADE' })
  @JoinColumn({name : 'person_in_charge_id'})
  personInCharge?: Promise<User>;

  @Index()
  @Column({ name: 'person_in_charge_id', nullable: true})
  personInChargeId?: string;

  @Index()
  @Field()
  @Column({
    name: 'is_deleted',
    default: false,
  })
  isDeleted: Boolean;
}
