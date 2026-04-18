import React, { useContext } from 'react';
import { TouchableOpacity } from "react-native";
import { ThemeContext } from '../appContext/ThemeContext';
import { Appbar } from 'react-native-paper';
import FontAwesome5Icon from 'react-native-vector-icons/FontAwesome5';
export default (props) => {
 const [{theme}] = useContext(ThemeContext);
 return (
  <TouchableOpacity>
   <Appbar.Action
    {...props}
    icon={ props.FontAwesome5Icon ? () => <FontAwesome5Icon name={props.icon} color={theme.colors.accent} size={20} /> : props.icon}
    color={theme.colors.accent}
    style={[props.style]}
   />
  </TouchableOpacity>
 )
}

