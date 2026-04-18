import { InputType, Field, ID } from 'type-graphql';

@InputType()
export class BookKeepingCompanyUpdateInput {
  @Field(type=>ID)
  id: string;

  @Field({ nullable: true })
  companyName?: string;

  @Field({ nullable: true })
  businessRegistrationNo?: string;

  @Field({ nullable: true })
  address?: string;

  @Field({ nullable: true })
  phone?: string;
}
