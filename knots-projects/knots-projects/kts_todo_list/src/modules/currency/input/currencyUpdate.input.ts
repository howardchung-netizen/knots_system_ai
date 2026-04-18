import { InputType, Field, ID, Int } from 'type-graphql';

@InputType()
export class CurrencyUpdateInput {
  @Field(type=>ID)
  id: string;

  @Field(type => String, { nullable: true })
  code?: string;

  @Field(type => String, { nullable: true })
  symbol?: string;

  @Field(type => String, { nullable: true })
  commonSymbol?: string;

  @Field(type => String, { nullable: true })
  nameEn?: string;

  @Field(type => String, { nullable: true })
  nameCht?: string;

  @Field(type => Int, { nullable: true })
  sort?: number;

  @Field(type => Boolean, { nullable: true })
  show?: boolean;

  @Field(type => Boolean, { nullable: true })
  deleted?: boolean;
}
