import {Field, ID, Int, Float, ObjectType} from 'type-graphql';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  OneToOne,
} from 'typeorm';
import { Gantt } from '../gantt/gantt.entity';
import {Node} from '../node/node.interface';
import { User } from '../user/user.entity';
import { Client } from '../client/client.entity';
import { ClientContacts } from '../clientContacts/clientContacts.entity';
import { ProjectOrder } from '../projectOrder/projectOrder.entity';
import { ProjectStatus } from '../projectStatus/projectStatus.entity';
import { ProjectType } from '../projectType/projectType.entity';
import { ProjectHashtag } from '../projectHashtag/projectHashtag.entity';
import { TaskAssignedProject } from '../task/task.entity';

// @ObjectType()
@ObjectType({implements: Node})
@Entity({name: 'project_info'})
export class Project extends BaseEntity implements Node {
  @Index()
  @Field(type => ID)
  @PrimaryGeneratedColumn()
  id: string;

  @Field(type => Number, { nullable: true })
  realId?: number;
  
  @Index()
  @Field()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Index()
  @Field()
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Index()
  @Field({nullable: true})
  @Column()
  uuid: string;

  @Index()
  @Field(type=>Int)
  @Column({
    type: 'int',
    name: 'project_id',
  })
  projectId: number;

  @Field(type=>Int)
  @Column({
    type: 'int',
  })
  year: number;

  @Field(type=>Int)
  @Column({
    type: 'int',
    unsigned: true,
  })
  case: number;

  @Index()
  @Field()
  @Column({
    default: true,
  })
  valid: boolean;

  @Field(type=>String,{nullable: true})
  @Column({
    type: 'varchar',
    nullable: true,
    length: 8,
  })
  spotlight?: string;

  @Column({
    type: 'int',
    name: 'status',
    default: 1,
  })
  statusId: number;

  @Field(type => ProjectStatus, { nullable: true })
  status?: Promise<ProjectStatus>;

  @Index()
  @Field()
  @Column({
    default: true,
  })
  progress: boolean;

  @Index()
  @Field(type=>String,{nullable: true})
  @Column({nullable: true, length: 255})
  code?: string;

  @Field(type=>String,{nullable: true})
  @Column({nullable: true, length: 45, name: 'code_cht'})
  codeCht?: string;

  @Field(type=>String,{nullable: true})
  @Column({nullable: true, length: 45, name: 'code_en'})
  codeEn?: string;

  @Index()
  @Column({
    type: 'int',
    name: 'p_type',
    nullable: true,
  })
  pType?: number;

  @Field(type=>ProjectType,{nullable: true})
  projectType?: Promise<ProjectType>;

  @Field(type=>String,{nullable: true})
  @Column({nullable: true, length: 200})
  address?: string;

  @Field(type=>String,{nullable: true})
  @Column({nullable: true, type: 'text'})
  lan?: string;

  @Field(type=>String,{nullable: true})
  @Column({nullable: true, type: 'text'})
  lon?: string;

  @Field(type => String,
    {
      nullable: true
    })
  @Column({ nullable: true, type: 'varchar', length: 20 })
  start?: string;

  @Field(type => String,
    {
      nullable: true
    }
  )
  @Column({ nullable: true, type: 'varchar', length: 20 })
  end?: string;

  @Field(type => String)
  @Column({nullable:true, type: 'int', name: 'client_id'})
  clientId?: number;

  @Field(type => Client, { nullable: true })
  @ManyToOne(type => Client)
  @JoinColumn({ name: 'client_id' })
  client?: Promise<Client>;

  @Field(type => String, {nullable: true})
  @Column({nullable:true, type: 'int', name: 'main_contacts_id'})
  mainContactId?: number;

  @Field(type => String, {nullable: true})
  @Column({nullable:true, type: 'text', name: 'contacts_id'})
  contactsId?: string;

  @Field(type => Int, {nullable: true})
  @Column({nullable:true, type: 'int', name: 'contact_id'})
  contactId?: number;

  @Field(type => ClientContacts, { nullable: true })
  @ManyToOne(type => ClientContacts)
  @JoinColumn({ name: 'main_contacts_id' })
  contact?: Promise<ClientContacts>;
  

  @Field(type => String, {
    nullable:true
  })
  @Column({nullable:true, type: 'longtext', })
  remark?: string;

  @Field(type => Int,
    {
      nullable: true
    })
  @Column({ nullable: true, type: 'tinyint', })
  pin?: number;

  @Column({ nullable: true, type: 'text', name: 'hashtags' })
  hashtagsId?: string;

  @Field(type => [ProjectHashtag])
  @ManyToMany(type => ProjectHashtag)
  @JoinTable({
    joinColumn: {
      name: 'project_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'hashtag_id',
      referencedColumnName: 'id',
    }
  })
  hashtags: Promise<ProjectHashtag[]>;

  @Field(type=> Boolean, {nullable: true})
  @Column({nullable:true, default: false})
  deleted?: boolean;

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

  @Field({
    nullable: true,
  })
  @Column({ name: 'editAt', type: 'bigint', nullable: true, })
  editAt: number;

  @Column({
    name: 'gantt_id',
    nullable: true,
  })
  ganttId?: string;

  @Field(
    type => Gantt,
    {
      nullable: true,
    }
  )
  @OneToOne(
    type => Gantt,
  )
  @JoinColumn({
    name: 'gantt_id',
  })
  gantt?: Promise<Gantt>;

  @Field(type => [User])
  @ManyToMany(type => User)
  @JoinTable({
    joinColumn: {
      name: 'project_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'user_id',
      referencedColumnName: 'id',
    }
  })
  assignee: Promise<User[]>;

  @Column({ nullable: true, type: 'int', name: 'manager' })
  managerId?: number;

  @Field(type => User, { nullable: true })
  manager?: Promise<User>;

  @Field(type => String, {
    nullable: true
  })
  @Column({nullable:true, type: 'text'})
  assigness?: string;

  @Field(type=> String,{nullable: true})
  @Column({nullable: true, type: 'varchar', length: '255', name: 'album_share_token'})
  albumShareToken:string;

  @Field(type => [ProjectOrder], { nullable: true })
  orders?: Promise<ProjectOrder[]>;

  @Field(type => [TaskAssignedProject], { nullable: true })
  taskAssignedProject?: Promise<TaskAssignedProject[]>;

  @Field(type => Float, { nullable: true, description: "總承包額扣除成本後的專案毛利 (由後端動態計算)" })
  grossProfit?: number;

  @Field(type => Float, { nullable: true, description: "專案毛利率百分比 (由後端動態計算)" })
  profitMargin?: number;

}
