import { JSONResolver } from 'graphql-scalars';
import { Field, ID, Int, ObjectType, registerEnumType } from 'type-graphql';
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
  AfterLoad,
  RelationId,
  OneToMany,
  PrimaryColumn,
  Unique,
} from 'typeorm';
import { Contact } from '../contact/contact.entity';
import { Node } from '../node/node.interface';
import { Project } from '../project/project.entity';
import { User } from '../user/user.entity';

export enum TaskPriority {
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW',
}

registerEnumType(TaskPriority, {
  name: 'TaskPriority',
});


export enum TaskStatus {
  TODO = 'TODO',
  DONE = 'DONE',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

registerEnumType(TaskStatus, {
  name: 'TaskStatus',
});

export enum LogWhatsAppStaus {
  NA = 'NA',
  PENDING = 'PENDING',
  SENT = 'SENT',
}

registerEnumType(LogWhatsAppStaus, {
  name: 'LogWhatsAppStaus',
});

// @ObjectType()
@ObjectType({ implements: Node })
@Entity()
export class Task extends BaseEntity implements Node {
  @Field(type => ID)
  @PrimaryGeneratedColumn('uuid')
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
  @Field(type=>String, {
    nullable: true
  })
  @Column({
    type: 'varchar',
    nullable: true,
    length: 40,
  })
  dueDate?: string | null;

  @Field()
  @Column({
    default: false,
    name: 'is_daily_reminder',
  })
  isDailyReminder: boolean;

  @Field(
    type => [TaskAssignedStaff],
    {nullable: true}
  )
  @OneToMany(type => TaskAssignedStaff, taskAssignedStaff => taskAssignedStaff.task, { cascade: true, orphanedRowAction: 'delete', onUpdate: 'CASCADE' })
  assignedStaff?: Promise<TaskAssignedStaff[]>;

  @Field(
    type => [TaskAssignedContact],
    {nullable: true}
  )
  @OneToMany(type => TaskAssignedContact, taskAssignedContact => taskAssignedContact.task, { cascade: true, orphanedRowAction: 'delete', onUpdate: 'CASCADE' })
  assignedContact?: Promise<TaskAssignedContact[]>;

  @Field()
  @Column({
  })
  name: string;

  @Field({ nullable: true })
  @Column({
    nullable: true
  })
  description?: string;

  @Field(type=>String, { nullable: true })
  @Column({
    nullable: true,
    type: 'varchar',
    length: 8
  })
  spotlight?: string;

  @Field(
    type => TaskPriority,
    {
      nullable: true,
    }
  )
  @Column({
    type: 'enum',
    enum: TaskPriority,
    nullable: true,
  })
  priority: TaskPriority

  @Index()
  @Field(type => TaskStatus)
  @Column(
    {
      type: 'enum',
      enum: TaskStatus,
      default: TaskStatus.TODO,
    }
  )
  status: TaskStatus;

  @Field()
  @Column({
    name: 'is_tender',
    default: false,
  })
  isTender: Boolean;

  @Field(
    type => [TaskAssignedProject],
    {
      nullable: true,
    }
  )
  @OneToMany(
    type => TaskAssignedProject, TaskAssignedProject => TaskAssignedProject.task,{cascade: true, orphanedRowAction: 'delete', onUpdate: 'CASCADE', onDelete: 'CASCADE'}
  )
  assignedProjects: Promise<TaskAssignedProject[]>;

  @Field(
    type=> Task, {nullable: true}
    )
  @ManyToOne(type=>Task, task => task.subTasks, {onDelete: 'CASCADE', onUpdate: 'CASCADE', orphanedRowAction: 'delete'})
  @JoinColumn({name: 'parent_task_id'})
  parentTask: Promise<Task>;

  @Index()
  @Field(
    type => String
  )
  @Column({name: 'parent_task_id', nullable: true})
  parentTaskId: string;

  @Field(type => [Task])
  @OneToMany(type=>Task, task=>task.parentTask)
  subTasks: Promise<Task[]>;

  @Field(Type=>[TaskLog])
  @OneToMany(type=>TaskLog,taskLog=>taskLog.task)
  taskLog: Promise<TaskLog[]>;

  @Field(type => Date, { nullable: true })
  @Column({
    nullable: true,
    type: 'date',
    name: 'done_at'
  })
  doneAt?: Date | null;

  @Field()
  @Column({
    name: 'is_deleted',
    default: false,
  })
  isDeleted: Boolean;

  @Field(type=> User, {nullable: true,})
  @ManyToOne(type=> User, { onDelete: 'CASCADE' })
  @JoinColumn({name : 'created_by'})
  createdBy: Promise<User>;

  @Index()
  @Column({ name: 'created_by', nullable: true})
  createdById: string;
}


@ObjectType({ implements: Node })
@Entity()
export class TaskAssignedStaff extends BaseEntity {
  @Field(
    type => ID,
  )
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({
    type: 'uuid',
    name: 'task_id',
    length: 36,
  })
  @RelationId((taskAssignedStaff: TaskAssignedStaff) => taskAssignedStaff.task)
  taskId: string;

  @Field(
    type => Task,
  )
  @ManyToOne(type => Task, Task => Task.assignedStaff, {
    onDelete: 'CASCADE',
    onUpdate: "CASCADE",
    orphanedRowAction: "delete",
  })
  @JoinColumn({ name: "task_id" })
  task: Promise<Task>;

  @Column({
    name: 'staff_id',
  })
  staffId: string;

  @Field(
    type => User,
  )
  @ManyToOne(
    type => User,
  )
  @JoinColumn({
    name: "staff_id",
  })
  staff: Promise<User>;

  @Field()
  @Column({
    name: "is_daily_reminder",
    default: true,
  })
  isDailyReminder: Boolean;

  @Index()
  @Field(type => Boolean, {
    nullable: true,
  })
  @Column({
    nullable: true,
    name: 'is_pic'
  })
  isPic?: Boolean;
  
}


@ObjectType({ implements: Node })
@Entity()
export class TaskAssignedContact extends BaseEntity {
  @Field(
    type => ID,
  )
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({
    type: 'uuid',
    name: 'task_id',
    length: 36,
  })
  @RelationId((taskAssignedContact: TaskAssignedContact) => taskAssignedContact.task)
  taskId: string;

  @Field(
    type => Task,
  )
  @ManyToOne(type => Task, Task => Task.assignedStaff, {
    onDelete: 'CASCADE',
    onUpdate: "CASCADE",
    orphanedRowAction: "delete",
  })
  @JoinColumn({ name: "task_id" })
  task: Promise<Task>;

  @Column({
    name: 'contact_id',
  })
  contactId: string;

  @Field(
    type => Contact,
  )
  @ManyToOne(
    type => Contact,
  )
  @JoinColumn({
    name: "contact_id",
  })
  contact: Promise<Contact>;

  @Field()
  @Column({
    name: "is_daily_reminder",
    default: true,
  })
  isDailyReminder: Boolean;

  @Index()
  @Field(type => Boolean, {
    nullable: true,
  })
  @Column({
    nullable: true,
    name: 'is_pic'
  })
  isPic?: Boolean;

}

export enum OperationAction {
  CREATE = "CREATE",
  UPDATE = "UPDATE",
  DELETE = "DELETE",
}

export enum DataAction {
  ADD = "ADD",
  CHANGE = "CHANGE",
  REMOVE = "REMOVE",
  KEEP = "KEEP",
}

registerEnumType(OperationAction, {
  name: 'OperationAction',
});

registerEnumType(DataAction, {
  name: 'DataAction',
});

@ObjectType({ implements: Node })
@Entity()
export class TaskLog extends BaseEntity {
  @Field(type => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Field()
  @CreateDateColumn({
    name: "created_at",
  })
  createdAt: Date;

  @Index()
  @Field()
  @UpdateDateColumn({
    name: "updated_at",
  })
  updatedAt: Date;

  @Field(
    type => OperationAction,
  )
  @Column({
    type: "enum",
    enum: OperationAction,
  })
  action: OperationAction;

  @Field(type=>Task)
  @ManyToOne(
    type => Task,
  )
  @JoinColumn({
    name: "task_id",
  })
  task: Promise<Task>;

  @Index()
  @Column({
    name: "task_id",
  })
  taskId: string;

  @Field(type=>User,{nullable: true})
  @ManyToOne(
    type => User,
  )
  @JoinColumn({
    name: "user_id",
  })
  user: Promise<User>;

  @Index()
  @Column({
    name: "user_id",
    nullable: true,
  })
  userId: string;

  @Field(type=>Contact,{nullable: true})
  @ManyToOne(
    type => Contact,
  )
  @JoinColumn({
    name: "contact_id",
  })
  contact: Promise<Contact>;

  @Index()
  @Column({
    name: "contact_id",
    nullable: true,
  })
  contactId: string;

  @Field(
    type => JSONResolver,
    {
      nullable: true,
    }
  )
  @Column({
    type: "json",
    nullable: true,
  })
  changes?: JSON;

  @Index()
  @Field(type=> LogWhatsAppStaus)
  @Column({
    type: 'enum',
    enum: LogWhatsAppStaus,
    default: LogWhatsAppStaus.NA,
  })
  whatsAppStatus?: LogWhatsAppStaus;
}

@ObjectType({ implements: Node })
@Entity()
@Unique(['taskId', 'projectId'])
export class TaskAssignedProject extends BaseEntity {
  @Field(type => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Field()
  @CreateDateColumn({
    name: "created_at",
  })
  createdAt: Date;

  @Index()
  @Field()
  @UpdateDateColumn({
    name: "updated_at",
  })
  updatedAt: Date;
  
  @Index()
  @Column({ name: 'task_id', length: 36 })
  taskId: string;

  @Index()
  @Column({ name: 'project_id', nullable: true})
  projectId: string;

  @Field(type=> Task)
  @ManyToOne(type=> Task, task=>task.assignedProjects, {
    onDelete: 'CASCADE',
    onUpdate: "CASCADE",
    orphanedRowAction: "delete",
  })
  @JoinColumn({name : 'task_id'})
  task: Promise<Task>;

  @Field(type=> Project)
  @ManyToOne(type=> Project, { onDelete: 'CASCADE' })
  @JoinColumn({name : 'project_id'})
  project: Promise<Project>;
  
  @Field(type=> String, {nullable: true})
  @Column({name: 'section_name', nullable: true})
  sectionName: string;

  @Field()
  @Column({
    name: 'sorting_index',
    type: 'bigint',
    default: '99999999',
    nullable: true,
  })
  sortingIndex: number;
}
export interface taskLogChanges {
  entity?: string,
  action: DataAction,
  originalValue?: string | boolean | null,
  newValue?: string | boolean | null,
  originalId?: string,
  newId?: string,
  originalIds?: Array<string>,
  newIds?: Array<string>,
  originalName?: string,
  newName?: string,
  originalNames?: Array<string>,
  newNames?: Array<string>,
}
