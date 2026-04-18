import { InputType, Field } from 'type-graphql';
import { PermissionAction } from '../../action/action.type';

@InputType()
export class PermissionInput {
  @Field()
  name: string;

  @Field({ nullable: true })
  resource?: string;

  @Field(type => [PermissionAction], { nullable: true })
  actions?: PermissionAction[];
}
