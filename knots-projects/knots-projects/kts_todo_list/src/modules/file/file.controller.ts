import { Request, Response } from 'express';
import moment from 'moment-timezone';
import path from 'path';
import { logger } from '../../lib/logger';
import { getRepository } from 'typeorm';
import { ClockInContactFile } from '../clockInContactFile/clockInContactFile.entity';
import { PdfCompare } from '../pdfCompare/pdfCompare.entity';
import { PdfSource } from '../pdfSource/pdfSource.entity';
import { PdfSourcePageVersion } from '../pdfSourcePageVersion/pdfSourcePageVersion.entity';
import { PdfUpload } from '../pdfUpload/pdfUpload.entity';
import { PdfSourceHistory } from '../pdfSourceHistory/pdfSourceHistory.entity';
import { getFolder } from '../../lib/utils';
import { PdfSourcePageHistory } from '../pdfSourcePageHistory/pdfSourcePageHistory.entity';
import { ContactFile } from '../contactFile/contactFile.entity';
import { ProjectOrderFile } from '../projectOrderFile/projectOrderFile.entity';
import { ClaimFormFile } from '../claimFormFile/claimFormFile.entity';
import { QuotationFile } from '../quotationFile_/quotationFile.entity';

export class FileController {
  static async getFile(request: Request, response: Response): Promise<boolean> {
    try {
      let filename = request.params.filename;
      let folder = '';

      if (request.params.folder !== 'public') {
        try {
          switch (request.params.folder) {
            case 'clockInContactFile':
              const clockInContactFile = await getRepository(ClockInContactFile).findOne(request.params.filename);
              if (!clockInContactFile) throw new Error(`clockInContactFile not found`);

              folder = getFolder(clockInContactFile.clockInContactFilePath);
              filename = clockInContactFile.clockInContactFilePath || '';
              filename = filename.substring(`/storage/${folder}/`.length);

              break;
              case 'contactFile':
                const contactFile = await getRepository(ContactFile).findOne(request.params.filename);
                if (!contactFile) throw new Error(`contactFile not found`);
  
                folder = getFolder(contactFile.filePath);
                filename = contactFile.filePath || '';
                filename = filename.substring(`/storage/${folder}/`.length);
  
                break;  
            case 'pdfCompare':
              const pdfCompareFile = await getRepository(PdfCompare).findOne(request.params.filename);
              if (!pdfCompareFile) throw new Error(`pdfCompareFile not found`);

              folder = getFolder(pdfCompareFile.filePath);
              filename = pdfCompareFile.filePath || '';
              filename = filename.substring(`/storage/${folder}/`.length);

              break;
            case 'pdfSource':
              const pdfSourceFile = await getRepository(PdfSource).findOne(request.params.filename);
              if (!pdfSourceFile) throw new Error(`pdfSourceFile not found`);

              folder = getFolder(pdfSourceFile.filePath);
              filename = pdfSourceFile.filePath || '';
              filename = filename.substring(`/storage/${folder}/`.length);

              break;
            case 'pdfSourceHistoryFile':
              const pdfSourceHistoryFile = await getRepository(PdfSourceHistory).findOne(request.params.filename);
              if (!pdfSourceHistoryFile) throw new Error(`pdfSourcePageVersionFile not found`);

              folder = getFolder(pdfSourceHistoryFile.filePath);
              filename = pdfSourceHistoryFile.filePath || '';
              filename = filename.substring(`/storage/${folder}/`.length);

              break;
            case 'pdfSourceHistoryCompare':
              const pdfSourceHistoryComapre = await getRepository(PdfSourceHistory).findOne(request.params.filename);
              if (!pdfSourceHistoryComapre) throw new Error(`pdfSourceHistoryComapre not found`);

              folder = getFolder(pdfSourceHistoryComapre.comparePath);
              filename = pdfSourceHistoryComapre.comparePath || '';
              filename = filename.substring(`/storage/${folder}/`.length);

              break;
            case 'pdfSourcePageVersionFile':
              const pdfSourcePageVersionFile = await getRepository(PdfSourcePageVersion).findOne(request.params.filename);
              if (!pdfSourcePageVersionFile) throw new Error(`pdfSourcePageVersionFile not found`);

              folder = getFolder(pdfSourcePageVersionFile.filePath);
              filename = pdfSourcePageVersionFile.filePath || '';
              filename = filename.substring(`/storage/${folder}/`.length);

              break;
            case 'pdfSourcePageVersionImage':
              const pdfSourcePageVersionImage = await getRepository(PdfSourcePageVersion).findOne(request.params.filename);
              if (!pdfSourcePageVersionImage) throw new Error(`pdfSourcePageVersionFile not found`);

              folder = getFolder(pdfSourcePageVersionImage.imagePath);
              filename = pdfSourcePageVersionImage.imagePath || '';
              filename = filename.substring(`/storage/${folder}/`.length);

              break;
            case 'pdfSourcePageHistoryFile':
              const pdfSourcePageHistoryFile = await getRepository(PdfSourcePageHistory).findOne(request.params.filename);
              if (!pdfSourcePageHistoryFile) throw new Error(`pdfSourcePageHistoryFile not found`);

              folder = getFolder(pdfSourcePageHistoryFile.filePath);
              filename = pdfSourcePageHistoryFile.filePath || '';
              filename = filename.substring(`/storage/${folder}/`.length);

              break;
            case 'pdfSourcePageHistoryCompare':
              const pdfSourcePageHistoryCompare = await getRepository(PdfSourcePageHistory).findOne(request.params.filename);
              if (!pdfSourcePageHistoryCompare) throw new Error(`pdfSourcePageHistoryCompare not found`);

              folder = getFolder(pdfSourcePageHistoryCompare.comparePath);
              filename = pdfSourcePageHistoryCompare.comparePath || '';
              filename = filename.substring(`/storage/${folder}/`.length);

              break;
            case 'pdfUpload':
              const pdfUploadFile = await getRepository(PdfUpload).findOne(request.params.filename);
              if (!pdfUploadFile) throw new Error(`pdfUploadFile not found`);

              folder = getFolder(pdfUploadFile.filePath);
              filename = pdfUploadFile.filePath || '';
              filename = filename.substring(`/storage/${folder}/`.length);

              break;
            case 'claimFormFile':
              const claimForm = await getRepository(ClaimFormFile).findOne(request.params.filename);
              if (!claimForm) throw new Error(`claimForm not found`);

              folder = getFolder(claimForm.filePath);
              filename = claimForm.filePath || '';
              filename = filename.substring(`/storage/${folder}/`.length);

              break;
            case 'projectOrderFile':
              const projectOrderFile = await getRepository(ProjectOrderFile).findOne(request.params.filename); 
              if (!projectOrderFile) throw new Error(`projectOrderFile not found`); 
              
              folder = getFolder(projectOrderFile.filePath);
              filename = projectOrderFile.filePath || '';
              filename = filename.substring(`/storage/${folder}/`.length);
              
              break;
            case 'quotationFile':
              const quotation = await getRepository(QuotationFile).findOne(request.params.filename);
              if (!quotation) throw new Error(`quotation not found`);

              folder = getFolder(quotation.filePath);
              filename = quotation.filePath || '';
              filename = filename.substring(`/storage/${folder}/`.length);

              break;
            default:
              throw new Error(`authorization checking rules for folder ${request.params.folder} not found`);
          }
        } catch (error: any) {
          logger.error(`Not authorized when getting storage file: ${request.params.filename}, ${error}.`);
          logger.error(error);
          response.status(401).end();
          return false;
        }
      }

      const match = filename.match(/^(\d+)-.+$/);
      if (!match) throw new Error(`Invalid request data when getting storage file, invalid "filename": ${filename}.`);

      const fileTime = moment(parseInt(match[1]));
      if (!fileTime.isValid()) throw new Error(`Invalid request data when getting storage file, invalid "filename": ${filename}.`);

      response.sendFile(path.join(__dirname, '..', '..', '..', 'storage', folder, fileTime.format('YYYY'), fileTime.format('MMDD'), decodeURIComponent(filename)));
    } catch (error: any) {
      logger.error(error);
      response.status(404).end();
      return false;
    }

    return true;
  }
}
