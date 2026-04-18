import React, { useState } from 'react';
import { gql, useQuery } from '@apollo/client';
import Loading from '../Loading';
import { Text } from '../Text';
import CenterView from '../CenterView';

export const TaskUseQuery = (props) => {
  //  console.log("TaskUseQuery", props)
  const { loading, error, data, refetch } = useQuery(gql`${props.query} ${props.fragment}`, {
    // fetchPolicy: "network-only",   // Used for first execution
    // nextFetchPolicy: "network-only", // Used for subsequent executions
    variables: {
      id: props.id,
      projectId: props.projectId
    }
  })
  if (loading) return <Loading />
  if (error) return <CenterView><Text>載入失敗:{error.message}</Text></CenterView>
  if (data) return React.cloneElement(props.children, { data: data, refetch: () => { console.log("refetch"); refetch() } })
}

