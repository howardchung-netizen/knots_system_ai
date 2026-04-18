import { InputType, Field, ID } from 'type-graphql';

@InputType()
export class ProjectInvoiceDeleteInput {
  @Field(type=>ID)
  id: string;
}

