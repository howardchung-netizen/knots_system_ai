/**
 * Gantt Component
 */

// React libraries
import React, { useEffect, useRef } from 'react';
import { useParams } from "react-router-dom";
import SubscriptionsChecker from './SubscriptionsChecker';
import Task from '../lib/Task';
import { BryntumGantt, BryntumProjectModel } from '@bryntum/gantt-react';
import Gantt from './Gantt';
import '../lib/TasksLogList.js'
import moment from 'moment';
import { StringHelper, WidgetHelper }  from '@bryntum/gantt';


const ScreenGantt = props => {


  const params = useParams();
  const project = useRef();
  const gantt = useRef();

  function processError(event) {
    // error code
    const response = event.response,
            code = response && response.code;
    WidgetHelper.toast(response && response.message || 'Unknown error occurred');
  };

  const projectConfig = {
    // Let the Project know we want to use our own Task model with custom fields / methods
    taskModelClass: Task,

    transport: {
      load: {
        url: `${props.REACT_APP_TODO_HTTP_ENDPOINT}/gantt-chart/share/load`,
        params: {
          code: params.code,
        },
        method: 'POST',
        headers: {
          'authorization': `Bearer ${props.appToken}`,
        },
      },
    },

    autoLoad: true,

    // The State TrackingManager which the UndoRedo widget in the toolbar uses
    stm: {
      autoRecord: true
    },

    // This config enables response validation and dumping of found errors to the browser console.
    // It's meant to be used as a development stage helper only so please set it to false for production systems.
    validateResponse: false,

    readOnly: true,

    taskContextMenu: false,
    taskMenuShow: false,

    listeners: {
      loadFail : processError,
      load() {
        gantt.current.instance.expandAll();
      }
    },
  }

  // endregion

  const ganttConfig = {

    dependencyIdField: 'wbsCode',

    columns: [
      // { type: 'wbs' },
      {
        type: 'name', width: 250, text: 'Task', hideable: true,
        leafIconCls: null,
        renderer: ({ record }) => {
          let returnEle = {
            children: [
              {
                tag: 'span',
                html: StringHelper.encodeHtml(
                  props.language ? props.language === 'CHI' ? record.name : record.nameEng : record.name
                  )
              }]
          }
          return returnEle;
        }

      },
      //{ type: 'statuscolumn' },
      { type: 'startdate', text: 'Start', format: 'DD-MM-YYYY', width: 100 },
      {
        type: 'enddate', text: 'Due', width: 100,
        renderer: ({ record }) =>
          `${moment(record.endDate).subtract(1, "days").format("DD-MM-YYYY")}`
      },
      {
        type: 'duration', text: 'Days', align: 'center', width: 80,
        renderer: ({ record }) => `${record.duration}`
      },
      { type: 'percentdone', text: 'Progress', showCircle: true, align: 'center', width: 80 },
      // { type: 'resourceassignment', text: 'Assigned', width: 120, 
      //   showAvatars: false,
      //   itemTpl : (assignment) => {
      //     const { resource } = assignment;
      //     const outputName = resource.name.match(/\b(\w)/g).length > 1 ? resource.name.match(/\b(\w)/g).slice(0,2).join('') : resource.name.substring(0,2);
      //     return `<div class="b-resource-avatar b-resource-initials" style="padding:0">${outputName}</div>`;
      //   }
      // },
      { type: 'constrainttype', text: 'Constrain' },
      { type: 'constraintdate', text: 'Constrain Date', format: 'DD-MM-YYYY' },
    ],

    subGridConfigs: {
      locked: {
        flex: 3
      },
      normal: {
        flex: 4
      }
    },

    columnLines: true,

    rollupsFeature: {
      disabled: true
    },
    baselinesFeature: {
      disabled: true
    },
    progressLineFeature: {
      disabled: true,
      statusDate: new Date(2019, 0, 25)
    },
    filterFeature: false,
    dependencyEditFeature: false,
    timeRangesFeature: {
      showCurrentTimeLine: true
    },
    labelsFeature: {
      left: {
        field: props.language ? props.language === 'CHI' ? 'name' : 'nameEng' : 'name',
      },
      //right: rightLabel
    },
    projectLinesFeature: false,

    viewPreset: 'weekAndDayLetter',


    features: {
      taskMenu: {
        disabled: true,
      },
      taskEdit: {
        disabled: true,
      }
    },

    showTooltip: false,

    readOnly: true,

    taskContextMenu: false,
    taskMenuShow: false,

  };

  return (
    <div style={{height: '100vh'}}>
      <BryntumProjectModel
        {...projectConfig}
        ref={project}
      />
      <div className='b-widget b-grid-header b-grid-header-text' 
      style={{justifyContent: 'space-between',flexDirection: 'row',padding:'8px 12px',height:45,borderBottom:'1px solid #f3f3f3', alignItems:'center'}}>
        <div className="b-grid-header-text-content">
          <i className="b-fa b-fa-circle"></i>{props.projectName}
        </div>
        <div>
          <img src={`/cms/rs/img/logo.svg`} style={{width:100}}></img>
        </div>
      </div>
      <Gantt ganttRef={gantt} appUUID={props.appUUID} project={project} {...ganttConfig} readOnly={true} 
       REACT_APP_KQS_SHARE_LINK={props.REACT_APP_KQS_SHARE_LINK} projectId={params.projectId}
       REACT_APP_TODO_HTTP_ENDPOINT={props.REACT_APP_TODO_HTTP_ENDPOINT}
      />
      <SubscriptionsChecker gantt={gantt} project={project} appUUID={props.appUUID} />
    </div>
  )
};

export default ScreenGantt;
