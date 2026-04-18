import React, { useEffect, useContext, useState, useRef } from 'react'
import { UserContext } from '../../components/appContext/UserContext'
import { currentUser as currentUserAsyncStorage, account, password, token } from '../asyncStorage/userAsyncStorage';
import { gql, useApolloClient, useMutation } from '@apollo/client';
import { ServerConnectionContext } from '../../components/appContext/ServerConnectionContext';
import { userFragment } from '../GQL/fragment';
import { loginMutation } from '../GQL/mutation'
import messaging from '@react-native-firebase/messaging';
import promiseAll from '../promiseAll';
const loginGQL = gql`${loginMutation} ${userFragment}`

export const useUserAuth = () => {
 const userContextDispatch = useContext(UserContext)[1];
 const _currentUser = useRef(null);
 const _account = useRef(null);
 const _password = useRef(null);
 const _deviceId = useRef(null);
 const [loginMutate] = useMutation(loginGQL, {
   onCompleted: async (data) => {
     console.log("onCompleted", data)
    await setUser(data.login.user, data.login.token, data.login.user.username, _password.current, _deviceId.current);
    },
   onError: async (err) => {
      await userContextDispatch({
        type: "INITIAL_CONFIG",
        payload: {}
      })
    }
  });
 
  const login = (username, password, deviceId, cb) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        reject({message:'無法連接伺服'});
      }, 5000);
      _password.current = password;
      loginMutate(
       {
        variables: {
         "data": {
          username: username,
          password: password,
          deviceId: deviceId
         }
        }
       }
      ).then(res => {
        // console.log("login", res);
        cb(res);
        resolve();
      }).catch(err => {
        // console.log("login", err);
        cb(err)
        reject(err);
      })
    })
  }

 const getUser = async () => {
  await promiseAll([
   currentUserAsyncStorage(),
   account(),
   password(),
   messaging().getToken()
  ], res => {
  //  console.log(res)
   _currentUser.current = res[0];
   _account.current = res[1];
   _password.current = res[2];
   _deviceId.current = res[3]
   login(_account.current, _password.current, _deviceId.current, () => { });
  })
 }
 
 const setUser = async (_user, _token, _account, _password, _deviceId) => {
  await promiseAll([
   currentUserAsyncStorage(_user),
   token(_token),
   account(_account),
   password(_password),
   userContextDispatch({
    type: "LOGIN",
    payload: {
     user: _user,
     token: _token,
     account: _account,
     password: _password,
     deviceId: _deviceId,
     loginType: "Account"
    }
   })
  ], res => {
   
  })
 }

 useEffect(() => { 
  getUser();
 }, [])
 
 return [_currentUser.current, login];
}
