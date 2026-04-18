import moment from 'moment';
import React, { useContext} from 'react';
import { View, StyleSheet } from 'react-native';
import { Divider } from 'react-native-paper';
import { ThemeContext } from './appContext/ThemeContext';
import { Text } from './Text'

export const ActionLog = ({ data, children, ActionLogContainerStyle }) => { 
 return (
  <View style={[styles.ActionLogContainer, ActionLogContainerStyle]}>
   {children && data ? data.map(e => (
    React.cloneElement(children, { ...e })
   )) : null}
  </View>
 )
}

export const TaskLogItem = ({user, action, changes, createdAt }) => { 
 const [{ theme }] = useContext(ThemeContext);
 const username = user.nameCht
 const usernameColor =  theme.colors.text 
 const descColor = { color: theme.colors.secondary }
 console.log(action)
 return (
  <>
   <View>
    <View style={styles.itemTitleContainer}>
     <Text style={[styles.usernameText]} color={usernameColor}>{username}</Text>
     <Text style={[styles.actionText, descColor]}>{action}</Text>
     <Text style={[styles.dateText, descColor]}>{moment(createdAt).format("YYYY-MM-DD")}</Text>
    </View>
    {changes?.map(e => {
     let key = Object.keys(e)[0]; 
     return (
     <View style={{flexDirection:"row", paddingHorizontal:10}}>
       <Text style={[styles.changesText, descColor]}>{e[key].entity == 'user' ? null : key} </Text>
       <Text style={[styles.changesText, usernameColor]}> "{e[key].originalValue}" </Text>
       <Text style={[styles.changesText, descColor]}>更改為</Text>
       <Text style={[styles.changesText, usernameColor]}> "{e[key].newValue}"</Text>
     </View>
     )
    })}
    <Divider/>
   </View>
  </>
 )
}

const styles = StyleSheet.create({
 ActionLogContainer: {
  backgroundColor: "white",
 },
 itemTitleContainer: {
  flexDirection: "row",
  padding: 3,
  alignItems:"center"
 },
 usernameText: {
  fontSize: 16,
  fontWeight:"bold",
  marginRight:5
 },
 actionText: {
  marginRight:5
 },
 dateText: {

 },
 changesText: {
  fontSize: 13
 }
})
