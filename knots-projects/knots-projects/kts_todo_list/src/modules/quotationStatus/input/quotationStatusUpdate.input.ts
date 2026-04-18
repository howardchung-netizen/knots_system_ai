import { InputType, Field, ID, Int } from 'type-graphql';

@InputType()
export class QuotationStatusUpdateInput {
  @Field(type=>ID)
  id: string;

  @Field({ nullable: true })
  code?: string;

  @Field({ nullable: true })
  nameEn?: string;

  @Field({ nullable: true })
  nameCht?: string;

  @Field(type => Int, { nullable: true })
  sort?: number;

  @Field(type => Boolean, { nullable: true })
  show?: boolean;

  @Field(type => Boolean, { nullable: true })
  deleted?: boolean;
}
