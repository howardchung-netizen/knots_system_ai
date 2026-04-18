import { InputType, Field } from 'type-graphql';

@InputType()
export class BookKeepingCompanyCreateInput {
  @Field(type => String)
  companyName: string;

  @Field({ nullable: true })
  businessRegistrationNo?: string;

  @Field({ nullable: true })
  address?: string;

  @Field({ nullable: true })
  phone?: string;
}
