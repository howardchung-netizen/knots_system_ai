import { InputType, Field } from 'type-graphql';

@InputType()
class  MeasurementSorting {
  @Field()
  id: string;

  @Field(type => Number)
  sort: number;
}

@InputType()
export class MeasurementSortInput {

  @Field(type => [MeasurementSorting], { nullable: true })
  sorting: MeasurementSorting[];

}
