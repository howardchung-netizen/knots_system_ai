import { InputType, Field, ID, Int } from 'type-graphql';
import { GraphQLDate } from 'graphql-iso-date';
import { ChequeBookAllocateInput } from './chequeBookCreate.input';

@InputType()
export class ChequeBookUpdateInput {
  @Field(type=>ID)
  id: string;

  @Field(type => String, { nullable: true })
  chequeNo?: string;

  @Field(type => GraphQLDate, { nullable: true })
  date?: Date;

  @Field(type => String, { nullable: true })
  receiver?: string;

  @Field({ nullable: true })
  confirmTransfer?: boolean;

  @Field({ nullable: true })
  desc?: string;

  @Field({ nullable: true })
  remark?: string;

  @Field({ nullable: true })
  isCredit?: boolean;

  @Field(type => [ChequeBookAllocateInput], { nullable: true })
  allocate?: ChequeBookAllocateInput[];

  @Field({ nullable: true })
  forPettyCash?: boolean;

  @Field(type => ID, { nullable: true })
  forPettyCashStaffId?: string;
}
