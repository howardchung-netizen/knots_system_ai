import React, { useContext } from 'react';
import { ThemeContext } from '../appContext/ThemeContext';
import { StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';
import scalesStyle, { scaledFontSize } from '../../utils/scalesStyle';

export default ({ style, labelStyle, padding, ...props }) => {
  const [themeContext] = useContext(ThemeContext);
  const width = props.width ? { width: props.width } : null;
  const fontSize = { fontSize: props.fontSize ? scaledFontSize(props.fontSize) : scaledFontSize(20) };
  const _padding = { padding: padding ? padding : 5 };
  return (
    <Button
      {...props}
      theme={themeContext.theme}
      style={[{ width: "100%" }, scalesStyle(style), width]}
      contentStyle={[_padding]}
      labelStyle={[styles.labelStyle, scalesStyle(props.labelStyle), fontSize]}
    >{props.children}
    </Button>
  )
}

const styles = StyleSheet.create({
  labelStyle: {
      fontWeight: 'bold',
      textAlign: 'center',
    },
})

