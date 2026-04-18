import DataLoader from "dataloader";
import { In } from "typeorm";
import { PdfSource } from "./pdfSource.entity";

export const pdfSourceByPdfIdLoader = () =>
new DataLoader(async (keys: readonly string[]) => {
    const data = await PdfSource.find({
      pdfId: In([...keys]),
      deleted: false,
    });

    const map: { [key: string]: Array<PdfSource> } = {};
    data.forEach(e => {
      if (!(e.pdfId! in map)) {
        map[e.pdfId!] = [];
      }
      map[e.pdfId!].push(e);
    });

    return keys.map(k => map[k]);
});

export const pdfSourceLoader = () =>
new DataLoader(async (keys: readonly string[]) => {
    const data = await PdfSource.find({
      id: In([...keys]),
      deleted: false,
    });

    const map: { [key: string]: PdfSource } = {};
    data.forEach(e => {
      map[e.id] = (e);
    });

    return keys.map(k => map[k]);
});
