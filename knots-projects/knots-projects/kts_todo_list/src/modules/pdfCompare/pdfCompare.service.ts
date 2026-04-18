import { fromGlobalId } from 'graphql-relay';
import { Service } from 'typedi';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { PdfCompareRepository } from './pdfCompare.repository';
import { LoggedInUser } from '../shared/middleware/currentUser';
import {Request} from 'express';
import { logger } from '../../lib/logger';
import { PdfCompareCreateInput } from './input/pdfCompareCreate.input';
import { PdfComparePayload } from './payload/pdfCompare.payload';
import { PdfUploadRepository } from '../pdfUpload/pdfUpload.repository';
import { PdfCompare } from './pdfCompare.entity';;
import { PdfSourcePageVersionRepository } from '../pdfSourcePageVersion/pdfSourcePageVersion.repository';
import { comparePngs } from '../../lib/compare';
import { convertPdfToImages, getPdfLib, pdfToPng, savePdfPagesToBuffer } from '../../lib/pdf';
import { PdfCompareUploadInput } from './input/pdfCompareCompare.input';
import { PdfSourceRepository } from '../pdfSource/pdfSource.repository';
import { PdfCompareUploadPayload } from './payload/pdfCompareUpload.payload';
import path from 'path';
import fs from 'fs';
@Service()
export class PdfCompareService {
  constructor(
    @InjectRepository()
    private readonly pdfUploadRepository: PdfUploadRepository,
    @InjectRepository()
    private readonly pdfCompareRepository: PdfCompareRepository,
    @InjectRepository()
    private readonly pdfSourcePageVersionRepository: PdfSourcePageVersionRepository,
    @InjectRepository()
    private readonly pdfSourceRepository: PdfSourceRepository,
  ) {
  }

  async pdfCompare(
    data: PdfCompareCreateInput,
    user: LoggedInUser,
    req: Request,
  ): Promise<PdfComparePayload> {
    try {
      const sourcePageVersion = await this.pdfSourcePageVersionRepository.findOne({ id: fromGlobalId(data.sourcePageVersionId).id });
      if (!sourcePageVersion || !sourcePageVersion?.filePath) throw new Error('No pdf source page version record');
      const targetPageVersion = await this.pdfSourcePageVersionRepository.findOne({ id: fromGlobalId(data.targetPageVersionId).id });
      if (!targetPageVersion || !targetPageVersion?.filePath) throw new Error('No pdf target page version record');

      let pdfCompare: PdfCompare | undefined;
      pdfCompare = await this.pdfCompareRepository.findOne({
        sourcePageVersionId: sourcePageVersion.id,
        targetPageVersionId: targetPageVersion.id,
      });
      if (!pdfCompare) {
        //const result = { details: [] };
        // const sourceFile = await newPDFByPageNumbers({ id: `${sourceVersion.id}_${data.sourcePage}`, filePath: sourceVersion.filePath, pages: [data.sourcePage - 1], folder: 'pdfVersionPage'});
        // const targetFile = await newPDFByPageNumbers({ id: `${targetVersion.id}_${data.targetPage}`, filePath: targetVersion.filePath, pages: [data.targetPage - 1], folder: 'pdfVersionPage'});
        // if (!sourceFile || !targetFile) throw new Error('source or target file error');
        pdfCompare = new PdfCompare();
        // const result: any = await PDFCompare({
        //   sourceFilePath: sourceFile,
        //   targetFilePath: targetFile,
        // });
        const { status, diffPng } = await comparePngs(sourcePageVersion.imagePath, targetPageVersion.imagePath, 'diff.png', 'pdfCompare', undefined, false);
        //if (!result?.details) throw new Error('Compare error');
        if (status === 'failed') throw new Error('The compage result same');
        pdfCompare.sourcePageVersionId = sourcePageVersion.id;
        pdfCompare.targetPageVersionId = targetPageVersion.id;
        pdfCompare.filePath = diffPng;
        if (user) {
          pdfCompare.createdById = user.id;
        }
        await pdfCompare.save();
        // const { filePath } = await imagesToPDF({
        //   files: result.details?.map((e:any)=>e.diffPng),
        //   folder: 'pdfCompare',
        //   filename: pdfCompare.id,
        // });
        //pdfCompare.filePath = filePath;
        //await pdfCompare.save();
      }

      return {
        userErrors: [],
        pdfCompare: pdfCompare,
      };

    } catch (error: any) {
      logger.error(error);
      return {
        userErrors: [{
          message: error.message,
          field: ['id'],
        }],
      };
    }
  }

  async pdfCompareUpload(
    data: PdfCompareUploadInput,
    user: LoggedInUser,
    req: Request,
  ): Promise<PdfCompareUploadPayload> {
    try {
      const pdfSource = await this.pdfSourceRepository.findOne({ id: fromGlobalId(data.sourceId).id });
      if (!pdfSource || !pdfSource?.filePath) throw new Error('No pdf source record');
      const pdfUpload = await this.pdfUploadRepository.findOne({ id: fromGlobalId(data.uploadId).id });
      if (!pdfUpload || !pdfUpload?.filePath) throw new Error('No pdf upload record');

      // const sourcePngs = await pdfToPng(pdfSource.filePath);
      // const uploadPngs = await pdfToPng(pdfUpload.filePath);
      // const sourcePng = sourcePngs[data.sourcePage - 1];
      // const uploadPng = uploadPngs[data.uploadPage - 1];

      const sourcePDFLIB = await getPdfLib(pdfSource.filePath!);
      const sourceBuffers = await savePdfPagesToBuffer({ pdf: sourcePDFLIB!, pages: [data.sourcePage - 1] });
      let sourcePngs: { [index: string]: Uint8Array } = {};
      sourcePngs[data.sourcePage] = (await convertPdfToImages(sourceBuffers))?.[0];

      const uploadPDFLIB = await getPdfLib(pdfUpload.filePath!);
      const uploadBuffers = await savePdfPagesToBuffer({ pdf: uploadPDFLIB!, pages: [data.uploadPage - 1] });
      let uploadPngs: { [index: string]: Uint8Array } = {};
      uploadPngs[data.uploadPage] = (await convertPdfToImages(uploadBuffers))?.[0];

      // const filePath = path.join(__dirname, '..', '..', '..', 'storage', 'tmp');
      // if (!fs.existsSync(filePath)) fs.mkdirSync(filePath);
      // const sourcePath = `${filePath}/source.png`;
      // const targetPath = `${filePath}/target.png`;
      // fs.writeFileSync(sourcePath, sourcePng);
      // fs.writeFileSync(targetPath, uploadPng);

      //const { status, savefilePath } = await comparePngs(sourcePath, targetPath, 'compare.png', 'tmp', undefined, true);
      const { status, savefilePath, error } = await comparePngs(
        '',
        '',
        'diff.png',
        'pdfCompare',
        undefined,
        false,
        sourcePngs[data.sourcePage],
        uploadPngs[data.uploadPage],
      );
      if (status === 'failed') throw new Error('The compage result same');

      return {
        userErrors: [],
        // sourceBase64: (await fs.promises.readFile(sourcePath)).toString('base64'),
        // targetBase64: (await fs.promises.readFile(targetPath)).toString('base64'),
        sourceBase64: Buffer.from(sourcePngs[data.sourcePage]).toString('base64'),
        targetBase64: Buffer.from(uploadPngs[data.uploadPage]).toString('base64'),
        compareBase64: (await fs.promises.readFile(savefilePath)).toString('base64'),
      };

    } catch (error: any) {
      logger.error(error);
      return {
        userErrors: [{
          message: error.message,
          field: ['id'],
        }],
      };
    }
  }

}
