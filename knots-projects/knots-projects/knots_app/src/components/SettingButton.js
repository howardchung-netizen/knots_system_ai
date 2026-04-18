import React, { useContext, useState, createContext } from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import { ModalButton } from './modal/ModalButton';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { ThemeContext } from './appContext/ThemeContext';
import { Searchbar, List } from 'react-native-paper';
import { Text } from './Text';

export const SettingButton = ({ title, body, height, width, onConfirmPress, onClosePress }) => {
 const [{ theme }] = useContext(ThemeContext);
 const iconContainerStyle = {...styles.iconContainerStyle, backgroundColor: theme.colors.secondary,  height:height??30,}
  const iconColor = (status) => { return status ? theme.colors.checkedColor : theme.colors.disabled; }
 return (<>
  <ModalButton
   title={title}
   width="90%"
   body={body}
   confirmButton={onConfirmPress ? true : false}
   onConfirmclose
   onConfirmPress={() => {
    if(onConfirmPress) onConfirmPress();
   }}
   closeButton
   onClosePress={() => {
    if(onClosePress) onClosePress();
   }}
  >
   <View style={iconContainerStyle}>
    <FontAwesome5 name="cog" solid size={20} color={theme.colors.primary} />
   </View>
  </ModalButton>
 </>)
}

const styles = StyleSheet.create({
  iconContainerStyle: {
    height: "100%",
    borderRadius: 15,
    padding: 5,
    flexDirection: "row",
    height: 30,
    alignSelf: "center",
    alignContent: "center",
    alignItems: "center",
  },
  item: {
    padding: 3
  }
});