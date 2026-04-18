import { Field, InputType, ID } from 'type-graphql';

@InputType()
export class BookKeepingCompanyDeleteInput {
  @Field(type => ID)
  id: string;
}
