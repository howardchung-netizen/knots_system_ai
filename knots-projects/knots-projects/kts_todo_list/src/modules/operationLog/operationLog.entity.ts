import {Field, ID, ObjectType, registerEnumType} from "type-graphql";
import {JSONResolver} from "graphql-scalars";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from "typeorm";
import {Node} from "../node/node.interface";
import {User} from "../user/user.entity";
import {OperationLogObjectUnion} from "./union/operationLogObjectUnion";
import { OperationAction } from "../task/task.entity";

export enum OperationObjectType {
  ClockIn = 'ClockIn',
  Contact = 'Contact',
  Gantt = 'Gantt',
  Pdf = 'Pdf',
  Project = 'Project',
  Task = 'Task',
}

registerEnumType(OperationObjectType, {
  name: 'OperationObjectType',
});

@ObjectType({implements: Node})
@Entity()
export class OperationLog extends BaseEntity implements Node {
  @Field(
    type => ID,
  )
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

  @Field(type => User)
  @ManyToOne(
    type => User,
  )
  @JoinColumn({
    name: "user_id",
  })
  user: User;

  @Index()
  @Column({
    name: "user_id",
  })
  userId: string;

  @Field(
    type => OperationObjectType,
  )
  @Column({
    type: 'enum',
    name: 'object_type',
    enum: OperationObjectType,
  })
  objectType: OperationObjectType;

  @Field(
    type => OperationLogObjectUnion,
  )
  object?: typeof OperationLogObjectUnion;

  @Index()
  @Column({
    name: "object_id",
  })
  objectId: string;

  @Field(
    type => OperationAction,
  )
  @Column({
    type: "enum",
    enum: OperationAction,
  })
  action: OperationAction;

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
}
