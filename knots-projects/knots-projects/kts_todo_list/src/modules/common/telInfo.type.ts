import { ObjectType, Field } from 'type-graphql';

@ObjectType()
export class TelInfo {
  @Field({ nullable: true })
  region?: string;

  @Field({ nullable: true })
  countryCallingCode?: string;

  @Field({ nullable: true })
  localNumber?: string;

  @Field({ nullable: true })
  internationalNumber?: string;
}
