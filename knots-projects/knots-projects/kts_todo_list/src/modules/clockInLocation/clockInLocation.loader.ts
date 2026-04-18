import DataLoader from "dataloader";
import { ClockInLocation } from "./clockInLocation.entity";

export const clockInLocationLoader = () =>
new DataLoader(async (keys: readonly string[]) => {
  const clockInLocations = await ClockInLocation.findByIds([...keys]);
  const map: { [key: string]: ClockInLocation } = {};
  clockInLocations.forEach(t => {
    map[t.id] = t;
  });
  return keys.map(k => map[k]);
});