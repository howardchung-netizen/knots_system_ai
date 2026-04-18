import { InputType, Field } from 'type-graphql';

@InputType()
export class LoginInput {
  @Field({nullable: true})
  username?: string;

  @Field({nullable: true})
  password?: string;

  @Field({nullable: true})
  googleIdToken?: string;

  @Field({nullable: true})
  appleIdToken?: string;

  @Field({nullable: true})
  appleNonce?: string;

  @Field({nullable: true})
  deviceId?: string;
}
