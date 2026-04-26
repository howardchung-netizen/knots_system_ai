import gql from 'graphql-tag';

export const GENERATE_SHARE = gql`
mutation ganttShareGenerate($data:GanttShareGenerateInput!){
  ganttShareGenerate(data:$data){
    userErrors{
      message
      field
    }
    ganttShare{
      expiredTime
      code
      remark
    }
  }
}
`;
export const DISABLE_SHARE = gql`
mutation ganttShareDisable($data:GanttShareDisableInput!){
  ganttShareDisable(data:$data){
    userErrors{
      message
      field
    }
  }
}
`;
export const UPDATE_CALENDAR = gql`
mutation ganttUpdateCalendar($data:GanttUpdateCalendarInput!){
  ganttUpdateCalendar(data:$data){
    userErrors{
      message
      field
    }
  }
}
`;
export const UPDATE_COLUMN_CONFIG = gql`
mutation ganttColumnConfigSave($data: GanttColumnConfigSaveInput!) {
  ganttColumnConfigSave(data: $data) {
    userErrors {
      message
      field
    }
    ganttColumnConfig {
      config
    }
  }
}
`;
