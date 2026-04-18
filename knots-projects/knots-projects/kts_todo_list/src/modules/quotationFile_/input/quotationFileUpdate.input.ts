import {Field, ID, InputType} from 'type-graphql';
import {QuotationFile} from '../quotationFile.entity';

@InputType()
export class QuotationFileUpdateInput implements Partial<QuotationFile> {
  @Field(type => ID)
  id: string;
}
