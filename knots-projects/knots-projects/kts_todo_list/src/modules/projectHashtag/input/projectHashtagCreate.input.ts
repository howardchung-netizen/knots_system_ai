import { InputType, Field, Int } from 'type-graphql';

@InputType()
export class ProjectHashtagCreateInput {
  
  @Field({ nullable: true })
  nameEn?: string;

  @Field({ nullable: true })
  nameCht?: string;

  @Field({ nullable: true })
  hex?: string;

  @Field({ nullable: true })
  preset?: boolean;

  @Field(type => Boolean, { nullable: true })
  show?: boolean;

  @Field(type => Int, { nullable: true })
  sort?: number;
}
