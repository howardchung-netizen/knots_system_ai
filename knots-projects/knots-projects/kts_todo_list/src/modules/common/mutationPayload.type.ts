import { ObjectType, Field } from 'type-graphql';
import { UserError } from './userError.type';

@ObjectType()
export class MutationPayload {
  @Field(type => [UserError])
  userErrors: UserError[];
}
