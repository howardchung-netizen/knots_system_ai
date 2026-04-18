import React, { useContext } from 'react';
import { View, TouchableOpacity } from 'react-native';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { ThemeContext } from './appContext/ThemeContext';
import { Text } from './Text';
function getLabelDirection(LabelDirection) { 
  switch (LabelDirection) { 
    case "right":
      return "row"
    case "left":
      return "row-reverse"
    default :
    return "row"
  }
}

export const CheckBox = ({ label, status, onPress, labelDirection, containerStyle, textStyle, size, color, name , textSize, textColor, iconStyle, disabled}) => {
  const [{ theme }] = useContext(ThemeContext);
  const defaultColor = theme.colors[status ? "primary" : "text"];
  return (
      <View style={[{ flexDirection: getLabelDirection(labelDirection), alignItems: 'center'}, containerStyle]}>
      <Text style={[{ fontWeight: 'bold', color: theme.colors.text }, textStyle]} color={textColor??defaultColor}>{label}</Text>
      <TouchableOpacity onPress={onPress} disabled={disabled}>
        <FontAwesome5
          style={[{ margin: 3 }, iconStyle ]}
          size={size ? size : 25}
          name={name ? name : "check-square"}
          color={ color ? color : defaultColor}
          solid   
        />
      </TouchableOpacity>
      </View>
  );
}

