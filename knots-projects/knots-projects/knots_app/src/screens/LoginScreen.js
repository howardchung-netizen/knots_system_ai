import React, { useState, useEffect, useContext, useRef } from 'react';
import { View, ImageBackground, Dimensions, Image, Alert, StyleSheet, TouchableOpacity, PixelRatio, Platform, Keyboard, Pressable } from 'react-native';
import { CheckBox } from '../components/CheckBox';
import CenterView from '../components/CenterView';
import H1 from '../components/H1';
import Button from '../components/button/Button';
import TextInput from '../components/TextInput';
import Loading from '../components/Loading';
import ErrorMsg from '../components/ErrorMsg';
import { UserContext } from '../components/appContext/UserContext';
import { Text } from '../components/Text';
import { userQuery } from '../helpers/GQL/query';
import { userFragment } from '../helpers/GQL/fragment';
import { useUserAuth } from '../helpers/hooks/useUserAuth';
import { useGoogleAuth } from '../helpers/hooks/useGoogleAuth';
import { useAppleAuth } from '../helpers/hooks/useAppleAuth';
import { AppStart } from '../components/AppStart';
import { AlertError } from '../components/AlertError';
import { ThemeContext } from '../components/appContext/ThemeContext';
import { gql, useApolloClient } from '@apollo/client';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { appleAuth } from '@invertase/react-native-apple-authentication';
import { APPInfoContext } from '../components/appContext/AppContextProvider';
import scalesStyle, { scaledFontSize } from '../utils/scalesStyle';
const LoginScreen = (props) => {
  // console.log('LoginScreen', props)
  const [{ theme }] = useContext(ThemeContext);
  const [starting, setStarting] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [{ user, isLogedin }] = useContext(UserContext);
  const [userCredentails, setUserCredentails] = useState({ username: null, password: null });
  const { username, password } = userCredentails;
  const [loginState, setLogingState] = useState({ data: null, loading: null, error: null });
  const { data, loading, error } = loginState;
  // const [checked, setChecked] = useState(userContext.account ? true : false);
  const [accountUser, loginByAccount] = useUserAuth();
  const [googleCurrentUser, signInGoogle, login, deviceId] = useGoogleAuth();
  const [appleCurrentUser, signInApple, loginByAppleToken, appleDeviceId] = useAppleAuth();
  const [appInfoContext, appInfoContextDispatch] = useContext(APPInfoContext);
  const [textColor, setTextColor] = useState({
    username: theme.colors.text,
    password: theme.colors.text
  });
  const btnTextSize = scaledFontSize(20) ;
  const inputOnChange = (name, text) => {
    setUserCredentails( { ...userCredentails, [name]: text })
  }
  const onLoginPressed = async () => {
    _setLogingState(null, true, null);
    // console.log(!username || !password)
    if (!username || !password) { _setLogingState(null, null, { message: "請輸入帳戶和密碼" }); }
    else {
      try {
        await loginByAccount(username, password, null, (res) => {
          // console.log(res)
          _setLogingState(res.data, null, res.errors);
        })
      } catch (error) {
        _setLogingState(null, null, error);
      }
    }
  }
  const _setLogingState = (data, loading, error) => { 
    // console.log("_setLogingState")
    setLogingState({ data, loading, error })
  }
  const changeTextColor = (name, color) => { 
    setTextColor({...textColor, [name]:theme.colors[color]});
  }
  const appleLogin = async () => {
    _setLogingState(null, true, null);
    await signInApple((res)=>{
       console.log(res)
       if(res.errors) _setLogingState(null, false, res.errors);
       else _setLogingState(null, false, null);
    });
    // get current authentication state for user
    // /!\ This method must be tested on a real device. On the iOS simulator it always throws an error.
    // const credentialState = await appleAuth.getCredentialStateForUser(appleAuthRequestResponse.user);
  
    // // use credentialState response to ensure the user is authenticated
    // if (credentialState === appleAuth.State.AUTHORIZED) {
    //   // user is authenticated
    //   console.log("apple logedin")
    // }
  }
  const goBack = ()=>{
    props.navigation.replace("KnotsWebScreen");
  }
  useEffect(() => { 
    if (googleCurrentUser || accountUser) { 
      _setLogingState(googleCurrentUser??accountUser, true, null);
      setTimeout(()=>_setLogingState(null, false, null), 5000)
    }
  }, [googleCurrentUser, accountUser])
  useEffect(() => {
    // console.log("user", user)
    if (googleCurrentUser?.user && !isLogedin) {
      try {
        login(googleCurrentUser.idToken, deviceId, (res) => {
          _setLogingState(res.user, null, res.errors);
        })
      } catch (error) {
        _setLogingState(res.data, null, error);
      }
    } 
    else if (user && isLogedin) {
      props.navigation.reset({
        index: 0,
        routes: [{ name: 'HomeScreen' }],
      })
    }
    if (loginState.error) {
      // setErrorMsg(res.errors[0].message);
      // setEmail({ ...email, error: '帳戶或密碼錯誤' })
      // setPassword({ ...password, error: '帳戶或密碼錯誤' })
    }
  }, [user, isLogedin])
  return (
    // <AppStart>
    <Pressable style={{flex:1}} onPress={Keyboard.dismiss}>
      {
        appInfoContext?.apple_reviewing ?
        <FontAwesome5 solid name='arrow-left' size={25} color={"black"} style={[styles.goBackBtn]} onPress={goBack}/> 
        : null
      }
      <ImageBackground
        onPress={Keyboard.dismiss}
        source={require('../assets/knots-images/bg2x.jpg')}
        style={{ flex: 1 }} // Set the width and height
        imageStyle={{ resizeMode: 'cover', width:"100%", height:"100%" }}>
        <View style={{ flex: 1, alignItems:"center", padding:10, justifyContent:"space-around"}}>
        <Image
            source={require('../assets/knots-images/logo3x.png')}
            style={{ resizeMode: 'contain', width:"90%", height:"30%"}}/>
          {loading ? <Loading /> : null}
          <ErrorMsg text={error ? error.message : null} />
          { 
              appInfoContext.isReviewing ?
              <>
                <TextInput
                  ellipsizeMode={"tail"}
                  // mode="outlined"
                  textColor={textColor.username}
                  style={{ ...styles.textInput }}
                  name="username"
                  title='帳號'
                  returnKeyType="next"
                  value={username}
                  onChangeText={inputOnChange}
                  autoCapitalize="none"
                  onFocus={() => changeTextColor("username", "primary")}
                  onBlur={() => changeTextColor("username", "text")}
                />
                <TextInput
                  // mode="outlined"
                  textColor={textColor.password}
                  style={{ ...styles.textInput }}
                  name="password"
                  secure={true}
                  title='密碼'
                  returnKeyType="done"
                  value={password}
                  secureTextEntry={true}
                  onChangeText={inputOnChange}
                  onFocus={() => changeTextColor("password", "primary")}
                  onBlur={() => changeTextColor("password", "text")}
                />
                <TouchableOpacity
                  style={[styles.appleBtnContainer, { backgroundColor: theme.colors.primary, marginTop: 20 }]}
                  onPress={async () => await onLoginPressed()}>
                  <Text color={theme.colors.accent} style={{ fontWeight: "bold" }} size={btnTextSize}>登入</Text>
                </TouchableOpacity>
                <Text style={{ margin: 2 }} size={20}>或</Text>
              </>
              : null
          }
          <View style={{width: "100%", alignItems:"center"}}>
          <TouchableOpacity
            style={styles.googleBtnContainer}
            onPress={async () => {
              _setLogingState(null, true, null);
              try {
                let { googleCurrentUser, deviceId, error } = await signInGoogle();
                if (error) {
                  _setLogingState(null, null, error.message);
                  // AlertError("Google登入失敗", error.message);
                }
                else if (googleCurrentUser) await login(googleCurrentUser.idToken, deviceId, (res) => _setLogingState(res.user, null, res.errors))           
                else _setLogingState(null, false);
              } catch (error) {
                _setLogingState(null, null, error);
              }
          }}>
            <Image style={{ width: 30, height: 30, left: 15, position: "absolute" }} source={require('../assets/knots-images/google.png')} resizeMode={"contain"} />
            <Text color={theme.colors.Text} style={{ fontWeight: "bold", fontSize:27}} size={btnTextSize}>使用 Google 登入</Text>
          </TouchableOpacity>
          {
          appleAuth.isSupported && Platform.OS == 'ios' && appInfoContext.isReviewing ?
          <TouchableOpacity
            style={styles.appleBtnContainer}
            onPress={(appleLogin)}>
            {/* <Image style={{ width: 30, height: 30, left: 15, position: "absolute" }} source={require('../assets/knots-images/google.png')} resizeMode={"contain"} /> */}
            <FontAwesome5 solid name='apple' size={40} color={"black"} style={{left: 15, position: "absolute" }} />
            <Text color={theme.colors.Text} style={{ fontWeight: "bold", fontSize:27}} size={btnTextSize}>Sign in with Apple</Text>
          </TouchableOpacity>
          : null
          }
          </View>
        </View>
      </ImageBackground>
    </Pressable>
    // </AppStart>
  )
}

const styles = StyleSheet.create(scalesStyle({
  textInput: {
    backgroundColor: null,
    fontSize: 20,
    paddingTop: 10,
    fontSize: 21,
    fontWeight: "bold",
  },
  googleBtnContainer: {
    width: "80%",
    height: 48,
    backgroundColor: "white",
    flexDirection: "row",
    borderRadius: 5,
    justifyContent: "center",
    alignContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  appleBtnContainer: {
    marginTop:10,
    width: "80%",
    height: 48,
    backgroundColor: "white",
    flexDirection: "row",
    borderRadius: 5,
    justifyContent: "center",
    alignContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  goBackBtn: {
    position: 'absolute',
    margin: 10,
    left: 5,
    top: 5,
    zIndex:100
  },
}))
export default LoginScreen

