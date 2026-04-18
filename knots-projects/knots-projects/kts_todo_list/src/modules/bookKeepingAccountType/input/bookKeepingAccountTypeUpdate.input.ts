import { InputType, Field, ID, Int } from 'type-graphql';

@InputType()
export class BookKeepingAccountTypeUpdateInput {
  @Field(type=>ID)
  id: string;

  @Field({ nullable: true })
  name?: string;

  @Field(type => Int, { nullable: true })
  order?: number;

  @Field({ nullable: true })
  increaseDebit?: boolean;
}
