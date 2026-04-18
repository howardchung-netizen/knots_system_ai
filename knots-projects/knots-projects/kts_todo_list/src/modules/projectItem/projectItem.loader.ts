import DataLoader from "dataloader";
import { ProjectItem } from "./projectItem.entity";

export const projectItemChildLoader = () =>
new DataLoader(async (keys: readonly string[]) => {
  console.log(keys);
  const projectItem = await ProjectItem.findByIds([...keys]);
  const map: { [key: string]: ProjectItem } = {};
  projectItem.forEach(t => {
    map[t.id] = t;
  });
  return keys.map(k => map[k]);
});
