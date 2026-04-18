import DataLoader from "dataloader";
import { Project } from "./project.entity";
import { In } from "typeorm";
import { User } from "../user/user.entity";
import { ProjectHashtag } from "../projectHashtag/projectHashtag.entity";

export const projectLoader = () =>
new DataLoader(async (keys: readonly string[]) => {
  const projects = await Project.findByIds([...keys]);
  const map: { [key: string]: Project } = {};
  projects.forEach(t => {
    map[t.id] = t;
  });
  return keys.map(k => map[k]);
});

export const projectByProjectIdLoader = () =>
new DataLoader(async (keys: readonly number[]) => {
  const projects = await Project.find({
    projectId: In([...keys]),
  });
  const map: { [key: number]: Project } = {};
  projects.forEach(t => {
    map[t.projectId] = t;
  });
  return keys.map(k => map[k]);
});

export const projectAssigneeLoader = () =>
  new DataLoader(async (keys: readonly string[]) => {
    const projects = await Project.findByIds([...keys], { relations: ['assignee'] });

    const map: { [key: string]: User[] } = {};
    for (const project of projects) {
      map[project.id] = await project.assignee;
    }

    return keys.map(k => map[k]);
  });

export const projectHashtagsLoader = () =>
  new DataLoader(async (keys: readonly string[]) => {
    const projects = await Project.findByIds([...keys], { relations: ['hashtags'] });

    const map: { [key: string]: ProjectHashtag[] } = {};
    for (const project of projects) {
      map[project.id] = await project.hashtags;
    }

    return keys.map(k => map[k]);
  });

