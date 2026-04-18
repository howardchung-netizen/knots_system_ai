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
import { Project } from '../project/project.entity';
import { User } from '../user/user.entity';

@ObjectType({implements: Node})
@Entity({name: 'clock_in_location'})
export class ClockInLocation extends BaseEntity implements Node {

  @Index()
  @Field(type => ID)
  @PrimaryGeneratedColumn('increment')
  id: string;

  @Index()
  @Field()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Index()
  @Field()
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Field()
  @Column({
    name: 'is_deleted',
    default: false,
  })
  isDeleted: boolean;

  @Field(type => User)
  @ManyToOne(type => User)
  @JoinColumn({
    name: 'staff_id',
  })
  user: Promise<User>;

  @Field(type => ID)
  @Column({name: 'staff_id'})
  staffId: string;

  @Field(type => Project)
  @ManyToOne(type => Project)
  @JoinColumn({
    name: 'project_id',
  })
  Project: Promise<Project>;

  @Field(type=> ID)
  @Column({name: 'project_id'})
  projectId: string;

  @Field()
  @Column()
  address?: string;

  @Field()
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 6,
  })
  lat?: number;

  @Field()
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 6,
  })
  lon?: number;

  @Index()
  @Field({nullable: true})
  @Column({
    type: 'varchar',
    length: 10,
    nullable: true,
  })
  nonce: string;

}

