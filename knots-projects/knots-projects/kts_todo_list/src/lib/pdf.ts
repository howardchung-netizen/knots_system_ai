import { Readable } from 'stream';
//import PDFDocument from 'pdfkit-next';
import { logger } from './logger';
import { getRealFilePath, uploadToLocal } from './storage';
import moment from 'moment-timezone';
import path from 'path';
import {PDFDocument, PDFPage, StandardFonts, rgb} from 'pdf-lib';
import fs from 'fs';
import pdf2img from'pdf-img-convert';
import sharp from 'sharp';
import { PdfMergeData } from '../modules/pdfSource/pdfSource.service';
import { comparePngs } from './compare';
import { fromBuffer } from "pdf2pic";
import { ToBase64Response } from 'pdf2pic/dist/types/toBase64Response';

const pdfLayout = {
  color: {
    default: [56, 56, 56] as [number, number, number],
    gray: [132, 144, 159] as [number, number, number],
    lightGray: [244, 244, 244] as [number, number, number],
  },
  margin: 5,
  fontSize: 10,
  lineWidth: 1,
  pageMargin: {
    top: 15,
    bottom: 15,
    left: 30,
    right: 30,
  },
  pageSize: {
    width: (595.28),
    height: (841.89),
  },
  listWidth: 15,
};

interface imagePdfData {
  files: string[],
  folder: string,
  filename: string,
}

interface filePaths {
  filePath: string,
  subFilePaths: string[],
}

// export async function imagesToPDF(data: imagePdfData): Promise<filePaths> {
//   try {
//     const buffer = Buffer.from(data.files[0], 'base64');
//     const { width, height } = await sharp(buffer).metadata();
//     if (!width || !height) throw new Error('error read image size from base64 images');
//     const imagePdf = new PDFDocument({
//       size: [width, height],
//       autoFirstPage: false,
//       bufferPages: true,
//     });

//     await Promise.all(data.files.map(async (e) => {
//       imagePdf.addPage({
//         margins: { left: 0, top: 0, right: 0, bottom: 0 },
//       }).image('data:image/png;base64,' + e, { fit: [imagePdf.page.width, imagePdf.page.height], align: 'center', valign: 'center' });
//     }));

//     imagePdf.end();

//     const { path: filePath } = await uploadToLocal({
//       filename: `${data.filename}.pdf`,
//       mimetype: 'application/pdf',
//       encoding: '7bit',
//       createReadStream: () => new Readable().wrap(imagePdf),
//     }, data.folder);

//     return {
//       filePath: filePath,
//       subFilePaths: [],
//     };
//   } catch (error: any) {
//     logger.error(error);
//     throw new Error(`Cannot create PDF for image pdf, error: ${error.message}`);
//   }
// }

export async function newPDFByPageNumbers(data: { id: string, filePath: string, pages: number[], folder: string, }): Promise<string | null> {
  try {
    const realFilePath = await getRealFilePath(data.filePath);
    const docmentAsBytes = await fs.promises.readFile(realFilePath);
    // Load your PDFDocument
    const pdfDoc = await PDFDocument.load(docmentAsBytes);

    const saveFilename = `${data.id}.pdf`;
    const newDocument = await PDFDocument.create();
    // copy the page at current index
    const copiedPages = await newDocument.copyPages(pdfDoc, data.pages);
    for (let k = 0; k < copiedPages.length; k++) {
      newDocument.addPage(copiedPages[k]);
    }
    const pdfBytes = await newDocument.save();

    let folder = data.folder;
    const now = moment();
    const timestampedFileName = `${now.format('x')}-${encodeURIComponent(saveFilename)}`;

    let filePath = path.join(__dirname, '..', '..', 'storage');
    const dataFilePath = path.join('/storage', folder, timestampedFileName);
    if (!fs.existsSync(filePath)) fs.mkdirSync(filePath);
    if (!folder) folder = 'public';
    filePath = path.join(filePath, folder);
    if (!fs.existsSync(filePath)) fs.mkdirSync(filePath);

    filePath = path.join(filePath, now.format('YYYY'));
    if (!fs.existsSync(filePath)) fs.mkdirSync(filePath);

    filePath = path.join(filePath, now.format('MMDD'));
    if (!fs.existsSync(filePath)) fs.mkdirSync(filePath);

    filePath = path.join(filePath, timestampedFileName);

    await fs.promises.writeFile(filePath, pdfBytes);

    return dataFilePath;
  } catch (error: any) {
    logger.error(error.message);
    return null;
  }
}

export const getPdfLib = async (filePath: string): Promise<PDFDocument | null> =>  {
  try {
    const realFilePath = await getRealFilePath(filePath);
    const docmentAsBytes = await fs.promises.readFile(realFilePath);
    // Load your PDFDocument
    return await PDFDocument.load(docmentAsBytes)
  } catch (error: any) {
    logger.error(error.message);
    return null;
  }
}

export const getPdfLibPages = async (filePath: string): Promise<{doc: PDFDocument, pages: PDFPage[]}> =>  {
  try {
    const newDocument = await PDFDocument.create();
    const realFilePath = await getRealFilePath(filePath);
    const docmentAsBytes = await fs.promises.readFile(realFilePath);
    const pdfDoc = await PDFDocument.load(docmentAsBytes);
    let pageNum = [];
    for(let i = 0; i < pdfDoc.getPages().length; i++) {
      pageNum.push(i);
    }
    const copiedPages = await newDocument.copyPages(pdfDoc, pageNum)
    return {
      doc: pdfDoc,
      pages: copiedPages,
    }
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export const savePdfLibByPages = async (data: {
  pdf: PDFDocument,
  pages: number[],
  folder: string,
  saveFileName: string,
  version?: string,
}): Promise<string | null> =>  {
  try {
    const newDocument = await PDFDocument.create();
    // copy the page at current index
    const copiedPages = await newDocument.copyPages(data.pdf, data.pages);
    for (let k = 0; k < copiedPages.length; k++) {
      const page = newDocument.addPage(copiedPages[k]);
      if (data.version) {
        const timesRomanFont = await newDocument.embedFont(StandardFonts.TimesRoman);
        const { width } = page.getSize();
        const fontSize = 12;
        const text = `V(${data.version})`;
        const textWidth = timesRomanFont.widthOfTextAtSize(text, fontSize);
        page.drawText(text, {
          x: width - textWidth - 10,
          y: 10,
          size: fontSize,
          font: timesRomanFont,
          color: rgb(0, 0.53, 0.71),
        });
      }
    }
    const pdfBytes = await newDocument.save()

    let folder = data.folder;
    const now = moment();
    const timestampedFileName = `${now.format('x')}-${encodeURIComponent(data.saveFileName)}`;

    let filePath = path.join(__dirname, '..', '..', 'storage');
    const dataFilePath = path.join('/storage', folder, timestampedFileName);
    if (!fs.existsSync(filePath)) fs.mkdirSync(filePath);
    if (!folder) folder = 'public';
    filePath = path.join(filePath, folder);
    if (!fs.existsSync(filePath)) fs.mkdirSync(filePath);

    filePath = path.join(filePath, now.format('YYYY'));
    if (!fs.existsSync(filePath)) fs.mkdirSync(filePath);

    filePath = path.join(filePath, now.format('MMDD'));
    if (!fs.existsSync(filePath)) fs.mkdirSync(filePath);

    filePath = path.join(filePath, timestampedFileName);

    await fs.promises.writeFile(filePath, pdfBytes);

    return dataFilePath;
  } catch (error: any) {
    logger.error(error.message);
    return null;
  }
}

export const savePdfPages = async (data: { pdf: PDFDocument, pages: number[], folder: string, saveFileName: string }): Promise<string> =>  {
  try {
    const newDocument = await PDFDocument.create();
    // copy the page at current index
    const copiedPages = await newDocument.copyPages(data.pdf, data.pages);
    for (let k = 0; k < copiedPages.length; k++) {
      newDocument.addPage(copiedPages[k]);
    }
    const pdfBytes = await newDocument.save()

    let folder = data.folder;
    const now = moment();
    const timestampedFileName = `${now.format('x')}-${encodeURIComponent(data.saveFileName)}`;

    let filePath = path.join(__dirname, '..', '..', 'storage');
    const dataFilePath = path.join('/storage', folder, timestampedFileName);
    if (!fs.existsSync(filePath)) fs.mkdirSync(filePath);
    if (!folder) folder = 'public';
    filePath = path.join(filePath, folder);
    if (!fs.existsSync(filePath)) fs.mkdirSync(filePath);

    filePath = path.join(filePath, now.format('YYYY'));
    if (!fs.existsSync(filePath)) fs.mkdirSync(filePath);

    filePath = path.join(filePath, now.format('MMDD'));
    if (!fs.existsSync(filePath)) fs.mkdirSync(filePath);

    filePath = path.join(filePath, timestampedFileName);

    await fs.promises.writeFile(filePath, pdfBytes);

    return dataFilePath;
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export const savePdfPagesToBuffer = async (data: { pdf: PDFDocument, pages?: number[] }): Promise<PdfBufferOutput[]> =>  {
  try {
    let pdfs: PdfBufferOutput[] = [];
    let currentPages = [];
    if (!data.pages) {
      const pages = data.pdf.getPages();
      currentPages = Array.from({ length: pages.length }, (_, index) => index);
    } else {
      currentPages = [...data.pages];
    }
    // copy the page at current index
    for (let k = 0; k < currentPages.length; k++) {
      const newDocument = await PDFDocument.create();
      const copiedPages = await newDocument.copyPages(data.pdf, [currentPages[k]]);
      const page = newDocument.addPage(copiedPages[0]);
      const { width, height } = page.getSize();
      const pdfBytes = await newDocument.save();
      pdfs.push({
        buffer: Buffer.from(pdfBytes),
        width: width,
        height: height,
      });
    }

    return pdfs;
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export interface PdfBufferOutput {
  buffer: Buffer;
  width: number;
  height: number;
}

export const savePdfPagesMerge = async (data: { sourcePdf: PDFDocument, targetPdf: PDFDocument, pdfPages: PdfMergeData[], folder: string, saveFileName: string, version?: string, }): Promise<string> =>  {
  try {
    const newDocument = await PDFDocument.create();
    for (const e of data.pdfPages) {
      const [page] = await newDocument.copyPages(e.type === 'source' ? data.sourcePdf : data.targetPdf, [e.page - 1]);
      const newPage = newDocument.addPage(page);
      if (data.version) {
        const timesRomanFont = await newDocument.embedFont(StandardFonts.TimesRoman);
        const { width } = newPage.getSize();
        const fontSize = 12;
        const text = `V(${data.version})`;
        const textWidth = timesRomanFont.widthOfTextAtSize(text, fontSize);
        newPage.drawText(text, {
          x: width - textWidth - 10,
          y: 10,
          size: fontSize,
          font: timesRomanFont,
          color: rgb(0, 0.53, 0.71),
        });
      }
    }
    const pdfBytes = await newDocument.save()

    let folder = data.folder;
    const now = moment();
    const timestampedFileName = `${now.format('x')}-${encodeURIComponent(data.saveFileName)}`;

    let filePath = path.join(__dirname, '..', '..', 'storage');
    const dataFilePath = path.join('/storage', folder, timestampedFileName);
    if (!fs.existsSync(filePath)) fs.mkdirSync(filePath);
    if (!folder) folder = 'public';
    filePath = path.join(filePath, folder);
    if (!fs.existsSync(filePath)) fs.mkdirSync(filePath);

    filePath = path.join(filePath, now.format('YYYY'));
    if (!fs.existsSync(filePath)) fs.mkdirSync(filePath);

    filePath = path.join(filePath, now.format('MMDD'));
    if (!fs.existsSync(filePath)) fs.mkdirSync(filePath);

    filePath = path.join(filePath, timestampedFileName);

    await fs.promises.writeFile(filePath, pdfBytes);

    return dataFilePath;
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export const savePdfPagesMergeWithCompare = async (
  data: {
    sourcePdf?: PDFDocument,
    targetPdf: PDFDocument,
    pdfPages: PdfMergeData[],
    folder: string,
    saveFileName: string,
    sourcePngs: { [index: string]: Uint8Array },
    uploadPngs: { [index: string]: Uint8Array },
    version?: string,
  }): Promise<string> =>  {
  try {
    const newDocument = await PDFDocument.create();
    for (const e of data.pdfPages) {
      if (!e.merge && data.sourcePdf) {
        const [page] = await newDocument.copyPages(e.type === 'source' ? data.sourcePdf : data.targetPdf, [e.page - 1]);
        const newPage = newDocument.addPage(page);
        if (data.version) {
          const timesRomanFont = await newDocument.embedFont(StandardFonts.TimesRoman);
          const { width } = newPage.getSize();
          const fontSize = 12;
          const text = `V(${data.version})`;
          const textWidth = timesRomanFont.widthOfTextAtSize(text, fontSize);
          newPage.drawText(text, {
            x: width - textWidth - 10,
            y: 10,
            size: fontSize,
            font: timesRomanFont,
            color: rgb(0, 0.53, 0.71),
          });
        }
      } else {
        const { status, savefilePath, error } = await comparePngs(
          '',
          '',
          'diff.png',
          'pdfCompare',
          undefined,
          false,
          data.sourcePngs[e.originalPage!],
          data.uploadPngs[e.page],
        );
        if (error) throw new Error(error);
        if (status === 'failed' && !error && data.sourcePdf) {
          const [page] = await newDocument.copyPages(data.sourcePdf, [e.page - 1]);
          const newPage = newDocument.addPage(page);
          if (data.version) {
            const timesRomanFont = await newDocument.embedFont(StandardFonts.TimesRoman);
            const { width } = newPage.getSize();
            const fontSize = 12;
            const text = `V(${data.version})`;
            const textWidth = timesRomanFont.widthOfTextAtSize(text, fontSize);
            newPage.drawText(text, {
              x: width - textWidth - 10,
              y: 10,
              size: fontSize,
              font: timesRomanFont,
              color: rgb(0, 0.53, 0.71),
            });
          }
        } else {
          const image = await newDocument.embedPng(fs.readFileSync(savefilePath));
          const { width, height } = image;
          const page = newDocument.addPage([width, height]);
          page.drawImage(image, {
            x: 0,
            y: 0,
            width,
            height,
          });
          if (data.version) {
            const timesRomanFont = await newDocument.embedFont(StandardFonts.TimesRoman);
            const fontSize = 12;
            const text = `V(${data.version})`;
            const textWidth = timesRomanFont.widthOfTextAtSize(text, fontSize);
            page.drawText(text, {
              x: width - textWidth - 10,
              y: 10,
              size: fontSize,
              font: timesRomanFont,
              color: rgb(0, 0.53, 0.71),
            });
          }
        }
      }
    }
    const pdfBytes = await newDocument.save()

    let folder = data.folder;
    const now = moment();
    const timestampedFileName = `${now.format('x')}-${encodeURIComponent(data.saveFileName)}`;

    let filePath = path.join(__dirname, '..', '..', 'storage');
    const dataFilePath = path.join('/storage', folder, timestampedFileName);
    if (!fs.existsSync(filePath)) fs.mkdirSync(filePath);
    if (!folder) folder = 'public';
    filePath = path.join(filePath, folder);
    if (!fs.existsSync(filePath)) fs.mkdirSync(filePath);

    filePath = path.join(filePath, now.format('YYYY'));
    if (!fs.existsSync(filePath)) fs.mkdirSync(filePath);

    filePath = path.join(filePath, now.format('MMDD'));
    if (!fs.existsSync(filePath)) fs.mkdirSync(filePath);

    filePath = path.join(filePath, timestampedFileName);

    await fs.promises.writeFile(filePath, pdfBytes);

    return dataFilePath;
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function pdfToPng(filePath: string): Promise<any> {
  try {
    const config = {
      width: undefined,
      height: undefined,
      page_numbers: undefined,
      base64: false,
    }
    const pdfArray = await pdf2img.convert(await getRealFilePath(filePath), config);
    return pdfArray;
  } catch (error: any) {
    throw new Error(error.message);
  }
}

// export async function convertPdfToImages(pdfBuffers: PdfBufferOutput[]): Promise<Uint8Array[]> {
//   try {
//     const config = {
//       width: undefined,
//       height: undefined,
//       page_numbers: undefined,
//       base64: false,
//     }
//     let convertedImages: Uint8Array[] = [];

//     for (let i = 0; i < pdfBuffers.length; i++) {
//       const pdfBuffer = pdfBuffers[i].buffer;

//       const uint8Array: string | Uint8Array = (await pdf2img.convert(pdfBuffer, config))?.[0];
//       if (typeof uint8Array === 'string') throw new Error('result data format error');
//       convertedImages.push(uint8Array);
//     }

//     return convertedImages;
//   } catch (error: any) {
//     logger.error(error);
//     return [];
//   }
// }

export async function convertPdfToImages(pdfBuffers: PdfBufferOutput[]): Promise<Uint8Array[]> {
  try {
    let convertedImages: Uint8Array[] = [];

    // Iterate over each PDF buffer
    for (let i = 0; i < pdfBuffers.length; i++) {
      const pdfBuffer = pdfBuffers[i].buffer;

      // Create a new instance of pdf2pic with page-specific options
      const pdf2pic = fromBuffer(pdfBuffer, {
        density: 300,   // Use page-specific density or default to 300 DPI
        format:'png',
        //width: pdfBuffers[i].width || 800,       // Use page-specific width or default to 800 pixels
        //height: pdfBuffers[i].height || 1200     // Use page-specific height or default to 1200 pixels
      });

      // Convert the PDF buffer to images
      const imagesBase64: ToBase64Response = await pdf2pic(1, true);
      const buffer = Buffer.from(imagesBase64.base64!, 'base64');
      const uint8Array = new Uint8Array(buffer);
      convertedImages.push(uint8Array);
    }

    return convertedImages;
  } catch (error: any) {
    logger.error(error);
    return [];
  }
}
