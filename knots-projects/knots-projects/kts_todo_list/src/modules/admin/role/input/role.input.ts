import { InputType, Field } from 'type-graphql';

@InputType()
export class RoleInput {
  @Field()
  name: string;

  @Field(type => [String], { description: 'Permission names', nullable: true })
  permissions?: string[];

  @Field(type => [String], {
    description: 'Names of roles to inherit',
    nullable: true,
  })
  roles?: string[];
}
