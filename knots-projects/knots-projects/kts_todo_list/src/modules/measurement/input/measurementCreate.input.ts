import { InputType, Field } from 'type-graphql';

@InputType()
export class MeasurementCreateInput {
  @Field({ nullable: true })
  typeId?: string;

  @Field({ nullable: true })
  nameEn?: string;

  @Field({ nullable: true })
  nameCht?: string;

  @Field({ nullable: true })
  descEn?: string;

  @Field({ nullable: true })
  descCht?: string;

}
