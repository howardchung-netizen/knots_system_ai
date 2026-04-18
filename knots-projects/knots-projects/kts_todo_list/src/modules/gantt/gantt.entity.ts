import { JSONResolver } from 'graphql-scalars';
import { Field, Float, ID, Int, ObjectType, registerEnumType } from 'type-graphql';
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
  OneToMany,
  OneToOne,
} from 'typeorm';
import { Node } from '../node/node.interface';
import { Project } from '../project/project.entity';
import { DataAction, OperationAction } from '../task/task.entity';
import { User } from '../user/user.entity';
import { GraphQLDate } from "graphql-iso-date";


export enum GanttStatus {
  TODO = 'TODO',
  DONE = 'DONE',
  APPROVED = 'APPROVED',
}

registerEnumType(GanttStatus, {
  name: 'GanttStatus',
});

export enum GanttScheduleMethod {
  NORMAL = 'Normal',
  FIXEDDURATION = 'FixedDuration',
  FIXEDUNITS = 'FixedUnits',
  FIXEDEFFORT = 'FixedEffort',
}

registerEnumType(GanttScheduleMethod, {
  name: 'GanttScheduleMethod',
});

export enum GanttUnit {
  MILLISECOND = 'millisecond',
  SECOND = 'second',
  MINUTE = 'minute',
  HOUR = 'hour',
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month',
  QUARTER = 'quarter',
  YEAR = 'year'
}

registerEnumType(GanttUnit, {
  name: 'GanttUnit',
});

export enum GanttLagUnit {
  MILLISECOND = 'ms',
  SECOND = 's',
  MINUTE = 'm',
  HOUR = 'h',
  DAY = 'd',
  WEEK = 'w',
  MONTH = 'm',
  YEAR = 'y'
}

registerEnumType(GanttLagUnit, {
  name: 'GanttLagUnit',
});

// @ObjectType()
@ObjectType({ implements: Node })
@Entity()
export class Gantt extends BaseEntity implements Node {
  @Field(type => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({
    name: 'project_id',
    nullable: true,
  })
  projectId?: string;

  @Field(
    type => Project,
    {
      nullable: true,
    }
  )
  @OneToOne(
    type => Project,
    project => project.gantt, {
      onDelete: 'CASCADE',
      onUpdate: "CASCADE",
      orphanedRowAction: "delete",
    }
  )
  @JoinColumn({
    name: 'project_id',
  })
  project?: Promise<Project>;

  @Field(
    type => [GanttTasks],
    {nullable: true}
  )
  @OneToMany(type => GanttTasks, ganttTasks => ganttTasks.gantt, { cascade: true, orphanedRowAction: 'delete', onUpdate: 'CASCADE' })
  ganttTasks?: Promise<GanttTasks[]>;

  @Index()
  @Field()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Index()
  @Field()
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Index()
  @Field(type=>String, { nullable: true })
  @Column({
    type: 'varchar',
    name: 'start_date',
    length: 45,
    nullable: true,
  })
  startDate: string;

  @Index()
  @Column({
    name: 'calendar_id',
  })
  calendarId: string;

  @Field(
    type => GanttCalendar,
  )
  @ManyToOne(
    type => GanttCalendar,
  )
  @JoinColumn({
    name: "calendar_id",
  })
  calendar: Promise<GanttCalendar>;

  @Field(type => Int)
  @Column(
    {
      name: 'hours_per_day',
      default: 24,
    }
  )
  hoursPerDay: number;

  @Field(type => Int)
  @Column(
    {
      name: 'days_per_week',
      default: 7,
    }
  )
  daysPerWeek: number;

  @Field(type => Int)
  @Column(
    {
      name: 'days_per_month',
      default: 30,
    }
  )
  daysPerMonth: number;

  @Index()
  @Field(type => GanttStatus)
  @Column(
    {
      type: 'enum',
      enum: GanttStatus,
      default: GanttStatus.TODO,
    }
  )
  status: GanttStatus;

  @Field(type => GraphQLDate, { nullable: true })
  @Column({
    nullable: true,
    type: 'date',
    name: 'done_at'
  })
  doneAt?: Date | null;

  @Field(type => Int)
  @Column({
    default: 0,
  })
  revision: number;

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

  @Field(
    type => [GanttDependencies],
    {nullable: true}
  )
  @OneToMany(type => GanttDependencies, ganttDependencies => ganttDependencies.gantt, { cascade: true, orphanedRowAction: 'delete', onUpdate: 'CASCADE' })
  dependencies?: Promise<GanttDependencies[]>;

  @Field(
    type => [GanttAssignments],
    {nullable: true}
  )
  @OneToMany(type => GanttAssignments, ganttAssignments => ganttAssignments.gantt, { cascade: true, orphanedRowAction: 'delete', onUpdate: 'CASCADE' })
  assignments?: Promise<GanttAssignments[]>;

  @Field(
    type => [GanttShare],
    {nullable: true}
  )
  @OneToMany(type => GanttShare, ganttShare => ganttShare.gantt, { cascade: true, orphanedRowAction: 'delete', onUpdate: 'CASCADE' })
  share?: Promise<GanttShare[]>;
}

// @ObjectType()
@ObjectType({ implements: Node })
@Entity()
export class GanttCalendar extends BaseEntity implements Node {
  @Field(type => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(type => String, { nullable: true })
  @Column({type:'varchar',nullable: true})
  name?: string | null;

  @Field(
    type=> GanttCalendar, {nullable: true}
    )
  @ManyToOne(type=>GanttCalendar, ganttCalendar => ganttCalendar.subCalendars, {onDelete: 'CASCADE', onUpdate: 'CASCADE', orphanedRowAction: 'delete'})
  @JoinColumn({name: 'parent_id'})
  parentCalendar: Promise<GanttCalendar>;

  @Index()
  @Field(
    type => String
  )
  @Column({name: 'parent_id', nullable: true})
  parentId: string;

  @Field(type => [GanttCalendar])
  @OneToMany(type=>GanttCalendar, ganttCalendar => ganttCalendar.parentCalendar)
  subCalendars: Promise<GanttCalendar[]>;

  @Field(
    type => [GanttCalendarIntervals],
    {nullable: true}
  )
  @OneToMany(type => GanttCalendarIntervals, ganttCalendarIntervals => ganttCalendarIntervals.calendar, { cascade: true, orphanedRowAction: 'delete', onUpdate: 'CASCADE' })
  calendarIntervals?: Promise<GanttCalendarIntervals[]>;

  @Field(
    type => [Gantt],
    {nullable: true}
  )
  @OneToMany(type => Gantt, gantt => gantt.calendar, { orphanedRowAction: 'nullify', onUpdate: 'CASCADE' })
  gantt?: Promise<Gantt[]>;

  @Field(
    type => [User],
    {nullable: true}
  )
  @OneToMany(type => User, user => user.calendar, { orphanedRowAction: 'nullify', onUpdate: 'CASCADE' })
  user?: Promise<User[]>;

  @Field()
  @Column({
    name: 'is_deleted',
    default: false,
  })
  isDeleted: Boolean;
}

// @ObjectType()
@ObjectType({ implements: Node })
@Entity()
export class GanttCalendarIntervals extends BaseEntity implements Node {
  @Field(type => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({
    type: 'uuid',
    name: 'calendar_id',
    length: 36,
  })
  @RelationId((ganttCalendarIntervals: GanttCalendarIntervals) => ganttCalendarIntervals.calendar)
  calendarId: string;

  @Field(
    type => GanttCalendar,
  )
  @ManyToOne(type => GanttCalendar, ganttCalendar => ganttCalendar.calendarIntervals, {
    onDelete: 'CASCADE',
    onUpdate: "CASCADE",
    orphanedRowAction: "delete",
  })
  @JoinColumn({ name: "calendar_id" })
  calendar: Promise<GanttCalendar>;

  @Field(type => String, { nullable: true })
  @Column({type: 'varchar', name: 'recurrent_start_date', nullable: true})
  recurrentStartDate?: string | null;

  @Field(type => String, { nullable: true })
  @Column({type: 'varchar', name: 'recurrent_end_date', nullable: true})
  recurrentEndDate?: string | null;

  @Field(type => Int)
  @Column(
    {
      name: 'is_working',
      default: 0,
    }
  )
  isWorking: number;

  @Field()
  @Column({
    name: 'is_deleted',
    default: false,
  })
  isDeleted: Boolean;
}

// @ObjectType()
@ObjectType({ implements: Node })
@Entity()
export class GanttTasks extends BaseEntity implements Node {
  @Field(type => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({
    type: 'uuid',
    name: 'gantt_id',
    length: 36,
  })
  @RelationId((ganttTasks: GanttTasks) => ganttTasks.gantt)
  ganttId: string;

  @Field(
    type => Gantt,
  )
  @ManyToOne(type => Gantt, gantt => gantt.ganttTasks, {
    onDelete: 'CASCADE',
    onUpdate: "CASCADE",
    orphanedRowAction: "delete",
  })
  @JoinColumn({ name: "gantt_id" })
  gantt: Promise<Gantt>;

  @Index()
  @Field()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Index()
  @Field()
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Field(
    type=> GanttTasks, {nullable: true}
    )
  @ManyToOne(type=>GanttTasks, ganttTasks => ganttTasks.subTasks, {onDelete: 'CASCADE', onUpdate: 'CASCADE', orphanedRowAction: 'delete'})
  @JoinColumn({name: 'parent_id'})
  parentTasks: Promise<GanttTasks>;

  @Index()
  @Field(
    type => String,
    { nullable: true },
  )
  @Column({
    type: 'uuid',
    name: 'parent_id',
    nullable: true,
    default: null,
  })
  parentId?: string | null;

  @Field(type => [GanttTasks])
  @OneToMany(type=>GanttTasks, ganttTasks => ganttTasks.parentTasks)
  subTasks: Promise<GanttTasks[]>;

  @Index()
  @Column({
    name: 'calendar_id',
    nullable: true
  })
  calendarId?: string | null;

  @Field(
    type => GanttCalendar,
  )
  @ManyToOne(
    type => GanttCalendar,
  )
  @JoinColumn({
    name: "calendar_id",
  })
  calendar: Promise<GanttCalendar>;

  @Field(type => String, { nullable: true })
  @Column({type:'varchar',nullable: true})
  name?: string | null;

  @Field(type => String, { nullable: true })
  @Column({name:'name_eng', type:'varchar',nullable: true})
  nameEng?: string | null;

  @Field(type => GraphQLDate, {nullable:true})
  @Column({name:'start_date', type:'date',nullable: true})
  startDate?: Date | null;

  @Field(type => GraphQLDate, {nullable:true})
  @Column({name:'end_date', type:'date',nullable: true})
  endDate?: Date | null;

  @Field(type => Float, { nullable: true })
  @Column({type:'float', precision: 11, scale: 2, nullable: true, default: 24})
  effort?: number | null;

  @Field(type => GanttUnit, { nullable: true })
  @Column({
    type: 'enum',
    enum: GanttUnit,
    name:'effort_unit',
    default: GanttUnit.HOUR,
    nullable: true
  })
  effortUnit?: GanttUnit;

  @Field(type => Float, { nullable: true })
  @Column({type:'float', precision: 11, scale: 2, unsigned: true, nullable: true})
  duration?: number | null;

  @Field(type => GanttUnit, { nullable: true })
  @Column({
    type: 'enum',
    enum: GanttUnit,
    name: 'duration_unit',
    default: GanttUnit.DAY,
    nullable: true
  })
  durationUnit?: GanttUnit;

  @Field(type => Float, { nullable: true })
  @Column({name: 'percent_done', type:'float', precision: 11, scale: 2, nullable: true, default: 0})
  percentDone?: number | null;

  @Field(type => String, { nullable: true })
  @Column({type:'text', nullable: true})
  note?: string | null;

  @Field(type => String, { nullable: true })
  @Column({type: 'varchar', name: 'constraint_type', nullable: true})
  constraintType?: string | null;

  @Field(type => GraphQLDate, { nullable: true })
  @Column({name: 'constraint_date', type:'date',nullable: true})
  constraintDate?: Date | null;

  @Field({ nullable: true })
  @Column({name: 'manually_scheduled', nullable: true, default: false})
  manuallyScheduled?: Boolean;

  @Field(type => GanttScheduleMethod)
  @Column({
    type: 'enum',
    name: 'scheduling_mode',
    enum: GanttScheduleMethod,
    default: GanttScheduleMethod.NORMAL
  }
  )
  schedulingMode: GanttScheduleMethod;

  @Field({ nullable: true })
  @Column({nullable: true, default: false})
  rollup?: Boolean;

  @Field({ nullable: true })
  @Column({name: 'dffort_driven', nullable: true, default: false})
  effortDriven?: Boolean;

  @Field({ nullable: true })
  @Column({nullable: true, default: false})
  inactive?: Boolean;

  @Field(type => String, { nullable: true })
  @Column({type: 'varchar', nullable: true})
  cls?: string | null;

  @Field(type => String, { nullable: true })
  @Column({type: 'varchar', name: 'icon_cls', nullable: true})
  iconCls?: string | null;

  @Field(type => String, { nullable: true })
  @Column({type: 'varchar', nullable: true})
  color?: string | null;

  @Field(type => String, { nullable: true })
  @Column({type: 'varchar', nullable: true})
  style?: string | null;

  @Field(type => Int, { nullable: true })
  @Column({name: 'parent_index', nullable: true, default: 0})
  parentIndex?: number;

  @Field({ nullable: true })
  @Column({nullable: true, default: false})
  expanded?: Boolean;

  @Field(type => GraphQLDate, { nullable: true })
  @Column({type:'date',nullable: true})
  deadline?: Date | null;

  @Field(
    type => [GanttDependencies],
    {nullable: true}
  )
  @OneToMany(type => GanttDependencies, ganttDependencies => ganttDependencies.toEvent)
  toEvent?: Promise<GanttDependencies[]>;

  @Field(
    type => [GanttDependencies],
    {nullable: true}
  )
  @OneToMany(type => GanttDependencies, ganttDependencies => ganttDependencies.fromEvent)
  fromEvent?: Promise<GanttDependencies[]>;

  @Field(
    type => [GanttAssignments],
    {nullable: true}
  )
  @OneToMany(type => GanttAssignments, ganttAssignments => ganttAssignments.event, { cascade: true, orphanedRowAction: 'delete', onUpdate: 'CASCADE' })
  assignments?: Promise<GanttAssignments[]>;

  // @Field(
  //   type => [GanttLog],
  //   {nullable: true}
  // )
  // @OneToMany(type => GanttLog, ganttLog => ganttLog.ganttTasks, { cascade: true, orphanedRowAction: 'delete', onUpdate: 'CASCADE' })
  // logs?: Promise<GanttLog[]>;

  @Field()
  @Column({
    name: 'is_deleted',
    default: false,
  })
  isDeleted: Boolean;
}

// @ObjectType()
@ObjectType({ implements: Node })
@Entity()
export class GanttDependencies extends BaseEntity implements Node {
  @Field(type => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({
    type: 'uuid',
    name: 'gantt_id',
    length: 36,
  })
  @RelationId((ganttDependencies: GanttDependencies) => ganttDependencies.gantt)
  ganttId: string;

  @Field(
    type => Gantt,
  )
  @ManyToOne(type => Gantt, gantt => gantt.id, {
    onDelete: 'CASCADE',
    onUpdate: "CASCADE",
    orphanedRowAction: "delete",
  })
  @JoinColumn({ name: "gantt_id" })
  gantt: Promise<Gantt>;

  @Index()
  @Column({
    type: 'uuid',
    name: 'from_event_id',
    length: 36,
  })
  @RelationId((ganttDependencies: GanttDependencies) => ganttDependencies.fromEvent)
  fromEventId: string;

  @Field(
    type => GanttTasks,
  )
  @ManyToOne(type => GanttTasks, ganttTasks => ganttTasks.fromEvent)
  @JoinColumn({ name: "from_event_id" })
  fromEvent: Promise<GanttTasks>;

  @Index()
  @Column({
    type: 'uuid',
    name: 'to_event_id',
    length: 36,
  })
  @RelationId((ganttDependencies: GanttDependencies) => ganttDependencies.toEvent)
  toEventId: string;

  @Field(
    type => GanttTasks,
  )
  @ManyToOne(type => GanttTasks, ganttTasks => ganttTasks.toEvent)
  @JoinColumn({ name: "to_event_id" })
  toEvent: Promise<GanttTasks>;

  @Field(type => Int, { nullable: true })
  @Column({nullable: true, default: 2})
  typ?: number;

  @Field(type => String, { nullable: true })
  @Column({type: 'varchar', nullable: true})
  cls?: string | null;

  @Field(type => Float, { nullable: true })
  @Column({type:'float', precision: 11, scale: 2, nullable: true, default: 0})
  lag?: number | null;

  @Field(type => String, { nullable: true })
  @Column({
    // type: 'enum',
    name: 'lag_unit',
    // enum: GanttLagUnit,
    // default: GanttLagUnit.DAY,
    nullable: true
  })
  lagUnit?: string;

  @Field()
  @Column({
    name: 'is_deleted',
    default: false,
  })
  isDeleted: Boolean;

  @Field()
  @Column({
    name: 'active',
    default: false,
  })
  active: Boolean;
}

@ObjectType({ implements: Node })
@Entity()
export class GanttAssignments extends BaseEntity {
  @Field(
    type => ID,
  )
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({
    type: 'uuid',
    name: 'gantt_id',
    length: 36,
  })
  @RelationId((ganttDependencies: GanttDependencies) => ganttDependencies.gantt)
  ganttId: string;

  @Field(
    type => Gantt,
  )
  @ManyToOne(type => Gantt, gantt => gantt.id, {
    onDelete: 'CASCADE',
    onUpdate: "CASCADE",
    orphanedRowAction: "delete",
  })
  @JoinColumn({ name: "gantt_id" })
  gantt: Promise<Gantt>;

  @Index()
  @Column({
    type: 'uuid',
    name: 'event_id',
    length: 36,
  })
  @RelationId((ganttAssignments: GanttAssignments) => ganttAssignments.event)
  eventId: string;

  @Field(
    type => GanttTasks,
  )
  @ManyToOne(type => GanttTasks, ganttTasks => ganttTasks.assignments, {
    onDelete: 'CASCADE',
    onUpdate: "CASCADE",
    orphanedRowAction: "delete",
  })
  @JoinColumn({ name: "event_id" })
  event: Promise<GanttTasks>;

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

  @Field(
    type => Int,
    { nullable: true },
  )
  @Column({
    nullable: true,
  })
  units?: number;

  @Field()
  @Column({
    name: 'is_deleted',
    default: false,
  })
  isDeleted: Boolean;
}

@ObjectType({ implements: Node })
@Entity()
export class GanttLog extends BaseEntity {
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

  // @Field(type=>Gantt)
  // @ManyToOne(
  //   type => Gantt,
  // )
  // @JoinColumn({
  //   name: "gantt_id",
  // })
  // gantt: Promise<Gantt>;

  // @Index()
  // @Column({
  //   name: "gantt_id",
  // })
  // ganttId: string;

  // @Field(type=>GanttTasks, {nullable: true})
  // @ManyToOne(
  //   type => GanttTasks,
  // )
  // @JoinColumn({
  //   name: "gantt_tasks_id",
  // })
  // ganttTasks: Promise<GanttTasks>;

  // @Index()
  // @Column({
  //   name: "gantt_tasks_id",
  //   nullable: true,
  // })
  // ganttTasksId: string;

  // @Field(type=>GanttDependencies, {nullable: true})
  // @ManyToOne(
  //   type => GanttDependencies,
  // )
  // @JoinColumn({
  //   name: "gantt_dependencies_id",
  // })
  // ganttDependencies: Promise<GanttDependencies>;

  // @Index()
  // @Column({
  //   name: "gantt_dependencies_id",
  //   nullable: true,
  // })
  // ganttDependenciesId: string;

  // @Field(type=>GanttAssignments, {nullable: true})
  // @ManyToOne(
  //   type => GanttAssignments,
  // )
  // @JoinColumn({
  //   name: "gantt_assignments_id",
  // })
  // ganttAssignments: Promise<GanttAssignments>;

  // @Index()
  // @Column({
  //   name: "gantt_assignments_id",
  //   nullable: true,
  // })
  // ganttAssignmentsId: string;

  @Field(type=>User,{nullable: true})
  @ManyToOne(
    type => User,
  )
  @JoinColumn({
    name: "user_id",
  })
  user?: Promise<User>;

  @Index()
  @Column({
    name: "user_id",
    nullable: true,
  })
  userId?: string;

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

  @Field(
    type => String,
  )
  @Column({
    name: "request_id"
  })
  requestId: string;

  @Field(type => Int)
  @Column({
    default: 0,
  })
  revision: number;

}

@ObjectType({ implements: Node })
@Entity()
export class GanttShare extends BaseEntity implements Node {
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
  @Column({
    type: 'uuid',
    name: 'gantt_id',
    length: 36,
  })
  @RelationId((ganttShare: GanttShare) => ganttShare.gantt)
  ganttId: string;

  @Field(
    type => Gantt,
  )
  @ManyToOne(type => Gantt, gantt => gantt.share, {
    onDelete: 'CASCADE',
    onUpdate: "CASCADE",
    orphanedRowAction: "delete",
  })
  @JoinColumn({ name: "gantt_id" })
  gantt: Promise<Gantt>;

  @Field()
  @Column({name: 'expired_time'})
  expiredTime: Date;

  @Index()
  @Field(type => String)
  @Column()
  code: string;

  @Field(type => String)
  @Column()
  remark: string;

  @Index()
  @Field()
  @Column({
    name: 'is_deleted',
    default: false,
  })
  isDeleted: Boolean;
}

@ObjectType({ implements: Node })
@Entity()
export class GanttColumnConfig extends BaseEntity implements Node {
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
  @Column({
    name: 'staff_id',
  })
  staffId: string;

  @Field(
    type => User,
  )
  @ManyToOne(type => User, user => user.username)
  @JoinColumn({
    name: "staff_id",
  })
  staff: Promise<User>;

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
  config?: JSON;
}

export interface ganttLogChanges {
  entity?: string,
  action: DataAction,
  originalValue?: string | Boolean | number | Date | null,
  newValue?: string | Boolean | number | Date | null,
  originalId?: string,
  newId?: string,
  originalIds?: Array<string>,
  newIds?: Array<string>,
  originalName?: string,
  newName?: string,
  originalNames?: Array<string>,
  newNames?: Array<string>,
}
