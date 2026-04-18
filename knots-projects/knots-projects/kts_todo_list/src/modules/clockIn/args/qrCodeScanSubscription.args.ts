import { ArgsType, Field, ID } from 'type-graphql';

@ArgsType()
export class QrCodeScanSubscriptionArgs {
  @Field(type => ID, { nullable: true })
  locationId?: string;
}
