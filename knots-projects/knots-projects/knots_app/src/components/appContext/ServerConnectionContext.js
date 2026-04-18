import React, { createContext } from "react";

export const ServerConnectionContext = createContext({
 isInited: false
});

export const serverConnectionContextReducer = (state, action) => {
//  console.log("serverConnectionContextReducer")
 switch (action.type) {
   case 'INITIAL_CONFIG':
    //  console.log({ ...state, isInited: true, ...action.payload })
     return { ...state, isInited: true,  ...action.payload }
 }
}
