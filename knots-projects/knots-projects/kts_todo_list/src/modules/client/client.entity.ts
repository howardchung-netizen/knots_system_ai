import {Field, ID, ObjectType} from 'type-graphql';
import {
  BaseEntity,
  Column,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ClientContacts } from '../clientContacts/clientContacts.entity';
import {Node} from '../node/node.interface';

@ObjectType({implements: Node})
@Entity()
export class Client extends BaseEntity implements Node {
  @Field(type => ID)
  @PrimaryGeneratedColumn()
  id: string;

  @Index()
  @Field({
    nullable: true,
  })
  @Column({
    length: 200,
    nullable: true,
  })
  uuid?: string;

  @Index()
  @Field({
    nullable: true,
  })
  @Column({
    type: 'varchar',
    name: 'prefix',
    length: 5,
    nullable: true,
  })
  prefix?: string;

  @Field({
    nullable: true,
  })
  @Column({
    name: 'img',
    length: 200,
    default: '0',
  })
  img: string;

  @Index()
  @Field({
    nullable: true,
  })
  @Column({
    name: 'company_cht',
    length: 200,
    nullable: true,
  })
  companyCht?: string;

  @Index()
  @Field({
    nullable: true,
  })
  @Column({
    name: 'company_en',
    length: 200,
    nullable: true,
  })
  companyEn?: string;

  @Field({
    nullable: true,
  })
  @Column({
    name: 'address',
    length: 200,
    nullable: true,
  })
  address?: string;

  @Index()
  @Field({
    nullable: true,
  })
  @Column({
    name: 'email',
    length: 45,
    nullable: true,
  })
  email?: string;

  @Field({
    nullable: true,
  })
  @Column({
    name: 'tel_code',
    length: 45,
    nullable: true,
  })
  telCode?: string;

  @Index()
  @Field({
    nullable: true,
  })
  @Column({
    name: 'tel',
    length: 45,
    nullable: true,
  })
  tel?: string;

  @Field({
    nullable: true,
  })
  @Column({
    name: 'fax_code',
    length: 45,
    nullable: true,
  })
  faxCode?: string;

  @Field({
    nullable: true,
  })
  @Column({
    name: 'fax',
    length: 45,
    nullable: true,
  })
  fax?: string;

  @Field({
    nullable: true,
  })
  @Column({
    name: 'whatsapp_code',
    length: 45,
    nullable: true,
  })
  whatsappCode?: string;

  @Index()
  @Field({
    nullable: true,
  })
  @Column({
    name: 'whatsapp',
    length: 45,
    nullable: true,
  })
  whatsapp?: string;

  @Field({
    nullable: true,
  })
  @Column({
    name: 'wechat_code',
    length: 45,
    nullable: true,
  })
  wechatCode?: string;

  @Index()
  @Field({
    nullable: true,
  })
  @Column({
    name: 'wechat',
    length: 45,
    nullable: true,
  })
  wechat?: string;

  @Field({
    nullable: true,
  })
  @Column({
    name: 'remark',
    type: 'text',
    nullable: true,
  })
  remark?: string;

  @Column({
    name: 'main_contacts',
    type: 'int',
    nullable: true,
  })
  mainContactId?: number;

  @Field(type => ClientContacts, {
    nullable: true,
  })
  mainContact?: Promise<ClientContacts>;

  @Column({
    name: 'contacts',
    type: 'text',
    nullable: true,
  })
  contactIds?: string;

  @Field(type => [ClientContacts], {
    nullable: true,
  })
  contacts?: Promise<ClientContacts[]>;

  @Field({
    nullable: true,
  })
  @Column({
    name: 'contacts_detail',
    type: 'text',
    nullable: true,
  })
  contactsDetail?: string;

  @Field({
    nullable: true,
  })
  @Column({
    name: 'name',
    type: 'text',
    nullable: true,
  })
  name?: string;

  @Field({
    nullable: true,
  })
  @Column({
    name: 'name_en',
    length: 45,
    nullable: true,
  })
  nameEn?: string;

  @Field({
    nullable: true,
  })
  @Column({
    name: 'name_cht',
    length: 45,
    nullable: true,
  })
  nameCht?: string;

  @Field({
    nullable: true,
  })
  @Column({
    name: 'createFrom',
    length: 45,
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
    length: 45,
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
  @Field({
    nullable: true,
  })
  @Column({
    type: 'int',
    default: 0,
  })
  deleted: boolean;

  @Field({
    nullable: true,
  })
  @Column({ type: 'bigint', nullable: true, })
  deleteAt: number;

}
