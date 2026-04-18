import { InputType, Field, ID } from 'type-graphql';
import { QuotationPrice } from '../../quotation/input/quotationCreate.input';

@InputType()
export class QuotationTemplateImportItemInput {
  @Field(type=>ID)
  id: string;
  
  @Field(type=>ID, { nullable: true })
  importId?: string;

  @Field(type => [QuotationPrice], { nullable: true })
  form?: QuotationPrice[];
}
