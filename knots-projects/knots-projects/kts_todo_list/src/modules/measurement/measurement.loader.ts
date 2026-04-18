import DataLoader from "dataloader";
import { Measurement } from "./measurement.entity";

export const measurementLoader = () =>
new DataLoader(async (keys: readonly string[]) => {
  const datas = await Measurement.findByIds([...keys]);
  const map: { [key: string]: Measurement } = {};
  datas.forEach(t => {
    map[t.id] = t;
  });
  return keys.map(k => map[k]);
});
