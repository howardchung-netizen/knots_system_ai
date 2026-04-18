import DataLoader from "dataloader";
import { ClaimForm } from "./claimForm.entity";

export const claimFormLoader = () =>
  new DataLoader(async (keys: readonly string[]) => {
    const datas = await ClaimForm.findByIds([...keys]);

    const map: { [key: string]: ClaimForm } = {};
    datas.forEach(u => {
      map[u.id] = u;
    });

    return keys.map(k => map[k]);
  });
