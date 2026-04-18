import React, { useState } from 'react'
import { StyleSheet, SafeAreaView, Text, View} from 'react-native'

export default (props) =>  { 
 return (
  <SafeAreaView style={styles.center}>{props.children}</SafeAreaView>
 )
}

const styles = StyleSheet.create({
 center: {
  flex: 1,
  width: "100%",
  padding:5
 }
})
