import { Field, Float, ObjectType } from 'type-graphql';

@ObjectType()
export class OverheadSummaryMonthlyPayload {
  @Field()
  month: string;

  @Field(type => Float)
  totalAmount: number;
}

@ObjectType()
export class OverheadSummaryCategoryPayload {
  @Field()
  categoryName: string;

  @Field(type => [OverheadSummaryMonthlyPayload])
  monthlyData: OverheadSummaryMonthlyPayload[];
  
  @Field(type => Float)
  categoryTotal: number;
}
