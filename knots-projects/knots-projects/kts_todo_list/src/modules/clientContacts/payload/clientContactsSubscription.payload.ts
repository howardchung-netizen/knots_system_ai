import {ObjectType, Field} from 'type-graphql';
import {SubscriptionPayload} from '../../common/subscriptionPayload.type';
import { ClientContacts } from '../clientContacts.entity';


@ObjectType()
export class ClientContactsSubscriptionPayload extends SubscriptionPayload {
  @Field(type => ClientContacts, { nullable: true })
  node?: ClientContacts;

  @Field(type => ClientContacts, { nullable: true })
  previousValues?: ClientContacts;
}
