import {Field, ID, Int, ObjectType} from 'type-graphql';
import {
  BaseEntity,
  Column,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';
import {Node} from '../node/node.interface';

@ObjectType({implements: Node})
@Entity({name: 'project_item_schedule'})
export class ProjectItemSchedule extends BaseEntity implements Node {
  @Field(type => ID)
  @PrimaryGeneratedColumn()
  id: string;

  @Index()
  @Field(type=>Int)
  @Column({nullable: true, type: 'bigint', name: 'item_id'})
  itemId: number;

  @Index()
  @Field(type=>String)
  @Column({nullable: true, type: 'varchar', name: 'uuid'})
  uuid: string;

  @Field(type=>String,{nullable: true})
  @Column({nullable: true, type: 'text', name: 'schedule'})
  schedule?: string;

  @Field(type=>String,{nullable: true})
  @Column({nullable: true, type: 'varchar', length: 8, name: 'color'})
  color?: string;

  @Field({
    nullable: true,
  })
  @Column({ name: 'createAt', type: 'bigint', nullable: true, })
  createAt: number;

  @Field({
    nullable: true,
  })
  @Column({ name: 'editAt', type: 'bigint', nullable: true, })
  editAt: number;

  @Index()
  @Field({nullable: true})
  @Column({nullable:true, default: false})
  deleted?: boolean;

  @Field({
    nullable: true,
  })
  @Column({ name: 'deleteAt', type: 'bigint', nullable: true, })
  deleteAt: number;

}
