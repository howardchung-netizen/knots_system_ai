import { ObjectType, Field } from 'type-graphql';
import { MutationPayload } from '../../common/mutationPayload.type';
import { BookKeepingCompany } from '../bookKeepingCompany.entity';

@ObjectType()
export class BookKeepingCompanyPayload extends MutationPayload{
  @Field({ nullable: true })
  bookKeepingCompany?: BookKeepingCompany;
}
