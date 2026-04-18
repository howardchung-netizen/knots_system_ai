import { ObjectType, Field } from 'type-graphql';
import { MutationPayload } from '../../../common/mutationPayload.type';
import { Permission } from '../permission.type';

@ObjectType()
export class PermissionCreatePayload extends MutationPayload {
  @Field({ nullable: true })
  permission?: Permission;
}
