import React, { useState } from 'react'
import { StyleSheet, View, Text } from 'react-native'


export default function (props) { 
 return (
  <View style={[styles.center, props.style ? props.style : null]}>{props.children}</View>
 )
}

const styles = StyleSheet.create({
 center: {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  width: "100%",
  position: "relative",
  backgroundColor: null
 }
})
