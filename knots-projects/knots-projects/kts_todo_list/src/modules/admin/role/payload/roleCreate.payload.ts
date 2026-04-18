import { ObjectType, Field } from 'type-graphql';
import { Role } from '../role.type';
import { MutationPayload } from '../../../common/mutationPayload.type';

@ObjectType()
export class RoleCreatePayload extends MutationPayload {
  @Field()
  role: Role;
}
