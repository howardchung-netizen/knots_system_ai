import React, { useContext } from 'react';
import { PixelRatio } from 'react-native';
import { ThemeContext } from './appContext/ThemeContext';
import { Text as PaperText, Provider } from 'react-native-paper'
import scalesStyle, { scaledFontSize } from '../utils/scalesStyle';
export const Text = (props) => { 
  const [{ theme }] = useContext(ThemeContext);
  const color = { color: props.color??theme.colors.text };
  const size = { fontSize: scaledFontSize(props.size??15) }
 return (
   <PaperText
     {...props}
     style={[props.style, color, size]}
     theme={theme}
   >
     {props.children}
   </PaperText>
 )

}