import { InputType, Field, ID, Int } from 'type-graphql';
import { ProjectType } from '../projectType.entity';

@InputType()
export class ProjectTypeUpdateInput implements Partial<ProjectType>{
  @Field(type=>ID)
  id: string;

  @Field({ nullable: true })
  code?: string;

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

  @Field(type => Boolean, { nullable: true })
  deleted?: boolean;
}
