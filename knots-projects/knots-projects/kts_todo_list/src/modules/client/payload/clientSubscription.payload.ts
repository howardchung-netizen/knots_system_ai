import {ObjectType, Field} from 'type-graphql';
import {SubscriptionPayload} from '../../common/subscriptionPayload.type';
import { Client } from '../client.entity';


@ObjectType()
export class ClientSubscriptionPayload extends SubscriptionPayload {
  @Field(type => Client, { nullable: true })
  node?: Client;

  @Field(type => Client, { nullable: true })
  previousValues?: Client;
}
