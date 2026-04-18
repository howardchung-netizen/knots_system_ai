import { InputType, Field } from 'type-graphql';

@InputType()
class SortingInput {
  @Field()
  id: string;

  @Field(type => Number)
  sort: number;
}

@InputType()
export class ProjectItemSortInput {

  @Field(type => [SortingInput], { nullable: true })
  sort: [SortingInput];

}
