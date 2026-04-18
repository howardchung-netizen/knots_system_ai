import React, { createContext, useReducer, useContext } from "react";
import { PixelRatio } from 'react-native';
import { useToast } from "react-native-toast-notifications";

export const UploadStateContext = createContext(
 {
  inited: false,
  isUploading: false,
  headerContent: "",
  uploadingList: [],
 }
);

export const uploadStateContextReducer = (state, action) => {
 console.log("uploadStateContextReducer")
 switch (action.type) {
  case 'INITIAL':
   return { inited: action.payload.inited, isUploading: action.payload.isUploading, headerContent: action.payload.headerContent }
  case 'SET_HEADER_CONTENT':
   return { ...state, headerContent: action.payload }
  case 'SET_IS_UPLOADING':
   return { ...state, isUploading: action.payload }
  case 'SET_INITED':
   return { ...state, inited: action.payload }
  case 'ADD_UPLOAD_ID': {
   let _uploadingList = state.uploadingList;
   _uploadingList.push(action.payload);
   return { ...state, uploadingList: _uploadingList }
  }
  case 'REMOVE_UPLOAD_ID': {  
   let _uploadingList = state.uploadingList;
   _uploadingList = _uploadingList.filter(e => e != action.payload);
   // console.log("uploadStateContext.uploadingList.length", _uploadingList.length)
   return { ...state, uploadingList: _uploadingList, lastUploadedID: !_uploadingList.length ? action.payload : null}
  }
  case 'ALL_UPLOADED': {  
   return { ...state, lastUploadedID: null }
  } 
 }
}

export const UploadStateContextProvider = ({ children }) => { 
 const [uploadStateContext, uploadStateContextDispatch] = useReducer(uploadStateContextReducer, useContext(UploadStateContext));
 return (
  <>
   <UploadStateContext.Provider value={[uploadStateContext, uploadStateContextDispatch]}>
    {children}
   </UploadStateContext.Provider>
  </>
 )
}