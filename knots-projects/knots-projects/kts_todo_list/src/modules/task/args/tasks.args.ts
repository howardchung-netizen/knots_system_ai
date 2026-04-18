import {ArgsType, Field, ID, Int, registerEnumType} from 'type-graphql';
import {ConnectionArgs} from '../../common/connectionPaging';

export enum TaskView {
  PROJECT = 'PROJECT',
  PERSONAL = 'PERSONAL',
}

registerEnumType(TaskView, {
  name: 'TaskView',
});

@ArgsType()
export class TasksArgs extends ConnectionArgs {
  @Field(
    type => ID,
    {
      nullable: true,
    })
  id?: string;

  @Field(type=> String, {nullable: true})
  userId?: string;

  @Field(type=> String, {nullable: true})
  projectId: string;

  @Field(type=> Int, {nullable: true})
  realProjectId: number;
}
