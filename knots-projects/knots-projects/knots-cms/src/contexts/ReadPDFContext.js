import React, { createContext, useContext, useEffect, useReducer } from "react";
import { useQuery } from "@apollo/client";
import { enumQuery } from "../apollo/queries";



export const ReadPDFContext = createContext({});

const ReadPDFContextReducer = (state, action) => {
  switch (action.type) {
    case 'READ_PDF':
      return { ...state,  ...action.payload  };
  }
}

export const ReadPDFContextProvider = ({ children }) => {
 const [context, dispatch] = useReducer(ReadPDFContextReducer, useContext(ReadPDFContext));
 console.log("context", context)
 return (
  <ReadPDFContext.Provider value={[context, dispatch]}>
   {children}
  </ReadPDFContext.Provider>
 );
};



