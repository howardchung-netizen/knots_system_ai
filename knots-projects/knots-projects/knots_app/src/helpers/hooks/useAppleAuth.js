import React, { useEffect, useRef, useContext } from 'react';
import { Platform } from 'react-native';
import { appleAuth, AppleSignin } from '@invertase/react-native-apple-authentication';
import { gql, useMutation, useApolloClient } from '@apollo/client';
import { userFragment } from '../GQL/fragment';
import { userQuery } from '../GQL/query';
import { loginMutation } from '../GQL/mutation'
import { currentUser as currentUserAsyncStorage, token } from '../asyncStorage/userAsyncStorage';
import promiseAll from '../promiseAll';
import { UserContext } from '../../components/appContext/UserContext';
import messaging from '@react-native-firebase/messaging';

const loginGQL = gql`${loginMutation} ${userFragment}`;
const options = {
  requestedOperation: appleAuth.Operation.LOGIN,
  requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
};

export const AppleSigninButton = ({ ...rest }) => (
  <AppleSignin
    /** Auth options passed to AppleID.auth.init() */
    authOptions={{
      clientId: 'app-1-751874718363-ios-33c813d946c15d4f29243e',
      redirectURI: 'SAME AS ANDROID',
      scope: 'appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME',
      state: 'state',
      /** sha256 nonce before sending to apple to unify with native firebase behavior - https://github.com/invertase/react-native-apple-authentication/issues/28 */
      nonce: sha256('nonce'),
      /** We have to usePopup since we need clientSide authentication */
      usePopup: true,
    }}
    onSuccess={(response) => {
      console.log(response);
      // {
      //     "authorization": {
      //       "state": "[STATE]",
      //       "code": "[CODE]",
      //       "id_token": "[ID_TOKEN]"
      //     },
      //     "user": {
      //       "email": "[EMAIL]",
      //       "name": {
      //         "firstName": "[FIRST_NAME]",
      //         "lastName": "[LAST_NAME]"
      //       }
      //     }
      // }
    }}
  />
);

export const useAppleAuth = () => {
  // const [appleCurrentUser, setappleCurrentUser] = useState(null);
  const appleCurrentUser = useRef(null);
  const isSignedInapple = useRef(null);
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
        loginType: "apple",
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
  
  const checkIsSignedInapple = async () => {
    console.log("await appleSignin.isSignedIn()", await app.isSignedIn());
    try {
      if (await appleSignin.isSignedIn()) {
        await promiseAll([appleSignin.getCurrentUser(), messaging().getToken(), appleSignin.getTokens()], async (res, err) => {
          console.log("res", res, err);
          appleCurrentUser.current = res[0]
          deviceId.current = res[1];
          isSignedInapple.current = true;
          console.log("appleCurrentUser", appleCurrentUser.current);
          const credentialState = await appleAuth.getCredentialStateForUser(appleAuthRequestResponse.user);
          // use credentialState response to ensure the user is authenticated
          console.log("credentialState",credentialState)
          if (credentialState === appleAuth.State.AUTHORIZED) {
            // user is authenticated
            console.log("credentialState",credentialState)
          }
          if (appleCurrentUser.current?.user) await login(appleCurrentUser.current.idToken, deviceId.current);
        })
      }
      else  isSignedInapple.current = false;
    } catch (error) {
      console.log(error)
    }
  };
  
  const signInApple = async (cb) => {
    try {
      if(!appleAuth.isSupported) return;
      let currentUser = await appleAuth.performRequest(options);
      // console.log("currentUser", currentUser)
      appleCurrentUser.current = currentUser;
      deviceId.current = await messaging().getToken();
      // console.log("deviceId",deviceId.current)
      if(currentUser.identityToken) {
        // const credentialState = await appleAuth.getCredentialStateForUser(currentUser.user);
        //   // use credentialState response to ensure the user is authenticated
        //   if (credentialState === appleAuth.State.AUTHORIZED) {
        //     // user is authenticated
        //     console.log("credentialState",credentialState)
        //   }
        await login(currentUser.identityToken, currentUser.nonce, deviceId.current, (res)=>{
          if (cb) cb(res);
          // console.log(res)
        }) 
      }
      return { appleCurrentUser:appleCurrentUser.current, deviceId: deviceId.current};
    } catch (error) {
      console.log(error)
      if (cb) cb(error);
      return { error }
    }
  }

  const login = (idToken, nonce, deviceId, cb) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        reject({ message: '無法連接伺服' });
      }, 5000);
      loginMutate(
        {
          variables: {
            "data": {
              appleIdToken: idToken,
              appleNonce: nonce,
              deviceId: deviceId
            }
          }
        }
      ).then(async res => {
        console.log("login account after apple auth 2.0", res)
        if (res.errors)
        {
         
        }
        if (cb) cb(res)
        resolve(res)
      }).catch(async err => {
        if (cb) cb(err);
        reject(err)
        console.log(err)
      })
    })
  }
  
  useEffect(() => {
    // checkIsSignedInapple();
  }, [])
  return [appleCurrentUser.current, signInApple, login, deviceId.current]
}