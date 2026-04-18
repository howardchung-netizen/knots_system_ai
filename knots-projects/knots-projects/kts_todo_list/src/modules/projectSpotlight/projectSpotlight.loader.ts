import DataLoader from "dataloader";
import { ProjectSpotlight } from "./projectSpotlight.entity";

export const projectSpotlightsLoader = () =>
new DataLoader(async (keys: readonly string[]) => {
  const datas = await ProjectSpotlight.findByIds([...keys]);
  const map: { [key: string]: ProjectSpotlight } = {};
  datas.forEach(t => {
    map[t.id] = t;
  });
  return keys.map(k => map[k]);
});
