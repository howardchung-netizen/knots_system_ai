import DataLoader from "dataloader";
import { In } from "typeorm";
import { PdfSourceHistory } from "./pdfSourceHistory.entity";

export const pdfSourceHistoryByPdfSourceIdLoader = () =>
new DataLoader(async (keys: readonly string[]) => {
    const data = await PdfSourceHistory.find({
      where: { pdfSourceId: In([...keys]) },
      order: { createdAt: 'DESC' },
    });

    const map: { [key: string]: Array<PdfSourceHistory> } = {};
    data.forEach(e => {
      if (!(e.pdfSourceId in map)) {
        map[e.pdfSourceId] = [];
      }
      map[e.pdfSourceId].push(e);
    });

    return keys.map(k => map[k]);
});
