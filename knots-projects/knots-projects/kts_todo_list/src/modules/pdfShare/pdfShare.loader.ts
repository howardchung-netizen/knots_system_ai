import DataLoader from "dataloader";
import { In } from "typeorm";
import { PdfShare } from "./pdfShare.entity";

export const pdfShareLoader = () =>
new DataLoader(async (keys: readonly string[]) => {
    const data = await PdfShare.find({
      id: In([...keys]),
      isDeleted: false,
    });

    const map: { [key: string]: Array<PdfShare> } = {};
    data.forEach(e => {
      if (!(e.id! in map)) {
        map[e.id!] = [];
      }
      map[e.id!].push(e);
    });

    return keys.map(k => map[k]);
});
