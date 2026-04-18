import { InputType, Field } from 'type-graphql';

@InputType()
class  MeasureTypeSorting {
  @Field()
  id: string;

  @Field(type => Number)
  sort: number;
}

@InputType()
export class MeasureTypeSortInput {

  @Field(type => [MeasureTypeSorting], { nullable: true })
  sorting: MeasureTypeSorting[];

}
