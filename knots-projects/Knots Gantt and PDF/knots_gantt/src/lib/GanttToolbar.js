import {
  Toolbar,
  Toast,
  DateHelper,
  CSSHelper,
} from '@bryntum/gantt';
const { unescape } = require('underscore');

/**
 * @module GanttToolbar
 */

/**
 * @extends Core/widget/Toolbar
 */
export default class GanttToolbar extends Toolbar {
  // Factoryable type name
  static get type() {
    return 'gantttoolbar';
  }

  static get $name() {
    return 'GanttToolbar';
  }

  // Called when toolbar is added to the Gantt panel
  set parent(parent) {
    super.parent = parent;

    const me = this;

    this.assignedFilter = 'all';
    this.assignedLastClicked = 'all';

    me.gantt = parent;

    // parent.project.on({
    //     load: me.onAfterLoadSync,
    //     sync: me.onAfterLoadSync,
    //     thisObj : me
    // });

    me.styleNode = document.createElement('style');
    document.head.appendChild(me.styleNode);

  }

  get parent() {
    return super.parent;
  }

  static get configurable() {
    return {
      items: [
        {
          style: {
            justifyContent: 'space-between',
            width: '100%',
          },
          type: 'buttonGroup',
          items: [
            {
              type: 'buttonGroup',
              style: {
                gap: '20px',
              },
              items: [
                {
                  //color: 'b-green',
                  ref: 'addTaskButton',
                  icon: 'b-fa b-fa-plus',
                  text: 'Create',
                  tooltip: 'Create new task',
                  style: {
                    border: '1px solid #ebebeb',
                    borderRadius: 4,
                  },
                  onAction: 'up.onAddTaskClick'
                },
                {
                  ref   : 'undoRedo',
                  type  : 'undoredo',
                  items : {
                      transactionsCombo : null
                  }
                },
                {
                  type: 'textfield',
                  ref: 'filterByName',
                  cls: 'filter-by-name',
                  flex: '0 0 12.5em',
                  // Label used for material, hidden in other themes
                  //label: 'Find tasks by name',
                  // Placeholder for others
                  placeholder: 'Search',
                  clearable: true,
                  keyStrokeChangeDelay: 100,
                  style: {
                    paddingTop: 2
                  },
                  // triggers: {
                  //   filter: {
                  //     align: 'end',
                  //     cls: 'b-fa b-fa-filter'
                  //   }
                  // },
                  onChange: 'up.onFilterChange'
                },
                {
                  type  : 'datefield',
                  ref   : 'startDateField',
                  label : 'Project start',
                  // required  : true, (done on load)
                  flex      : '0 0 8em',
                  listeners : {
                      change : 'up.onStartDateChange'
                  }
                }
              ],
            },
            {
              type: 'buttonGroup',
              items: [
                {
                  ref: 'previousButton',
                  icon: 'b-fa b-fa-angle-left',
                  tooltip: 'Previous time span',
                  onAction: 'up.onShiftPreviousClick'
                },
                {
                  ref: 'nextButton',
                  icon: 'b-fa b-fa-angle-right',
                  tooltip: 'Next time span',
                  onAction: 'up.onShiftNextClick'
                },
                {
                  ref: 'zoomInButton',
                  icon: 'b-far b-fa-search-plus',
                  tooltip: 'Zoom in',
                  onAction: 'up.onZoomInClick'
                },
                {
                  ref: 'zoomOutButton',
                  icon: 'b-fa b-fa-search-minus',
                  tooltip: 'Zoom out',
                  onAction: 'up.onZoomOutClick'
                },
                {
                  ref: 'zoomToFitButton',
                  icon: 'b-fa b-fa-arrows-alt',
                  tooltip: 'Zoom to fit',
                  onAction: 'up.onZoomToFitClick'
                },
                {
                  ref: 'criticalPathsButton',
                  icon: 'b-fa-solid b-fa-wave-square',
                  tooltip: 'Highlight critical paths',
                  onAction: 'up.onCriticalPathsClick',
                  toggleable: true
                },
                {
                  feature: 'baselines',
                  icon: 'b-fa b-fa-layer-group',
                  tooltip: 'Show baselines',
                  checked: false,
                  toggleable: true
                },
                {
                  type: 'button',
                  ref: 'assignedButton',
                  icon: 'b-fa b-fa-user-friends',
                  text: 'All',
                  tooltip: 'Assigned',
                  toggleable: true,
                  menu: {
                    onItem: 'up.onAssignedClick',
                    onBeforeShow: 'up.onAssignedShow',
                    items: [
                      {
                        text: 'All',
                        value: 'all',
                        checked: true
                      },
                      // {
                      //   text: 'Unasigned',
                      //   value: 'unasigned',
                      //   checked: false
                      // },
                    ]
                  }
                },
                {
                  type: 'button',
                  ref: 'colorButton',
                  icon: 'b-fa b-fa-circle',
                  text: 'All',
                  tooltip: 'Color',
                  toggleable: true,
                  menu: {
                    onItem: 'up.onColorClick',
                    onBeforeShow: 'up.onColorShow',
                    items: [
                      {
                        text: 'All',
                        value: 'all',
                        checked: true
                      },
                      {
                        text: 'Yellow',
                        value: 'background:#FFEB3B;',
                        checked: false
                      },
                      {
                        text: 'Orange',
                        value: 'background:#FF9966;',
                        checked: false
                      },
                      {
                        text: 'Red',
                        value: 'background:#E74C3C;',
                        checked: false
                      },
                      {
                        text: 'Purple',
                        value: 'background:#8E44AD;',
                        checked: false
                      },
                      {
                        text: 'Gray',
                        value: 'background:#BDC3C7;',
                        checked: false
                      },
                    ]
                  }
                },
                {
                  type: 'button',
                  ref: 'languageButton',
                  icon: 'b-fa b-fa-language',
                  text: '',
                  tooltip: 'Language',
                  onAction: 'up.onLanguageClick'
                },
                {
                  type: 'button',
                  ref: 'settingsButton',
                  icon: 'b-fa b-fa-ellipsis-v',
                  text: '',
                  tooltip: 'Others',
                  toggleable: false,
                  menu: {
                    onItem: 'up.onFeaturesClick',
                    onBeforeShow: 'up.onFeaturesShow',
                    items: [
                      {
                        text: 'Draw dependencies',
                        feature: 'dependencies',
                        checked: false
                      },
                      // {
                      //     text    : 'Task labels',
                      //     feature : 'labels',
                      //     checked : true
                      // },
                      {
                        text: 'Project lines',
                        feature: 'projectLines',
                        checked: false
                      },
                      {
                        text: 'Highlight non-working time',
                        feature: 'nonWorkingTime',
                        checked: false
                      },
                      // {
                      //     text    : 'Enable cell editing',
                      //     feature : 'cellEdit',
                      //     checked : false
                      // },
                      // {
                      //     text    : 'Show baselines',
                      //     feature : 'baselines',
                      //     checked : false
                      // },
                      // {
                      //     text    : 'Show rollups',
                      //     feature : 'rollups',
                      //     checked : false
                      // },
                      {
                        text: 'Show progress line',
                        feature: 'progressLine',
                        checked: false
                      },
                      {
                        text: 'Hide schedule',
                        subGrid: 'normal',
                        checked: false
                      },
                      {
                        ref: 'collapseAllButton',
                        icon: 'b-fa b-fa-compress-alt',
                        cls: 'b-separator',
                        text: 'Collapse all',
                        tooltip: 'Collapse all',
                        onclick: 'up.onCollapseAllClick',
                        collapse: true,
                      },
                      {
                        ref: 'expandAllButton',
                        icon: 'b-fa b-fa-expand-alt',
                        text: 'Expand all',
                        tooltip: 'Expand all',
                        onAction: 'up.onExpandAllClick',
                        expand: true,
                      },
                      {
                        ref: 'exportButton',
                        icon: 'b-fa b-fa-file-pdf',
                        text: 'Export to PDF/PNG',
                        tooltip: 'Export',
                        onAction: 'up.onExportClick',
                        export: true
                      },
                      {
                        ref: 'shareButton',
                        icon: 'b-fa b-fa-share',
                        text: 'Share',
                        tooltip: 'Share',
                        share: true,
                      },
                      {
                        ref: 'columnButton',
                        icon: 'b-fa b-fa-user-cog',
                        text: 'Column Config',
                        tooltip: 'Column Config',
                        columnConfig: true,
                      },
                      {
                        ref: 'calendarButton',
                        icon: 'b-fa b-fa-calendar',
                        text: 'Calendar Day Setup',
                        tooltip: 'Calendar Day Setup',
                        calendar: true,
                      }
                    ]
                  }
                },
              ]
            },
          ],

        },
      ]
    };
  }

  // Called when toolbar is added to the Gantt panel
  updateParent(parent, was) {
    super.updateParent(parent, was);

    this.gantt = parent;

    parent.project.on({
      load: 'loadProject',
      refresh: 'updateAssignedField',
      thisObj: this
    });
  }

  setAnimationDuration(value) {
    const me = this,
      cssText = `.b-animating .b-gantt-task-wrap { transition-duration: ${value / 1000
        }s !important; }`;

    me.gantt.transitionDuration = value;

    if (me.transitionRule) {
      me.transitionRule.cssText = cssText;
    } else {
      me.transitionRule = CSSHelper.insertRule(cssText);
    }
  }

  updateStartDateField() {
    const { startDateField } = this.widgetMap;

    startDateField.value = this.gantt.project.startDate;

    // This handler is called on project.load/propagationComplete, so now we have the
    // initial start date. Prior to this time, the empty (default) value would be
    // flagged as invalid.
    startDateField.required = true;
  }

  loadProject() {
    const { startDateField } = this.widgetMap;

    startDateField.value = this.gantt.project.startDate;

    // This handler is called on project.load/propagationComplete, so now we have the
    // initial start date. Prior to this time, the empty (default) value would be
    // flagged as invalid.
    startDateField.required = true;

    const { assignedButton } = this.widgetMap;

    assignedButton.menu.removeAll()
    assignedButton.menu.add({
      text: 'All',
      value: 'all',
      checked: true
    });

    let keys = {};
    this.gantt.project.assignmentStore.allRecords.map(e => {
      keys[`id_${e.resourceId}`] = { text: e.resourceName, value: e.resourceName, checked: false };
    });
    Object.keys(keys).map(key => {
      assignedButton.menu.add({
        text: keys[key].text,
        value: keys[key].value,
        checked: false
      });
    });

    this.gantt.expandAll();
  }

  updateAssignedField() {
    const { startDateField } = this.widgetMap;

    startDateField.value = this.gantt.project.startDate;

    // This handler is called on project.load/propagationComplete, so now we have the
    // initial start date. Prior to this time, the empty (default) value would be
    // flagged as invalid.
    startDateField.required = true;
    
    const { assignedButton } = this.widgetMap;

    assignedButton.menu.removeAll()
    assignedButton.menu.add({
      text: 'All',
      value: 'all',
      checked: true
    });
    let keys = {};
    this.gantt.project.assignmentStore.allRecords.map(e => {
      keys[`id_${e.resourceId}`] = { text: e.resourceName, value: e.resourceName, checked: false };
    });
    Object.keys(keys).map(key => {
      assignedButton.menu.add({
        text: keys[key].text,
        value: keys[key].value,
        checked: false
      });
    });
  }

  onAssignedShow({ source: menu }) {
    menu.items.map(item => {
      const { value } = item;
      item.checked = this.assignedFilter === value ? true : false;
    });
  }

  async onAssignedClick({ source: menu }) {

    const { assignedButton } = this.widgetMap;

    assignedButton.text = menu.text;

    this.assignedFilter = menu.value;

    assignedButton.menu.items.map(item => {
      const { value } = item;
      item.checked = this.assignedLastClicked === value ? false : true;
      item.checked = menu.value === value ? true : false;
    });

    this.assignedLastClicked = this.assignedFilter;

    if (menu.value === 'all') {
      this.gantt.taskStore.clearFilters();
    } else if (menu.value === 'unasigned') {

    } else {
      this.gantt.taskStore.filter({
        filters: task =>
          task.resources.some(el => el.name === menu.text),
        replace: true
      });
    }

    //assignedButton.menu.hide();
  }

  async onColorClick({ source: menu }) {

    const { colorButton } = this.widgetMap;

    colorButton.text = menu.text;

    this.colorFilter = menu.value;

    colorButton.menu.items.map(item => {
      const { value } = item;
      item.checked = this.colorLastClicked === value ? false : true;
      item.checked = menu.value === value ? true : false;
    });

    this.colorLastClicked = this.colorFilter;

    if (menu.value === 'all') {
      this.gantt.taskStore.clearFilters();
    } else {
      this.gantt.taskStore.filter({
        filters: task =>
          task.style && (task.style === menu.value),
        replace: true
      });
    }

    //assignedButton.menu.hide();
  }

  // region controller methods

  async onAddTaskClick() {
    const { gantt } = this,
      added = gantt.taskStore.rootNode.appendChild({
        name: 'New task',
        duration: 1
      });

    // run propagation to calculate new task fields
    await gantt.project.propagateAsync();

    // scroll to the added task
    await gantt.scrollRowIntoView(added);

    gantt.features.cellEdit.startEditing({
      record: added,
      field: 'name'
    });
  }


  onEditTaskClick() {
    const { gantt } = this;

    if (gantt.selectedRecord) {
      gantt.editTask(gantt.selectedRecord);
    } else {
      Toast.show('First select the task you want to edit');
    }
  }

  onExpandAllClick() {
    this.gantt.expandAll();
  }

  onCollapseAllClick() {
    this.gantt.collapseAll();
  }

  onZoomInClick() {
    this.gantt.zoomIn();    
  }

  onZoomOutClick() {
    this.gantt.zoomOut();
  }

  onZoomToFitClick() {
    this.gantt.zoomToFit({
      leftMargin: 50,
      rightMargin: 50
    });
  }

  onShiftPreviousClick() {
    this.gantt.shiftPrevious();
  }

  onShiftNextClick() {
    this.gantt.shiftNext();
  }

  onStartDateChange({ value, oldValue }) {
    if (!oldValue) {
      // ignore initial set
      return;
    }

    this.gantt.startDate = DateHelper.add(value, -1, 'week');

    this.gantt.project.setStartDate(value);
  }

  onFilterChange({ value }) {
    if (value === '') {
      this.gantt.taskStore.clearFilters();
    } else {
      value = value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

      this.gantt.taskStore.filter({
        filters: task =>
          task.name && task.name.match(new RegExp(value, 'i')),
        replace: true
      });
    }
  }

  onFeaturesClick({ source: item }) {
    const { gantt } = this;

    //console.log(gantt);

    if (item.feature) {
      const feature = gantt.features[item.feature];
      feature.disabled = !feature.disabled;
    } else if (item.subGrid) {
      const subGrid = gantt.subGrids[item.subGrid];
      subGrid.collapsed = !subGrid.collapsed;
    } else if (item.export) {
      this.gantt.features.pdfExport.showExportDialog();
    } else if (item.expand) {
      this.gantt.expandAll();
    } else if (item.collapse) {
      this.gantt.collapseAll();
    } else if (item.share) {
      this.gantt.extraData('share');
    } else if (item.calendar) {
      this.gantt.extraData('calendar');
    } else if (item.changeLanguage) {
      this.gantt.extraData('changeLanguage');
    } else if (item.columnConfig) {
      this.gantt.extraData('columnConfig');
    }

  }

  onFeaturesShow({ source: menu }) {
    const { gantt } = this;

    menu.items.map(item => {
      const { feature } = item;

      if (feature) {
        // a feature might be not presented in the gantt
        // (the code is shared between "advanced" and "php" demos which use a bit different set of features)
        if (gantt.features[feature]) {
          item.checked = !gantt.features[feature].disabled;
        }
        // hide not existing features
        else {
          item.hide();
        }
      } else if (item.subGrid) {
        item.checked = gantt.subGrids[item.subGrid].collapsed;
      }
      return item;
    });
  }

  onSettingsShow({ source: menu }) {
    const { gantt } = this,
      { rowHeight, barMargin, duration } = menu.widgetMap;

    rowHeight.value = gantt.rowHeight;
    barMargin.value = gantt.barMargin;
    barMargin.max = gantt.rowHeight / 2 - 5;
    duration.value = gantt.transitionDuration;
  }

  onSettingsRowHeightChange({ value }) {
    this.gantt.rowHeight = value;
    this.widgetMap.settingsButton.menu.widgetMap.barMargin.max =
      value / 2 - 5;
  }

  onSettingsMarginChange({ value }) {
    this.gantt.barMargin = value;
  }

  onSettingsDurationChange({ value }) {
    this.gantt.transitionDuration = value;
    this.styleNode.innerHTML = `.b-animating .b-gantt-task-wrap { transition-duration: ${value / 1000
      }s !important; }`;
  }

  onCriticalPathsClick({ source }) {
    this.gantt.features.criticalPaths.disabled = !source.pressed;
  }

  onExportClick() {
    this.gantt.features.pdfExport.showExportDialog();
  }

  onLanguageClick() {
    const urlParams = new URLSearchParams(window.location.search);
    const projectName = unescape(urlParams.get('project_name'));
    const { gantt } = this;
    //the url like /cms/gantt_chart/project/131?projectName=test%20project&language=chi
    //the url like /cms/gantt_chart/project/131?projectName=test%20project&language=eng
    if (gantt.features.labels.initialConfig.left.field === 'name') {
      //eng
      window.location.href = window.location.origin + '/cms/gantt_chart/project/' + window.location.pathname.split('/').pop() + '?projectName=' + encodeURIComponent(projectName) + '&language=eng';
    } else {
      //chi
      window.location.href = window.location.origin + '/cms/gantt_chart/project/' + window.location.pathname.split('/').pop() + '?projectName=' + encodeURIComponent(projectName) + '&language=chi';
    }
  }

}

// Register this widget type with its Factory
GanttToolbar.initClass();
