import { InputType, Field, ID } from 'type-graphql';

@InputType()
export class ClockInUpdateInput{
  @Field(type=>String)
  id: string;

  @Field(type => Number, { nullable: true })
  salary?: number;

  @Field(type=>String, { nullable: true })
  remark?: string;
}