import { InputType, Field, Int } from 'type-graphql';

@InputType()
export class MeasureTypeCreateInput {
  @Field({ nullable: true })
  nameEn?: string;

  @Field({ nullable: true })
  nameCht?: string;

  @Field(type => Int, { nullable: true })
  sort?: number;

  @Field(type => Boolean, { nullable: true })
  show?: boolean;
}
