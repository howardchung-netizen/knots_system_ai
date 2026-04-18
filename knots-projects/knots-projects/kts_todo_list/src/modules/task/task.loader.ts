import DataLoader from 'dataloader';
import { In } from 'typeorm';
import { Task, TaskAssignedContact, TaskAssignedStaff, TaskLog, TaskAssignedProject } from './task.entity';

export const taskLoader = () =>
new DataLoader(async (keys: readonly string[]) => {
  const task = await Task.findByIds([...keys]);
  const map: { [key: string]: Task } = {};
  task.forEach(t => {
    map[t.id] = t;
  });
  return keys.map(k => map[k]);
});

export const subTaskLoader = () =>
new DataLoader(async (keys: readonly string[]) => {
  const tasks = await Task.find({parentTaskId: In([...keys]), isDeleted: false, });
  const map: { [key: string]: Task[] } = {};
  tasks.forEach(t => {
    if(!(t.parentTaskId in map)){
      map[t.parentTaskId] = [];
    }
    map[t.parentTaskId].push(t);
  });
  return keys.map(k => map[k]??[]);
});

export const assignedStaffLoader = () =>
  new DataLoader(async (keys: readonly string[]) => {
    const assignedStaff = await TaskAssignedStaff.find({taskId: In([...keys])});
    const map: { [key: string]: TaskAssignedStaff[] } = {};
    assignedStaff.forEach(u => {
      if(!(u.taskId in map)){
        map[u.taskId] = [];
      }
      map[u.taskId].push(u);
    });
    return keys.map(k => map[k]??[]);
  });

  export const assignedContactLoader = () =>
  new DataLoader(async (keys: readonly string[]) => {
    const assignedContact = await TaskAssignedContact.find({taskId: In([...keys])});
    const map: { [key: string]: TaskAssignedContact[] } = {};
    assignedContact.forEach(u => {
      if(!(u.taskId in map)){
        map[u.taskId] = [];
      }
      map[u.taskId].push(u);
    });
    return keys.map(k => map[k]??[]);
  });

  export const assignedProjectsLoader = () =>
  new DataLoader(async (keys: readonly string[]) => {
    const assignedProjects = await TaskAssignedProject.find({taskId: In([...keys])});
    const map: { [key: string]: TaskAssignedProject[] } = {};
    assignedProjects.forEach((u:TaskAssignedProject) => {
      if(!(u.taskId in map)){
        map[u.taskId] = [];
      }
      map[u.taskId].push(u);
    });
    return keys.map(k => map[k]??[]);
  });

  

export const taskLogsbyTaskIdLoader = () =>
  new DataLoader(async (keys: readonly string[]) => {
    const taskLog = await TaskLog.find({taskId: In([...keys])});
    const map: { [key: string]: TaskLog[] } = {};
    taskLog.forEach(u => {
      if(!(u.taskId in map)){
        map[u.taskId] = [];
      }
      map[u.taskId].push(u);
    });
    return keys.map(k => map[k]??[]);
  });

  export const taskAssignedProjectLoader = () =>
  new DataLoader(async (keys: readonly string[]) => {
    const map: { [key: string]: TaskAssignedProject[] } = {};
    
    // const taskIds = (await TaskAssignedProject.find({projectId: In([...keys])}))?.map(async(taskAssignedProject: TaskAssignedProject) => {

    //   const task = await Task.find({id: In([...taskAssignedProject.taskId])});;
    //   task.forEach(u => {
    //     if(!(u.id in map)){
    //       map[taskAssignedProject.taskId] = [];
    //     }
    //     map[taskAssignedProject.taskId].push(u);
    //   });
    // });
   
    const taskIds = await TaskAssignedProject.find({projectId: In([...keys])})

    taskIds.forEach(u => {
      if(!(u.projectId in map)){
        map[u.projectId] = [];
      }
      map[u.projectId].push(u);
    });
    return keys.map(k => map[k]??[]);
  });
