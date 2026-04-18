import React, { createContext, useContext, useEffect, useReducer } from "react";
import { useQuery } from "@apollo/client";
import { enumQuery } from "../apollo/queries";



export const EnumContext = createContext({});

const EnumContextReducer = (state, action) => {
  switch (action.type) {
    case 'INIT':
      return { ...state,  ...action.payload  };
  }
}

export const EnumContextProvider = ({ children }) => {
 const { data, loading, error } = useQuery(enumQuery)
 const [context, dispatch] = useReducer(EnumContextReducer, useContext(EnumContext));

 useEffect(() => { 
  dispatch({ type: "INIT", payload: data });
 }, [data])
 return (
  <EnumContext.Provider value={[context, dispatch]}>
   {children}
  </EnumContext.Provider>
 );
};



