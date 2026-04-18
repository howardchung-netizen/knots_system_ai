import { InputType, Field, ID } from 'type-graphql';
import { QuotationPrice } from './quotationCreate.input';
import { JSONResolver } from 'graphql-scalars';

@InputType()
export class QuotationMarkupUpdateInput {
  @Field(type=>ID)
  id: string;
  
  @Field(type => [JSONResolver])
  form: any;

  @Field(type => Number)
  markup: number;

  @Field(type => Number)
  editAt: number;
}
