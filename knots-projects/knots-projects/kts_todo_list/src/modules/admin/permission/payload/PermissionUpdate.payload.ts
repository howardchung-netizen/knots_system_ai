import { ObjectType, Field } from 'type-graphql';
import { MutationPayload } from '../../../common/mutationPayload.type';
import { Permission } from '../permission.type';

@ObjectType()
export class PermissionUpdatePayload extends MutationPayload {
  @Field(type => Permission, { nullable: true })
  permission?: Permission;
}
