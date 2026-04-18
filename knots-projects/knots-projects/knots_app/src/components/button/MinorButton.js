import React, { useContext } from 'react';
import Button from './Button';
import { StyleSheet } from 'react-native';
import { theme } from '../../core/theme';
import { ThemeContext } from '../appContext/ThemeContext';

export default (props) => {
  const [themeContext] = useContext(ThemeContext)
  // const style = getStyles(themeContext.theme);
 return (
   <Button {...props} mode="outlined">
     {props.children}
   </Button>
 )
}

const getStyles = (mode) => StyleSheet.create({
  buttonStyles: {
      marginVertical: 0,
      padding: 5,
      backgroundColor: theme[mode].Secondary,
      alignItems: 'center',
      borderWidth: 2,
      borderColor: theme[mode].Primary,
      borderRadius: 3,
      width: "80%"
    },
    textStyles: {
      fontWeight: 'bold',
      fontSize: 20,
      textAlign: 'center',
      color: theme[mode].Primary,
    },
 })