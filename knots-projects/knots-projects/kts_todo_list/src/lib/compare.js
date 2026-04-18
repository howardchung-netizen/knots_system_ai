import fs from 'fs';
import moment from 'moment-timezone';
import { getRealFilePath } from './storage';
import path from 'path';
const PNG = require('pngjs').PNG;
const pixelmatch = require('pixelmatch');

export const comparePngs = async (actual, baseline, filename, folder, config, customPath, actualBuffer, baselineBuffer) => {
	return new Promise(async (resolve, reject) => {
		  const defaultOptions = {
			threshold: 0.05,         // matching threshold (0 to 1); smaller is more sensitive
			includeAA: false,       // whether to skip anti-aliasing detection
			alpha: 1,             // opacity of original image in diff output
			aaColor: [229, 35, 56], // color of anti-aliased pixels in diff output
			diffColor: [73, 221, 200], // color of different pixels in diff output
			diffColorAlt: [null],     // whether to detect dark on light differences between img1 and img2 and set an alternative color to differentiate between the two
			diffMask: false         // draw the diff over a transparent background (a mask)
		};
		try {
			const realActualPath = actualBuffer ? '' : customPath ? actual : await getRealFilePath(actual);
			const realBaselinePath = baselineBuffer ? '' : customPath ? baseline : await getRealFilePath(baseline);
			const actualPng = PNG.sync.read(actualBuffer ? Buffer.from(actualBuffer) : fs.readFileSync(realActualPath));
			const baselinePng = PNG.sync.read(baselineBuffer ? Buffer.from(baselineBuffer) :fs.readFileSync(realBaselinePath));
			const { width, height } = actualPng;
			const diffPng = new PNG({ width, height });

			const now = moment();
			const timestampedFileName = `${now.format('x')}-${encodeURIComponent(filename)}`;
			const saveFilePath = `${now.format('x')}-${filename}`;
			let filePath = path.join(__dirname, '..', '..', 'storage');
      		if (!fs.existsSync(filePath)) fs.mkdirSync(filePath);
			filePath = path.join(filePath, folder);
			if (!fs.existsSync(filePath)) fs.mkdirSync(filePath);
			filePath = path.join(filePath, now.format('YYYY'));
			if (!fs.existsSync(filePath)) fs.mkdirSync(filePath);
			filePath = path.join(filePath, now.format('MMDD'));
			if (!fs.existsSync(filePath)) fs.mkdirSync(filePath);

			filePath = path.join(filePath, saveFilePath);

      		const returnFilePath = `/storage/${folder}/${timestampedFileName}`;

			let threshold = config?.settings && config?.settings?.threshold ? config?.settings?.threshold : 0.05;
			let tolerance = config?.settings && config?.settings?.tolerance ? config?.settings?.tolerance : 0;

			let numDiffPixels = pixelmatch(actualPng.data, baselinePng.data, diffPng.data, width, height, defaultOptions);

			if (numDiffPixels > tolerance) {
				fs.writeFileSync(filePath, PNG.sync.write(diffPng));
				resolve({ status: 'success', numDiffPixels: numDiffPixels, diffPng: returnFilePath, savefilePath: filePath, error: undefined });
			} else {
				resolve({ status: 'failed', error: undefined });
			}
		} catch (error) {
			resolve({ status: 'failed', actual: actual, error: error });
		}
	});
};
