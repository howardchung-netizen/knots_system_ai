import { InputType, Field, GraphQLISODateTime, ID } from 'type-graphql';

@InputType()
export class ClockInCreateInput {

  @Field(type => String)
  tel: string;

  @Field(type => GraphQLISODateTime)
  qrCodeCreatedAt: Date;

  @Field(type => GraphQLISODateTime)
  clockedInAt: Date;

  @Field(type => ID, { nullable: true })
  locationId?: string;

  @Field({ nullable: true })
  nonce?: string;

  @Field(type => String, { nullable: true })
  address?: string;

  @Field(type => ID, { nullable: true })
  staffId?: string;

  @Field(type => ID, { nullable: true })
  projectId?: string;

  @Field(type => Number, { nullable: true })
  salary?: number;

}

@InputType()
export class ClockInCreateCode {
  @Field(type => String)
  tel: string;

  @Field(type => String)
  code: string;
}