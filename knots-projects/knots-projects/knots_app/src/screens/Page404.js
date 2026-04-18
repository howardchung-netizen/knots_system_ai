import * as React from 'react';
import { useState } from "react";
import { Button, Modal, TouchableOpacity, StyleSheet, View, Text, ScrollView, FlatList, Alert } from 'react-native';
export default function (props) {
 console.log('404')
  return (
   <View style={styles.center}><Text style={{color:"#686868"}}>頁面正在開發中...</Text></View>
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