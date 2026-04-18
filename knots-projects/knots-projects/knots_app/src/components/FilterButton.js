import React, { useContext, useState, createContext } from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import { ModalButton } from './modal/ModalButton';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { ThemeContext } from './appContext/ThemeContext';
import { Text } from './Text';
import scalesStyle, { scaledFontSize } from '../utils/scalesStyle';

export const FilterButton = ({ filterContext, title, body, height, width,  onConfirmPress, onClosePress}) => {
 const [{ theme }] = useContext(ThemeContext);
 const [contextState, setContextState] = useContext(filterContext);
 const iconContainerStyle = {...styles.iconContainerStyle, backgroundColor: theme.colors.secondary,  height:height??30,}
  const iconColor = (status) => { return status ? theme.colors.checkedColor : theme.colors.disabled; }
 return (<>
  <ModalButton
   modalButtonStyle={iconContainerStyle}
   title={title}
   width="90%"
   body={body}
   confirmButton
   onConfirmclose
   onConfirmPress={() => {
    if(onConfirmPress) onConfirmPress();
   }}
   closeButton
   onClosePress={() => {
    if(onClosePress) onClosePress();
   }}
  >
    <FontAwesome5 name="search" solid size={20} color={theme.colors.primary} />
    <Text style={{ paddingLeft: 5 }} color={theme.colors.primary}>{contextState.keyword == '' || !contextState.keyword ? "搜尋" : contextState.keyword}</Text>
  </ModalButton>
 </>)
}

const styles = StyleSheet.create(scalesStyle({
  iconContainerStyle: {
    height: "100%",
    borderRadius: 15,
    padding: 5,
    flexDirection: "row",
    height: 50,
    alignSelf: "center",
    alignContent: "center",
    alignItems: "center",
  },
  item: {
    padding: 3
  }
}));