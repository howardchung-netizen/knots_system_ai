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
@Entity({name: 'quotation_status'})
export class QuotationStatus extends BaseEntity implements Node {
  @Field(type => ID)
  @PrimaryGeneratedColumn()
  id: string;

  @Index()
  @Field()
  @Column({type: 'varchar', length: 45, name: 'code'})
  code: string;

  @Index()
  @Field(type=>String)
  @Column({length: 200, name: 'name_cht'})
  nameCht: string;

  @Index()
  @Field(type=>String)
  @Column({length: 200, name: 'name_en'})
  nameEn: string;

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
  @Column({default: true})
  show?: boolean;

  @Index()
  @Field()
  @Column({default: false})
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
