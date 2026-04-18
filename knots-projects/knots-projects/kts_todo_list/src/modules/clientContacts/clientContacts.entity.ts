import {Field, ID, ObjectType} from 'type-graphql';
import {
  BaseEntity,
  Column,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';
import {Node} from '../node/node.interface';
import { ContactFile } from '../contactFile/contactFile.entity';

@ObjectType({implements: Node})
@Entity()
export class ClientContacts extends BaseEntity implements Node {
  @Field(type => ID)
  @PrimaryGeneratedColumn()
  id: string;

  @Index()
  @Field({
    nullable: true,
  })
  @Column({
    length: 45,
    nullable: true,
  })
  uuid?: string;

  @Index()
  @Field({
    nullable: true,
  })
  @Column({
    nullable: true,
    default: '0',
  })
  appellation: number;

  @Index()
  @Field({
    nullable: true,
  })
  @Column({
    name: 'name_cht',
    length: 200,
    nullable: true,
  })
  nameCht?: string;

  @Index()
  @Field({
    nullable: true,
  })
  @Column({
    name: 'name_en',
    length: 200,
    nullable: true,
  })
  nameEn?: string;

  @Index()
  @Field({
    nullable: true,
  })
  @Column({
    name: 'email',
    length: 200,
    nullable: true,
  })
  email?: string;

  @Field({
    nullable: true,
  })
  @Column({
    name: 'tel_code',
    length: 200,
    nullable: true,
  })
  telCode?: string;

  @Index()
  @Field({
    nullable: true,
  })
  @Column({
    name: 'tel',
    length: 200,
    nullable: true,
  })
  tel?: string;

  @Field({
    nullable: true,
  })
  @Column({
    name: 'whatsapp_code',
    length: 200,
    nullable: true,
  })
  whatsappCode?: string;

  @Index()
  @Field({
    nullable: true,
  })
  @Column({
    name: 'whatsapp',
    length: 200,
    nullable: true,
  })
  whatsapp?: string;

  @Field({
    nullable: true,
  })
  @Column({
    name: 'wechat_code',
    length: 200,
    nullable: true,
  })
  wechatCode?: string;

  @Index()
  @Field({
    nullable: true,
  })
  @Column({
    name: 'wechat',
    length: 200,
    nullable: true,
  })
  wechat?: string;

  @Field({
    nullable: true,
  })
  @Column({
    name: 'client_id',
    type: 'text',
    nullable: true,
  })
  client_id?: string;

  @Field({
    nullable: true,
  })
  @Column({
    name: 'project_id',
    type: 'text',
    nullable: true,
  })
  projectId?: string;

  @Field({
    nullable: true,
  })
  @Column({
    name: 'quotation_id',
    type: 'text',
    nullable: true,
  })
  quotationId?: string;

  @Index()
  @Field({
    nullable: true,
  })
  @Column({ name: 'createAt', type: 'bigint', nullable: true, })
  createdAt: number;

  @Index()
  @Field({
    nullable: true,
  })
  @Column({ name: 'editAt', type: 'bigint', nullable: true, })
  editAt: number;

  @Index()
  @Field({
    nullable: true,
  })
  @Column({
    type: 'tinyint',
    nullable: true,
    default: 0,
  })
  deleted: boolean;

  @Field({
    nullable: true,
  })
  @Column({ type: 'bigint', nullable: true, })
  deleteAt: number;

  @Field(type => [ContactFile],
    {nullable: true},
  )
  contactFiles?: Promise<ContactFile[]>;

}
