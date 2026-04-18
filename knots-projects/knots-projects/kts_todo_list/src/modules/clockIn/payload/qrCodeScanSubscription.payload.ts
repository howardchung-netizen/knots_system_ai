import { ObjectType, Field } from 'type-graphql';
import { SubscriptionPayload } from '../../common/subscriptionPayload.type';

@ObjectType()
export class QrCodeScanSubscriptionPayload extends SubscriptionPayload {
  @Field(type => String, { nullable: true })
  locationId?: string;
}
