import React, { createContext } from "react";

export const LangContext = createContext({
 lang: "cht"
});

export const langContextReducer = (state, action) => {
 console.log("langContextReducer")
 switch (action.type) {
   case 'INITIAL_CONFIG':
     return { ...state, ...action.payload }
   case 'SET_LANG':
     return { ...state, ...action.payload }
 }
}
