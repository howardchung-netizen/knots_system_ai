import gql from 'graphql-tag';

export const GANTT_CHANGE = gql`
subscription onGanttChange($projectId:Int) {
  onGanttChange(projectId:$projectId) {
    node{
      id
    }
    updatedTime
    requestId
    appUUID
    operateUser
    returnSubscriptionData
  }
}
`;
