import { InputType, Field, ID } from 'type-graphql';
import { QuotationTemplatePrice } from './quotationTemplateCreate.input';
import { JSONResolver } from 'graphql-scalars';

@InputType()
export class QuotationTemplateUpdateItemInput {
  @Field(type=>ID)
  id: string;
  
  @Field(type => [JSONResolver])
  form: any;
}
