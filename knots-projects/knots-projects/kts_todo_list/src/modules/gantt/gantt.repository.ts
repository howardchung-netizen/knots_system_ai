import { EntityRepository } from 'typeorm';
import { PaginatingRepository } from '../common/paginating.repository';
import { Gantt, GanttAssignments, GanttCalendar, GanttCalendarIntervals, GanttColumnConfig, GanttDependencies, GanttLog, GanttShare, GanttTasks } from './gantt.entity';

// @Service()
@EntityRepository(Gantt)
export class GanttRepository extends PaginatingRepository<Gantt> {}

@EntityRepository(GanttCalendar)
export class GanttCalendarRepository extends PaginatingRepository<GanttCalendar> {}

@EntityRepository(GanttCalendarIntervals)
export class GanttCalendarIntervalsRepository extends PaginatingRepository<GanttCalendarIntervals> {}

@EntityRepository(GanttTasks)
export class GanttTasksRepository extends PaginatingRepository<GanttTasks> {}

@EntityRepository(GanttDependencies)
export class GanttDependenciesRepository extends PaginatingRepository<GanttDependencies> {}

@EntityRepository(GanttAssignments)
export class GanttAssignmentsRepository extends PaginatingRepository<GanttAssignments> {}

@EntityRepository(GanttLog)
export class GanttLogRepository extends PaginatingRepository<GanttLog> {}

@EntityRepository(GanttShare)
export class GanttShareRepository extends PaginatingRepository<GanttShare> {}

@EntityRepository(GanttColumnConfig)
export class GanttColumnConfigRepository extends PaginatingRepository<GanttColumnConfig> {}
