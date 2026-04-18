import React from 'react';
import { taskFragment, taskCreateFragment, userErrorFragment, taskListFragment } from '../../helpers/GQL/fragment';
import { taskSetStatusMutation, taskUpdateMutation, taskCreateMutation } from '../../helpers/GQL/mutation';
import { gql, useMutation } from '@apollo/client';

export const TaskCreateUseMutation = (props) => { 
 const [taskCreateMutate] = useMutation(gql`${taskCreateMutation} ${taskCreateFragment} ${userErrorFragment}`);
 return React.cloneElement(props.children, { mutate: taskCreateMutate })
}

export const TaskUpdateUseMutation = (props) => { 
  // console.log("TaskUpdateUseMutation")
  const [taskUpdateMutate] = useMutation(gql`${taskUpdateMutation} ${taskFragment} ${userErrorFragment}`,
    {
      // fetchPolicy: "network-only",   // Used for first execution
      // nextFetchPolicy: "network-only" // Used for subsequent executions
    }
  );
    // console.log("TaskUpdateUseMutation", TaskUpdateUseMutation)
 return React.cloneElement(props.children, { ...props, mutate: taskUpdateMutate })
}

export const TaskSetStatusUseMutation = (props) => {
  // console.log("TaskSetStatusUseMutation")
  const [mutate] = useMutation(gql`${taskSetStatusMutation} ${userErrorFragment}`);
  
  return React.cloneElement(props.children, { mutate: mutate })
}