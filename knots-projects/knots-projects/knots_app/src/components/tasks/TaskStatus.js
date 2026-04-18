import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import { CheckBox } from "../CheckBox";
import { TaskSetStatusUseMutation } from './TaskUseMutation';

export const TaskStatusContainer = ({ id, status, color, mutate, size, onStatusChange }) => {
  // console.log("TaskStatusContainer", onStatusChange)
  const [taskStatus, setTaskStatus] = useState(status);
  const textStyle = { color: taskStatus ? color : null }
 return (
   <CheckBox
    iconStyle = {{margin:0}}
    name="check-circle"
    size={size??40}
    color={taskStatus == "TODO" ? null : color??"green"}
    status={taskStatus == "TODO" ? false : true}
    // label="已完成:"
    textStyle={styles.textStyle}
    containerStyle={styles.containerStyle}
     onPress={async () => { 
       console.log("taskStatus", status)
       setTaskStatus(taskStatus == "TODO" ? "DONE" : "TODO");
       if (onStatusChange) onStatusChange(id, taskStatus);
       if (mutate) mutate(
         {
          variables: {
           data: {
             id: id,
             status: taskStatus == "TODO" ? "DONE" : "TODO"
           }
         }
        }
        ).then((res) => { 
        //  console.log("data", res)
          if (res.data?.taskSetStatus?.task)
            setTaskStatus(res.data.taskSetStatus.task.status)
          else {
            console.log("setTaskStatus")
            // setTaskStatus(taskStatus == "TODO" ? "DONE" : "TODO");
          }
        }).catch(err => {
          console.log(err);
          setTaskStatus(taskStatus == "TODO" ? "DONE" : "TODO");
        })
     }}
   />
 )
}

export const TaskStatusBtn = (props) => { 
  return (
    <TaskSetStatusUseMutation {...props}>
      <TaskStatusContainer {...props}/>
    </TaskSetStatusUseMutation>
  )
}

const styles = StyleSheet.create({
 textStyle: {
  fontSize: 18,
  fontWeight:"100"
 },
 containerStyle: {
  marginHorizontal: 5
 }
})

