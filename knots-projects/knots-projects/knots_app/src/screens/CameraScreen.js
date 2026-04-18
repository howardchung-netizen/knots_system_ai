import * as React from 'react';
import { useState } from "react";
import { Button, Modal, TouchableOpacity, StyleSheet, View, Text, ScrollView, FlatList, Alert } from 'react-native';
import { Camera } from '../components/Camera';
export default function (props) {
 console.log('CameraScreen')
  return (
   <View style={styles.center}>
    <Camera/>
   </View>
 )
}
const styles = StyleSheet.create({
  center: {
    flex: 1,
    fontSize: 30,
    color: "#686868",
    justifyContent: 'center',
    alignItems: 'center',
  }
})