import {ArgsType, Field, ID, Int} from 'type-graphql';
import {ConnectionArgs} from '../../common/connectionPaging';
import {LocalDateResolver as LocalDate} from 'graphql-scalars';

@ArgsType()
export class ProjectArgs extends ConnectionArgs {
  @Field(type => String, {nullable: true})
  id?: string;

  @Field(type => String, {nullable: true})
  realId?: string;

  @Field(type => Int, {nullable: true})
  projectId?: number;

  @Field(type => ID, {nullable: true})
  clientId?: string;

  @Field(type => ID, {nullable: true})
  status?: number;

  @Field(type => [ID], {nullable: true})
  statusArray?: number[];

  @Field(
    type => LocalDate,
    {
      nullable: true,
    }
  )
  startDate: string;

  @Field( 
    type => LocalDate,
    {
      nullable: true,
    }
  )
  endDate: string;

  @Field(type => String, {nullable: true})
  keyword?: string;

  @Field(type => String, {nullable: true})
  order?: "DESC" | "ASC";

  @Field(type => String, {nullable: true})
  sort?: string;
}
