import React, { useContext } from 'react';
import { StyleSheet } from 'react-native';
import { ThemeContext } from '../appContext/ThemeContext';
import { Appbar } from 'react-native-paper';

export default (props) => {
 const [{ theme }] = useContext(ThemeContext);
 return (
  <Appbar.Content theme={theme}
   {...props}
   style={[props.style]}
   titleStyle={[style.titleStyle, { ...props.titleStyle, color:"white" }]}
  />
 )
}

const style = StyleSheet.create({
 titleStyle: {
  fontWeight:"bold"
 }
})