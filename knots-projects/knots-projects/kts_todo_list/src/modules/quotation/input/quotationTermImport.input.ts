import { InputType, Field, ID } from 'type-graphql';
import { QuotationPrice } from './quotationCreate.input';


@InputType()
export class QuotationImportTermInput {
  @Field(type=>ID)
  id: string;
  
  @Field(type => [String], { nullable: true })
  termsIds?: string[];
}
