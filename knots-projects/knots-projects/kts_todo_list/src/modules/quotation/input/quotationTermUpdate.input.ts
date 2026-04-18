import { JSONResolver } from 'graphql-scalars';
import { InputType, Field, ID } from 'type-graphql';

@InputType()
export class QuotationUpdateTermInput {

  @Field(type => ID)
  id: string;

  @Field(type => JSONResolver)
  term: string;

}
