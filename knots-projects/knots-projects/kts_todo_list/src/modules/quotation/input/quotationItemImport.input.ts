import { InputType, Field, ID } from 'type-graphql';
import { QuotationPrice } from './quotationCreate.input';


@InputType()
export class QuotationImportItemInput {
  @Field(type=>ID)
  id: string;
  
  @Field(type=>ID, { nullable: true })
  importId?: string;

  @Field(type => [QuotationPrice], { nullable: true })
  form?: QuotationPrice[];

  @Field(type => String, { nullable: true })
  importMode?: string;
  
}
