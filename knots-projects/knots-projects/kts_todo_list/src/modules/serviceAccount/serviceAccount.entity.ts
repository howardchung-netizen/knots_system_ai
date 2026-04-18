import { ObjectType, Field, ID } from 'type-graphql';
import {
  Entity,
  BaseEntity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Column,
  Index,
} from 'typeorm';
import { Node } from '../node/node.interface';
import { Role } from '../admin/role/role.type';

@ObjectType({ implements: Node })
@Entity()
export class ServiceAccount extends BaseEntity implements Node {
  @Field(type => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Field()
  @CreateDateColumn({ name: 'created_at', precision: 6 })
  createdAt: Date;

  @Index()
  @Field()
  @UpdateDateColumn({ name: 'updated_at', precision: 6 })
  updatedAt: Date;

  @Index()
  @Field()
  @Column()
  name: string;

  @Field()
  @Column()
  token: string;

  @Index()
  @Field()
  @Column({ default: false })
  disabled: Boolean;

  @Field(type => [Role], { nullable: true })
  roles?: Role[];
}
