import { InputType, Field, ID, Int } from 'type-graphql';

@InputType()
export class TermsUpdateInput {
  @Field(type=>ID)
  id: string;

  @Field({ nullable: true })
  nameEn?: string;

  @Field({ nullable: true })
  nameCht?: string;

  @Field({ nullable: true })
  descEn?: string;

  @Field({ nullable: true })
  descCht?: string;

  @Field(type => Int, { nullable: true })
  sort?: number;

  @Field(type => Boolean, { nullable: true })
  preset?: boolean;

  @Field(type => Boolean, { nullable: true })
  show?: boolean;

  @Field(type => Boolean, { nullable: true })
  deleted?: boolean;
}
