import React, { createContext } from "react";
import { theme } from '../../core/theme'

export const ThemeContext = createContext({
  mode:"default",
  theme: { ...theme.default }
});

export const themeContextReducer = (state, action) => {
 console.log("langContextReducer")
 switch (action.type) {
   case 'INITIAL_CONFIG':
     return { ...state, ...{ theme: theme.default, mode: "default" } }
   case 'SET_THEME':
     return { ...state, ...{ theme: theme[action.payload], mode: action.payload } }
 }
}