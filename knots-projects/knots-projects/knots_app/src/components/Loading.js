
import React, { useState } from 'react'
import { StyleSheet, ActivityIndicator, View, Text} from 'react-native'
import { color } from 'react-native-reanimated'
import CenterView  from '../components/CenterView'
export default (props) => { 
 return (
  <ActivityIndicator style={[styles.loading, props.style]} size={props.size?? "large"}/>
 )
}
const styles = StyleSheet.create({
 loading: {
  position: "absolute",
  backgroundColor: "#bbbbbb99",
  zIndex: 999999999999,
  top: 0,
  bottom: 0,
  left: 0,
  right: 0,
 }
})
