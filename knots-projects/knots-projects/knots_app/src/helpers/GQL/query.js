import gql from 'graphql-tag';

export const userQuery = gql`
query user($id:ID) {
  users (id:$id){
    edges{
      node{
        ...user
      }
    }
  }
}
`

export const taskQuery = gql`
query tasks ($projectId:String, $id:ID) {
  tasks (projectId:$projectId, id:$id){
  	edges{
      node{
        ...task
      }
      __typename
    }
    pageInfo
    {
      hasNextPage
    }
    totalCount
  }
}
`;

export const contactsQuery = gql`
query contacts {
  contacts{
    edges{
      node{
        id
        contactName
        tel
      }
      __typename
    }
    pageInfo
    {
      hasNextPage
    }
    totalCount
  }
}  
`; 

export const projectQuery = gql`
query project{
  projects{
    edges{
      node{
        code
        id
        albumShareToken
      }
    }
  }
}
`;

export const ganntQuery = gql`
query gantt {
  gantt {
    edges{
       node {
        id
        project {
          code
          id
        }
        ganttTasks {
          id
          name
          isDeleted
          style
          startDate
          endDate
          percentDone
          assignments {
            staff {
              ...user
            } 
          }
          # subTasks {
          #   id
          #   name
          #   isDeleted
          #   style
          #   startDate
          #   endDate
          # }
        }
      }
    }
  }
}
`


export const GET_APP_SETTINGS = gql`
query appSettings($query: String, $skip: Int, $first: Int) {
  appSettings(query: $query, skip: $skip, first: $first) {
    edges {
      node {
        ...appSetting
      }
      cursor
    }
    pageInfo {
      ...pageInfo
    }
    totalCount
  }
}
`;

