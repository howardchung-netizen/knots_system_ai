import Column from '../../Grid/column/Column.js';
import ColumnStore from '../../Grid/data/ColumnStore.js';
import AssignmentField from '../widget/AssignmentField.js';
import ChipView from '../../Core/widget/ChipView.js';
import '../../Core/widget/NumberField.js';
import AvatarRendering from '../../Core/widget/util/AvatarRendering.js';
import StringHelper from '../../Core/helper/StringHelper.js';

/**
 * @module Gantt/column/ResourceAssignmentColumn
 */

const resourceNameRegExp = a => a.resourceName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Column allowing resource manipulation (assignment/unassignment/units changing) on a task. In the column cells,
 * assignments are either shown as badges or avatars. To show avatars, set {@link #config-showAvatars} to `true`. When
 * showing avatars there are two options for how to specify image paths:
 *
 * * You may provide a {@link Gantt.view.Gantt#config-resourceImageFolderPath} on your Gantt panel pointing to where
 *   resource images are located. Set the resource image filename in the `image` field of the resource data.
 * * And/or you may provide an `imageUrl` on your record, which then will take precedence when showing images.
 *
 * If a resource has no name, or its image cannot be loaded, the resource initials are rendered. If the resource has
 * an {@link Scheduler/model/mixin/ResourceModelMixin#field-eventColor} specified, it will be used as the background
 * color of the initials.
 *
 * Default editor is a {@link Gantt.widget.AssignmentField AssignmentField}.
 *
 * ## Customizing displayed elements
 *
 * If {@link #config-showAvatars} is false, column will render resource name and utilization wrapped in a
 * small element called _a chip_. Content of the chip can be customized. For example, if you don't want to see percent
 * value, or want to display different resource name, you can specify an {@link #config-itemTpl} config. Please keep in
 * mind that when you start editing the cell, chip will be rendered by the default editor. If you want chips to be
 * consistent, you need to customize the editor too.
 *
 * ```javascript
 * new Gantt({
 *     columns: [
 *         {
 *             type     : 'resourceassignment',
 *             itemTpl  : (assignment) => assignment.resourceName,
 *             editor   : {
 *                 chipView : {
 *                     itemTpl : (assignment) => assignment.resourceName
 *                 }
 *             }
 *         }
 *     ]
 * });
 * ```
 *
 * {@inlineexample Gantt/column/ResourceAssignment.js}
 *
 * @extends Grid/column/Column
 * @classType resourceassignment
 */
export default class ResourceAssignmentColumn extends Column {
    internalCellCls = 'b-resourceassignment-cell';

    static get $name() {
        return 'ResourceAssignmentColumn';
    }

    static get type() {
        return 'resourceassignment';
    }

    static get isGanttColumn() {
        return true;
    }

    static get fields() {
        return [
            /**
             * True to show a resource avatar for every assignment. Note that you also have to provide a {@link Gantt.view.Gantt#config-resourceImageFolderPath} for where to load images from.
             * And/or you may provide an `imageUrl` on your record, which then will take precedence when showing images.
             * @config {Boolean} showAvatars
             * @category Common
             */
            'showAvatars',

            'sideMargin',

            /**
             * A function which produces the content to put in the resource assignment cell.
             * May be overridden in subclasses, or injected into the column
             * to customize the Chip content.
             *
             * Defaults to returning `${assignment.resourceName} ${assignment.units}%`
             *
             * @param {Gantt.model.AssignmentModel} assignment The assignment
             * @param {Number} index The index - zero based.
             * @config {Function} itemTpl
             * @category Rendering
             */
            {
                name         : 'itemTpl',
                defaultValue : assignment => StringHelper.encodeHtml(assignment.toString())
            },

            /**
             * A function which receives data about the resource and returns a html string to be displayed in the tooltip.
             *
             * ```javascript
             * const gantt = new Gantt({
             *     columns : [
             *          {
             *              type          : 'resourceassignment',
             *              showAvatars : true,
             *              avatarTooltipTemplate({ resourceRecord }) {
             *                  return `<b>${resourceRecord.name}</b>`;
             *              }
             *          }
             *     ]
             * });
             * ```
             *
             * This function will be called with an object containing the fields below:
             *
             * @param {Object} data
             * @param {Gantt.model.TaskModel} data.taskRecord Hovered task
             * @param {Gantt.model.ResourceModel} data.resourceRecord Hovered resource
             * @param {Gantt.model.AssignmentModel} data.assignmentRecord Hovered assignment
             * @param {Number} data.overflowCount Number of overflowing resources, only valid for last shown resource
             * @config {Function} avatarTooltipTemplate
             */
            'avatarTooltipTemplate',

            { name : 'avatarMaxSize', defaultValue : 50 }
        ];
    }

    static get defaults() {
        return {
            field         : 'assignments',
            instantUpdate : false,
            text          : 'L{Assigned Resources}',
            width         : 250,
            cellCls       : 'b-resourceassignment-cell',
            showAvatars   : false,
            sideMargin    : 20,
            sortable(task1, task2) {
                const
                    a1 = task1.assignments.join(''),
                    a2 = task2.assignments.join('');

                if (a1 === a2) {
                    return 0;
                }
                return a1 < a2 ? -1 : 1;
            },

            filterable({ value, record }) {
                // We're being passed an array of Assignments
                if (Array.isArray(value)) {
                    // Shortcut if we're matching no assignments.
                    if (!value.length) {
                        return Boolean(!record.assignments.length);
                    }
                    // Create a multi resource name Regexp, eg /Macy|Lee|George/.
                    value = value.map(resourceNameRegExp).join('|');
                }
                const regexp = new RegExp(value, 'gi');

                return record.assignments.some(assignment => regexp.test(assignment.resourceName));
            }
        };
    }

    construct() {
        super.construct(...arguments);

        const
            me       = this,
            { grid } = me;

        if (me.showAvatars) {
            Object.assign(me, {
                repaintOnResize : true,
                htmlEncode      : false,
                renderer        : me.rendererWithAvatars,
                avatarRendering : new AvatarRendering({
                    element : grid.element,
                    tooltip : {
                        forSelector : '.b-resourceassignment-cell .b-resource-avatar',
                        listeners   : {
                            beforeShow({ source : tip }) {
                                const
                                    {
                                        taskRecord,
                                        resourceRecord,
                                        assignmentRecord,
                                        overflowCount
                                    }       = tip.activeTarget.elementData,
                                    tooltip = StringHelper.xss`${assignmentRecord.toString()}${overflowCount ? ` (+${overflowCount} ${me.L('L{more resources}')})` : ''}`;

                                tip.html = me.avatarTooltipTemplate?.({
                                    taskRecord, resourceRecord, assignmentRecord, overflowCount
                                }) ?? tooltip;
                            }
                        }
                    }
                })
            });
        }

        grid.on({
            beforeCellEditStart : me.onBeforeCellEditStart,
            finishCellEdit      : me.onDoneCellEdit,
            cancelCellEdit      : me.onDoneCellEdit,
            thisObj             : me
        });

        if (me.showAvatars) {
            grid.on({
                beforeRenderRows : me.calculateAvatarSize,
                once             : true,
                thisObj          : me
            });

            grid.rowManager.on({
                beforeRowHeight : me.calculateAvatarSize,
                thisObj         : me
            });
        }

        grid.resourceStore.on({
            name    : 'resourceStore',
            update  : me.onResourceUpdate,
            thisObj : me
        });
    }

    calculateAvatarSize() {
        const
            { grid }        = this,
            { cellElement } = grid.beginGridMeasuring();

        cellElement.classList.add(this.internalCellCls);

        const
            cellStyles = window.getComputedStyle(cellElement),
            padding    = parseInt(cellStyles.paddingTop, 10);

        this.avatarRendering.size = Math.min(this.avatarMaxSize, grid.rowHeight - (2 * padding));

        cellElement.classList.remove(this.internalCellCls);
        grid.endGridMeasuring();
    }

    doDestroy() {
        super.doDestroy();

        this.avatarRendering?.destroy();
    }

    get defaultEditor() {
        return {
            type  : AssignmentField.type,
            store : {
                modelClass : this.grid.project.assignmentStore.modelClass
            }
        };
    }

    onBeforeCellEditStart({ editorContext : { record, column } }) {
        const me = this;

        if (column === me) {
            const { editor } = me;

            editor.resourceImageFolderPath = me.grid.resourceImageFolderPath;
            editor.projectEvent            = record;

            me.detachListeners('editorStore');

            editor.store.on({
                name           : 'editorStore',
                changesApplied : me.onEditorChangesApplied,
                thisObj        : me
            });
        }
    }

    onDoneCellEdit() {
        this.detachListeners('editorStore');
    }

    onEditorChangesApplied() {
        const
            me          = this,
            cellElement = me.grid.getCell({ id : me.editor.projectEvent.id, columnId : me.id });

        if (cellElement) {
            me.renderer({ value : me.editor.projectEvent.assignments, cellElement });
        }
    }

    onResourceUpdate({ source }) {
        // no need for this listener when the gantt is loading data
        if (!source.project?.propagatingLoadChanges) {
            this.grid.refreshColumn(this);
        }
    }

    get chipView() {
        const me = this;

        if (!me._chipView) {
            me._chipView = new ChipView({
                cls            : 'b-assignment-chipview',
                itemsFocusable : false,
                closable       : false,
                itemTpl        : me.itemTpl,
                store          : {},
                scrollable     : {
                    overflowX : 'hidden-scroll'
                }
            });
            // The List class only refreshes itself when visible, so
            // since this is an offscreen, rendering element
            // we have to fake visibility.
            Object.defineProperty(me.chipView, 'isVisible', {
                get() {
                    return true;
                }
            });
        }
        return me._chipView;
    }

    renderer({ cellElement, value, isExport }) {
        value = value.filter(a => a.resource)
            .sort((lhs, rhs) => lhs.resourceName.localeCompare(rhs.resourceName));

        if (isExport) {
            return value.map(this.itemTpl).join(',');
        }
        else {
            const { chipView } = this;

            chipView.store.storage.replaceValues({
                values : value,
                silent : true
            });

            chipView.refresh();
            const chipCloneElement = chipView.element.cloneNode(true);
            chipCloneElement.removeAttribute('id');

            cellElement.innerHTML = '<div class="b-assignment-chipview-wrap"></div>';
            cellElement.firstElementChild.appendChild(chipCloneElement);
        }
    }

    rendererWithAvatars({ record : taskRecord, value, isExport }) {
        const
            me            = this,
            { size }      = me.avatarRendering,
            nbrVisible    = Math.floor((me.width - me.sideMargin) / (size + 2)),
            overflowCount = value.length > nbrVisible ? value.length - nbrVisible : 0;

        value = value.filter(a => a.resource)
            .sort((lhs, rhs) => lhs.resourceName.localeCompare(rhs.resourceName));

        if (isExport) {
            return value.map(this.itemTpl).join(',');
        }

        return {
            className : 'b-resource-avatar-container',
            children  : value.map((assignmentRecord, i) => {
                const { resource : resourceRecord } = assignmentRecord;

                if (i < nbrVisible) {
                    const
                        isLastOverflowing = overflowCount > 0 && i === nbrVisible - 1,
                        imgConfig = me.renderAvatar({
                            taskRecord,
                            resourceRecord,
                            assignmentRecord,
                            overflowCount : isLastOverflowing ? overflowCount : 0
                        });

                    if (isLastOverflowing) {
                        return {
                            className : 'b-overflow-img',
                            style     : {
                                height : size + 'px',
                                width  : size + 'px'
                            },
                            children : [
                                imgConfig,
                                {
                                    tag       : 'span',
                                    className : 'b-overflow-count',
                                    html      : `+${overflowCount}`
                                }
                            ]
                        };
                    }

                    return imgConfig;
                }
            })
        };
    }

    renderAvatar({ taskRecord, resourceRecord, assignmentRecord, overflowCount }) {
        const
            {
                resourceImageFolderPath
            }        = this.grid,
            imageUrl = resourceRecord.imageUrl || resourceRecord.image && resourceImageFolderPath && (resourceImageFolderPath + resourceRecord.image),
            avatar   = this.avatarRendering.getResourceAvatar({
                initials        : resourceRecord.initials,
                color           : resourceRecord.eventColor,
                iconCls         : resourceRecord.iconCls,
                defaultImageUrl : this.defaultAvatar,
                imageUrl
            });

        // Some paths in avatarRendering does not yield elementData
        if (!avatar.elementData) {
            avatar.elementData = {};
        }

        Object.assign(avatar.elementData, { taskRecord, resourceRecord, assignmentRecord, overflowCount });

        return avatar;
    }

    get defaultAvatar() {
        const { grid } = this;

        return grid.defaultResourceImageName ? grid.resourceImageFolderPath + grid.defaultResourceImageName : '';
    }
}

ColumnStore.registerColumnType(ResourceAssignmentColumn);
