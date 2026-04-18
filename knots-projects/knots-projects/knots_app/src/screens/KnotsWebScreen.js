import * as React from 'react';
import { useContext } from "react";
import { StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { FAB } from 'react-native-paper';
import { ThemeContext } from '../components/appContext/ThemeContext';
import { useNavigation } from '@react-navigation/native';
export default function (props) {
  const [{ theme }] = useContext(ThemeContext);
  const navigation = useNavigation();
  const onPress = ()=>{
     navigation.navigate("LoginScreen")
  }
  return (
    <View style={{ flex: 1 }}>
      <WebView
        style={{ flex: 1 }}
        source={{ uri: 'https://knotsltd.com' }}
      ></WebView>
      <FAB
        icon="login-variant"
        size="large"
        color={theme.colors.accent}
        style={[styles.fab, {backgroundColor:theme.colors.primary}]}
        onPress={onPress}
      />
    </View>

  )
}
const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 20,
  },
})