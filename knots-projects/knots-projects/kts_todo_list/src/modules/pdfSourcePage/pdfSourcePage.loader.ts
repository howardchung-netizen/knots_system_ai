import DataLoader from "dataloader";
import { In } from "typeorm";
import { PdfSourcePage } from "./pdfSourcePage.entity";

export const pdfSourcePageByPdfSourceIdLoader = () =>
new DataLoader(async (keys: readonly string[]) => {
    const data = await PdfSourcePage.find({
      pdfSourceId: In([...keys]),
      deleted: false,
    });

    const map: { [key: string]: Array<PdfSourcePage> } = {};
    data.forEach(e => {
      if (!(e.pdfSourceId! in map)) {
        map[e.pdfSourceId!] = [];
      }
      map[e.pdfSourceId!].push(e);
    });

    return keys.map(k => map[k]);
});

export const pdfSourcePageLoader = () =>
new DataLoader(async (keys: readonly string[]) => {
    const data = await PdfSourcePage.find({
      id: In([...keys]),
    });

    const map: { [key: string]: PdfSourcePage } = {};
    data.forEach(e => {
      map[e.id] = e;
    });

    return keys.map(k => map[k]);
});
