import { InputType, Field, ID, Int } from 'type-graphql';

@InputType()
export class PdfUpdateInput {
  @Field(type => ID)
  id: string;

  @Field(type => Int, { nullable: true })
  projectId?: number;

  @Field(type => String, { nullable: true })
  name?: string;

  @Field(type => String, { nullable: true })
  remarks?: string;
}
