import {ArgsType, Field, ID} from 'type-graphql';
import {ConnectionArgs} from '../../common/connectionPaging';
import { OperationAction } from '../../task/task.entity';
import {OperationObjectType} from '../operationLog.entity';

@ArgsType()
export class OperationLogArgs extends ConnectionArgs {
  @Field(
    type => ID,
    {
      nullable: true,
    }
  )
  id?: string;

  @Field(
    type => OperationAction,
    {
      nullable: true,
    }
  )
  action?: OperationAction;

  @Field(
    type => OperationObjectType,
    {
      nullable: true,
    }
  )
  type?: OperationObjectType;

  @Field(
    type => ID,
    {
      nullable: true,
    }
  )
  shopId?: string;

  @Field(
    type => ID,
    {
      nullable: true,
    }
  )
  userId?: string;

  @Field(
    type => ID,
    {
      nullable: true,
    }
  )
  objectId?: string;

  @Field(
    type => [ID],
    {
      nullable: true,
    }
  )
  objectIds?: string[];

  @Field(
    type => String,
    {
      nullable: true,
    }
  )
  date?: string;

  @Field(
    type => String,
    {
      nullable: true,
    }
  )
  startDate?: string;

  @Field(
    type => String,
    {
      nullable: true,
    }
  )
  endDate?: string;

  @Field(
    type => String,
    {
      nullable: true,
    }
  )
  startTime?: string;

  @Field(
    type => String,
    {
      nullable: true,
    }
  )
  endTime?: string;
}
