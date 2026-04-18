import React, { useContext } from 'react';
import { StyleSheet, View } from 'react-native';
import { Avatar } from 'react-native-paper';
import { ThemeContext } from './appContext/ThemeContext';
import CenterView from './CenterView';
import { Text } from './Text';

export const AvatarItem = (props) => {
  const [{ theme }] = useContext(ThemeContext);
  const containerStyle = {
    avatarDirection: props.avatarDirection == "left" ? "row-reverse" : "row",
    width: props.width ? props.width : null,
    // backgroundColor: props.backgroundColor ? props.backgroundColor : theme.colors.avatarItemBackgroundColor,
  }

  return (
    <View style={[styles.container, containerStyle, props.containerStyle]}>
      <View>
        <Avatar.Text
          theme={theme}
          color={props.color}
          style={{ backgroundColor: props.labelColor }}
          labelStyle={[styles.avatarLabelStyle, props.avatarLabelStyle]}
          size={props.size}
          label={props.label}
        />
      </View>
      {props.children ? props.children : null}
    </View>
  )
}

export const SmallAvatar = (props) => {
  const [{ theme }] = useContext(ThemeContext);
  const containerStyle = {
    avatarDirection: props.avatarDirection == "left" ? "row-reverse" : "row",
    width: props.width ? props.width : null,
    // backgroundColor: props.backgroundColor ? props.backgroundColor : theme.colors.avatarItemBackgroundColor,
  }

  return (
    <CenterView style={[styles.container, containerStyle, props.containerStyle]}>
      <Text color={props.color} size={props.size}>{props.label}</Text>
    </CenterView>
  )
}

const styles = StyleSheet.create({
 container: {
   flexDirection: "row",
   alignItems: "center",
  //  padding: 3,
 },
 avatarLabelStyle: {
   fontWeight: "bold",
 },
 textSize: {fontSize:12}
});
