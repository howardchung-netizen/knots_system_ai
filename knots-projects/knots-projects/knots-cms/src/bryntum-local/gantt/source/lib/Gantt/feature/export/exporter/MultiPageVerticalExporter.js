import SchedulerMultiPageVerticalExporter from '../../../../Scheduler/feature/export/exporter/MultiPageVerticalExporter.js';
import GanttExporterMixin from './GanttExporterMixin.js';

/**
 * @module Gantt/feature/export/exporter/MultiPageVerticalExporter
 */

/**
 * A vertical multiple page exporter. Used by the {@link Gantt.feature.export.PdfExport} feature to export to multiple
 * pages. Content will be scaled in a horizontal direction to fit the page.
 *
 * You do not need to use this class directly.
 *
 * ### Extending exporter
 *
 * ```javascript
 * class MyMultiPageVerticalExporter extends MultiPageVerticalExporter {
 *     // type is required for exporter
 *     static get type() {
 *         return 'mymultipageverticalexporter';
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
 *             exporters : [MyMultiPageVerticalExporter]
 *         }
 *     }
 * });
 *
 * // run export with the new exporter
 * gantt.features.pdfExport.export({ exporter : 'mymultipageverticalexporter' });
 * ```
 *
 * @classType multipagevertical
 * @feature
 * @extends Scheduler/feature/export/exporter/MultiPageVerticalExporter
 * @typings Scheduler/feature/export/exporter/MultiPageVerticalExporter -> Scheduler/feature/export/exporter/SchedulerMultiPageVerticalExporter
 */
export default class MultiPageVerticalExporter extends GanttExporterMixin(SchedulerMultiPageVerticalExporter) {

    static get $name() {
        return 'MultiPageVerticalExporter';
    }

    static get type() {
        return 'multipagevertical';
    }
}
