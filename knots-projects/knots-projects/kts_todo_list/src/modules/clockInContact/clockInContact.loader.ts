import DataLoader from "dataloader";
import { In } from "typeorm";
import { ClockInContact } from "./clockInContact.entity";

export const clockInContactLoader = () =>
new DataLoader(async (keys: readonly string[]) => {
  const clockInContacts = await ClockInContact.find({tel: In([...keys])});
  const map: { [key: string]: ClockInContact } = {};
  clockInContacts.forEach(t => {
    map[t.tel] = t;
  });
  return keys.map(k => map[k]);
});