import { PaginatedResponse } from '../../common/paginatedResponse.type';
import { ObjectType } from 'type-graphql';
import { Gantt, GanttCalendar, GanttShare } from '../gantt.entity';

@ObjectType()
export class GanttsConnection extends PaginatedResponse(Gantt) {}

@ObjectType()
export class GanttsCalendarConnection extends PaginatedResponse(GanttCalendar) {}

@ObjectType()
export class GanttsShareConnection extends PaginatedResponse(GanttShare) {}
