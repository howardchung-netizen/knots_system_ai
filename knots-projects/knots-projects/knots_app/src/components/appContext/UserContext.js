import react, { createContext } from "react";

export const UserContext = createContext({
  user: null,
  token: null,
  account: null,
  password: null,
  deviceID: null,
  isInited: false,
  isLogedin: false,
  loginType: "default",
});

export const userContextReducer = (state, action) => {
  // console.log("userContextReducer")
 switch (action.type) {
   case 'INITIAL_CONFIG':
    return { ...state, ...{ isInited: true }, ...action.payload }
   case 'SET_CURRENT_USER':
     // console.log({ ...state, ...action.payload })
     return { ...state, ...action.payload }
   case 'LOGIN':
     // console.log({ ...state, ...action.payload })
     return { ...state, ...{ isInited: true, isLogedin: true }, ...action.payload }
   case 'LOGOUT':
     // console.log({ ...state, ...action.payload })
     return { ...state, ...{ user: null, token: null, isInited: false, isLogedin: false, account: null, password: null }}
 }
}
