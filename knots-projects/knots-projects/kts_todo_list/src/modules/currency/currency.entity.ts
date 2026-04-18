import { ObjectType, Field, ID } from 'type-graphql';
import { Entity, PrimaryGeneratedColumn, Column, Index, BaseEntity } from 'typeorm';
import { Node } from '../node/node.interface';

@ObjectType({ implements: Node })
@Entity()
export class Currency extends BaseEntity implements Node {
  @Field(type => ID)
  @PrimaryGeneratedColumn()
  id: string;

  @Index()
  @Field()
  @Column()
  code: string;

  @Field()
  @Column()
  symbol: string;

  @Field()
  @Column()
  commonSymbol: string;

  @Field()
  @Column({ name: 'name_en' })
  nameEn: string;

  @Field()
  @Column({ name: 'name_cht' })
  nameCht: string;

  @Index()
  @Field()
  @Column({ default: 1 })
  sort: number;

  @Index()
  @Field()
  @Column({ default: true })
  show: boolean;

  @Index()
  @Field()
  @Column({ default: false})
  deleted: boolean;

  @Index()
  @Field({ nullable: true })
  @Column({ name: 'createAt', type: 'bigint', nullable: true, })
  createAt: number;

  @Index()
  @Field({ nullable: true })
  @Column({ name: 'editAt', type: 'bigint', nullable: true, })
  editAt: number;

}
