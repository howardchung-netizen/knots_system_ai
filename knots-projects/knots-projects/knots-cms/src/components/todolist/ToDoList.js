import React, { useState, useCallback, useMemo, useRef, useLayoutEffect } from 'react';
import { useParams } from "react-router-dom";
import { useQuery, useApolloClient } from '@apollo/client';
import gql from 'graphql-tag';
import { taskListFragment, taskCreateFragment, taskFragment, userErrorFragment, taskEditUserFragment, taskUpdateFragment } from '../../apollo/fragments.js';
import { projectQuery, taskQuery, projects_task_user_contact_Query } from '../../apollo/queries';
import { taskAssignProjectMutation, taskCreateMutation, taskUpdateMutation, taskSetStatusMutation, taskUnassignProjectMutation, taskAssignMutation, taskUnAssignMutation, taskDeleteMutation } from '../../apollo/mutations'
import { Mask, Splitter, Popup, Combo, Grid, Checkbox, DataField, FilterField } from '@bryntum/gantt';
import { BryntumGrid } from '@bryntum/gantt-react';

import moment from 'moment';
import * as uuid from "uuid";

import '../../lib/SpotlightColumn.js';
import SpotlightCombo from '../../lib/SpotlightCombo';
import { LoadingMask } from '../LoadingMask';
import BackdropLoading from '../BackdropLoading.js';
import { is } from 'date-fns/locale';

const statusOptions = {
  TODO: {
    backgroundColor: "#f4f4f4",
    color: "rgb(135 135 135)",
    title: "未完成"
  },
  DONE: {
    backgroundColor: "#1db8cd",
    color: "white",
    title: "已完成"
  },
  APPROVED: {
    backgroundColor: "#323594",
    color: "white",
    title: "已確認"
  },
  REJECTED: {
    backgroundColor: "#f44336",
    color: "white",
    title: "已拒絕"
  },
}
const priorityOptions = {
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
const rightSideColumns = [
  {
    type: "SpotlightColumn"
  },
  {
    field: 'name', text: '任務', autoWidth: true, cellCls: 'task-name-cell',
  },
  {
    field: 'status', text: '狀態', cellCls: 'task-status-cell', type: 'template',
    filterable: {
      filterField: {
        type: 'combo',
        editable: false,
        multiSelect: true,
        items: [
          { value : 'TODO', text : '未完成' },
          { value : 'DONE', text : '已完成' },
          { value : 'APPROVED', text : '已確認' },
        ]
      },
      filterFn : ({ record, value }) => value.length ? value.includes(record.data.status) : true
    },
    template: ({ value }) => {
      const Status = () => {
        return (
          `<div style='background:${statusOptions[value].backgroundColor}; height:100%; padding:5px;'>
            <div style='font-weight:bold; color:${statusOptions[value].color}; display:flex; align-items:center; height:100%;'>
              ${statusOptions[value].title}
            </div>
           </div>`
        )
      }
      return value ? Status(): null
    }
  },
  {
    field: 'dueDate', text: '結束日期', width: '120px',  type: 'date', format: 'YYYY-MM-DD',
    renderer: ({ value, record }) => {
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
        {
          tag: 'div',
          html: `<div style='color:${dueDateColor()};font-weight:bold;'>
          ${record.data.dueDate ? moment(record.data.dueDate).format("YYYY-MM-DD") : ''}
         </div>`
        }
      )
    }
  },
  {
    field: 'priority', text: '優先度', cellCls: 'task-priority-cell', type: 'template',
    filterable: {
      filterField: {
        type: 'combo',
        editable: false,
        multiSelect: true,
        items: [
          { value: '-', text: '無' },
          { value: 'HIGH', text: '高' },
          { value: 'MEDIUM', text: '中' },
          { value: 'LOW', text: '低' },
        ]
      },
      filterFn: ({ record, value }) => {
        let v = value.map(e => { if (e == '-') e = null; return e });
        return v.length ? v.includes(record.data.priority) : true ;
      }
    },
    template: ({ value, record }) => {
      return (
       ` <div class='task-priority-cell-wrap' style='background:${priorityOptions[value ?? '-'].backgroundColor}; height:100%; padding:5px; width:60px;'>
          <div style='font-weight:bold; color:${priorityOptions[value ?? '-'].color}; display:flex; align-items:center; height:100%; justify-content:center;'>
            ${priorityOptions[value ?? '-'].title}
          </div>
        </div>`
      )
    }
  }
]

export const ProjectsUseQuery = React.memo((props) => {
  const { loading, error, data, refetch } = useQuery(projectQuery, {
    // fetchPolicy: "no-cache",   // Used for first execution
    // nextFetchPolicy: "no-cache", // Used for subsequent executions,
    context: {
      headers: {
        authorization: `Bearer ${props.appToken}`
      }
    }
  })
  if (loading) return <></>
  if (error) return <div>載入失敗:{error.message}</div>
  if (data) return React.cloneElement(props.children, { data: data, refetch: () => { console.log("ProjectsUseQuery refetch"); refetch(); } })
})

export const TaskUseQuery = (props) => {

  const { loading, error, data, refetch } = useQuery(gql`${props.query} ${props.fragment}`, {
    fetchPolicy: 'network-only', // Used for first execution
    nextFetchPolicy: 'cache-first',
    context: {
      headers: {
        authorization: `Bearer ${props.appToken}`
      }
    },
    variables: {
      id: props.id,
      projectId: props.projectId,
      first: 99999,
    }
  })
  if (loading) return <BackdropLoading />
  if (error) return <div>載入失敗:{error.message}</div>
  if (data) return React.cloneElement(props.children, { data: data, refetch: () => { refetch(); } })
}

export const ToDoList = ({ appToken, projectId, showMenu }) => {

  const client = useApolloClient();
  const [selectedProject, setSelectedProject] = useState(projectId ?? "my_tasks");

  let fakeProjectIdArr = ['my_tasks', 'no_project', 'all'];
  const setSelectedProjectID = (id) => {
    setSelectedProject(id);
  };

  const LeftSide = ({ data, refetch }) => {
    console.log("LeftSide")
    const leftGrid = useRef();
    const columns = useMemo(() => [{
      field: 'code',
      text: '專案',
      sortable(lhs, rhs) {
        if (fakeProjectIdArr.includes(lhs.id) || fakeProjectIdArr.includes(rhs.id)) return 0;
        else if (lhs.code < rhs.code) return 1
        else if (lhs.code > rhs.code) return -1
        else return 0
      }
    },], []);
    const projectsEdges = useMemo(() => data.projects.edges.map(e => { return e.node }), [data.projects.edges]);
    const gridConfig = {
      // Bryntum Grid config options
      id: "leftGrid",
      enableTextSelection: true,
      tbar: {
        padding: "5px",
        height: "80px",
        id: "taskListToolBar",
        items: [
          {
            width: "100%",
            type: 'textfield',
            placeholder: '搜尋',
            clearable: true,
            keyStrokeChangeDelay: 100,
            style: {
              paddingTop: 2
            },
            onChange: (e) => {
              leftGrid.current.gridInstance.store.filter('code', e.value);
            }
          },
        ]
      },
      features: {
        filter: true,
        cellEdit: { disabled: true },
        search: true,
      },
      onCellClick: ({ cellSelector }) => {
        setSelectedProjectID(cellSelector.id)
      },
      columns: columns,
      data: projectsEdges
    };
    useLayoutEffect(() => {
      // new Splitter({
      //   insertBefore: "rightSide",
      //   orientation: 'horizontal'
      // });
      leftGrid.current.gridInstance.store.insert(0, { code: '無專案任務', id: "no_project" });
      leftGrid.current.gridInstance.store.insert(0, { code: '全部任務', id: "all" });
      leftGrid.current.gridInstance.store.insert(0, { code: '我的任務', id: "my_tasks" });
      // setSelectedProjectID(leftGrid.current.gridInstance.store.getAt(0).id);
    }, [])
    return <BryntumGrid ref={leftGrid} {...gridConfig}> </BryntumGrid>
  };

  const LeftSideRender = useCallback((props) => {
    return (
      <ProjectsUseQuery appToken={appToken}>
        <LeftSide {...props} />
      </ProjectsUseQuery>
    )
  }, []);

  const RightSide = ({ data, refetch }) => {
    const dateRangeSelect = useRef({min: null, max:null});
    const rightGrid = useRef();
    const tasksEdges = useMemo(() => data.tasks.edges.map(e => { return e.node }), [data]);
    const onAddTaskBtnClick = async () => {
      Mask.mask('新增任務...');
      let tempUuid = uuid.v4();
      rightGrid.current.gridInstance.store.insert(0, { id: tempUuid, name: "New Task", status: "TODO", dueDate: null, priroity: null, spotlight: null });
      await client.mutate({
        mutation: gql`${taskCreateMutation} ${taskCreateFragment} ${userErrorFragment}`,
        context: {
          headers: {
            authorization: `Bearer ${appToken}`
          }
        },
        variables: {
          data: {
            projectId: selectedProject,
            name: "New Task",
          }
        },
      }).then(async res => {
        // merge to store
        let resTask = res.data.taskCreate.task;
        let tempItem = rightGrid.current.gridInstance.store.getById(tempUuid);
        for (let k in resTask) tempItem[[k]] = resTask[k];
        //Assigned To Project
        if (!fakeProjectIdArr.includes(selectedProject)) { 
          await client.mutate({
            mutation: gql`${taskAssignProjectMutation} ${taskFragment} ${userErrorFragment}`,
            context: {
              headers: {
                authorization: `Bearer ${appToken}`
              }
            },
            variables: {
              data: {
                id: resTask.id,
                projectId: selectedProject
              }
            }
          }).catch(err => {
            alert("編輯任務失敗...請重新最試一次");
            console.log(err);
          })
        }
      }).catch(err => {
        alert("新增任務失敗...請重新最試一次1111");
        rightGrid.current.gridInstance.store.remove(tempUuid);
        refetch();
        console.log(err);
      }).finally(() => { Mask.unmask(); })
      ;
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
    const onCellDblClick = async (e) => {
      Mask.mask("載入中", document.body);
      await client.query({
        query: gql`${projects_task_user_contact_Query} ${taskFragment} ${taskEditUserFragment}`,
        context: {
          headers: {
            authorization: `Bearer ${appToken}`
          }
        },
        variables: {
          taskId: e.cellSelector.id,
        },
      }).then(res => {
        taskEditPopup(res, client, appToken, refetch);
      }).catch(err => {
        alert(err);
      })
      await Mask.unmask();
    }
    const onDeleteRow = async (e) => { 
      e.record.remove();
      client.mutate(
        {
          mutation: gql`${taskDeleteMutation} ${userErrorFragment}`,
          context: {
            headers: {
              authorization: `Bearer ${appToken}`
            }
          },
          variables:
           {
             data: {
               id: e.id
             }
           },
        }
      ).then(res => {
      }).catch(err => {
        e.source.store.insert(e.source.store.indexOf(e.record.data.id), e.record);
        alert("操作失敗");
        console.log(err)
      })
    }
    const onDateRangeChange = () => {
      let min = dateRangeSelect.current.min;
      let max = dateRangeSelect.current.max;
      rightGrid.current.gridInstance.store.filter(r => { 
        if (min && max) return moment(r.dueDate).isBetween(min, max)
        else if (min) return moment(min).isBefore(r.dueDate);
        else if (max) return moment(max).isAfter(r.dueDate);
      })
    }
    const gridConfig = {
      // Bryntum Grid config options
      enableTextSelection: true,
      emptyText: '沒有資料',
      tbar: {
        height: "80px",
        id: "taskListToolBar2",
        items: [
          {
            text: '新增任務',
            icon: 'b-fa b-fa-plus',
            onClick: onAddTaskBtnClick
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
        cellMenu: {
          items: {
            cut: false,
            copy: false,
            removeRow: {
              text: "刪除",
              onItem: (e) => { onDeleteRow(e) }
            }
          }
        },
      },
      listeners: {
        cellDblClick: onCellDblClick,
      },
      columns: rightSideColumns,
      data: selectedProject == "no_project" ? tasksEdges.filter(e => e.assignedProjects.length == 0) : tasksEdges
    };
    return (
      <BryntumGrid
        ref={rightGrid}
        id={"rightGrid"}
        {...gridConfig}
      />
    );
  };
  const RightSideRender = useCallback((props) => {
    return (
      <TaskUseQuery appToken={appToken} query={taskQuery} fragment={taskListFragment} projectId={selectedProject}>
        <RightSide {...props} />
      </TaskUseQuery>
    )
  }, [selectedProject]);//[selectedProject]

  return (
    <div id={"TaskListContainer"} style={{height: "100%", width: "100%", display: "flex" }}>
     { showMenu == true && <div id={"leftSide"} style={{ height: "100%", width: "30vw", minWidth: "300px" }}>
        <LeftSideRender />
      </div>}
      <div id={"rightSide"} style={{ height: "100%", width: "100vw" }}>
        <RightSideRender />
        {/* { selectedProject ? <RightSideRender /> : null } */}
      </div>
    </div>
  )
}

export const taskEditPopup = ({ data }, client, appToken, refetch, parents = []) => {
  let task = data.tasks.edges[0].node;
  // console.log(task)
  let projects = data.projects.edges.map(e => e.node);
  let users = data.users.edges.map(e => e.node);
  let contacts = data.contacts.edges.map(e => e.node);
  let parentGridStore = parents.pop()?.store.getById(task.id)??false;
  const oldValueForRollBack = JSON.parse(JSON.stringify(parentGridStore));
  let spotlightCombo = new SpotlightCombo({
    value: task.spotlight,
    listeners: {change({ value }) { taskUpdateUseMutation(["spotlight"], [value]) }}
  });
  let assignedProjectsCombo = new Combo({
    label: '專案',
    editable: false,
    multiSelect: true,
    items: projects,
    value: task.assignedProjects.map(e => e.project.id),
    displayValueRenderer: record => {
    },
    chipView: {
      iconTpl: (record) => record.code
    },
    listItemTpl: record => `
      <div class="">
          <span class="name">${record.code}</span>
      </div>
      `,
    listeners: {
      async change({ oldValue, value }) {
        if (!oldValue && value) onAssignedToProject(value[0]);
        else if (oldValue && value.length == 0) onUnassignedFormProject(oldValue[0]);
        else {
          for (let i of value) {
            if (!oldValue.includes(i)) await onAssignedToProject(i);
          }
          for (let i of oldValue) {
            if (!value.includes(i)) await onUnassignedFormProject(i);
          }
        }
      }
    }
  });
  let userPicsCombo = new Combo({
    label: '指派人',
    editable: false,
    multiSelect: true,
    items: users,
    value: task.assignedStaff.filter(e=> e.isPic == true).map(e=> e.staff.id),
    displayValueRenderer: record => {
    },
    chipView: {
      iconTpl: (record) => record.nameCht
    },
    listItemTpl: record => `
      <div class="staff-list-item" style="display: flex;align-items: center; width: 100%;">
        <div class="staff-list-item-name"><span class="material-icons account_circle"></span><span class="name">${record.nameCht}</span></div>
        <div class="staff-list-item-email">${ record.email ? `&emsp;<span class="material-icons">email</span><span class="email">${record.email}</span>` : ''}</div>
      </div>
      `,
    listeners: {
     async change({ oldValue, value }) {
        if (!oldValue && value) onAssignedMember(value[0], true);
        else if (oldValue && value.length == 0) onUnassignedMember(oldValue[0]);
        else {
          for (let i of value) {
            if (!oldValue.includes(i)) await onAssignedMember(i, true);
          }
          for (let i of oldValue) {
            if (!value.includes(i)) await onUnassignedMember(i);
          }
        }
      }
    }
  });
  let usersCombo = new Combo({
    label: '員工',
    editable: false,
    multiSelect: true,
    items: users,
    value: task.assignedStaff.filter(e=> e.isPic != true).map(e=> e.staff.id),
    displayValueRenderer: record => {
    },
    chipView: {
      iconTpl: (record) => record.nameCht
    },
    listItemTpl: record => `
      <div class="staff-list-item" style="display: flex;align-items: center; width: 100%;">
        <div class="staff-list-item-name"><span class="material-icons account_circle"></span><span class="name">${record.nameCht}</span></div>
        <div class="staff-list-item-email">${ record.email ? `&emsp;<span class="material-icons">email</span><span class="email">${record.email}</span>` : ''}</div>
      </div>
      `,
    listeners: {
     async change({ oldValue, value }) {
        if (!oldValue && value) onAssignedMember(value[0]);
        else if (oldValue && value.length == 0) onUnassignedMember(oldValue[0]);
        else {
          for (let i of value) {
            if (!oldValue.includes(i)) await onAssignedMember(i);
          }
          for (let i of oldValue) {
            if (!value.includes(i)) await onUnassignedMember(i);
          }
        }
      }
    }
  });
  let contactsCombo = new Combo({
    label: '其他聯絡人',
    editable: false,
    multiSelect: true,
    items: contacts,
    value: task.assignedContact.map(e=> e.contact.id),
    displayValueRenderer: record => {
    },
    chipView: {
      iconTpl: (record) => record.contactName
    },
    listItemTpl: record => `
      <div class="" style="display: flex;align-items: center;">
         <span class="material-icons account_circle"></span><span class="name">${record.contactName}</span> 
         ${ record.email ? `&emsp;<span class="material-icons">email</span><span class="name">${record.nameCht}</span>` : ''}
      </div>
      `,
    listeners: {
     async change({ oldValue, value }) {
        if (!oldValue && value) onAssignedMember(value[0]);
        else if (oldValue && value.length == 0) onUnassignedMember(oldValue[0]);
        else {
          for (let i of value) {
            if (!oldValue.includes(i)) await onAssignedMember(i);
          }
          for (let i of oldValue) {
            if (!value.includes(i)) await onUnassignedMember(i);
          }
        }
      }
    }
  });
  let tenderCheckbox = new Checkbox({
    style: { marginTop: '18px', marginLeft: '10px'},
    text: 'Tender',
    listeners: {
      change() {
        taskUpdateUseMutation(['is_tender'], [])
       }
    }
  });
  const subTaskGridConfig = {
    // Bryntum Grid config options
    autoHeight: true,
    emptyText: '沒有資料',
    maxHeight: '35em',
    width: '300px',
    enableTextSelection: true,
    tbar: {
      height: "80px",
      items: [
        {
          text: '新增任務',
          icon: 'b-fa b-fa-plus',
          onClick: async (e) => onAddTaskBtnClick()
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
          }
        },
      ]
    },
    features: {
      filter: true,
      cellEdit: { disabled: true },
      search: true,
      cellMenu: {
        items: {
          cut: false,
          copy: false,
          removeRow: {
            text: "刪除",
            onItem: (e) => { onDeleteRow(e) }
          }
        }
      },
    },
    listeners: {
      cellDblClick: (e)=> { parents.push(subTaskGrid); onSubTaskDblClick(e.cellSelector.id) },
    },
    columns: rightSideColumns,
    data: task.subTasks
  }
  let subTaskGrid = new Grid(subTaskGridConfig);
  const updateParentGridStore = (key, value) => { 
    if(parentGridStore) for (let k in key) parentGridStore[key[k]] = value[k];
  }
  const rollbackParentGridStore = () => { 
    for (let i in oldValueForRollBack) parentGridStore[i] = oldValueForRollBack[i];
  }
  const onAddTaskBtnClick = async () => {
    Mask.mask('新增任務...');
    let tempUuid = uuid.v4();
    subTaskGrid.store.insert(0, { id: tempUuid, name: "New Task", status: "TODO", dueDate: null, priroity: null, spotlight: null });
    await client.mutate({
      mutation: gql`${taskCreateMutation} ${taskFragment} ${userErrorFragment}`,
      context: {
        headers: {
          authorization: `Bearer ${appToken}`
        }
      },
      variables: {
        data: {
          parentTaskId: task.id,
          name: "New Task",
        }
      },
    }).then(res => {
      client.writeFragment({
        id: 'Task:' + task.id,
        fragment: gql`
        fragment task on Task{
          subTasks {
            id
            name
            status
            spotlight
            dueDate
            createdBy {
              username
            }
          }
        }
      `,
        data: {
          __typename: 'Task',
          subTasks: [...task.subTasks, res.data.taskCreate.task],
        },
      });
      client.readFragment({
        id: 'Task:' + task.id,
        fragment: gql`
        fragment task on Task{
          subTasks {
            id
            name
            status
            spotlight
            dueDate
            createdBy {
              username
            }
          }
        }
      `
      });
      try {
        let tempItem = subTaskGrid.store.getById(tempUuid);
        tempItem.id = res.data.taskCreate.task.id;
      } catch (error) {

      }
    }).catch(err => {
      alert("新增任務失敗...請重新最試一次");
      subTaskGrid.store.remove(tempUuid);
      console.log(err);
    }).finally(() => { Mask.unmask(); })
  }
  const taskUpdateUseMutation = async (key, value) => {
    const oldValueForRollBack = JSON.parse(JSON.stringify(parentGridStore));
    const genInput = () => {
      let input = { id: task.id };
      for (let k in key) input[key[k]] = value[k];
      return input;
    }
    updateParentGridStore(key, value)
    genInput(key, value);
    await client.mutate({
      mutation: gql`${taskUpdateMutation} ${taskFragment} ${userErrorFragment}`,
      context: {
        headers: {
          authorization: `Bearer ${appToken}`
        }
      },
      variables: {
        data: genInput(key, value)
      },
    }).then(res => {
      const t = client.readFragment({
        id: 'Task:' + task.id,
        fragment: gql`
        fragment task on Task{
          subTasks {
            id
            name
            status
            spotlight
            dueDate
            createdBy {
              username
            }
          }
        }
      `
      });
      console.log(t)
      try {

      } catch (error) {

      }
    }).catch(err => {
      rollbackParentGridStore();
      alert("編輯任務失敗...請重新最試一次");
      console.log(err);
    })
    refetch();
  }
  const onTaskNameInput = (self, value) => {
    const taskNameHasInputError = (text) => {
      switch (true) {
        case (text == null || text == ''):
          return "請輸入任務名稱...";
        case (text.replace(/ /g, '').length == 0 || text[0] == ' '):
          return "任務名稱不能以空格開頭..."
        default:
          return false;
      }
    }

    let hasError = taskNameHasInputError(value);
    if (hasError) self.setError(hasError);
    else self.clearError();
  }
  const onTaskNameChange = (value, isValid) => { 
    if (isValid) {
      // task.name = value;
    }
  }
  const onTaskNameFocusOut = (self, isValid) => { 
    if (!isValid) {
      self.value = task.name;
      self.clearError();
    }
    else if (task.name !== self.value) taskUpdateUseMutation(['name'], [self.value]);
    
  }
  const onTaskStatusChange = async (value) => { 
    updateParentGridStore(['status'], [value])
    await client.mutate({
      mutation: gql`${taskSetStatusMutation} ${userErrorFragment}`,
      context: {
        headers: {
          authorization: `Bearer ${appToken}`
        }
      },
      variables: {
        data: {
          id: task.id,
          status: value
        }
      }
    }).then(res => {
    }).catch(err => {
      rollbackParentGridStore();
      alert("編輯任務失敗...請重新最試一次");
      console.log(err);
    })
  }
  const onAssignedToProject = async (value) => { 
    popup.mask({
      text: "更改中...",
      target: document.body
    });
    await client.mutate({
      mutation: gql`${taskAssignProjectMutation} ${taskFragment} ${userErrorFragment}`,
      context: {
        headers: {
          authorization: `Bearer ${appToken}`
        }
      },
      variables: {
        data: {
          id: task.id,
          projectId: value
        }
      }
    }).then(res => {
    }).catch(err => {
      alert("編輯任務失敗...請重新最試一次");
      console.log(err);
    })
    popup.unmask();
  }
  const onUnassignedFormProject = async (value) => { 
    popup.mask({
      text: "更改中...",
      target: document.body
    });
    await client.mutate({
      mutation: gql`${taskUnassignProjectMutation} ${taskFragment} ${userErrorFragment}`,
      context: {
        headers: {
          authorization: `Bearer ${appToken}`
        }
      },
      variables: {
        data: {
          id: task.id,
          projectId: value
        }
      }
    }).then(res => {
    }).catch(err => {
      alert("編輯任務失敗...請重新最試一次");
      console.log(err);
    })
    refetch();
    popup.unmask();
  }
  const onAssignedMember = async (id, isPic) => {
    await client.mutate({
      mutation: gql`${taskAssignMutation} ${taskUpdateFragment} ${userErrorFragment}`,
      context: {
        headers: {
          authorization: `Bearer ${appToken}`
        }
      },
      variables: {
        data: {
          id: task.id,
          assignee: id,
          isPic: isPic
        }
      }
    }).then(res => {
    }).catch(err => {
      alert("新增任務成員失敗...請重新最試一次");
      console.log(err);
    })
  }
  const onUnassignedMember = async (id) => {
    await client.mutate({
      mutation: gql`${taskUnAssignMutation} ${taskUpdateFragment} ${userErrorFragment}`,
      context: {
        headers: {
          authorization: `Bearer ${appToken}`
        }
      },
      variables: {
        data: {
          id: task.id,
          assignee: id
        }
      }
    }).then(res => {
    }).catch(err => {
      alert("操作失敗...請重新最試一次");
      console.log(err);
    })
  }
  const onSubTaskDblClick = async (id) => { 
    popup.mask("載入中...");
    await client.query({
      query: gql`${projects_task_user_contact_Query} ${taskFragment} ${taskEditUserFragment}`,
      context: {
        headers: {
          authorization: `Bearer ${appToken}`
        }
      },
      variables: {
        taskId: id,
      },
    }).then(res => {
      taskEditPopup(res, client, appToken, refetch, parents);
    }).catch(err => {
      alert(err);
      console.log(err)
    });
    popup.unmask();
    // popup.destroy();
  }
  const onDeleteRow = async (e) => { 
    e.record.remove();
    client.mutate(
      {
        mutation: gql`${taskDeleteMutation} ${userErrorFragment}`,
        context: {
          headers: {
            authorization: `Bearer ${appToken}`
          }
        },
        variables:
         {
           data: {
             id: e.record.data.id
           }
         },
      }
    ).then(res => {
      client.writeFragment({
        id: 'Task:' + task.id,
        fragment: gql`
        fragment task on Task{
          subTasks {
            id
            name
            status
            spotlight
            dueDate
            createdBy {
              username
            }
          }
        }
      `,
        data: {
          __typename: 'Task',
          subTasks: task.subTasks.filter(s=> s.id != e.record.data.id),
        },
      });
      client.readFragment({
        id: 'Task:' + task.id,
        fragment: gql`
        fragment task on Task{
          subTasks {
            id
            name
            status
            spotlight
            dueDate
            createdBy {
              username
            }
          }
        }
      `
      });
    }).catch(err => {
      e.source.store.insert(e.source.store.indexOf(e.record.data.id), e.record);
      alert("操作失敗");
      console.log(err)
    })
  }
  const popup = new Popup({
    modal: {
      listeners: {
        click: (e) => {
          console.log(e)
        }
      },
      closeOnMaskTap: (e) => {
        console.log(e)
      }
    },
    autoClose: false,
    header: "編輯",
    autoShow: false,
    centered: true,
    closeAction: 'destroy',
    closable: true,
    // autoClose: false,
    width: '50em',
    height: '50em',
    items: {
      details: {
        type: 'tabPanel',
        items: [
          {
            title: '任務內容',
            lazyItems: [
              {
                type: 'Widget', style: 'width: 100%; display: flex;justify-content: flex-end;',
                html: `<div style='font-style: italic;'><span style='font-size:12px;font-weight: bold;'>${task.createdBy.nameCht}</span><span style='font-size:10px;'>於${moment(task.createdAt).format('YYYY-MM-DD')}建立</span></div>`
              },
              {
                type: 'textField', label: '任務名稱', value: task.name, validateOnInput: true,
                listeners: {
                  input({ value }) { onTaskNameInput(this, value) },
                  change({ value, source }){ onTaskNameChange(value, source.isValid)},
                  focusOut({ source }) {onTaskNameFocusOut(this, source.isValid) }
                }
              },
              { type: 'textArea', label: '任務描述', value: task.description, listeners: { change({ value }) { taskUpdateUseMutation(["description"], [value]) } } },
              {
                type: 'container',
                style: { paddingRight: '20px', width: '25%' },
                items: [
                  spotlightCombo,
                  {
                    type: 'DateField', editable: false, width: "50%", label: '結束日期', format: 'YYYY-MM-DD', value: task.dueDate,
                    listeners: { change({ value }) { taskUpdateUseMutation(['dueDate'], [moment(value).format('YYYY-MM-DD')]) } }
                  },
                ]
              },
              {
                type: 'container',
                style: { paddingRight: '20px', width: '25%' },
                items: [
                  {
                    type: 'Combo', label: '狀態', editable: false, value: statusOptions[task.status].title,
                    autoClose: false,
                    items: { ...statusOptions },
                    listItemTpl: (e) => e.data.text.title,
                    displayValueRenderer: (e, i) => e?.value ? statusOptions[e.value].title : statusOptions[task.status].title,
                    listeners: {
                      change({ value }) {onTaskStatusChange(value)}
                    }
                  }
                ]
              },
              {
                type: 'container',
                style: { paddingRight: '20px', width: '25%' },
                items: [
                  {
                    type: 'Combo', label: '優先度', width: '50%', editable: false, value: priorityOptions[task.priority ?? "-"].title,
                    autoClose: false,
                    items: { ...priorityOptions },
                    listItemTpl: (e) => e.data.text.title,
                    displayValueRenderer: (e, i) => e?.value ? priorityOptions[e.value].title : priorityOptions[task.priority ?? "-"].title,
                    listeners: {
                      change({ value }) { taskUpdateUseMutation(["priority"], [value == '-' ? null : value]) }
                    }
                  }
                ]
              },
              {
                type: 'container',
                style: { paddingRight: '20px', width: '25%' },
                items: [tenderCheckbox]
              },
              {
                type: 'container',
                width: "100%",
                style: { paddingRight: "20px" },
                items: [assignedProjectsCombo]
              },
            ]
          },
          {
            title: '子任務',
            items: [subTaskGrid]
          },
          {
            title: '指派人',
            items: [userPicsCombo]
          },
          {
            title: '成員',
            items: [usersCombo, contactsCombo]
          },
        ]
      },
    },
    bbar: [
      {
        text: parentGridStore ? '返回' : '關閉',
        minWidth: 100,
        onAction: 'up.close',
      }
    ],
  });
  popup.show();
}