import DataLoader from 'dataloader';
import { In } from 'typeorm';
import { Gantt, GanttAssignments, GanttCalendar, GanttCalendarIntervals, GanttDependencies, GanttTasks } from './gantt.entity';

export const ganttTasksLoader = () =>
  new DataLoader(async (keys: readonly string[]) => {
    const ganttTasks = await GanttTasks.find({ganttId: In([...keys]), isDeleted: false});
    const map: { [key: string]: GanttTasks[] } = {};
    ganttTasks.forEach(u => {
      if(!(u.ganttId in map)){
        map[u.ganttId] = [];
      }
      map[u.ganttId].push(u);
    });
    return keys.map(k => map[k]??[]);
  });

  export const ganttDependenciesLoader = () =>
  new DataLoader(async (keys: readonly string[]) => {
    const ganttDependencies = await GanttDependencies.find({ganttId: In([...keys]), isDeleted: false});
    const map: { [key: string]: GanttDependencies[] } = {};
    ganttDependencies.forEach(u => {
      if(!(u.ganttId in map)){
        map[u.ganttId] = [];
      }
      map[u.ganttId].push(u);
    });
    return keys.map(k => map[k]??[]);
  });

  export const ganttAssignmentsLoader = () =>
  new DataLoader(async (keys: readonly string[]) => {
    const ganttAssignments = await GanttAssignments.find({ganttId: In([...keys]), isDeleted: false});
    const map: { [key: string]: GanttAssignments[] } = {};
    ganttAssignments.forEach(u => {
      if(!(u.ganttId in map)){
        map[u.ganttId] = [];
      }
      map[u.ganttId].push(u);
    });
    return keys.map(k => map[k]??[]);
  });

  export const ganttTasksAssignmentsLoader = () =>
  new DataLoader(async (keys: readonly string[]) => {
    const ganttAssignments = await GanttAssignments.find({eventId: In([...keys]), isDeleted: false});
    const map: { [key: string]: GanttAssignments[] } = {};
    ganttAssignments.forEach(u => {
      if(!(u.eventId in map)){
        map[u.eventId] = [];
      }
      map[u.eventId].push(u);
    });
    return keys.map(k => map[k]??[]);
  });


export const calendarLoader = () =>
new DataLoader(async (keys: readonly string[]) => {
  const gantt = await GanttCalendar.find({id: In([...keys]), isDeleted: false});
  const map: { [key: string]: GanttCalendar } = {};
  gantt.forEach(t => {
    map[t.id] = t;
  });
  return keys.map(k => map[k]);
});

export const subCalendarLoader = () =>
new DataLoader(async (keys: readonly string[]) => {
  const calendars = await GanttCalendar.find({parentId: In([...keys]), isDeleted: false});
  const map: { [key: string]: GanttCalendar[] } = {};
  calendars.forEach(t => {
    if(!(t.id in map)){
      map[t.parentId] = [];
    }
    map[t.parentId].push(t);
  });
  return keys.map(k => map[k]??[]);
});

export const calendarIntervalsLoader = () =>
  new DataLoader(async (keys: readonly string[]) => {
    const calendarIntervals = await GanttCalendarIntervals.find({calendarId: In([...keys]), isDeleted: false});
    const map: { [key: string]: GanttCalendarIntervals[] } = {};
    calendarIntervals.forEach(u => {
      if(!(u.calendarId in map)){
        map[u.calendarId] = [];
      }
      map[u.calendarId].push(u);
    });
    return keys.map(k => map[k]??[]);
  });
