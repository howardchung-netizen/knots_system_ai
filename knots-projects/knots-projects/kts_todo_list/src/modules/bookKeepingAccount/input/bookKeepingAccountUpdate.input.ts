import { InputType, Field, ID, Float, Int } from 'type-graphql';

@InputType()
export class BookKeepingAccountUpdateInput {
  @Field(type=>ID)
  id: string;

  @Field(type => ID, { nullable: true })
  companyId?: string;

  @Field(type => ID, { nullable: true })
  accountTypeId?: string;

  @Field(type => ID, { nullable: true })
  parentAccountId?: string;

  @Field(type => String, { nullable: true })
  name?: string;

  @Field(type => Float, { nullable: true })
  balance?: number;

  @Field(type => Boolean, { nullable: true })
  isPlaceholder?: boolean;

  @Field(type => Boolean, { nullable: true })
  isClaim?: boolean;

  @Field(type => Int, { nullable: true })
  order?: number;
}
