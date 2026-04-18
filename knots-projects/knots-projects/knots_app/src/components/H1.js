import React, { useContext } from 'react'
import { StyleSheet, Text } from 'react-native'
import { theme } from '../core/theme'
import { ThemeContext } from './appContext/ThemeContext'
export default function (props) { 
 const [themeContext] = useContext(ThemeContext)
 const styles = getStyles(themeContext)

 return (
  <Text style={[styles.h1, { color: themeContext.theme.colors.text } ]} {...props}/>
 )
}

const getStyles = () => {
 return StyleSheet.create({
  h1: {
   marginBottom: 10,
   justifyContent: 'center',
   alignItems: 'center',
   fontSize: 30,
   fontWeight: "bold"
  }
 })
}
