import React, { useState, useRef } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { ModalButton } from './modal/ModalButton';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { List, Avatar } from 'react-native-paper'


import { useNavigation } from '@react-navigation/native';
import { gql, useMutation } from '@apollo/client';
import { taskCreateMutation } from '../helpers/GQL/mutation'
import { taskFragment, userErrorFragment } from '../helpers/GQL/fragment'
const taskCreateGQL = gql`${taskCreateMutation} ${taskFragment} ${userErrorFragment}`;

export const AvatarSelector = (props) => {

 const navigation = useNavigation();
 const [memberCount, setMemberCount] = useState(props.assignedStaff.length + props.assignedContact.length);
 return (<>
  <ModalButton
   title='指派人名單'
   width="90%"
   closeButton
   body={
    <View style={{ marginHorizontal: 10 }}>


    </View>}
  >
   <View>
    <List.Section>
     <List.Subheader style={[styles.Subheader]}>已指派{memberCount}人</List.Subheader>
    </List.Section>
    <View style={{ flexDirection: "row", flexWrap:"wrap" }}>
     {props.assignedStaff.map(({ staff }) => {
      let lable = staff.username.split(' ');
      if (lable.length < 2) lable = lable[0][0];
      else lable = lable[0][0] + lable[1][0];
      lable = lable.toUpperCase();
      console.log(lable)
      return (
       <View style={{ flexDirection: "row"}}>
        <View><Avatar.Text key={staff.id} size={30} label={lable} /></View>
        <View>
         <Text>{staff.nameCht}</Text>
         <Text>{staff.nameEn}</Text>
        </View>
       </View>
      )
     }
     )}
    </View>
   </View>
  </ModalButton>
 </>)
}


const styles = StyleSheet.create({
 Subheader: { fontWeight: "bold" }
 
});