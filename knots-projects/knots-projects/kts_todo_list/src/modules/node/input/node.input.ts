import { ArgsType, ID, Field } from 'type-graphql';

@ArgsType()
export class NodeInput {
  @Field(type => ID)
  id: string;
}
