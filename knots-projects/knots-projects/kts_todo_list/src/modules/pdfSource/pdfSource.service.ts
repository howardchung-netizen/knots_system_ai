import { Service } from 'typedi';
import {Request} from 'express';
import { getConnection } from 'typeorm';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { LoggedInUser } from '../shared/middleware/currentUser';
import { PdfSourceCreateInput } from './input/pdfSourceCreate.input';
import { PdfSourcePayload } from './payload/pdfSource.payload';
import { PdfSourceRepository } from './pdfSource.repository';
import { fromGlobalId } from 'graphql-relay';
import { PdfUploadRepository } from '../pdfUpload/pdfUpload.repository';
import {
  getPdfLib,
  getPdfLibPages,
  savePdfLibByPages,
  savePdfPagesMerge,
  savePdfPages,
  savePdfPagesMergeWithCompare,
  savePdfPagesToBuffer,
  convertPdfToImages
} from '../../lib/pdf';
import { logger } from '../../lib/logger';
import { PdfSourcePageRepository } from '../pdfSourcePage/pdfSourcePage.repository';
import { PdfSourcePageVersionRepository } from '../pdfSourcePageVersion/pdfSourcePageVersion.repository';
import { savePngToLocal } from '../../lib/storage';
import { PdfSourceSaveInput } from './input/pdfSourceSave.input';
import { PdfUpload } from '../pdfUpload/pdfUpload.entity';
import { PDFDocument, PDFPage } from 'pdf-lib';
import { PdfSourceHistoryRepository } from '../pdfSourceHistory/pdfSourceHistory.repository';
import { PdfSourcePageHistoryRepository } from '../pdfSourcePageHistory/pdfSourcePageHistory.repository';
import fs from 'fs';
import { getRealFilePath } from '../../lib/utils';
import { PdfSourcePageHistory } from '../pdfSourcePageHistory/pdfSourcePageHistory.entity';
import { PdfSourcePageVersion } from '../pdfSourcePageVersion/pdfSourcePageVersion.entity';
import { PdfSourcePage } from '../pdfSourcePage/pdfSourcePage.entity';
import { uuid } from 'uuidv4';

@Service()
export class PdfSourceService {
  constructor(
    @InjectRepository()
    private readonly pdfSourceRepository: PdfSourceRepository,
    @InjectRepository()
    private readonly pdfSourceHistoryRepository: PdfSourceHistoryRepository,
    @InjectRepository()
    private readonly pdfUploadRepository: PdfUploadRepository,
    @InjectRepository()
    private readonly pdfSourcePageRepository: PdfSourcePageRepository,
    @InjectRepository()
    private readonly pdfSourcePageHistoryRepository: PdfSourcePageHistoryRepository,
    @InjectRepository()
    private readonly pdfSourcePageVersionRepository: PdfSourcePageVersionRepository,
  ) {
  }

  async create(
    data: PdfSourceCreateInput,
    user: LoggedInUser,
    req: Request,
  ): Promise<PdfSourcePayload> {
    const queryRunner = getConnection().createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const { id } = fromGlobalId(data.pdfId);
      const currentPdfSource = await this.pdfSourceRepository.findOne({ pdfId: id });
      if (currentPdfSource) throw new Error('PDF Source already exists.');

      const pdfUpload = await this.pdfUploadRepository.findOne({ id: fromGlobalId(data.pdfUploadId).id });
      if (!pdfUpload) throw new Error('PDF version not found.');

      if (!data.pages?.length) throw new Error('Page item required.');

      const pdfSource = this.pdfSourceRepository.create();
      pdfSource.id = uuid();
      pdfSource.pdfId = id;
      pdfSource.pages = data.pages.length;

      const pdf = await getPdfLib(pdfUpload.filePath!);
      if (!pdf) throw new Error('Pdf not found');
      const filePath = await savePdfLibByPages({ pdf: pdf, pages: data.pages, folder: 'pdfSource', saveFileName: `${pdfUpload.id}_merge.pdf` });
      const filePathWithVersion = await savePdfLibByPages({ pdf: pdf, pages: data.pages, folder: 'pdfSource', saveFileName: `${pdfUpload.id}_merge.pdf`, version: '1' });
      //const filePath = await newPDFByPageNumbers({ id: pdfUpload.id, filePath: pdfUpload.filePath!, pages: data.pages, folder: 'pdfSource'});
      if (!filePath) throw new Error('Save PDF version error.');
      pdfSource.filePath = filePath;
      await queryRunner.manager.save(pdfSource, { reload: false });
      const pdfHistory = this.pdfSourceHistoryRepository.create({
        pdfSourceId: pdfSource.id,
        filePath: filePathWithVersion!,
        pages: pdfSource.pages,
      });
      //await queryRunner.manager.insert(PdfSourceHistory, pdfHistory);
      await queryRunner.manager.save(pdfHistory, { reload: false });

      let newSourcePages: PdfSourcePage[] = [];
      let newSourcePagesVersion: PdfSourcePageVersion[] = [];
      let newSourcePagesHistory: PdfSourcePageHistory[] = [];
      for (let i = 0; i < data.pages.length; i++) {
        const e = data.pages[i];
        const sourcePage = this.pdfSourcePageRepository.create();
        sourcePage.id = uuid();
        sourcePage.pdfSourceId = pdfSource.id;
        sourcePage.page = i + 1;
        //await queryRunner.manager.insert(PdfSourcePage, sourcePage);
        //newSourcePages.push(sourcePage);
        //await queryRunner.manager.save(sourcePage, { reload: false });
        const sourcePageVersion = this.pdfSourcePageVersionRepository.create();
        sourcePageVersion.id = uuid();
        sourcePageVersion.pdfUploadId = pdfUpload.id;
        sourcePageVersion.uploadPage = data.pages[i] + 1;
        //sourcepage_id_sourcepage.page_version.png
        // const { path: filePath } = await savePngToLocal(
        //   `${sourcePage.id}_${sourcePage.page}_1.png`,
        //   e,
        //   'pdfSourcePageVersion',
        // );
        const filePath = await savePdfLibByPages({
          pdf: pdf,
          pages: [e],
          folder: 'pdfSourcePageVersion',
          saveFileName: `${sourcePage.id}_${sourcePage.page}_1.pdf`
        });
        const pdfBuffers = await savePdfPagesToBuffer({ pdf: pdf, pages: [data.pages[i]] });
        const uploadPngs = await convertPdfToImages(pdfBuffers);
        const { path: imagePath } = await savePngToLocal(
          `${pdfSource.id}_${i+1}_1.png`,
          uploadPngs[0],
          'pdfSourcePageVersion',
        );
        if (!filePath) throw new Error('Save pdfSourcePageVersion error.');
        sourcePageVersion.pdfSourcePageId = sourcePage.id;
        sourcePageVersion.filePath = filePath;
        sourcePageVersion.imagePath = imagePath;
        //await queryRunner.manager.insert(PdfSourcePageVersion, sourcePageVersion);
        //await queryRunner.manager.save(sourcePageVersion, { reload: true });
        newSourcePagesVersion.push(sourcePageVersion);
        sourcePage.pdfSourcePageVersionId = sourcePageVersion.id;
        //await queryRunner.manager.update(PdfSourcePage, { id: sourcePage.id }, sourcePage);
        //await queryRunner.manager.save(sourcePage, { reload: false });
        newSourcePages.push(sourcePage);

        const sourcePageHistory = this.pdfSourcePageHistoryRepository.create();
        sourcePageHistory.pdfSourcePageId = sourcePage.id;
        sourcePageHistory.filePath = filePath;
        sourcePageHistory.lastVersion = 1;
        newSourcePagesHistory.push(sourcePageHistory);
        //await queryRunner.manager.save(sourcePageHistory);
      };
      await queryRunner.manager.insert(PdfSourcePage, newSourcePages);
      await queryRunner.manager.insert(PdfSourcePageVersion, newSourcePagesVersion);
      await queryRunner.manager.insert(PdfSourcePageHistory, newSourcePagesHistory);
      // await queryRunner.manager.save(newSourcePages, { reload: false });
      // await queryRunner.manager.save(newSourcePagesVersion, { reload: false });
      // await queryRunner.manager.save(newSourcePagesHistory, { reload: false });

      // const pdfPngs = await pdfToPng(filePath);
      // await Promise.all(pdfPngs.map(async(e: any, i: number) => {
      //   const sourcePage = this.pdfSourcePageRepository.create();
      //   sourcePage.pdfSourceId = pdfSource.id;
      //   sourcePage.page = i + 1;
      //   await queryRunner.manager.save(sourcePage);
      //   const sourcePageVersion = this.pdfSourcePageVersionRepository.create();
      //   sourcePageVersion.pdfUploadId = pdfUpload.id;
      //   sourcePageVersion.uploadPage = data.pages[i] + 1;
      //   //sourcepage_id_sourcepage.page_version.png
      //   const { path: filePath } = await savePngToLocal(
      //     `${sourcePage.id}_${sourcePage.page}_1.png`,
      //     e,
      //     'pdfSourcePageVersion',
      //   );
      //   sourcePageVersion.pdfSourcePageId = sourcePage.id;
      //   sourcePageVersion.filePath = filePath;
      //   await queryRunner.manager.save(sourcePageVersion);
      //   sourcePage.pdfSourcePageVersionId = sourcePageVersion.id;
      //   await queryRunner.manager.save(sourcePage);
      // }));

      await queryRunner.commitTransaction();

      return {
        userErrors: [],
        pdfSource: pdfSource,
      };

    } catch (error: any) {
      logger.error(error);
      await queryRunner.rollbackTransaction();
      return {
        userErrors: [{
          message: error.message,
          field: ['id'],
        }],
      };
    } finally {
      await queryRunner.release();
    }
  }

  async save(
    data: PdfSourceSaveInput,
    user: LoggedInUser,
    req: Request,
  ): Promise<PdfSourcePayload> {
    const queryRunner = getConnection().createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {

      const pdfSource = await this.pdfSourceRepository.findOneOrFail({ id: fromGlobalId(data.pdfSourceId).id });
      //const sourcePDF = await getPdfLib(pdfSource.filePath!);
      //const sourceBuffers = await savePdfPagesToBuffer({ pdf: sourcePDF!, pages: Array.from({ length: pdfSource.pages }, (_, index) => index) });
      //const sourcePngs = await convertPdfToImages(sourceBuffers);
      let sourcePngs: { [index: string]: Uint8Array } = {};
      //const sourcePngs = await pdfToPng(pdfSource.filePath);
      const sourceRP = await getPdfLibPages(pdfSource.filePath);
      const sourcePdf = sourceRP.doc;
      //const sourcePdfPages = sourceRP.pages;
      let pdfUpload: PdfUpload | undefined;
      let uploadPdf: PDFDocument;
      let uploadPdfPages: PDFPage[] = [];
      let uploadPngs: { [index: string]: Uint8Array } = {};
      if (data.pdfUploadId) {
        pdfUpload = await this.pdfUploadRepository.findOneOrFail({ id: fromGlobalId(data.pdfUploadId).id });
        // const uploadPDF = await getPdfLib(pdfUpload.filePath!);
        // const uploadBuffers = await savePdfPagesToBuffer({ pdf: uploadPDF! });
        // uploadPngs = await convertPdfToImages(uploadBuffers);
        //uploadPngs = await pdfToPng(pdfUpload.filePath);
        const uploadRP = await getPdfLibPages(pdfUpload.filePath);
        uploadPdf = uploadRP.doc;
        uploadPdfPages = uploadRP.pages;
      }
      //let fullPngs: Uint8Array[] = [];
      let fullPdfPages: PdfMergeData[] = [];
      let newSourcePages: PdfSourcePage[] = [];
      let newSourcePagesVersion: PdfSourcePageVersion[] = [];
      let newSourcePagesHistory: PdfSourcePageHistory[] = [];
      for (let i = 0; i < data.pdfSourcePages.length; i++) {
       const e = data.pdfSourcePages[i];
        //fullPngs.push((e.merge || e.insert) && pdfUpload ? e.merge ? uploadPngs[e.page-1] : uploadPngs[e.targetPage!-1] : sourcePngs[e.page-1]);
        fullPdfPages.push((e.merge || e.insert) && pdfUpload ? e.merge ? { page: e.page, type: 'target', merge: true, originalPage: e.originalPage! }
        : { page: e.targetPage!, type: 'target', merge: false }
        : { page: e.page, type: 'source', merge: false });
        if (e.merge && pdfUpload) {
          if (!sourcePngs[e.originalPage!]) {
            const sourcePDFLIB = await getPdfLib(pdfSource.filePath!);
            const sourceBuffers = await savePdfPagesToBuffer({ pdf: sourcePDFLIB!, pages: [e.originalPage!-1] });
            sourcePngs[e.originalPage!] = (await convertPdfToImages(sourceBuffers))?.[0];
          }
          if (!uploadPngs[e.page]) {
            const uploadPDFLIB = await getPdfLib(pdfUpload.filePath!);
            const uploadBuffers = await savePdfPagesToBuffer({ pdf: uploadPDFLIB!, pages: [e.page-1] });
            uploadPngs[e.page!] = (await convertPdfToImages(uploadBuffers))?.[0];
          }
          const sourcePage = await this.pdfSourcePageRepository.findOneOrFail({
            pdfSourceId: pdfSource.id,
            page: e.originalPage,
          });
          const lastSourcePageVersion = await this.pdfSourcePageVersionRepository.findOne({
            pdfSourcePageId: sourcePage.id,
            version: sourcePage.version,
          });
          const sourcePageVersion = this.pdfSourcePageVersionRepository.create();
          sourcePageVersion.id = uuid();
          sourcePageVersion.pdfUploadId = pdfUpload.id;
          sourcePageVersion.uploadPage = e.page;
          const filePath = await savePdfPages({
            pdf: uploadPdf!,
            pages: [e.page-1],
            folder: 'pdfSourcePageVersion',
            saveFileName: `${pdfSource.id}_${i+1}_${sourcePage?.version + 1}.pdf`,
          });

          //sourcepage_id_sourcepage.page_version.png
          const { path: imagePath } = await savePngToLocal(
            `${pdfSource.id}_${i+1}_${sourcePage?.version + 1}.png`,
            uploadPngs[e.page],
            'pdfSourcePageVersion',
          );
          sourcePageVersion.pdfSourcePageId = sourcePage.id;
          sourcePageVersion.filePath = filePath;
          sourcePageVersion.imagePath = imagePath;
          sourcePageVersion.version = sourcePage.version + 1;
          newSourcePagesVersion.push(sourcePageVersion);
          //await queryRunner.manager.save(sourcePageVersion);
          sourcePage.pdfSourcePageVersionId = sourcePageVersion.id;
          sourcePage.version = sourcePage.version + 1;
          sourcePage.page = i + 1;
          await queryRunner.manager.save(sourcePage, { reload: false });

          //save source page history
          const lastSourcePageHistory = await this.pdfSourcePageHistoryRepository.findOneOrFail({
            where: { pdfSourcePageId: sourcePage.id },
            order: { lastVersion: 'DESC' },
          });
          //const sourcePageHistoryPngs = await pdfToPng(lastSourcePageHistory.filePath);
          const sourcePageHistoryRP = await getPdfLibPages(lastSourcePageHistory.filePath);
          const sourcePageHistoryPdf = sourcePageHistoryRP.doc;
          const originalPages: PdfMergeData[] = sourcePageHistoryRP.pages.map((e, i) => ({
            page: i + 1,
            type: 'source',
            merge: false,
          }));
          const mergePdfPages: PdfMergeData[] = [
            ...originalPages,
            { page: e.page, type: 'target', merge: false },
          ];
          const mergePath = await savePdfPagesMerge({
            sourcePdf: sourcePageHistoryPdf,
            targetPdf: uploadPdf!,
            pdfPages: mergePdfPages,
            folder: 'pdfSourcePageHistory',
            saveFileName: `${pdfSource.id}_${lastSourcePageHistory.lastVersion + 1}.pdf`,
          });
          const sourcePageHistory = this.pdfSourcePageHistoryRepository.create();
          sourcePageHistory.pdfSourcePageId = sourcePage.id;
          sourcePageHistory.filePath = mergePath;
          sourcePageHistory.lastVersion = lastSourcePageHistory.lastVersion + 1;

          let lastCompareRP;
          let lastComparePdf;
          if (lastSourcePageHistory?.comparePath) {
            lastCompareRP = await getPdfLibPages(lastSourcePageHistory.comparePath);
            lastComparePdf = lastCompareRP.doc;
          }

          const compareMerge: PdfMergeData[] = lastCompareRP?.pages?.map((e, i) => ({
            page: i + 1,
            type: 'source',
            merge: false,
          })) || [];
          const compareMergePdfPages: PdfMergeData[] = [
            ...compareMerge,
            { page: 1, type: 'target', merge: true, originalPage: 1 },
          ];
          let sourcePng: { [index: string]: Uint8Array } = {};
          let targetPng: { [index: string]: Uint8Array } = {};
          sourcePng['1'] = fs.readFileSync(getRealFilePath(lastSourcePageVersion?.imagePath!));
          targetPng['1'] = fs.readFileSync(getRealFilePath(imagePath));

          const comparePath = await savePdfPagesMergeWithCompare({
            sourcePdf: lastComparePdf,
            targetPdf: uploadPdf!,
            pdfPages: compareMergePdfPages,
            folder: 'pdfSourcePageCompareHistory',
            saveFileName: `${sourcePage.id}_${sourcePageHistory.lastVersion + 1}.pdf`,
            sourcePngs: sourcePng,
            uploadPngs: targetPng,
          });

          sourcePageHistory.comparePath = comparePath;
          newSourcePagesHistory.push(sourcePageHistory);
          //await queryRunner.manager.save(sourcePageHistory);

        } else if (e.insert && pdfUpload) {
          if (!uploadPngs[e.targetPage!]) {
            const uploadPDFLIB = await getPdfLib(pdfUpload.filePath!);
            const uploadBuffers = await savePdfPagesToBuffer({ pdf: uploadPDFLIB!, pages: [e.targetPage!-1] });
            uploadPngs[e.targetPage!] = (await convertPdfToImages(uploadBuffers))?.[0];
          }
          const sourcePage = this.pdfSourcePageRepository.create({
            id: uuid(),
            pdfSourceId: pdfSource.id,
            page: i + 1,
          });
          //await queryRunner.manager.save(sourcePage);

          const sourcePageVersion = this.pdfSourcePageVersionRepository.create();
          sourcePageVersion.pdfUploadId = pdfUpload.id;
          sourcePageVersion.uploadPage = e.targetPage!;
          const filePath = await savePdfPages({
            pdf: uploadPdf!,
            pages: [e.targetPage!-1],
            folder: 'pdfSourcePageVersion',
            saveFileName: `${pdfSource.id}_${i+1}_${sourcePage?.version}.pdf`,
          });
          //sourcepage_id_sourcepage.page_version.png
          const { path: imagePath } = await savePngToLocal(
            `${pdfSource.id}_${i+1}_${sourcePage?.version}.png`,
            uploadPngs[e.targetPage!],
            'pdfSourcePageVersion',
          );
          sourcePageVersion.pdfSourcePageId = sourcePage.id;
          sourcePageVersion.filePath = filePath;
          sourcePageVersion.imagePath = imagePath;
          sourcePageVersion.version = sourcePage.version;
          //await queryRunner.manager.save(sourcePageVersion);
          newSourcePagesVersion.push(sourcePageVersion);
          sourcePage.pdfSourcePageVersionId = sourcePageVersion.id;
          //await queryRunner.manager.save(sourcePage);
          newSourcePages.push(sourcePage);
          const sourcePageHistory = this.pdfSourcePageHistoryRepository.create();
          sourcePageHistory.pdfSourcePageId = sourcePage.id;
          sourcePageHistory.filePath = filePath;
          sourcePageHistory.lastVersion = 1;
          newSourcePagesHistory.push(sourcePageHistory);
          //await queryRunner.manager.save(sourcePageHistory);

        } else {
          if (i + 1 !== e.page) {
            const sourcePage = await this.pdfSourcePageRepository.findOneOrFail({
              pdfSourceId: pdfSource.id,
              page: e.page,
            });
            sourcePage.page = i + 1;
            await queryRunner.manager.save(sourcePage, { reload: false });
            //await queryRunner.manager.update(PdfSourcePage, { pdfSourceId: pdfSource.id, page: e.page }, sourcePage);
          }
        }
      };
      await queryRunner.manager.insert(PdfSourcePage, newSourcePages);
      await queryRunner.manager.insert(PdfSourcePageVersion, newSourcePagesVersion);
      await queryRunner.manager.insert(PdfSourcePageHistory, newSourcePagesHistory);

      // const { filePath } = await imagesToPDF({
      //   files: fullPngs.map(e => Buffer.from(e).toString('base64')),
      //   folder: 'pdfSource',
      //   filename: pdfSource.id,
      // });

      const filePath = await savePdfPagesMerge({
        sourcePdf: sourcePdf,
        targetPdf: uploadPdf!,
        pdfPages: fullPdfPages,
        folder: 'pdfSource',
        saveFileName: `${pdfSource.id}_merge.pdf`,
        version: `${pdfSource.version + 1}`,
      });
      pdfSource.filePath = filePath;
      pdfSource.pages = fullPdfPages.length;
      pdfSource.version = pdfSource.version + 1;

      const comparePath = await savePdfPagesMergeWithCompare({
        sourcePdf: sourcePdf,
        targetPdf: uploadPdf!,
        pdfPages: fullPdfPages,
        folder: 'pdfSource',
        saveFileName: `${pdfSource.id}_compare.pdf`,
        sourcePngs: sourcePngs,
        uploadPngs: uploadPngs,
        version: `${pdfSource.version}`,
      });
      pdfSource.comparePath = comparePath;
      await queryRunner.manager.save(pdfSource, { reload: false });

      const pdfHistory = this.pdfSourceHistoryRepository.create({
        pdfSourceId: pdfSource.id,
        filePath: filePath,
        comparePath: comparePath,
        pages: pdfSource.pages,
        version: pdfSource.version,
      });
      await queryRunner.manager.save(pdfHistory, { reload: false });

      await queryRunner.commitTransaction();

      return {
        userErrors: [],
        pdfSource: pdfSource,
      };

    } catch (error: any) {
      logger.error(error);
      await queryRunner.rollbackTransaction();
      return {
        userErrors: [{
          message: error.message,
          field: ['id'],
        }],
      };
    } finally {
      await queryRunner.release();
    }
  }

}

export interface PdfMergeData {
  page: number;
  type: 'source' | 'target';
  merge: boolean;
  originalPage?: number;
}