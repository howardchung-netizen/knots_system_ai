import { ObjectType, Field } from 'type-graphql';
import { SubscriptionPayload } from '../../common/subscriptionPayload.type';
import { OperationLog } from '../operationLog.entity';

@ObjectType()
export class OperationLogSubscriptionPayload extends SubscriptionPayload {
  @Field(type => OperationLog, { nullable: true })
  node?: OperationLog;

  @Field(type => OperationLog, { nullable: true })
  previousValues?: OperationLog;
}
