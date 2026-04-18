import { InputType, Field } from 'type-graphql';

@InputType()
class  ProjectTypeSorting {
  @Field()
  id: string;

  @Field(type => Number)
  sort: number;
}

@InputType()
export class ProjectTypeSortInput {

  @Field(type => [ProjectTypeSorting], { nullable: true })
  sorting: ProjectTypeSorting[];

}
