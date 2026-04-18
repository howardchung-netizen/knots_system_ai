import React, { useState, useEffect } from 'react';
import { View } from 'react-native'

const _currentUser = async () => { 
  const user = await currentUser();
  console.log(user)
 return user
}

export const AppConfig = (props) => { 
  console.log("AppConfig")
  const [default_config, set] = useState({ currentUser: _currentUser() });
  const [appContext, appContextDispatch] = useReducer(appContextReducer, {
    currentUser: null
  })
  useEffect(() => {})
  return (
    <>
      {props.children}
    </>
  );
}