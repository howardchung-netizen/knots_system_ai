import * as React from 'react';
import { useState, useContext, useEffect, createRef, useCallback, useRef } from 'react'; 
import { ThemeContext } from './appContext/ThemeContext';
import { TouchableOpacity, StyleSheet, View, Text, ScrollView, Image, Dimensions, Linking, AppState, PermissionsAndroid, Platform  } from 'react-native';
import { FAB, Portal } from 'react-native-paper';

export const FABGroup = (props) => {
 const [{ theme }] = useContext(ThemeContext);
 const [state, setState] = useState({ open: false });
 const onStateChange = ({ open }) => setState({ open });
 const { open } = state;
 return (
  <Portal>
   <FAB.Group
    style={[styles.FABGroupStyle, props.style]}
    fabStyle={[{ backgroundColor: theme.colors.primary }, props.fabStyle]}
    color={props.color??theme.colors.accent}
    open={open}
    icon={props.icon??'dots-vertical'}
    actions={props.actions}
    onStateChange={onStateChange}
    onPress={() => {
     if (open) {
      // do something if the speed dial is open
     }
    }}
   />
  </Portal>
 );
};

const styles = StyleSheet.create({
 FABGroupStyle: {
  zIndex:1000
 }
})
