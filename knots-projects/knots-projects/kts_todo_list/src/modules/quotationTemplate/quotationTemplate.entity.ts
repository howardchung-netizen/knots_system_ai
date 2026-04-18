import {Field, ID, ObjectType} from 'type-graphql';
import {
  BaseEntity,
  Column,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';
import {Node} from '../node/node.interface';

@ObjectType({implements: Node})
@Entity({name: 'template_info'})
export class QuotationTemplate extends BaseEntity implements Node {
  @Field(type => ID)
  @PrimaryGeneratedColumn()
  id: string;

  @Index()
  @Field(type=>String, { nullable: true })
  @Column({nullable: true, type: 'varchar', length: 255, name: 'uuid'})
  uuid?: string;

  @Index()
  @Field(type=>String, { nullable: true })
  @Column({nullable: true, type: 'varchar', length: 50, name: 'code'})
  code?: string;

  @Index()
  @Field(type=>String, { nullable: true })
  @Column({nullable: true, type: 'varchar', length: 200, name: 'name'})
  name?: string;

  @Field(type=>String, { nullable: true })
  @Column({nullable: true, type: 'longtext', name: 'form'})
  form?: string;

  @Field(type=>String,{nullable: true})
  @Column({nullable: true, type: 'longtext', name: 'inUsed'})
  inUsed?: string;

  @Field({
    nullable: true,
  })
  @Column({
    type: 'longtext',
    nullable: true,
  })
  remark?: string;

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

}
