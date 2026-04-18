import { InputType, Field, Int } from 'type-graphql';

@InputType()
export class PdfCreateInput {
  @Field(type => Int)
  projectId: number;

  @Field(type => String)
  name: string;

  @Field(type => String, { nullable: true })
  remarks?: string;
}
