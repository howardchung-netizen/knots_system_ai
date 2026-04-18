import DataLoader from "dataloader";
import { In } from "typeorm";
import { PdfSourcePageHistory } from "./pdfSourcePageHistory.entity";

export const pdfSourcePageHistoryByPdfSourcePageIdLoader = () =>
new DataLoader(async (keys: readonly string[]) => {
    const data = await PdfSourcePageHistory.find({
      pdfSourcePageId: In([...keys]),
    });

    const map: { [key: string]: Array<PdfSourcePageHistory> } = {};
    data.forEach(e => {
      if (!(e.pdfSourcePageId in map)) {
        map[e.pdfSourcePageId] = [];
      }
      map[e.pdfSourcePageId].push(e);
    });

    return keys.map(k => map[k]);
});
