import { InputType, Field, ID } from 'type-graphql';
import { QuotationPrice } from './quotationCreate.input';
import { JSONResolver } from 'graphql-scalars';

@InputType()
export class QuotationUpdateItemInput {
  @Field(type=>ID)
  id: string;
  
  @Field(type => [JSONResolver])
  form: any;
}
