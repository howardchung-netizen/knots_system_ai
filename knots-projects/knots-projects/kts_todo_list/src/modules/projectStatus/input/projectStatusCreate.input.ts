import { InputType, Field, Int } from 'type-graphql';

@InputType()
export class ProjectStatusCreateInput {
  @Field()
  code: string;

  @Field()
  nameEn: string;

  @Field()
  nameCht: string;

  @Field(type => Int, { nullable: true })
  sort?: number;

  @Field(type => Boolean, { nullable: true })
  show?: boolean;
}
