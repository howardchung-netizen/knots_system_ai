import gql from 'graphql-tag';

export const loginMutation = gql`
 mutation login($data: LoginInput!){
  login(data: $data){
    user{ 
      ...user
      __typename
    }
    token
  }
 }
`
export const taskCreateMutation = gql`
mutation task($data: TaskInput!){
  taskCreate(data: $data){
    task{
      ...task
    }
    userErrors{
      ...userErrors
    }
  }
}
`

export const taskUpdateMutation = gql`
mutation task($data: TaskInput!){
  taskUpdate(data: $data){
    task{
      ...task
    }
    userErrors{
      ...userErrors
    }
  }
}
`
export const taskSetStatusMutation = gql`
mutation taskSetStatus($data: TaskStatusChangeInput!){
  taskSetStatus(data: $data){
    task{
      id
      status
    }
    userErrors{
      ...userErrors
    }
  }
}
`;  

export const taskDeleteMutation = gql`
mutation taskDelete($data: TaskDeleteInput!){
  taskDelete(data: $data){
    userErrors{
      ...userErrors
    }
  }
}
`;  

export const taskAssignMutation = gql`
mutation taskAssign($data: TaskAssignInput!){
  taskAssign(data: $data){
    task{
      ...taskUpdate
    }
    userErrors{
      ...userErrors
    }
  }
}
`;

export const taskUnAssignMutation = gql`
mutation taskUnassign($data: TaskAssignInput!){
  taskUnassign(data: $data){
    task{
      ...taskUpdate
    }
    userErrors{
      ...userErrors
    }
  }
}
`  

export const projectUpdateMutation = gql`
mutation projectUpdate($data: ProjectUpdateInput!){
  projectUpdate(data: $data){
    project{
      id
      code
      albumShareToken
    }
  }
}
` 

export const taskAssignProjectMutation = gql`
mutation taskAssignProject($data: TaskAssignProjectInput!){
  taskAssignProject (data:$data){
     task{
      ...task
    }
    userErrors{
      ...userErrors
    }
  }
} 
`

export const taskUnassignProjectMutation = gql`
mutation taskUnassignProject($data: TaskAssignProjectInput!){
  taskUnassignProject (data:$data){
     task{
      ...task
    }
    userErrors{
      ...userErrors
    }
  }
}
`

export const createClockInLocationMutation = gql`
mutation createClockInLocation($data:ClockInLocationCreate!)  {
  createClockInLocation (data:$data) {
      userErrors{
        message
      }
      clockInLocation {
        id
      }
  }
}
`
export const deleteAccountMutation = gql`
mutation deleteAccount {
  deleteAccount
}
`
