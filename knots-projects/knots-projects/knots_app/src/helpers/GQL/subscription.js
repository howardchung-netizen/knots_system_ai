import gql from 'graphql-tag';

export const onClockInChangeSubscription = gql`
subscription onClockInChange($locationId:ID){
    onClockInChange(locationId:$locationId){
      mutation
      node{
        id
        
      }
    }
}
`  