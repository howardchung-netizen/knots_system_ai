import gql from 'graphql-tag';

export const GET_SHARE_LINK = gql`
query ganttShares($projectId:String!) {
  ganttShares(projectId:$projectId){
    edges{
      node{
        expiredTime
        code
        remark
      }
    }
  }
}
`;
export const GET_CALENDARS = gql`
query ganttCalendars {
  ganttCalendars {
    edges{
      node{
        id
        name
      }
    }
  }
}
`;
export const GET_COLMUN_CONFIG = gql`
query ganttColumn{
  ganttColumnConfig{
    ganttColumnConfig{
      config
    }
  }
}
`;
