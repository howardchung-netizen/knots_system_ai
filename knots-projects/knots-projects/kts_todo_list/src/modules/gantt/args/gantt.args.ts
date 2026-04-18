import {ArgsType, Field, ID} from 'type-graphql';
import {ConnectionArgs} from '../../common/connectionPaging';
import { GanttStatus } from '../gantt.entity';

@ArgsType()
export class GanttArgs extends ConnectionArgs {
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

  @Field(
    type => GanttStatus,
    {
      nullable: true,
    })
  status?: GanttStatus;

}

@ArgsType()
export class GanttCalendarArgs extends ConnectionArgs {
  @Field(
    type => ID,
    {
      nullable: true,
    })
  id?: string;

}
