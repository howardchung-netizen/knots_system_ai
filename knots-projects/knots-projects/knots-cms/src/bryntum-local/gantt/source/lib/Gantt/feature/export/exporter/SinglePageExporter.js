import SchedulerSinglePageExporter from '../../../../Scheduler/feature/export/exporter/SinglePageExporter.js';
import GanttExporterMixin from './GanttExporterMixin.js';

/**
 * @module Gantt/feature/export/exporter/SinglePageExporter
 */

/**
 * A single page exporter. Used by the {@link Gantt.feature.export.PdfExport} feature to export to single page. Content
 * will be scaled in both directions to fit the page.
 *
 * You do not need to use this class directly.
 *
 * ### Extending exporter
 *
 * ```javascript
 * class MySinglePageExporter extends SinglePageExporter {
 *     // type is required for exporter
 *     static get type() {
 *         return 'mysinglepageexporter';
 *     }
 *
 *     get stylesheets() {
 *         const stylesheets = super.stylesheets;
 *
 *         stylesheets.forEach(styleNodeOrLinkTag => doSmth(styleNodeOrLinkTag))
 *
 *         return stylesheets;
 *     }
 * }
 *
 * const gantt = new Gantt({
 *     features : {
 *         pdfExport : {
 *             // this export feature is configured with only one exporter
 *             exporters : [MySinglePageExporter]
 *         }
 *     }
 * });
 *
 * // run export with the new exporter
 * gantt.features.pdfExport.export({ exporter : 'mysinglepageexporter' });
 * ```
 *
 * @classType singlepage
 * @feature
 * @extends Scheduler/feature/export/exporter/SinglePageExporter
 * @typings Scheduler/feature/export/exporter/SinglePageExporter -> Scheduler/feature/export/exporter/SchedulerSinglePageExporter
 */
export default class SinglePageExporter extends GanttExporterMixin(SchedulerSinglePageExporter) {

    static get $name() {
        return 'SinglePageExporter';
    }

    static get type() {
        return 'singlepage';
    }

}
