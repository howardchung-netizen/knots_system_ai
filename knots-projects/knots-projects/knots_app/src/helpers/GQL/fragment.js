

import gql from 'graphql-tag';

export const userErrorFragment = gql`
fragment userErrors on UserError{
 message
 field
}
`
export const userFragment = gql`
fragment user on User{
 id
 username
 nameCht
 nameEn
 email
 roles {
   name
   permissions {
     name
     actions
   }
 }
 createdAt
}
`
export const taskListFragment = gql`
fragment task on Task {
  id
  name
  status
  priority
  dueDate
  description
  spotlight
  createdAt
  createdBy {
    username
    nameCht
  }
  assignedProjects {
    id
  }
}
`

export const myTaskListFragment = gql`
fragment task on Task{
  id
  name
  status
  priority
  dueDate
  description
  spotlight
  createdAt
  createdBy {
    username
    nameCht
  }
  assignedStaff{
    staff{
      id
      username
      nameEn
      nameCht
      tel1
    }
  }
  assignedContact{
    contact{
      id
      contactName
      tel
    }
  }
}
`

export const taskFragment = gql`
fragment task on Task{
  id
  createdBy {
    username
    nameCht
  }
  priority
  createdAt
  updatedAt
  dueDate
  isDailyReminder
  name
  description
  status,
  doneAt,
  isDeleted
  spotlight
  assignedProjects{
    id
    project {
      id
      code
    }
  }
  assignedStaff{
    staff{
      id
      username
      nameEn
      nameCht
      tel1
    }
  }
  assignedContact{
    contact{
      id
      contactName
      tel
    }
  }
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
//  taskLog{
//   user {
//     username
//     nameCht
//   }
//   contact{
//     contactName
//   }
//   action
//   changes
//   createdAt
// }

export const taskUpdateFragment = gql`
fragment taskUpdate on Task{
  id
  assignedStaff{
    staff{
      id
      username
      nameEn
      nameCht
      tel1
    }
  }
  assignedContact{
    contact{
      id
      contactName
      tel
    }
  }
}
`

export const taskCreateFragment = gql`
fragment task on Task{
  id
  name
  status
  spotlight
  dueDate
  createdBy {
    username
  }
  }
`

export const pageInfoFragment = gql`
  fragment pageInfo on PageInfo{
    startCursor
    endCursor
    hasNextPage
    hasPreviousPage
    __typename
  }
`;

export const appSettingFragment = gql`
fragment appSetting on AppSetting{
  id
  key
  public
  description
  value
}
`;

