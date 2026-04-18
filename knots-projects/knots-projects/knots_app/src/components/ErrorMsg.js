import React, { useContext } from "react";
import { Text, StyleSheet} from "react-native"
import { ThemeContext } from './appContext/ThemeContext';
export default ({ text }) => { 
 const [{ theme }] = useContext(ThemeContext);
 const color = {
  backgroundColor: theme.colors.error,
  color: theme.colors.accent
 };
 return text ? <Text style={[styles.ErrorMsg, color]}>{text}</Text> : <></>
}

const styles = StyleSheet.create({
 ErrorMsg: {
  fontSize:15,
  margin: 8,
  padding: 5,
 }
})