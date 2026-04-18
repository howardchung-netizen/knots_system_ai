import React, { useContext, createRef } from 'react';
import { StyleSheet } from 'react-native';
import { ThemeContext } from './appContext/ThemeContext';
import { Searchbar as PaperSearchbar } from 'react-native-paper';

export const Searchbar = ({ value, onChangeText, placeholder, style, ...props }) => {
  const [{ theme }] = useContext(ThemeContext);
  const backgroundColor = { backgroundColor: theme.colors.secondary }
  const defaultColor = { color: theme.colors.text }
  // const valueRef = createRef(value)
  // console.log("Searchbar", valueRef.current)
  return (
    <PaperSearchbar
      {...props}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      style={[styles.searchbarDefaultStyle, backgroundColor, style]}
      inputStyle={[defaultColor]}
      iconColor={theme.colors.text}
      placeholderTextColor={theme.colors.text}
      />
  )
}

const styles = StyleSheet.create({
 searchbarDefaultStyle: {
  margin: 3,
  borderRadius: 5,
 }
})