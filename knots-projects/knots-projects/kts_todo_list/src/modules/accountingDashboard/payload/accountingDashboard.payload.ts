import { Field, Float, ObjectType } from 'type-graphql';

@ObjectType()
export class AccountingDashboardPayload {
  @Field(type => Float)
  totalArBalance: number;

  @Field(type => Float)
  totalApBalance: number;

  @Field(type => Float)
  bankBalance: number;

  @Field(type => Float)
  totalDebtGap: number;
}
