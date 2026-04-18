import {Field, ID, ObjectType} from 'type-graphql';
import {
  BaseEntity,
  Column,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';
import {Node} from '../node/node.interface';
import { JSONResolver } from 'graphql-scalars';

@ObjectType({implements: Node})
@Entity({name: 'project_item'})
export class ProjectItem extends BaseEntity implements Node {
  @Field(type => ID)
  @PrimaryGeneratedColumn()
  id: string;

  @Field(type => String, { nullable: true })
  realId?: string;

  @Index()
  @Field(type=>String, { nullable: true })
  @Column({nullable: true, type: 'varchar', length: 200, name: 'name_en'})
  nameEn: string;

  @Index()
  @Field(type=>String)
  @Column({nullable: true, type: 'varchar', length: 200, name: 'name_cht'})
  nameCht: string;

  @Field(type=>String,{nullable: true})
  @Column({nullable: true, type: 'text', name: 'desc_en'})
  descEn?: string;

  @Field(type=>String,{nullable: true})
  @Column({nullable: true, type: 'text', name: 'desc_cht'})
  descCht?: string;

  @Field({
    nullable: true,
  })
  @Column({
    type: 'text',
    nullable: true,
  })
  remark?: string;

  @Field({
    nullable: true,
  })
  @Column({
    type: 'text',
    name: 'remark_en',
    nullable: true,
  })
  remarkEn?: string;

  @Field({
    nullable: true,
  })
  @Column({
    type: 'text',
    name: 'remark_cht',
    nullable: true,
  })
  remarkCht?: string;

  @Index()
  @Field({ nullable: true })
  @Column({
    type: 'int',
    nullable: true,
  })
  unit?: number;

  @Field(type => ID, { nullable: true })
  unitId?: string;

  @Field({ nullable: true })
  @Column({
    type: 'varchar',
    name: 'unit_en',
    length: 45,
    nullable: true,
  })
  unitEn?: string;

  @Field({ nullable: true })
  @Column({
    type: 'varchar',
    name: 'unit_cht',
    length: 45,
    nullable: true,
  })
  unitCht?: string;

  @Field({ nullable: true })
  @Column({
    type: 'longtext',
    nullable: true,
  })
  price?: string;

  @Field(type => JSONResolver, {
    nullable: true
  })
  prices?: [] | null;
  
  @Index()
  @Field({ nullable: true })
  @Column({
    type: 'int',
    nullable: true,
  })
  activePrice?: number;

  @Field({ nullable: true })
  @Column({
    type: 'longtext',
    nullable: true,
  })
  upperName?: string;

  @Field({ nullable: true })
  @Column({
    type: 'varchar',
    length: 200,
    name: 'upperName_en',
    nullable: true,
  })
  upperNameEn?: string;

  @Field({ nullable: true })
  @Column({
    type: 'varchar',
    length: 200,
    name: 'upperName_cht',
    nullable: true,
  })
  upperNameCht?: string;

  @Field({ nullable: true })
  @Column({
    type: 'longtext',
    nullable: true,
  })
  lowerName?: string;

  @Index()
  @Field()
  @Column({
    type: 'bigint',
    default: 0,
  })
  upper: number;

  @Field(type => ID, { nullable: true })
  upperId?: string;

  @Field()
  @Column({
    type: 'varchar',
    length: 500,
    default: '0',
  })
  lower: string;

  @Field(type => [ID], { nullable: true })
  lowerIds?: string[];

  @Field(type => [ProjectItem], { nullable: true })
  child?: ProjectItem[] | null;

  @Field()
  @Column({
    type: 'tinyint',
    default: 0,
  })
  level: number;

  @Index()
  @Field()
  @Column({
    type: 'int',
    default: 0,
  })
  sort: number;

  @Field()
  @Column({
    type: 'varchar',
    length: 200,
    default: 0,
  })
  hash: string;

  @Index()
  @Field({nullable: true})
  @Column({
    type: 'tinyint',
    default: true,
  })
  show?: boolean;

  @Index()
  @Field({nullable: true})
  @Column({nullable:true, default: false})
  delete?: boolean;

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

  @Field({ nullable: true })
  @Column({
    type: 'varchar',
    length: 45,
    name: 'project_itemcol',
    nullable: true,
  })
  projectItemcol?: string;

  @Field({
    nullable: true,
  })
  keyword: string;
}
