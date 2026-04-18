import { InputType, Field, Int } from 'type-graphql';

@InputType()
export class ProjectTypeCreateInput {
  @Field()
  code: string;

  @Field({ nullable: true })
  nameEn?: string;

  @Field({ nullable: true })
  nameCht?: string;

  @Field({ nullable: true })
  descEn?: string;

  @Field({ nullable: true })
  descCht?: string;

  @Field(type => Int, { nullable: true })
  sort?: number;

  @Field(type => Boolean, { nullable: true })
  show?: boolean;
}
