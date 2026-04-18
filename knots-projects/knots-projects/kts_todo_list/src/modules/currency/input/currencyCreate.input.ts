import { InputType, Field, Int } from 'type-graphql';

@InputType()
export class CurrencyCreateInput {
  @Field(type => String)
  code: string;

  @Field(type => String)
  symbol: string;

  @Field(type => String)
  commonSymbol: string;

  @Field(type => String)
  nameEn: string;

  @Field(type => String)
  nameCht: string;

  @Field(type => Int, { nullable: true })
  sort?: number;

  @Field(type => Boolean, { nullable: true })
  show?: boolean;
}
