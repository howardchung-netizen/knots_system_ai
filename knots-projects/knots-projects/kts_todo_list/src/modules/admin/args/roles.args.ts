import { ArgsType, Field } from 'type-graphql';

@ArgsType()
export class RolesArgs {
  @Field(type => [String], { nullable: true })
  names?: string[];
}
