import DataLoader from "dataloader";
import { MeasureType } from "./measureType.entity";

export const measureTypeLoader = () =>
new DataLoader(async (keys: readonly string[]) => {
  const datas = await MeasureType.findByIds([...keys]);
  const map: { [key: string]: MeasureType } = {};
  datas.forEach(t => {
    map[t.id] = t;
  });
  return keys.map(k => map[k]);
});
