import * as React from 'react';
import { useCallback } from 'react'; 
import {View, Text, Linking, Alert } from 'react-native';
import CenterView from './CenterView';
import Button from './button/Button';

export const NoPermissions = () => {
 return (
  <CenterView>
   <Text>讀取檔案權限不足，請按</Text>
   <View>
    <OpenSettingsButton />
   </View>
   <Text>開啟權限</Text>
  </CenterView>
 )
}

export const NoPermissionsAlert = (title, context) => {
 console.log("NoPermissionsAlert")
 Alert.alert(
  title??"",
  context??"",
  [
    {
      text: "取消",
      style: "cancel"
    },
    { 
      text: "設定",
      onPress: () => Linking.openSettings() }
  ]
);
}

export const OpenSettingsButton = ({ children }) => {
 const handlePress = useCallback(async () => {
  await Linking.openSettings();
 }, []);
 return <Button onPress={handlePress}>設定</Button>;
};

