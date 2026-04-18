import {Field, Float, ID, ObjectType} from 'type-graphql';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  RelationId,
  OneToOne,
} from 'typeorm';
import { Role } from '../admin/role/role.type';
import { GanttCalendar } from '../gantt/gantt.entity';
import {Node} from '../node/node.interface';
import { ChequeBook } from '../chequeBook/chequeBook.entity';
import { BookKeepingAccount } from '../bookKeepingAccount/bookKeepingAccount.entity';

// @ObjectType()
@ObjectType({implements: Node})
@Entity({name: 'staff'})
export class User extends BaseEntity implements Node {
  @Field(type => ID)
  @PrimaryGeneratedColumn({name : 'uid'})
  id: string;

  @Index()
  @Field()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Index()
  @Field()
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Index()
  @Field()
  @Column({ name: 'id'})
  username?: string;

  @Index()
  @Field({ nullable: true })
  @Column({ name: 'name_cht'})
  nameCht?: string;

  @Index()
  @Field({ nullable: true })
  @Column({ name: 'name_en'})
  nameEn?: string;

  @Index()
  @Field({ nullable: true })
  @Column({ name: 'name'})
  nickName?: string;

  @Column({ name: 'pw'})
  password: string;

  @Index()
  @Field({
    nullable: true,
  })
  @Column({
    nullable: true,
    name: 'tel'
  })
  tel1: string;

  @Index()
  @Field({
    nullable: true,
  })
  @Column({
    nullable: true,
    name: 'tel2'
  })
  tel2: string;

  @Index()
  @Field({
    nullable: true,
  })
  @Column({
    nullable: true,
    name: 'whatsapp',
  })
  whatsApp: string;

  @Index()
  @Field({
    nullable: true,
  })
  @Column({
    nullable: true,
    name: 'whatsapp2'
  })
  whatsapp2: string;

  @Index()
  @Field({
    nullable: true,
  })
  @Column({
    nullable: true,
    name: 'wechat',
  })
  wechat: string;

  @Index()
  @Field({
    nullable: true,
  })
  @Column({
    nullable: true,
    name: 'wechat2'
  })
  wechat2: string;

  @Field()
  @Column({
    default: 9,
    name:'daily_remind_time',
    unsigned: true,
    type: "tinyint",
  })
  dailyRemindTime?: number;

  @Field({
  })
  @Column({
  })
  email?: string;

  @Field()
  @Column({ name: 'status'})
  status: number;

  @Field({
    nullable: true
  })
  @Column({ 
    nullable: true,
    name: 'googleID'
  })
  googleID?: string;

  @Field()
  @Column()
  deleted: Boolean;

  @Field(type => [Role], {nullable: true})
  explicitRoles?: Role[];

  @Field(type => [Role], {nullable: true})
  roles?: Role[];

  @Field(type => String,{nullable: true})
  @Column({type: 'longtext', name: 'device_id', nullable: true,})
  deviceId?: string;

  @Field(type=> Boolean)
  @Column({type:'tinyint', default: false, name: 'is_all_project'})
  isAllProject: Boolean;

  @Field(type => String)
  @Column({
    type: "text",
    nullable: true,
  })
  img?: String | null;

  @Index()
  @Column({
    type: 'uuid',
    name: 'calendar_id',
    length: 36,
    nullable: true,
  })
  @RelationId((user: User) => user.calendar)
  calendarId: string;

  @Field(
    type => GanttCalendar,
  )
  @ManyToOne(type => GanttCalendar)
  @JoinColumn({ name: "calendar_id" })
  calendar: Promise<GanttCalendar>;

  @Field(type => Float)
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0.0 })
  pettyCash: number;

  @Index()
  @Field({ nullable: true })
  @Column({ name: 'last_cheque_no_for_petty_cash', nullable: true })
  lastChequeNoForPettyCash?: string;

  @Field(type => ChequeBook, { nullable: true })
  @ManyToOne(type => ChequeBook)
  @JoinColumn({ name: 'last_cheque_no_for_petty_cash', referencedColumnName: 'chequeNo' })
  lastChequeBook?: Promise<ChequeBook>;

  @Field({ nullable: true })
  @Column({ name: 'petty_cash_account_id', nullable: true })
  pettyCashAccountId?: string;

  @Field(type => BookKeepingAccount, { nullable: true })
  @OneToOne(type => BookKeepingAccount)
  @JoinColumn({ name: "petty_cash_account_id" })
  pettyCashAccount: Promise<BookKeepingAccount>;

  @Field({ nullable: true })
  @Column({
    nullable: true,
    name: 'color',
  })
  color: string;
}
