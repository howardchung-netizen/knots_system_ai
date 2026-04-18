import { InputType, Field, ID } from 'type-graphql';

@InputType()
export class QuotationDuplicateInput {
  @Field(type=>ID)
  id: string;
}
