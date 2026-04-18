import React from "react";
import { StyleSheet, View } from "react-native";

export const LabelShadow = (props) => { 
 return (
  <View style={[styles.LabelShadow, props.style]}>
    {props.children}
  </View>
 )
} 

const styles = StyleSheet.create({
  LabelShadow: {
    alignSelf: "flex-start",
    flexDirection:"row",
    backgroundColor: 'white',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  }
})