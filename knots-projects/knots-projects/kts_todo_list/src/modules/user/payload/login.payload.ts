import { ObjectType, Field } from 'type-graphql';
import { User } from '../user.entity';
import { UserUnion } from '../union/user.union';

@ObjectType()
export class LoginPayload {
  @Field(type => UserUnion, { nullable: true })
  user?: User;

  @Field()
  token: string;
}
