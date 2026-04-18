import {ArgsType, Field, ID} from 'type-graphql';
import {ConnectionArgs} from '../../common/connectionPaging';
import { GanttStatus } from '../gantt.entity';

@ArgsType()
export class GanttShareArgs extends ConnectionArgs {
  @Field(
    type => ID,
    {
      nullable: true,
    })
  id?: string;

  @Field(
    type => String,
    {
      nullable: true,
    })
  projectId?: string;

}
