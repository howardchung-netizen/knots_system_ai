import DataLoader from "dataloader";
import { In } from "typeorm";
import { PdfUpload } from "./pdfUpload.entity";

export const pdfUploadLoader = () =>
new DataLoader(async (keys: readonly string[]) => {
    const data = await PdfUpload.find({
      id: In([...keys]),
      deleted: false,
    });

    const map: { [key: string]: Array<PdfUpload> } = {};
    data.forEach(e => {
      if (!(e.id! in map)) {
        map[e.id!] = [];
      }
      map[e.id!].push(e);
    });

    return keys.map(k => map[k]);
});

export const pdfUploadByPdfIdLoader = () =>
new DataLoader(async (keys: readonly string[]) => {
    const data = await PdfUpload.find({
      pdfId: In([...keys]),
      deleted: false,
    });

    const map: { [key: string]: Array<PdfUpload> } = {};
    data.forEach(e => {
      if (!(e.pdfId! in map)) {
        map[e.pdfId!] = [];
      }
      map[e.pdfId!].push(e);
    });

    return keys.map(k => map[k]);
});
