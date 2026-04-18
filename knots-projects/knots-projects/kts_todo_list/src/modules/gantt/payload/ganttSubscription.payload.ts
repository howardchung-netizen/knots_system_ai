import { ObjectType, Field, Int, ID } from 'type-graphql';
import { SubscriptionPayload } from '../../common/subscriptionPayload.type';
import { Gantt } from '../gantt.entity';

@ObjectType()
export class GanttSubscriptionPayload extends SubscriptionPayload {
  @Field(type => Gantt, { nullable: true })
  node?: Gantt;

  @Field(type => String, { nullable: true })
  updatedTime?: string;

  @Field(type => String, { nullable: true })
  requestId?: string;

  @Field(type => ID, { nullable: true })
  appUUID?: string;

  @Field(type => String, { nullable: true })
  operateUser?: string;

  @Field(type => String, { nullable: true })
  returnSubscriptionData?: string;
}
