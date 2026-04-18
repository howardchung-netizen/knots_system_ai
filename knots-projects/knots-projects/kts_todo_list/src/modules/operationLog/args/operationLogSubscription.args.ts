import { ArgsType, Field, ID } from 'type-graphql';
import { OperationObjectType } from '../operationLog.entity';

@ArgsType()
export class OperationLogSubscriptionArgs {
  @Field(type => ID, { nullable: true })
  shopId?: string;

  @Field(type => OperationObjectType, { nullable: true })
  objectType?: OperationObjectType;
}
