import { InputType, Field } from 'type-graphql';

@InputType()
class ProjectHashtagSorting {
  @Field()
  id: string;

  @Field(type => Number)
  sort: number;
}

@InputType()
export class ProjectHashtagSortInput {

  @Field(type => [ProjectHashtagSorting], { nullable: true })
  sorting: ProjectHashtagSorting[];

}
