import { InputType, Field } from 'type-graphql';

@InputType()
export class UserConnectGoogleInput {

  @Field()
  googleIdToken: string;

  @Field({nullable: true})
  deviceId?: string;

}
