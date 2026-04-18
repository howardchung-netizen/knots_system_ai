import { ObjectType, Field } from 'type-graphql';
import { MutationPayload } from '../../common/mutationPayload.type';
import { User } from '../user.entity';

@ObjectType()
export class UserUpdatePayload extends MutationPayload {
  @Field({ nullable: true })
  user?: User;
}
