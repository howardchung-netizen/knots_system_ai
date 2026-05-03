import {ObjectType} from 'type-graphql';
import {Connection} from '../../common/connectionPaging';
import {GanttTemplate} from '../ganttTemplate.entity';

@ObjectType()
export class GanttTemplateConnection extends Connection<GanttTemplate>(GanttTemplate) {}
