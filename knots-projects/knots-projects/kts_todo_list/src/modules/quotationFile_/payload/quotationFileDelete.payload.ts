
import {Field, ObjectType} from 'type-graphql';
import {MutationPayload} from '../../common/mutationPayload.type';
import {QuotationFile} from '../quotationFile.entity';

@ObjectType()
export class QuotationFileDeletePayload extends MutationPayload {
  @Field(
    type => QuotationFile,
    {
      nullable: true,
    }
  )
  quotationFile?: QuotationFile;
}
