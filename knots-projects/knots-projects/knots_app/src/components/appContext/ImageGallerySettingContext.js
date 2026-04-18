import React, { createContext, useContext, useReducer } from "react";
import { theme } from '../../core/theme'

export const Context = createContext({
 useGPS: false,
 autoUpload: false,
 autoUploadWithWifi: false,
 inited: false
});

export const reducer = (state, action) => {
//  console.log("Reducer", state, action)
 switch (action.type) {
  case 'INITIAL':
   return { ...state, ...action.payload, inited: true }
  case 'USE_GPS':
   return { ...state, useGPS: action.payload }
  case 'USE_AUTO_UPLOAD':
   return { ...state, autoUpload: true }
  case 'CANCEL_AUTO_UPLOAD':
   return { ...state, autoUpload: false, autoUploadWithWifi: false }
  case 'AUTO_UPLOAD_WITH_WIFI':
     return { ...state, autoUploadWithWifi: action.payload } 
 }
}

export const ImageGallerySettingContextProvider = ({ children }) => { 
 const [context, dispatch] = useReducer(reducer, useContext(Context));
 return (
  <>
   <Context.Provider value={[context, dispatch]}>
    {children}
   </Context.Provider>
  </>
  )
}
