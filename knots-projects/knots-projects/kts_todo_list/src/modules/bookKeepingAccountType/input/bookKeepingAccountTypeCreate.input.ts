import { InputType, Field, Int } from 'type-graphql';

@InputType()
export class BookKeepingAccountTypeCreateInput {
  @Field(type => String)
  name: string;

  @Field(type => Int, { nullable: true })
  order?: number;

  @Field({ nullable: true })
  increaseDebit?: boolean;
}
