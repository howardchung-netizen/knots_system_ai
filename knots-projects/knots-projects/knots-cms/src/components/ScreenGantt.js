/**
 * Gantt Component
 */

// React libraries
import React, { useCallback, useRef, useState } from 'react';
import { useParams } from "react-router-dom";
import SubscriptionsChecker from './SubscriptionsChecker';
import Task from '../lib/Task';
import { BryntumProjectModel } from '@bryntum/gantt-react';
import Gantt from './Gantt';
import '../lib/TasksLogList.js'
import moment from 'moment';
import * as uuid from 'uuid';

import {StringHelper, WidgetHelper} from '@bryntum/gantt';

const ScreenGantt = props => {
  const appUUID = uuid.v4();
  const params = useParams();
  const queryParam = new URLSearchParams(window.location.search);
  const projectName = queryParam.get('projectName')
  const project = useRef();
  const gantt = useRef();

  const sendHeightToParent = () => {
    // const height = document.body.querySelector('#container').offsetHeight;
    // console.log("height", height)
    // window.parent.postMessage({ height }, '*'); // '*' 允许将消息发布到任何源
  };

  function processErrorLoad(event) {
    // error code
    const response = event.response,
            code = response && response.code;
            console.log('error');
    WidgetHelper.toast(response && response.message || 'Load Data: Unknown error occurred');
  };

  function processErrorSave(event) {
    // error code
    const response = event.response,
            code = response && response.code;
            console.log('error', response, event);
    WidgetHelper.toast(response && response.message || 'Sync Data: Unknown error occurred');
  };

  const projectConfig = {
    // Let the Project know we want to use our own Task model with custom fields / methods
    taskModelClass: Task,

    transport: {
      load: {
        url: `${props.REACT_APP_TODO_HTTP_ENDPOINT}/gantt-chart/load2`,
        params: {
          project: params.projectId,
        },
        method: 'POST',
        headers: {
          'authorization': `Bearer ${props.appToken}`
        },
      },
      sync: {
        url: `${props.REACT_APP_TODO_HTTP_ENDPOINT}/gantt-chart/sync2`,
        params: {
          project: params.projectId,
          appUUID: appUUID
        },
        method: 'POST',
        headers: {
          'authorization': `Bearer ${props.appToken}`
        },
      },
    },
    autoLoad: true,
    autoSync: true,

    // The State TrackingManager which the UndoRedo widget in the toolbar uses
    stm: {
      autoRecord: true
    },

    // This config enables response validation and dumping of found errors to the browser console.
    // It's meant to be used as a development stage helper only so please set it to false for production systems.
    validateResponse: false,

    listeners: {
      load: {
        prio : 3000,
        fn: () => { 
          sendHeightToParent()
        }
      },
      // listen to load request errors
      loadFail : processErrorLoad,
      // listen to sync request errors
      syncFail : processErrorSave
    },
  }

  // region Label configs
  const
    rightLabel = {
      renderer({ taskRecord }) {
        return taskRecord.resources.map((resource, i) => (
          ' ' + resource.name
        ));
      }
    }

  // endregion

  const headerTpl = (projectName = projectName) => `
    <div class="b-widget b-grid-header b-grid-header-text"
      style="justify-content:space-between;flex-direction:row;padding:8px 12px;height:45;border-bottom:1px solid #f3f3f3; align-items:center;">
        <div class="b-grid-header-text-content">
          <i class="b-fa b-fa-circle"></i>${projectName}
        </div>
        <div>
          <img src="${props.REACT_APP_KQS_HTTPS_ENDPOINT}/cms/rs/img/knots_logo.png" style="width:117px;height:30px;"></img>
        </div>
      </div>`;

  const ganttConfig = {

    tbar: { type: 'gantttoolbar' },

    dependencyIdField: 'wbsCode',

    pdfExportFeature: {
      exportServer: `${props.REACT_APP_TODO_HTTP_ENDPOINT}/gantt-chart/exportPDF/`,
      // Development config
      translateURLsToAbsolute: `${props.REACT_APP_KQS_HTTPS_ENDPOINT}/cms/rs/css/`, // Trailing slash is important
      headers: {
        'authorization': `Bearer ${props.appToken}`
      },
      keepPathName: false,
      headerTpl,
      fileName: `${projectName}-${moment().format('YYYY-MM-DD')}`,
    },

    // startDate               : '2019-01-12',
    // endDate                 : '2019-03-24',
    resourceImageFolderPath: 'users/',
    columns: [
      // { type: 'wbs' },
      {
        type: 'name', width: 250, text: 'Task', hideable: true,
        leafIconCls: null,
        renderer: ({ record }) => {
          let statusClass = 'progressStage';
          if (record.isCompleted) {
            statusClass = 'taskComplete';
          }
          let returnEle = {
            children: [
              {
                tag: 'span',
                html: StringHelper.encodeHtml(record.name)
              }]
          }
          if (!record.children) returnEle.children.unshift({
            class: 'b-actions',
            children: [
              {
                tag: 'span',
                className: `progressComplete ${statusClass}`,
                style: {
                  marginRight: 5,
                }
              },

            ]
          });
          return returnEle;
        }

      },
      { type: 'nameEngColumn', text: 'Task Eng', width: 200 },
      { type: 'startdate', text: 'Start', format: 'DD-MM-YYYY', width: 100 },
      { type: 'enddate', text: 'Due', width: 100,
        renderer: ({ record }) =>
          `${moment(record.endDate).subtract(1, "days").format("DD-MM-YYYY")}`
      },
      {
        type: 'duration', text: 'Days', align: 'center', width: 80,
        renderer: ({ record }) => `${record.duration}`
      },
      { type: 'percentdone', text: 'Progress', showCircle: true, align: 'center', width: 80 },
      { type: 'resourceassignment', text: 'Assigned', width: 120,
        showAvatars: false,
        itemTpl : (assignment) => {
          const { resource } = assignment;
          const outputName = resource.name.match(/\b(\w)/g).length > 1 ? resource.name.match(/\b(\w)/g).slice(0,2).join('') : resource.name.substring(0,2);
          return `<div class="b-resource-avatar b-resource-initials" style="padding:0">${outputName}</div>`;
        }
      },
      { type: 'stylecolumn', text: 'Color', width: 80 },
      { type: 'constrainttype', text: 'Constrain' },
      { type: 'constraintdate', text: 'Constrain Date', format: 'DD-MM-YYYY' },
    ],

    async onCellClick({ target, record, event }) {
      switch (target.classList[0]) {
        case 'progressComplete':
          this.taskStore.getById(record.id).percentDone = record.isCompleted?0:100;
          await this.project.propagateAsync();
          break;
        default:
          break;
      }
    },

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
    filterFeature: true,
    dependencyEditFeature: true,
    timeRangesFeature: {
      showCurrentTimeLine: true
    },
    labelsFeature: {
      left: {
        field: props.language ? props.language === 'CHI' ? 'name' : 'nameEng' : 'name',
        editor: {
          type: 'textfield'
        }
      },
      right: rightLabel
    },
    projectLinesFeature: false,

    viewPreset: 'weekAndDayLetter',

    // features: {
    //   taskEdit: {
    //     items: {
    //       generalTab: {},
    //       // add custom Resources tab to the third position
    //       // resourcesTab: {
    //       //   title: 'Subscribers',
    //       //   items: {
    //       //     grid:{
    //       //       columns:{
    //       //         data:{
    //       //           resource: {
    //       //             text:'Subscribers'
    //       //           }
    //       //         }
    //       //       }
    //       //     }
    //       //   }
    //       // },
    //       tasksLogTab: {
    //         type   : 'tasksLogList',
    //         title  : 'Tasks Log',
    //         weight: 550,
    //       },
    //     },
    //     editorConfig : {
    //       // Custom height of the Task Editor
    //       width : '50em'
    //     }
    //   },
    // },

    //loadMask: null,
    syncMask: null,
    // autoHeight: true,
    height: 'calc(100vh - 120px)',
    // maxHeight: '1000px',

  };

  const ProjectModal = useCallback(() => {
    return (
      <>
         <BryntumProjectModel
        {...projectConfig}
        ref={project}
      />
      <div className='b-widget b-grid-header b-grid-header-text' 
      style={{justifyContent: 'space-between',flexDirection: 'row',padding:'8px 12px',height:45,borderBottom:'1px solid #f3f3f3', alignItems:'center'}}>
        <div className="b-grid-header-text-content">
          <i className="b-fa b-fa-circle"></i>{projectName}
        </div>
        <div>
          <img src={`/cms/rs/img/logo.svg`} style={{width:100}}></img>
        </div>
      </div>
      <Gantt ganttRef={gantt} appUUID={appUUID} project={project} {...ganttConfig}
        REACT_APP_KQS_SHARE_LINK={props.REACT_APP_KQS_SHARE_LINK} projectId={params.projectId}
        REACT_APP_TODO_HTTP_ENDPOINT={props.REACT_APP_TODO_HTTP_ENDPOINT}
      />
      <SubscriptionsChecker gantt={gantt} project={project} appUUID={appUUID} />
      </>
    )
  });
  
  return (
    <>
     <ProjectModal />
    </>
  )
};

export default ScreenGantt;
