import { gql, useLazyQuery, useMutation, useQuery } from "@apollo/client";
import React, { createContext, useContext, useEffect, useReducer } from "react";
import { Cookies } from "react-cookie";
import { usersQuery } from "../apollo/queries";
import { userFragment } from "../apollo/fragments";

const cookies = new Cookies();


export const UserContext = createContext({
  info: null,
  token: cookies.get('authToken')??null,
  account: null,
  password: null,
  deviceID: null,
  isInited: cookies.get('authToken') ? true: null,
  isLogedin: cookies.get('authToken') ? true: null,
  loginType: "default"
});

const userContextReducer = (state, action) => {
  // console.log("userContextReducer", { ...state, ...action.payload })
  switch (action.type) {
    case 'INITIAL_CONFIG':
      return { ...state, ...{ isInited: true }, ...action.payload }
    case 'SET_CURRENT_USER':
      return { ...state, ...action.payload }
    case 'LOGIN':
      // const decodedToken = jwt.decode(res.login.token);
      cookies.set("authToken", action.payload.token, { path: '/', maxAge: 7776000})
      cookies.set("userId", action.payload.id, { path: '/', maxAge: 7776000})
      return { ...state, ...{ isInited: true, isLogedin: true }, ...action.payload };
    case 'LOGOUT':
      console.log('logout')
      cookies.remove('authToken', { path: '/' });
      cookies.remove('userId', { path: '/' });
      console.log(cookies.get('authToken'))
      return { ...state, ...{ info: null, token: null, isInited: false, isLogedin: false, account: null, password: null } }
  }
}

export const UserContextProvider = ({ children }) => {

  const [context, dispatch] = useReducer(userContextReducer, useContext(UserContext));
  const [getUser] = useLazyQuery(gql`${usersQuery} ${userFragment}`, { 
    fetchPolicy: 'network-only',
   });

  useEffect(() => {
    if (context.isLogedin)
      (async () => {
        getUser({
          variables: {
            first: 1,
            id: cookies.get('userId')
           },
          onCompleted: (res) => {
            if (res.users?.edges) {
              dispatch({ type: 'SET_CURRENT_USER', payload: { info: res.users.edges[0].node } });
            }
            else {
              dispatch({ type: 'LOGOUT' });
            }
          }
        })
      })()
  }, [context.isLogedin])
  
  return (
    <UserContext.Provider value={[context, dispatch]}>
      {children}
    </UserContext.Provider>
  );
};
