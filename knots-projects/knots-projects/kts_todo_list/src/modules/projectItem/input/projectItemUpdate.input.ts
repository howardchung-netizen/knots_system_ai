import { InputType, Field, ID, Int } from 'type-graphql';
import { ProjectItemPrice } from './projectItemCreate.input';

@InputType()
export class ProjectItemUpdateInput {
  @Field(type=>ID)
  id: string;

  @Field({ nullable: true })
  remark?: string;

  @Field({ nullable: true })
  upperId?: string;

  @Field({ nullable: true })
  nameEn?: string;

  @Field({ nullable: true })
  nameCht?: string;

  @Field({ nullable: true })
  descEn?: string;

  @Field({ nullable: true })
  descCht?: string;

  @Field(type => String, { nullable: true })
  unitId?: string;

  @Field(type => [ProjectItemPrice], { nullable: true })
  prices?: ProjectItemPrice[];

  @Field(type => Boolean, { nullable: true })
  delete?: boolean;

}
