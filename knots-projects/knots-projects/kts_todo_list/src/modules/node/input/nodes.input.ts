import { ID, Field, ArgsType } from 'type-graphql';

@ArgsType()
export class NodesInput {
  @Field(type => [ID])
  ids: string[];
}
