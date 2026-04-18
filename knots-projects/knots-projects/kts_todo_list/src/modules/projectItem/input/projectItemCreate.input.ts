import { InputType, Field, Int, Float } from 'type-graphql';

@InputType()
export class ProjectItemPrice {

  @Field({ nullable: true })
  id?: number;

  @Field({ nullable: true })
  desc?: string;

  @Field({ nullable: true })
  desc_en?: string;

  @Field({ nullable: true })
  desc_cht?: string;

  @Field(type => Float)
  price: number;

  @Field(type => Number, { nullable: true })
  delete?: number;

  @Field(type => String, { nullable: true })
  unitId?: string;

}

@InputType()
export class ProjectItemCreateInput {
  @Field({ nullable: true })
  remark?: string;

  @Field({ nullable: true })
  upperId?: string;

  @Field()
  nameEn: string;

  @Field()
  nameCht: string;

  @Field({ nullable: true })
  descEn?: string;

  @Field({ nullable: true })
  descCht?: string;

  @Field(type => String, { nullable: true })
  unitId?: string;

  @Field(type => [ProjectItemPrice], { nullable: true })
  prices?: ProjectItemPrice[];
}
