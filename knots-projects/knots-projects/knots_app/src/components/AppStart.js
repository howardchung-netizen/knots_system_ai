import React, { useEffect, useContext, useRef, useState } from 'react';
import { View, StyleSheet, Image, ImageBackground, Text, Dimensions, Alert, Platform, Linking, AppState } from 'react-native';
import { APPInfoContext } from './appContext/AppContextProvider';
import { useNavigation } from '@react-navigation/native';
import FadeIn from './FadeIn';
import CenterView from './CenterView';
import remoteConfig from '@react-native-firebase/remote-config';
import { AlertError } from './AlertError';
const window = Dimensions.get('window');
const windowWidth = window.width;
const AlertUpdateRequest = (link) => { 
  let platform = {
    ios: {
      message: "請到App Store更新應用程式",
    },
    android: {
      message:
        "請到Google Play商店更新應用程式"
    },
  }
  Alert.alert(
    "應用程式已更新",
    platform[Platform.OS].message,
    [
      {
        text: "更新", onPress: () => Linking.openURL(link)
      }
    ]
  )
}
export const AppStart = function (props) {
  // console.log('AppStart');
  const duration = 1500;
  const start = useRef(Date.now());
  const [end, setEnd] = useState(false);
  const [needUpdate, setNeedUpdate] = useState(true);
  const appState = useRef(AppState.currentState);
  const [appStateVisible, setAppStateVisible] = useState(appState.current);
  const [appInfoContext, appInfoContextDispatch] = useContext(APPInfoContext);
  const navigation = useNavigation();
  const checkAppVersion = async () => {
    await remoteConfig().reset();
    await remoteConfig().fetch(0);
    await remoteConfig().fetchAndActivate().then(fetchedRemotely => {
      if (fetchedRemotely) {

        let review_version = remoteConfig().getValue('review_version').asString();
        let min_app_version = remoteConfig().getValue('min_app_version').asString();
        let review_status = remoteConfig().getValue('review_status').asBoolean();
        let app_store_link = remoteConfig().getValue('app_store_link').asString();
        let url_end_point = remoteConfig().getValue('url_end_point').asString();
        let dev_url_end_point = remoteConfig().getValue('dev_url_end_point').asString();

        if (min_app_version > appInfoContext.version){
           setNeedUpdate(true)
           AlertUpdateRequest(app_store_link);
           return;
        }
        else setNeedUpdate(false);

        appInfoContextDispatch({type:"SET_APP_INFO", payload:{
          isReviewing: review_version == appInfoContext.version && review_status ? true : false,
          dev_url_end_point: dev_url_end_point,
          url_end_point: url_end_point
        }});
        // console.log('Configs were retrieved from the backend and activated.');
      } else {
        AlertError("網絡連接失敗", "請檢查網絡再重新開啟")
        // console.log(
        //   'No configs were fetched from the backend, and the local configs were already activated',
        // );
      }
    });
  }
  useEffect(() => {
    checkAppVersion();
    const subscription = AppState.addEventListener("change",async nextAppState => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === "active"
      ) checkAppVersion();
      appState.current = nextAppState;
      setAppStateVisible(appState.current);
    });
    return () => {
      subscription.remove();
    };
  }, []);
  
  useEffect(() => {
    const delayMS = duration - (Date.now() - start.current);
    const timeout = setTimeout(function () {
      if (props.onEnd) props.onEnd();
      setEnd(true);
    }, delayMS)
    return () => clearTimeout(timeout);
  }, [])

  useEffect(()=>{
    if (end && !needUpdate) navigation.replace("LoginScreen");
  }, [needUpdate, end])
  
  return (
    <CenterView>
      <FadeIn duration={duration}>
        <ImageBackground
          source={require('../assets/knots-images/app_start_img.jpg')}
          style={{ flex: 1, width: windowWidth }} // Set the width and height
          imageStyle={{ resizeMode: 'cover' }}>
        </ImageBackground>
      </FadeIn>
    </CenterView>
  )
}

const styles = StyleSheet.create({
  starting: {
    backgroundColor: "white",
    position: "absolute",
    zIndex: 999999999999,
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  }
})