import { Field, Float, GraphQLISODateTime, ID, ObjectType } from 'type-graphql';
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
import { ClockInContact } from '../clockInContact/clockInContact.entity';
import { ClockInLocation } from '../clockInLocation/clockInLocation.entity';

@ObjectType({ implements: Node })
@Entity({name: 'clock_in'})
export class ClockIn extends BaseEntity implements Node {

  @Index()
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

  @Field(type => GraphQLISODateTime)
  @Column({ name: 'qr_code_created_at' })
  qrCodeCreatedAt: Date;
  
  @Index()
  @Field()
  @CreateDateColumn({ name: 'clocked_in_at' })
  clockedInAt: Date;

  @Field()
  @Column()
  nonce: string;

  @Field()
  @Column({
    name: 'is_duplicated',
    default: false,
  })
  isDuplicated: boolean;

  @Field(type => ClockInContact, { nullable: true})
  contact?: Promise<ClockInContact>;

  @Index()
  @Field()
  @Column({
    name: 'clock_in_tel'
  })
  tel: string;

  @Field(type => ClockInLocation)
  @ManyToOne(type => ClockInLocation)
  @JoinColumn({
    name: 'clock_in_location_id',
  })
  location: Promise<ClockInLocation>;
  
  @Field()
  @Column({ name: 'clock_in_location_id'})
  locationId: string;

  @Field(type => Float, { nullable: true})
  @Column({
    name: 'clock_in_salary',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true
  })
  salary: number | null;

  @Field(type => String, { nullable: true})
  @Column({ name: 'clock_in_remark', nullable: true })
  remark?: string;

  @Field()
  @Column({
    name: 'is_deleted',
    default: false,
  })
  isDeleted: boolean;

}

@ObjectType({ implements: Node })
@Entity()
export class ClockInError extends BaseEntity implements Node {
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
  @Field()
  @Column()
  tel: string;
  
  @Field()
  @Column()
  message: string;

}
