import { ObjectType, Field } from 'type-graphql';
import { MutationPayload } from '../../common/mutationPayload.type';
import { User } from '../user.entity';

@ObjectType()
export class UserCreatePayload extends MutationPayload {
  @Field({ nullable: true })
  user?: User;
}
