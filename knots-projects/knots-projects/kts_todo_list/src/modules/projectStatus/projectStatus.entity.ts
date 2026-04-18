import { Field, ID, ObjectType } from 'type-graphql';
import {
  BaseEntity,
  Column,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Node } from '../node/node.interface';

@ObjectType({ implements: Node })
@Entity({ name: 'project_status' })
export class ProjectStatus extends BaseEntity implements Node {
  @Field(type => ID)
  @PrimaryGeneratedColumn()
  id: string;

  @Index()
  @Field({ nullable: true })
  @Column({
    type: 'varchar',
    length: 45,
    nullable: true,
  })
  code?: string;

  @Index()
  @Field()
  @Column({ name: 'name_en',length:200 })
  nameEn: string;

  @Index()
  @Field()
  @Column({ name: 'name_cht', length:200 })
  nameCht: string;

  @Field()
  @Column({
    type: 'varchar',
    length: 50,
    default: '#000000',
  })
  style: string;

  @Index()
  @Field()
  @Column({
    type: 'int',
    default: 1,
  })
  sort: number;

  @Index()
  @Field()
  @Column({default: true})
  show: boolean;

  @Index()
  @Field({
    nullable: true,
  })
  @Column({ name: 'createAt', type: 'bigint', nullable: true, })
  createAt: number;

  @Index()
  @Field({
    nullable: true,
  })
  @Column({ name: 'editAt', type: 'bigint', nullable: true, })
  editAt: number
}
