import * as React from 'react';
import { StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ProjectGalleryList } from '../components/ProjectGalleryList';
import { ImageGallery } from '../components/ImageGallery';
const Stack = createNativeStackNavigator(); 
export default function () {
  
  return (
    // <ImageGallery/>
    <Stack.Navigator
      initialRouteName="ProjectGalleryList"
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen key="ProjectGalleryList" name="ProjectGalleryList" component={ProjectGalleryList} />
      <Stack.Screen key="ImageGallery" name="ImageGallery" component={ImageGallery} />
    </Stack.Navigator>
  )
}
const styles = StyleSheet.create({
  center: {
    flex: 1,
    fontSize: 30,
    color: "#686868",
    justifyContent: 'center',
    alignItems: 'center',
  }
})