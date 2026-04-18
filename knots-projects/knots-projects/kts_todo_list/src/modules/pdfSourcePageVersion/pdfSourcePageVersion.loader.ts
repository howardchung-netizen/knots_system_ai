import DataLoader from "dataloader";
import { In } from "typeorm";
import { PdfSourcePageVersion } from "./pdfSourcePageVersion.entity";

export const pdfSourcePageVersionLoader = () =>
new DataLoader(async (keys: readonly string[]) => {
    const data = await PdfSourcePageVersion.find({
      id: In([...keys]),
      deleted: false,
    });

    const map: { [key: string]: PdfSourcePageVersion } = {};
    data.forEach(e => {
      if (!(e.id! in map)) {
        map[e.id!] = e;
      }
    });

    return keys.map(k => map[k]);
});

export const historyVersionLoader = () =>
  new DataLoader(async (keys: readonly string[]) => {
    const data = await PdfSourcePageVersion.find({
      pdfSourcePageId: In([...keys]),
      deleted: false,
    });

    const map: { [key: string]: Array<PdfSourcePageVersion> } = {};
    data.forEach(e => {
      if (!(e.pdfSourcePageId! in map)) {
        map[e.pdfSourcePageId!] = [];
      }
      map[e.pdfSourcePageId!].push(e);
    });

    return keys.map(k => map[k]);
  });
