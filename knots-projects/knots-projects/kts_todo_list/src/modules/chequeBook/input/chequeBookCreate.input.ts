import { GraphQLDate } from 'graphql-iso-date';
import { InputType, Field, Float, ID, Int } from 'type-graphql';

@InputType()
export class ChequeBookAllocateInput {
  @Field(type => String, { nullable: true })
  project?: string;

  @Field(type => String, { nullable: true })
  projectId?: string;

  @Field(type => Float, { nullable: true })
  amount: number;

  @Field(type => String, { nullable: true })
  desc?: string;

  @Field(type => Boolean, { nullable: true })
  deleted?: boolean;
}

@InputType()
export class ChequeBookCreateInput {
  @Field(type => String)
  chequeNo: string;

  @Field(type => GraphQLDate)
  date: Date;

  @Field(type => String)
  receiver: string;

  @Field({ nullable: true })
  confirmTransfer?: boolean;
  
  @Field({ nullable: true })
  desc?: string;

  @Field({ nullable: true })
  remark?: string;

  @Field()
  isCredit: boolean;

  @Field(type => [ChequeBookAllocateInput])
  allocate: ChequeBookAllocateInput[];

  @Field({ nullable: true })
  forPettyCash?: boolean;

  @Field(type => ID, { nullable: true })
  forPettyCashStaffId?: string;
}
