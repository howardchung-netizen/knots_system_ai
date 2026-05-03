import {Field, ID, ObjectType, Int} from 'type-graphql';
import {
  BaseEntity,
  Column,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';
import {Node} from '../node/node.interface';

@ObjectType({implements: Node})
@Entity({name: 'gantt_template'})
export class GanttTemplate extends BaseEntity implements Node {
  @Field(type => ID)
  @PrimaryGeneratedColumn()
  id: string;

  @Index()
  @Field(type=>String, {nullable: true})
  @Column({nullable: true, length: 200, name: 'name'})
  name?: string;

  @Field(type=>String, {nullable: true})
  @Column({nullable: true, length: 200, name: 'type'})
  type?: string;

  @Field(type=>String, {nullable: true})
  @Column({type: 'longtext', nullable: true, name: 'nodes'})
  nodes?: string;

  @Field(type=>String, {nullable: true})
  @Column({type: 'longtext', nullable: true, name: 'edges'})
  edges?: string;

  @Index()
  @Field()
  @Column({nullable:true, default: false})
  deleted?: boolean;

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
  editAt: number;

}
