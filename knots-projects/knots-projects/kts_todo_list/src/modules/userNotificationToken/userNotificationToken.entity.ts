import {Field, ID, ObjectType} from 'type-graphql';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import {Node} from '../node/node.interface';
import { User } from '../user/user.entity';

@ObjectType({implements: Node})
@Entity()
@Unique(['userId', 'token'])
export class UserNotificationToken extends BaseEntity implements Node {
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
  @Column({ name: 'user_id' })
  userId: string;

  @Field(type => User)
  @ManyToOne(type => User)
  @JoinColumn({ name: 'user_id' })
  user: Promise<User>;

  @Index()
  @Field()
  @Column()
  token: string;

}
