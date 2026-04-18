import { ObjectType, Field } from 'type-graphql';
import { MutationPayload } from '../../common/mutationPayload.type';
import { ProjectInvoice } from '../projectInvoice.entity';

@ObjectType()
export class ProjectInvoicePayload extends MutationPayload{
  @Field({ nullable: true })
  projectInvoice?: ProjectInvoice;
}
