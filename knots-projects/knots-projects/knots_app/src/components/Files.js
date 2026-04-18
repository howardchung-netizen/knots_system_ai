import React, { useContext, useState } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity } from 'react-native';
import { ThemeContext } from './appContext/ThemeContext';
// import ViewShot from "react-native-view-shot";
import moment from 'moment';
import { LabelShadow } from './Shadow';
import FontAwesome5Icon from 'react-native-vector-icons/FontAwesome5';
// import { Camera, useCameraDevices } from 'react-native-camera';
// import { RNCamera } from 'react-native-camera';
// import { Camera } from './Camera';
import { MenuButton } from './MenuButton';
import { Text } from './Text';

export const FilesButton = (props) => { 

 const [{ theme }] = useContext(ThemeContext);
 const titleStyle = {
  color: theme.colors.secondary,
  fontSize: props.titleSize ? props.titleSize : null
  }
  
  const onUploadFile = async () => { 
  // const d = await Camera.getAvailableCameraDevices();
  // console.log(d)
  }

  return (
    <>
      <View style={[styles.labelStyle]}>
        <Text style={[styles.title, titleStyle]}>{props.title}</Text>
        <FontAwesome5Icon style={styles.icon} name="folder-plus" size={props.iconSize} solid />
      </View>
    </>
 )
}

export const FilesListContainer = (props) => { 
  const [{ theme }] = useContext(ThemeContext);
   return (
     <>
        <ScrollView horizontal={true} style={{ padding: 3 }}>
           <FilePDF name="PDFasdasd" />
           <FilePDF name="PDFasdasd" />
           <FilePDF name="PDFasdasd" />
         </ScrollView>
     </>
  )
}
 
export const FilePDF = ({ name, size }) => {
  const iconSize = size ? size : 30;
  const [{ theme }] = useContext(ThemeContext);
  return (
    <View style={[styles.FilePDFContainer]}>
      <FontAwesome5Icon name="file-pdf" color={"#fb2929"} solid size={iconSize} />
      <Text theme={theme} numberOfLines={1} style={[styles.FilePDFName, { maxWidth: iconSize + 10 }]}>{name}</Text>
    </View>
  )
}

export const FileImage = ({ name, size }) => {
  const iconSize = size ? size : 30;
  return (
      <View style={[styles.FilePDFContainer]}>
        <FontAwesome5Icon name="file-pdf" color={"#fb2929"} solid size={iconSize} />
        <Text numberOfLines={1} style={[styles.FilePDFName, { maxWidth: iconSize + 10 }]}>{name}</Text>
      </View>
  )
}

export const Files = (props) => {
  // const devices = useCameraDevices()
  // const device = devices.back
  // console.log(devices)

  return (
    <View style={[styles.containerStyle]}>
      <MenuButton
        button={<FilesButton {...props} />}
        items={props.items}
      />
      <FilesListContainer />
    </View>
  )
}

const styles = StyleSheet.create({
 containerStyle: {
  flexDirection: "row"
 },
 labelStyle: {
 },
 title: {
  marginHorizontal: 10,
 },
 icon: {
  marginHorizontal: 10,
  color: "#7798a8"
 },
 listContainer: {},
 subTaskTitle: {
  fontSize: 18,
  margin: 10
 },
 FilePDFContainer: {
  marginRight: 5,
  alignItems: "center",
  borderStyle: "dashed",
  borderWidth: 1,
  padding:3
 },
 FilePDFName: {
  ellipsizeMode:"tail"
 },
})