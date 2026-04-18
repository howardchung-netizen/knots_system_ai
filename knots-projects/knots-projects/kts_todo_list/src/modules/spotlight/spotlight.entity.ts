import {Field, ID, Int, ObjectType} from 'type-graphql';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  AfterLoad,
} from 'typeorm';
import { Role } from '../admin/role/role.type';
import {Node} from '../node/node.interface';

@ObjectType({implements: Node})
@Entity()
export class Spotlight extends BaseEntity implements Node {
  @Field(type => ID)
  @PrimaryGeneratedColumn({name : 'id'})
  id: string;

  @Field(type => String)
  @Column({type: 'varchar', length: 8})
  hex: string;

  @Field(type=> Boolean)
  @Column({type:'tinyint', default: false, name: 'deleted'})
  isDeleted: Boolean;
}
