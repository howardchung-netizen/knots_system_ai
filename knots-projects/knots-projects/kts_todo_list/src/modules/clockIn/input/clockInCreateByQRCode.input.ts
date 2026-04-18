import { InputType, Field, GraphQLISODateTime, ID } from 'type-graphql';

@InputType()
export class ClockInCreateByQRCodeInput {

  @Field()
  tel: string;

  @Field()
  nonce: string;

}
