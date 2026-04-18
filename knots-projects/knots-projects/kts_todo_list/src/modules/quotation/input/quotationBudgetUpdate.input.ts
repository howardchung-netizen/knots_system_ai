import { InputType, Field, ID, Float } from 'type-graphql';

@InputType()
export class QuotationBudgetData {
  @Field()
  itemId: string;

  @Field(type => Float)
  budget: number;

  @Field(type => String, {nullable: true})
  budgetRemark?: string;
}

@InputType()
export class QuotationBudgetUpdateInput {
  @Field(type=>ID)
  id: string;

  @Field({ nullable: true })
  remark?: string;

  @Field(type => [QuotationBudgetData])
  budget: QuotationBudgetData[];
}
