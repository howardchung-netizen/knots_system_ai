import { InputType, Field } from 'type-graphql';

@InputType()
export class UserDisconnectGoogleInput {

  @Field()
  googleIdToken: string;

}
