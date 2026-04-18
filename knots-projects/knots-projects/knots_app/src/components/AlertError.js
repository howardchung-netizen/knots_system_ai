
import * as React from 'react';
import { Alert } from 'react-native';

export const AlertError = (title, message) => { 
 console.log("AlertError", title, message)
 Alert.alert(
  title,
  message,
  [
    {
      text: "關閉",
      onPress: () => { },
      style: "cancel",
    },
  ],
  {
    cancelable: true,
  }
);
}