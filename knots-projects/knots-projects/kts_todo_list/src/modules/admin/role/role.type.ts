import { ObjectType, Field } from 'type-graphql';
import { Permission } from '../permission/permission.type';

@ObjectType()
export class Role {
  @Field()
  name: string;

  @Field(type => [Permission], { nullable: true })
  explicitPermissions?: Permission[];

  @Field(type => [Permission], { nullable: true })
  permissions?: Permission[];

  @Field(type => [Role], { nullable: true })
  roles?: Role[];
}
