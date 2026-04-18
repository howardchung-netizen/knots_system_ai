import { ObjectType, Field } from 'type-graphql';
import { MutationPayload } from '../../common/mutationPayload.type';
import { BookKeepingAccount } from '../bookKeepingAccount.entity';

@ObjectType()
export class BookKeepingAccountPayload extends MutationPayload{
  @Field({ nullable: true })
  bookKeepingAccount?: BookKeepingAccount;
}
