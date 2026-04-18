import { ObjectType, Field } from 'type-graphql';
import { MutationPayload } from '../../common/mutationPayload.type';
import { ChequeBook } from '../chequeBook.entity';

@ObjectType()
export class ChequeBookPayload extends MutationPayload{
  @Field({ nullable: true })
  chequeBook?: ChequeBook;
}
