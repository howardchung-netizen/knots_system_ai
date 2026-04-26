import SchedulerMultiPageExporter from '../../../../Scheduler/feature/export/exporter/MultiPageExporter.js';
import GanttExporterMixin from './GanttExporterMixin.js';

/**
 * @module Gantt/feature/export/exporter/MultiPageExporter
 */

/**
 * A multiple page exporter. Used by the {@link Gantt.feature.export.PdfExport} feature to export to multiple pages. You
 * do not need to use this class directly.
 *
 * ### Extending exporter
 *
 * ```javascript
 * class MyMultiPageExporter extends MultiPageExporter {
 *     // type is required for exporter
 *     static get type() {
 *         return 'mymultipageexporter';
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
 *             exporters : [MyMultiPageExporter]
 *         }
 *     }
 * });
 *
 * // run export with the new exporter
 * gantt.features.pdfExport.export({ exporter : 'mymultipageexporter' });
 * ```
 *
 * @classType multipage
 * @feature
 * @extends Scheduler/feature/export/exporter/MultiPageExporter
 * @typings Scheduler/feature/export/exporter/MultiPageExporter -> Scheduler/feature/export/exporter/SchedulerMultiPageExporter
 */
export default class MultiPageExporter extends GanttExporterMixin(SchedulerMultiPageExporter) {

    static get $name() {
        return 'MultiPageExporter';
    }

    static get type() {
        return 'multipage';
    }

}
