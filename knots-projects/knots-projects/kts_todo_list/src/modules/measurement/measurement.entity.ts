import {Field, ID, Int, ObjectType} from 'type-graphql';
import {
  BaseEntity,
  Column,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';
import {Node} from '../node/node.interface';
import { MeasureType } from '../measureType/measureType.entity';

@ObjectType({implements: Node})
@Entity({name: 'measurement'})
export class Measurement extends BaseEntity implements Node {
  @Field(type => ID)
  @PrimaryGeneratedColumn()
  id: string;

  @Field(type => String, { nullable: true })
  realId?: string;
  
  @Index()
  @Column({nullable: true, type: 'int', name: 'type_id'})
  typeId?: number;

  @Field(type => MeasureType, { nullable: true })
  type?: Promise<MeasureType>;

  @Index()
  @Field(type=>String,{nullable: true})
  @Column({nullable: true, length: 200, name: 'name_cht'})
  nameCht?: string;

  @Index()
  @Field(type=>String,{nullable: true})
  @Column({nullable: true, length: 200, name: 'name_en'})
  nameEn?: string;

  @Field(type=>String,{nullable: true})
  @Column({nullable: true, length: 45, name: 'desc_cht'})
  descCht?: string;

  @Field(type=>String,{nullable: true})
  @Column({nullable: true, length: 45, name: 'desc_en'})
  descEn?: string;

  @Index()
  @Field(type=> Int)
  @Column({
    type: 'int',
    unsigned: true,
    default: 0,
  })
  sort: number;

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
