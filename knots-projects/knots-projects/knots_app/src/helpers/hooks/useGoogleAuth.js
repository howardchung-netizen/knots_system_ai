import React, { useEffect, useRef, useContext } from 'react';
import { Platform } from 'react-native';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { gql, useMutation, useApolloClient } from '@apollo/client';
import { userFragment } from '../GQL/fragment';
import { userQuery } from '../GQL/query';
import { loginMutation } from '../GQL/mutation'
import { currentUser as currentUserAsyncStorage, token } from '../asyncStorage/userAsyncStorage';
import promiseAll from '../promiseAll';
import { UserContext } from '../../components/appContext/UserContext';
import messaging from '@react-native-firebase/messaging';

const loginGQL = gql`${loginMutation} ${userFragment}`;
const scopes = [
  'https://www.googleapis.com/auth/drive.readonly',
  'https://www.googleapis.com/auth/photoslibrary',
  'https://www.googleapis.com/auth/photoslibrary.sharing',
  'https://www.googleapis.com/auth/photoslibrary.edit.appcreateddata',
  'https://www.googleapis.com/auth/photoslibrary.appendonly',
  "https://www.googleapis.com/auth/userinfo.profile",
  "https://www.googleapis.com/auth/userinfo.email",
  "https://www.googleapis.com/auth/drive",
  "https://www.googleapis.com/auth/drive.file",
  "https://www.googleapis.com/auth/drive.appdata",
  "https://www.googleapis.com/auth/drive.metadata"
];
GoogleSignin.configure({
 scopes: scopes,
 webClientId: '751874718363-4vgi2hcf1k4fs3cdgvaqqce60pic5f76.apps.googleusercontent.com', // client ID of type WEB for your server (needed to verify user ID and offline access)
 offlineAccess: false, // if you want to access Google API on behalf of the user FROM YOUR SERVER
 // hostedDomain: '', // specifies a hosted domain restriction
 forceCodeForRefreshToken: true, // [Android] related to `serverAuthCode`, read the docs link below *.
 // accountName: '', // [Android] specifies an account name on the device that should be used
//  iosClientId: '751874718363-c7627mmmt2vcdhcuq6g5u0rp6i47g3it.apps.googleusercontent.com', // [iOS] if you want to specify the client ID of type iOS (otherwise, it is taken from GoogleService-Info.plist)
 // googleServicePlistPath: '', // [iOS] if you renamed your GoogleService-Info file, new name here, e.g. GoogleService-Info-Staging
 // openIdRealm: '', // [iOS] The OpenID2 realm of the home web server. This allows Google to include the user's OpenID Identifier in the OpenID Connect ID token.
 // profileImageSize: 120, // [iOS] The desired height (and width) of the profile image. Defaults to 120px
 include_granted_scopes: true
});
export const useGoogleAuth = () => {
  // const [googleCurrentUser, setGoogleCurrentUser] = useState(null);
  const googleCurrentUser = useRef(null);
  const isSignedInGoogle = useRef(null);
  const currentToken = useRef(null);
  const deviceId = useRef(null);
  const [user, userContextDispatch] = useContext(UserContext);
  const client = useApolloClient();
  const setUser = async (_user, _token, _deviceId) => {
    await promiseAll([
     currentUserAsyncStorage(_user),
     token(_token),
     userContextDispatch({
      type: "LOGIN",
      payload: {
       user: _user,
       token: _token,
       deviceId: _deviceId,
        loginType: "Google",
        account: null,
        password: null,
      }
     })
    ],async res => {
      // console.log("currentUserAsyncStorage", await currentUserAsyncStorage())
    })
  }
  
  const [loginMutate] = useMutation(loginGQL, {
    onCompleted: async (data) => {
      await setUser(data.login.user, data.login.token, deviceId.current);
    },
    onError: async (err) => {
      await userContextDispatch({
        type: "INITIAL_CONFIG",
        payload: {}
      })
    }
  });
  
  const checkIsSignedInGoogle = async () => {
    try {
      if (await GoogleSignin.isSignedIn()) {
        // if (Platform.OS == 'ios')
        await GoogleSignin.signInSilently()
        await promiseAll([GoogleSignin.getCurrentUser(), messaging().getToken(), GoogleSignin.getTokens()], async (res, err) => {
          console.log("GoogleSignin", res, err);
          googleCurrentUser.current = res[0];
          deviceId.current = res[1];
          isSignedInGoogle.current = true;
          // console.log("googleCurrentUser", googleCurrentUser.current);
          // if (Platform.OS == 'android') {
          //   await GoogleSignin.clearCachedAccessToken(res[2].accessToken);

          //   await setUser(await currentUserAsyncStorage(), await token(), deviceId.current);
          // }
          // else if (googleCurrentUser.current?.user) await login(googleCurrentUser.current.idToken, deviceId.current);
          if (googleCurrentUser.current?.user) await login(googleCurrentUser.current.idToken, deviceId.current);
        })
      }
      else  isSignedInGoogle.current = false;
    } catch (error) {
      console.log(error)
    }
  };
  
  const signInGoogle = async (cb) => {
    try {
      let currentUser = await GoogleSignin.signIn();
      if(currentUser && Platform.OS == "ios") currentUser = await GoogleSignin.addScopes({scopes});
      // console.log("signInGoogle", currentUser)
      // currentUser.accessToken = (await GoogleSignin.getTokens()).accessToken;
      googleCurrentUser.current = currentUser;
      // await login(currentUser.idToken, deviceId.current, cb);
      deviceId.current = await messaging().getToken();
      // console.log("deviceId",deviceId.current)
      if (cb) cb(googleCurrentUser.current, deviceId.current);
      return { googleCurrentUser:googleCurrentUser.current, deviceId: deviceId.current};
    } catch (error) {
      console.log(error)
      if (cb) cb(error);
      return { error }
    }
  }

  const login = (idToken, deviceId, cb) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        reject({ message: '無法連接伺服' });
      }, 5000);
      loginMutate(
        {
          variables: {
            "data": {
              googleIdToken: idToken,
              deviceId: deviceId
            }
          }
        }
      ).then(async res => {
        console.log("login account after Google auth 2.0", res)
        if (res.errors)
        {
          await GoogleSignin.revokeAccess();
          await GoogleSignin.signOut();
        }
        if (cb) cb(res)
        resolve(res);
      }).catch(async err => {
        console.log(err)
        if (cb) cb(err);
        await GoogleSignin.signOut();
        await GoogleSignin.revokeAccess();
        reject(err);
        console.log(err);
      })
    })
  }
  
  useEffect(() => {
    checkIsSignedInGoogle();
  }, [])
  // useEffect(()=>{
  //   if (isSignedInGoogle.current && googleCurrentUser.current) client.query(
  //     {
  //       query: gql`${userQuery} ${userFragment}`,
  //       variables:{
  //         id: googleCurrentUser.current.id
  //       }
  //     }
  //   ).then(res => {
  //     setUser(res.data.users.edges.find(e=> e.node.id == googleCurrentUser.current.id).node, currentToken.current, deviceId.current);
  //   }).catch(err => {console.log(err)})
  // }, [isSignedInGoogle.current])
  return [googleCurrentUser.current, signInGoogle, login, deviceId.current]
}