import gql from 'graphql-tag';
import { appSetting, clientFragment } from './fragments';
import { baseClientContactFragment } from './baseFragment';

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

export const ON_APPSETTING_CHANGE = gql`
subscription onAppSettingChange(
  $key: String
  $public: Boolean
) {
  onAppSettingChange(
    key: $key
    public: $public
  ) {
    mutation
    updatedFields
    node{
      ...appSetting
    }
  }
}
${appSetting}
`;

export const ON_QRCODE_SCAN = gql`
subscription onQRCodeScan($locationId:ID){
  onQRCodeScan(locationId:$locationId){
    mutation
    locationId
  }
}
`;

export const ON_CLIENT_CHANGE = gql`
subscription onClientChange {
  onClientChange {
    mutation
    node {
      ...client
    }
  }
}
${clientFragment}
`;

export const ON_CLIENT_CONTACT_CHANGE = gql`
subscription onClientContactChange {
  onClientContactChange {
    mutation
    node {
      ...clientContact
    }
  }
}
${baseClientContactFragment}
`;
