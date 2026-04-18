import { ObjectType, Field, ID } from 'type-graphql';
import { MutationPayload } from '../../../common/mutationPayload.type';

@ObjectType()
export class RoleDeletePayload extends MutationPayload {
  @Field({ nullable: true })
  deletedRoleName?: string;
}
