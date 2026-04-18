import { ObjectType, Field } from 'type-graphql';
import { MutationPayload } from '../../common/mutationPayload.type';
import { Currency } from '../currency.entity';

@ObjectType()
export class CurrencyPayload extends MutationPayload{
  @Field({ nullable: true })
  currency?: Currency;
}
