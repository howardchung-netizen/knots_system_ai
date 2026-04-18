import { InputType, Field } from 'type-graphql';

@InputType()
export class QuotationStatusCreateInput {
  @Field()
  code: string;

  @Field()
  nameEn: string;

  @Field()
  nameCht: string;

}
