import { InputType, Field, ID, Int } from 'type-graphql';

@InputType()
export class BookKeepingAccountCreateInput {
  @Field(type => ID, {nullable: true})
  companyId?: string;

  @Field(type => ID)
  accountTypeId: string;

  @Field(type => ID, { nullable: true })
  parentAccountId?: string;

  @Field(type => String)
  name: string;

  @Field(type => Boolean, { nullable: true })
  isPlaceholder?: boolean;

  @Field(type => Boolean, { nullable: true })
  isClaim?: boolean;

  @Field(type => Int, { nullable: true })
  order?: number;
}
