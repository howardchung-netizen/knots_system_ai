import { ObjectType, Field } from 'type-graphql';
import { IsNotEmpty } from 'class-validator';
import { PermissionAction } from '../action/action.type';

@ObjectType()
export class Permission {
  @Field()
  @IsNotEmpty()
  name: string;

  @Field({
    description: `Resource name e.g. gift, promotion. Support regex e.g. (gift|promotion), .*`,
  })
  @IsNotEmpty()
  resource: string;

  @Field(type => PermissionAction, {
    description: `Allowed action e.g. getMany, create, update, delete. Support regex e.g. (create|update|delete), .*`,
  })
  @IsNotEmpty()
  actions: PermissionAction[];
}
