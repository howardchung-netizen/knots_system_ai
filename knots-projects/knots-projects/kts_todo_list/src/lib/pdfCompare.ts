import comparePdf from 'compare-pdf';
import moment from 'moment-timezone';
import path from 'path';

const config = {
  paths: {
    actualPdfRootFolder: process.cwd() + '/storage/comparePDF/actualPdfs',
		baselinePdfRootFolder: process.cwd() + '/storage/comparePDF/baselinePdfs',
		actualPngRootFolder: process.cwd() + '/storage/comparePDF/actualPngs',
		baselinePngRootFolder: process.cwd() + '/storage/comparePDF/baselinePngs',
		diffPngRootFolder: process.cwd() + '/storage/comparePDF/diffPngs'
  },
  settings: {
    imageEngine: 'graphicsMagick',
    density: 75,
    quality: 100,
    tolerance: 0,
    threshold: 0.05,
    cleanPngPaths: false,
    matchPageCount: false,
    disableFontFace: true,
    verbosity: 0
  }
}

export const PDFCompare = async(data: {
  sourceFilePath: string,
  targetFilePath: string,
}): Promise<any> => {
  try {

    const sourceFilename = data.sourceFilePath.split('/')[3];
    const sourceFolder = data.sourceFilePath.split('/')[2];
    const matchSource = sourceFilename.match(/^(\d+)-.+$/);
    if (!matchSource) throw new Error(`Invalid request data when getting storage file, invalid "filename": ${data.sourceFilePath}.`);
    const fileTimeSource = moment(parseInt(matchSource[1]));
    if (!fileTimeSource.isValid()) throw new Error(`Invalid request data when getting storage file, invalid "filename": ${data.sourceFilePath}.`);
    const sourcePdfFilename = path.join(__dirname, '..', '..', 'storage', sourceFolder, fileTimeSource.format('YYYY'), fileTimeSource.format('MMDD'), sourceFilename);

    const targetFilename = data.targetFilePath.split('/')[3];
    const targetFolder = data.targetFilePath.split('/')[2];
    const matchTarget = targetFilename.match(/^(\d+)-.+$/);
    if (!matchTarget) throw new Error(`Invalid request data when getting storage file, invalid "filename": ${data.targetFilePath}.`);
    const fileTimeTarget = moment(parseInt(matchTarget[1]));
    if (!fileTimeTarget.isValid()) throw new Error(`Invalid request data when getting storage file, invalid "filename": ${data.targetFilePath}.`);
    const targetPdfFilename = path.join(__dirname, '..', '..', 'storage', targetFolder, fileTimeTarget.format('YYYY'), fileTimeTarget.format('MMDD'), targetFilename);

    const comparisonResults = new comparePdf(config)
      .actualPdfFile(sourcePdfFilename)
      .baselinePdfFile(targetPdfFilename)
	    //.onlyPageIndexes([1])
      .compare();
    return comparisonResults;

  } catch (error: any) {
    throw new Error(error.meessage);
  }

}
