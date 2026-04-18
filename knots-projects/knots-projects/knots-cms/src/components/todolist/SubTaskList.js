import React, { useState, useEffect, useCallback, useContext, useMemo, useRef, createContext, useLayoutEffect } from 'react';

import { useQuery, useMutation, useApolloClient } from '@apollo/client';
import gql from 'graphql-tag';
import { taskListFragment, taskCreateFragment, userErrorFragment } from '../../apollo/fragment';
import { projectQuery, taskQuery } from '../../apollo/queries';
import { taskAssignProjectMutation, taskCreateMutation } from '../../apollo/mutations'
import { Mask, Splitter, Popup, LocaleManager, TabPanel, Panel, Combo, List } from '@bryntum/gantt';
import { BryntumGrid } from '@bryntum/gantt-react';

import { search } from '../../helper/search';
import moment from 'moment';
import * as uuid from "uuid";

import '../../lib/SpotlightColumn.js';
import SpotlightCombo from '../../lib/SpotlightCombo';
import { TaskUseQuery } from '../todolist/ToDoList';
export const SubTaskList = ({ appToken }) => {
 console.log("TaskList");
 const client = useApolloClient();
 const [selectedProject, setSelectedProject] = useState("my_tasks");
 let fakeProjectIdArr = ['my_tasks', 'no_project', 'all'];

 const setSelectedProjectID = (id) => {
   setSelectedProject(id);
 };



 const SubTasks = ({ data, refetch }) => {
   const rightGrid = useRef();
   const columns = useMemo(() =>
     [
       {
         type: "SpotlightColumn",
       },
       {
         field: 'name', text: '任務', width: '500px', cellCls: 'task-name-cell',
       },
       {
         field: 'status', text: '狀態', cellCls: 'task-status-cell',
         renderer: ({ value }) => {
           const Status = ({ status }) => {
             return (
               <div style={{ backgroundColor: statusOptions[status].backgroundColor, height: "100%", padding: "5px" }}>
                 <div style={{ fontWeight: "bold", color: statusOptions[status].color, display: "flex", alignItems: "center", height: "100%" }}>
                   {statusOptions[status].title}
                 </div>
               </div>
             )
           }
           return value ? <Status status={value} /> : null
         }
       },
       {
         field: 'dueDate', text: '結束日期', renderer: ({ value, record }) => {
           const dueDateColor = () => {
             let before = "red", after = "green", same = "orange"
             if (!record.data.dueDate) return "#f4f4f4"
             // "theme.colors.accent"
             switch (true) {
               case moment(record.data.dueDate).isBefore(moment().format('YYYY-MM-DD')):
                 return before
               case moment(record.data.dueDate).isSame(moment().format('YYYY-MM-DD')):
                 return same
               case moment(record.data.dueDate).isAfter(moment().format('YYYY-MM-DD')):
                 return after
             }
           }
           return (
             <div style={{ color: dueDateColor(), fontWeight: "bold" }}>
               {
                 record.data.dueDate ? moment(record.data.dueDate).format("YY-MM-DD") : null
               }
             </div>
           )
         }
       },
       {
         field: 'priority', text: '優先度', cellCls: 'task-priority-cell',
         renderer: ({ value, record }) => {
           let priorityOptions = {
             "-": {
               color: "#212121",
               title: "-"
             },
             HIGH: {
               color: "white",
               backgroundColor: "#d53465",
               title: "高"
             },
             MEDIUM: {
               color: "white",
               backgroundColor: "orange",
               title: "中"
             },
             LOW: {
               color: "white",
               backgroundColor: "#279d00",
               title: "低"
             }
           }
           return (
             <div className='task-priority-cell-wrap' style={{ backgroundColor: priorityOptions[value ?? '-'].backgroundColor, height: "100%", padding: "5px", width: "60px" }}>
               <div style={{ fontWeight: "bold", color: priorityOptions[value ?? '-'].color, display: "flex", alignItems: "center", height: "100%" }}>
                 {priorityOptions[value ?? '-'].title}
               </div>
             </div>
           )
         }
       },
     ]
     , [])
   const tasksEdges = useMemo(() => data.tasks.edges.map(e => { return e.node }), [data.tasks.edges]);
   const onAddTaskBtnClick = async () => {
     let tempUuid = uuid.v4();
     rightGrid.current.gridInstance.store.insert(0, { id: tempUuid, name: "New Task", status: "TODO", dueDate: null, priroity: null });
     await client.mutate({
       mutation: gql`${taskCreateMutation} ${taskCreateFragment} ${userErrorFragment}`,
       context: {
         headers: {
           authorization: `Bearer ${appToken}`
         }
       },
       variables: {
         data: {
           name: "New Task",
         }
       },
     }).then(res => {
       let tempItem = rightGrid.current.gridInstance.store.getById(tempUuid);
       tempItem.id = res.data.taskCreate.task.id;
       rightGrid.current.gridInstance.store.insert(0, res.data.taskCreate.task);
     }).catch(err => {
       alert("新增任務失敗...請重新最試一次");
       rightGrid.current.gridInstance.store.remove(tempUuid);
       refetch();
       console.log(err);
     })

     if (!fakeProjectIdArr.includes(selectedProject)) {
       await client.mutate({
         mutation: gql`${taskCreateMutation} ${taskCreateFragment} ${userErrorFragment}`,
         context: {
           headers: {
             authorization: `Bearer ${appToken}`
           }
         },
         variables: {
           data: {
             name: taskName,
           }
         },
       }).then(res => {
         console.log("taskAssignProject", res);
       }).catch(err => {
         console.log("taskAssignProject", err);
       })
     }
     return;
     let taskName = null;
     const onConfromClick = async (e) => {
      
     }
     const onTaskNameChange = ({ value }) => {
       taskName = value
     }
     const popup = new Popup({
       appendTo: document.getElementById('rightSide'),
       items: [
         { type: 'textfield', placeholder: '任務名稱', id: 'taskNameTextField', value: taskName, onChange: onTaskNameChange },
         { type: 'button', text: '確定', style: 'width: 100%', color: 'b-orange', onClick: onConfromClick }
       ],
       header: '新增任務',
       autoShow: false,
       centered: true,
       closeAction: 'destroy',
       closable: true,
       trapFocus: true,
       width: '40em',
     });
     popup.show();
   };
   const onCellDblClick = (e) => {
     let task = { ...e.record.data };
     let spotlightCombo = new SpotlightCombo({value: task.spotlight});
     const popup = new Popup({
       autoClose: false,
       header      : "編輯",
       autoShow    : false,
       centered    : true,
       closeAction : 'destroy',
       closable: true,
       // autoClose: false,
       width: '35em',
       height: '30em',
       items: {
         details: {
           type: 'tabPanel',
           items: [
             {
               title: '任務內容',
               lazyItems: [
                 { type: 'textField', label: '任務名稱', value: task.name, listeners: { change({ value }) { task.name = value } } },
                 { type: 'textArea', label: '任務描述', value: task.description, listeners: { change({ value }) { task.description = value } } },
                 {
                   type: 'container',
                   width: "33%",
                   style:{ paddingRight: "20px" },
                   items: [spotlightCombo]
                 },
                 {
                   type: 'container',
                   width: "33%",
                   style:{ paddingRight: "20px" },
                   items: [
                     {
                       type: 'Combo', label: '狀態', width: "50%", id: "statusTextField", editable: false, value: statusOptions[task.status].title,
                       autoClose: false,
                       items: { ...statusOptions },
                       listItemTpl: (e) => e.data.text.title,
                       displayValueRenderer: (e, i) => e?.value ? statusOptions[e.value].title : statusOptions[task.status].title,
                       listeners: {
                         select({ value }) { 
                           task.status = value
                          }
                       }
                     }
                   ]
                 },
                 {
                   type: 'container',
                   width: "33%",
                   style:{ paddingRight: "20px" },
                   items: [
                     { type: 'DateField', editable : false, width: "50%", label: '結束日期', value: task.date, listeners: { change({ value }) { task.date = value } } },
                   ]
                 },
               ]
             },
             {
               title: '子任務',
               items: [
                 { type: 'widget', html: 'Second' }
               ]
             },
             {
               title: 'Three',
               items: [
                 { type: 'widget', html: 'Last' }
               ]
             }
           ]
         },
       },
       bbar: [
         {
           text: 'Close',
           minWidth: 100,
           onAction: 'up.close'
         }
       ],
   });
   popup.show();
   }
   const gridConfig = {
     // Bryntum Grid config options
     enableTextSelection: true,
     tbar: {
       height: "80px",
       id:"taskListToolBar2",
       items : [
         {
           text: '新增任務',
           icon: 'b-fa b-fa-plus',
           onClick : onAddTaskBtnClick
         },
         {
           flex: 1,
           width: "auto",
           type: 'textfield',
           placeholder: '搜尋',
           clearable: true,
           keyStrokeChangeDelay: 100,
           style: {
             paddingTop: 2
           },
           onChange: (e) => {
             console.log(e)
             rightGrid.current.gridInstance.store.filter('code', e.value);
           }
         },
       ]
     },
     features: {
       filter: true,
       cellEdit: { disabled: true },
       search: true,
       cellMenu: false,
     },
     listeners: {
       cellDblClick: onCellDblClick,
     },
     columns: columns,
     data: selectedProject == "no_project" ? tasksEdges.filter(e=> e.assignedProjects.length == 0) : tasksEdges
   };
   useEffect(() => {
     (async () => { Mask.unmask(document.getElementById("rightSide")); })()
   });
   return (
     <BryntumGrid
       ref={rightGrid}
       id={"rightGrid"}
       {...gridConfig}
     />
   );
 }

 const RightSideRender = useCallback((props) => {
   return (
     <TaskUseQuery appToken={appToken} query={taskQuery} fragment={taskListFragment} projectId={selectedProject}>
     <RightSide {...props} />
     </TaskUseQuery>
   )
 }, [selectedProject])

 return (
   <div id={"TaskListContainer"} style={{ width: "100%", display: "flex" }}>
     <div id={"leftSide"} style={{ height: "100vh", width: "30vw", minWidth: "300px" }}>
       <LeftSideRender />
     </div>
     <div id={"rightSide"} style={{ height: "100vh", width: "100vw" }}>
       <RightSideRender /> 
       {/* { selectedProject ? <RightSideRender /> : null } */}
     </div>
   </div>
 )
}