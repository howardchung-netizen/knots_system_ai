import { ObjectType, Field } from 'type-graphql';
import { MutationPayload } from '../../common/mutationPayload.type';
import { ProjectInvoice } from '../projectInvoice.entity';

@ObjectType()
export class ProjectInvoiceConfirmTransferPayload extends MutationPayload{
  @Field()
  result: boolean;

  @Field({ nullable: true })
  projectInvoice?: ProjectInvoice;
}
