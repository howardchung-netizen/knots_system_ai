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
@Entity({name: 'terms'})
export class Terms extends BaseEntity implements Node {
  @Field(type => ID)
  @PrimaryGeneratedColumn()
  id: string;

  @Field(type => Number, { nullable: true })
  realId?: number;

  @Index()
  @Field(type=>String,{nullable: true})
  @Column({nullable: true, length: 200, name: 'name_cht'})
  nameCht?: string;

  @Index()
  @Field(type=>String,{nullable: true})
  @Column({nullable: true, length: 200, name: 'name_en'})
  nameEn?: string;

  @Field(type=>String,{nullable: true})
  @Column({nullable: true, type: 'longtext', name: 'desc_cht'})
  descCht?: string;

  @Field(type=>String,{nullable: true})
  @Column({nullable: true, type: 'longtext', name: 'desc_en'})
  descEn?: string;

  @Index()
  @Field(type=> Int)
  @Column({
    type: 'int',
    default: 0,
  })
  sort: number;

  @Index()
  @Field()
  @Column({nullable:true, default: false})
  preset?: boolean;

  @Index()
  @Field()
  @Column({nullable:true, default: true})
  show?: boolean;

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
