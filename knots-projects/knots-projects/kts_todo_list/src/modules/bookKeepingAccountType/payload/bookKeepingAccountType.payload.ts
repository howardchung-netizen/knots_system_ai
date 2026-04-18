import { ObjectType, Field } from 'type-graphql';
import { MutationPayload } from '../../common/mutationPayload.type';
import { BookKeepingAccountType } from '../bookKeepingAccountType.entity';

@ObjectType()
export class BookKeepingAccountTypePayload extends MutationPayload{
  @Field({ nullable: true })
  bookKeepingAccountType?: BookKeepingAccountType;
}
