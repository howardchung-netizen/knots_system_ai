import React, { useState, useEffect } from 'react'
import { GANTT_CHANGE } from '../apollo/subscriptions';
import { useSubscription } from '@apollo/react-hooks';
import { useParams } from "react-router-dom";
import { WidgetHelper } from '@bryntum/gantt';

function SubscriptionsChecker(props) {

  const params = useParams();
  //console.log('projectId',params.projectId);
  const { data: ganttChange } = useSubscription(GANTT_CHANGE, {
    variables: { projectId: parseInt(params.projectId) },
    skip: false
  });

  const [test,setTest] = useState(false);

  const syncTask = async (project, data) => {
    const eventStore = project.eventStore;
    for (let row of data.add) {
      eventStore.insert(row.parentIndex,row);
    }
    for (let row of data.rootNew) {
      eventStore.rootNode.appendChild(row.from);
    }
    for (let row of data.appendRoot) {
      //append task to root tree of last
      const toRecord = eventStore.getById(row.to);
      eventStore.rootNode.appendChild(toRecord);
    }
    for (let row of data.insertChild) {
      const treeRecord = eventStore.getById(row.tree);
      const toRecord = eventStore.getById(row.to);
      treeRecord.insertChild(row.from,toRecord);
    }
    for (let row of data.insertRoot) {
      const toRecord = eventStore.getById(row.to);
      eventStore.rootNode.insertChild(row.from,toRecord);
    }
    for (let row of data.appendNew) {
      const toRecord = eventStore.getById(row.to);
      toRecord.appendChild(row.from);
    }
    for (let row of data.appendTree) {
      const fromRecord = eventStore.getById(row.from);
      const treeRecord = eventStore.getById(row.tree);
      treeRecord.appendChild(fromRecord);
    }
    for (let row of data.update) {
      const record = eventStore.getById(row.id);
      record.set(row);
    }
    for (let row of data.remove) {
      eventStore.remove(row.id);
    }
    for (let row of data.move) {
      //move from to before tasks
      const fromRecord = eventStore.getById(row.from);
      const toRecord = eventStore.getById(row.to);
      eventStore.move(fromRecord,toRecord);
    }
    for (let row of data.append) {
      //append task to target tree
      const fromRecord = eventStore.getById(row.from);
      const toRecord = eventStore.getById(row.to);
      toRecord.appendChild(fromRecord);
    }
  }

  const syncDependency = async (project, data) => {
    const dependencyStore = project.dependencyStore;
    const eventStore = project.eventStore;
    for (let row of data.add) {
      dependencyStore.add({
        from: eventStore.getById(row.fromEvent),
        to: eventStore.getById(row.toEvent),
      });
    }
    for (let row of data.update) {
      const record = dependencyStore.getById(row.id);
      record.set(row);
    }
    for (let row of data.remove) {
      dependencyStore.remove(row.id);
    }
  }

  const syncAssignment = async (project, data) => {
    const assignmentStore = project.assignmentStore;
    for (let row of data.add) {
      assignmentStore.add(row,true)
    }
    for (let row of data.update) {
      const record = assignmentStore.getById(row.id);
      record.set(row);
    }
    for (let row of data.remove) {
      assignmentStore.remove(row.id);
    }
  }

  const syncGantt = async (data) => {
    const project = props.project.current.instance.project;
    const instance = props.project.current.instance;
    syncTask(project, data.tasks);
    syncDependency(instance, data.dependencies);
    syncAssignment(project, data.assignments);
  }

  useEffect(() => {
    const project = props.project.current.instance.project;
    project.on('beforeSync', (event) => {
      event.pack.fromSync = test;
    })
    project.on('requestDone', (event) => {      
      setTest(false);
    })
  }, [test]);

  useEffect(() => {   
    if (ganttChange) {
      const project = props.project.current.instance.project;
      const changeAppUUID = ganttChange?.onGanttChange?.appUUID;
      const returnSubscriptionData = JSON.parse(ganttChange?.onGanttChange?.returnSubscriptionData);
      //console.log('this uuid', props.appUUID, ' request uuid:', changeAppUUID);
      if (props.appUUID !== changeAppUUID) {
        const operateUser = ganttChange?.onGanttChange?.operateUser;
        setTest(true);
        if (operateUser) WidgetHelper.toast(`${operateUser} is updating...`);
        //console.log('call reload, uuid:', changeAppUUID)
        //console.log('return subscription data:', returnSubscriptionData)
        syncGantt(returnSubscriptionData);
        //for sorting
        project.eventStore.sort({field:'parentIndex', ascending:true, slient:true})
      }
    }
  }, [ganttChange]);
  
  return (
    <></>
  );
}

export default SubscriptionsChecker;