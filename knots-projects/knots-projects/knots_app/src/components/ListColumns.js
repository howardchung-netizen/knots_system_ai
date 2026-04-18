import * as React from 'react';
import { View, StyleSheet, PixelRatio } from 'react-native';
import { ThemeContext } from './appContext/ThemeContext';
import { Text } from './Text';

export const ListColumn = ({ columns, backgroundColor }) => { 
 const [{ theme }] = React.useContext(ThemeContext);
 return (
   <View style={[styles.listColumnContainer, backgroundColor ? {backgroundColor:backgroundColor}:null]}>
     {columns.map(({name, style, size}) => 
       <Text size={size} key={name} style={style} color={theme.colors.text}>{name}</Text>
     )}
   </View>
 )
}

const styles = StyleSheet.create({
 listColumnContainer: {
  width:"100%",
  paddingHorizontal: 10,
  flexDirection: "row",
  justifyContent: "center",
  alignContent: "center",
  alignItems: "center",
 },
}) 