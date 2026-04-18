import { InputType, Field, ID, Int } from 'type-graphql';
import { ProjectHashtag } from '../projectHashtag.entity';

@InputType()
export class ProjectHashtagUpdateInput implements Partial<ProjectHashtag>{
  @Field(type=>ID)
  id: string;

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

  @Field(type => Boolean, { nullable: true })
  deleted?: boolean;
}
