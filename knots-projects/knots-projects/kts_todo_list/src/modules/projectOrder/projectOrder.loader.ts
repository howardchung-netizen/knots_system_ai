import DataLoader from "dataloader";
import { ProjectOrder } from "./projectOrder.entity";
import { In } from "typeorm";

export const projectOrderLoader = () =>
new DataLoader(async (keys: readonly string[]) => {
  const datas = await ProjectOrder.findByIds([...keys]);
  const map: { [key: string]: ProjectOrder } = {};
  datas.forEach(t => {
    map[t.id] = t;
  });
  return keys.map(k => map[k]);
});

export const projectOrderByProjectIdLoader = () =>
new DataLoader(async (keys: readonly string[]) => {
  const datas = await ProjectOrder.find({
    projectId: In([...keys]),
  });
  const map: { [key: string]: Array<ProjectOrder> } = {};
  datas.forEach(u => {
    if (!(u.projectId! in map)) {
      map[u.projectId!] = [];
    }
    map[u.projectId!].push(u);
  });

  return keys.map(k => map[k]);
});
