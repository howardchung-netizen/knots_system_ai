import {ObjectType, Field} from 'type-graphql';
import {UserError} from '../../common/userError';
import {GanttTemplate} from '../ganttTemplate.entity';

@ObjectType()
export class GanttTemplatePayload {
  @Field(type => [UserError])
  userErrors: UserError[];

  @Field(type => GanttTemplate, {nullable: true})
  ganttTemplate?: GanttTemplate;
}
