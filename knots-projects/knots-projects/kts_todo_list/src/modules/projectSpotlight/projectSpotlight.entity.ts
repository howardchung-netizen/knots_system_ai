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
@Entity({name: 'spotlight'})
export class ProjectSpotlight extends BaseEntity implements Node {
  @Field(type => ID)
  @PrimaryGeneratedColumn()
  id: string;

  @Index()
  @Field(type=>String,{nullable: true})
  @Column({nullable: true, length: 200, name: 'name_en'})
  nameEn?: string;

  @Index()
  @Field(type=>String,{nullable: true})
  @Column({nullable: true, length: 200, name: 'name_cht'})
  nameCht?: string;

  @Index()
  @Field({nullable: true})
  @Column({type: 'varchar', length: 8, nullable: true})
  hex?: string;

  @Index()
  @Field({nullable: true})
  @Column({nullable:true, default: false})
  preset?: boolean;

  @Index()
  @Field({nullable: true})
  @Column({nullable:true, default: true})
  show?: boolean;

  @Index()
  @Field(type=> Int, { nullable: true })
  @Column({
    type: 'int',
    name: 'sort',
    nullable: true,
  })
  sort?: number;

  @Field({
    nullable: true,
  })
  @Column({
    name: 'createFrom',
    length: 200,
    nullable: true,
  })
  createFrom?: string;

  @Index()
  @Field({
    nullable: true,
  })
  @Column({ name: 'createAt', type: 'bigint', nullable: true, })
  createAt: number;

  @Field({
    nullable: true,
  })
  @Column({
    name: 'editFrom',
    length: 200,
    nullable: true,
  })
  editFrom?: string;

  @Index()
  @Field({
    nullable: true,
  })
  @Column({ name: 'editAt', type: 'bigint', nullable: true, })
  editAt: number;

  @Index()
  @Field()
  @Column({nullable:true, default: false})
  deleted?: boolean;

  @Index()
  @Field({
    nullable: true,
  })
  @Column({ name: 'deleteAt', type: 'bigint', nullable: true, })
  deleteAt: number;

  @Field({
    nullable: true,
  })
  @Column({
    name: 'deleteFrom',
    length: 200,
    nullable: true,
  })
  deleteFrom?: string;
}
