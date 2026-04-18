/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import LoginScreen from './src/screens/LoginScreen';
import StartScreen from './src/screens/StartScreen';
import HomeScreen from './src/screens/HomeScreen';
import { TaskForm } from './src/components/tasks/TaskForm';
import UserInfoScreen from './src/screens/UserInfoScreen';
import Container from './src/components/Container';
import UserAuth from './src/components/UserAuth';
import ServerConnector from './src/components/apollo/ServerConnector';
import { AppContextProvider } from './src/components/appContext/AppContextProvider';
import Stack from './src/components/Stack';
import { LaunchCamera } from './src/components/Camera';
import { ImageGallery } from './src/components/ImageGallery';
import { AppStart } from './src/components/AppStart';
import { enableScreens } from 'react-native-screens';
import { Header } from './src/components/header/Header';
import { SafeAreaView } from 'react-native-safe-area-context';
import KnotsWebScreen from './src/screens/KnotsWebScreen'
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ToastProvider } from 'react-native-toast-notifications';
import ClokInScreen from './src/screens/ClockInScreen';
enableScreens();

const stackList = [
  { name: "AppStart", Component: AppStart },
  { name: "KnotsWebScreen", Component: KnotsWebScreen },
  { name: 'LoginScreen', Component: LoginScreen },
  { name: 'HomeScreen', Component: HomeScreen, options: { headerShown: false } },
  { name: 'TaskForm', Component: TaskForm },
  { name: 'ImageGallery', Component: ImageGallery },
  { name: 'ClokInScreen', Component: ClokInScreen },
  // { name: 'UserInfoScreen', Component: UserInfoScreen}
  // { name: 'Camera', Component: LaunchCamera },
];

const App = () => {
  return (
    <>
      <ToastProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <SafeAreaView style={{ flex: 1 }} edges={['top']}>
            <NavigationContainer>
              <AppContextProvider>
                <ServerConnector>
                  <Stack
                    stackList={stackList}
                    initialRouteName={stackList[0].name}
                    screenOptions={{
                      headerShadowVisible: true,
                      header: (props) => {
                        //  console.log("header", props)
                        return <Header {...props.options}>{props.children}</Header>
                      },
                      headerShown: false,
                    }} />
                </ServerConnector>
              </AppContextProvider>
            </NavigationContainer>
          </SafeAreaView>
        </GestureHandlerRootView>
      </ToastProvider>
    </>
  );
};

export default App;
 