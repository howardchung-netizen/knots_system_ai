import { ObjectType, Field } from 'type-graphql';
import { MutationPayload } from '../../common/mutationPayload.type';
import { ChequeBook } from '../chequeBook.entity';

@ObjectType()
export class ChequeBookConfirmTransferPayload extends MutationPayload {
  @Field()
  result: boolean;

  @Field({ nullable: true })
  chequeBook?: ChequeBook;
}
