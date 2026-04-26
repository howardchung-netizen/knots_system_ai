import SchedulerPdfExport from '../../../Scheduler/feature/export/PdfExport.js';
import SinglePageExporter from './exporter/SinglePageExporter.js';
import MultiPageExporter from './exporter/MultiPageExporter.js';
import MultiPageVerticalExporter from './exporter/MultiPageVerticalExporter.js';
import GridFeatureManager from '../../../Grid/feature/GridFeatureManager.js';

/**
 * @module Gantt/feature/export/PdfExport
 */

/**
 * Generates PDF/PNG files from the Gantt component.
 *
 * <img src="Gantt/gantt-export-dialog.png" style="max-width : 300px" alt="Gantt Export dialog">
 *
 * **NOTE:** Server side is required to make export work!
 *
 * The export server is written in nodejs and it is shipped with our examples. You can find setup instructions in
 * `examples/_shared/server/README.md` and `examples/export/README.md` files.
 *
 * When your server is up and running, it listens to requests. The Export feature sends a request to the specified URL
 * with the HTML fragments. The server generates a PDF (or PNG) file and returns a download link (or binary, depending
 * on {@link #config-sendAsBinary} config). Then the Export feature opens the link in a new tab and the file is
 * automatically downloaded by your browser. This is configurable, see {@link #config-openAfterExport} config.
 *
 * The {@link #config-exportServer} URL must be configured. The URL can be localhost if you start the server locally,
 * or your remote server address.
 *
 * ## Usage
 *
 * ```javascript
 * const gantt = new Gantt({
 *     features : {
 *         pdfExport : {
 *             exportServer : 'http://localhost:8080' // Required
 *         }
 *     }
 * })
 *
 * // Opens popup allowing to customize export settings
 * gantt.features.pdfExport.showExportDialog();
 *
 * // Simple export
 * gantt.features.pdfExport.export({
 *     // Required, set list of column ids to export
 *     columns : gantt.columns.map(c => c.id)
 * }).then(result => {
 *     // Response instance and response content in JSON
 *     let { response, responseJSON } = result;
 * });
 * ```
 *
 * ## Configuring the export dialog
 *
 * To learn about how to customize the export dialog and its default widgets, please refer to the
 * {@link Scheduler.view.export.SchedulerExportDialog} which provides a 'ref' identifier for each child widget so that
 * you can customize them all based on your requirements.
 *
 * ## Loading resources
 *
 * If you face a problem with loading resources when exporting, the cause might be that the application and the export server are hosted on different servers.
 * This is due to [Cross-Origin Resource Sharing](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS) (CORS). There are 2 options how to handle this:
 * - Allow cross origin requests from the server where your export is hosted to the server where your application is hosted;
 * - Copy all resources keeping the folder hierarchy from the server where your application is hosted to the server where your export is hosted
 * and setup paths using {@link Grid.feature.export.PdfExport#config-translateURLsToAbsolute} config and configure the export server to give access to the path:
 *
 * ```javascript
 * const gantt = new Gantt({
 *     features : {
 *         pdfExport : {
 *             exportServer : 'http://localhost:8080',
 *             // '/resources' is hardcoded in WebServer implementation
 *             translateURLsToAbsolute : 'http://localhost:8080/resources'
 *         }
 *     }
 * })
 * ```
 *
 * ```javascript
 * // Following path would be served by this address: http://localhost:8080/resources/
 * node ./src/server.js -h 8080 -r web/application/styles
 * ```
 *
 * where `web/application/styles` is a physical root location of the copied resources, for example:
 *
 * <img src="Grid/export-server-resources.png" style="max-width : 500px" alt="Export server structure with copied resources" />
 *
 * @classtype pdfExport
 *
 * @extends Scheduler/feature/export/PdfExport
 * @feature
 * @typings Scheduler/feature/export/PdfExport -> Scheduler/feature/export/SchedulerPdfExport
 */
export default class PdfExport extends SchedulerPdfExport {
    static get $name() {
        return 'PdfExport';
    }

    static get defaultConfig() {
        return {
            exporters : [SinglePageExporter, MultiPageExporter, MultiPageVerticalExporter]
        };
    }
}

GridFeatureManager.registerFeature(PdfExport, false, 'Gantt');
