import {ArgsType, Field, Int} from 'type-graphql';
import {ConnectionArgs} from '../../common/connectionPaging';

@ArgsType()
export class GanttTemplateArgs extends ConnectionArgs {
  @Field(type => String, {nullable: true})
  id?: string;

  @Field(type => String, {nullable: true})
  name?: string;

  @Field(type => String, {nullable: true})
  type?: string;

  @Field(type => Boolean, {nullable: true})
  deleted?: boolean;
}
