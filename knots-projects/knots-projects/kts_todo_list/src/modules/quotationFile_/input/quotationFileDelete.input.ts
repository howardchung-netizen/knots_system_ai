import {Field, ID, InputType} from 'type-graphql';
import {QuotationFile} from '../quotationFile.entity';

@InputType()
export class QuotationFileDeleteInput implements Partial<QuotationFile> {
  @Field(type => ID)
  id: string;

}
