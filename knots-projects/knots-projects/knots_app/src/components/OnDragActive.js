import React, { useRef, useEffect } from "react";
import { StyleSheet, View, Animated } from "react-native"; 
import FontAwesome5Icon from "react-native-vector-icons/FontAwesome5";

export const OnDragActive = ({ item, index, drag, isActive, ...props }) => {
 console.log("OnDragActive")
 console.log(isActive)
 return (
  <View style={[styles.container, isActive ? styles.onActive : null]}>
   <View style={[{ width: "100%" }, isActive ? styles.onActive : null]}>
    {props.children}
    </View>
  </View>
 )

}

const styles = StyleSheet.create({
 container: {
  flex: 2,
  flexDirection: "row",
  width: "100%",
  justifyContent: "center",
  alignContent: "center"
 },
 icon: {
  marginLeft: 20,
  right: 0,
  fontSize: 15,
  justifyContent: "center",
  alignContent: "center",
  alignSelf: "center",
  zIndex: 100,
 },
 onActive: {
  borderWidth: 1,
  shadowColor: "#000",
  shadowOffset: {
   width: 0,
   height: 1,
  },
  shadowOpacity: 0.22,
  shadowRadius: 2.22,

  elevation: 3,
 }
});