import React, { useState, useEffect, createContext, useContext } from 'react'
import { GET_APP_SETTINGS } from '../apollo/queries';
import { ON_APPSETTING_CHANGE } from '../apollo/subscriptions';
import { useQuery, useSubscription } from '@apollo/client';

export const AppSettingsContext = createContext();

function AppSettingContextProvider(props) {
  const { children } = props;
  const [appSettingJson, setAppSettingJson] = useState({});
  const { data: appSettings } = useQuery(GET_APP_SETTINGS, {
    fetchPolicy: 'cache-and-network',
  });
  const { data: appSettingChange } = useSubscription(ON_APPSETTING_CHANGE);

  useEffect(() => {
    if (appSettings) {
      let tempJson = {};
      appSettings.appSettings.edges.forEach(edge => {
        tempJson[edge.node.key] = Object.assign({}, edge.node);
      })
      setAppSettingJson(tempJson);
    }
  }, [appSettings])

  useEffect(() => {
    const node = appSettingChange?.onAppSettingChange?.node;
    if (node && appSettingJson) {
      setAppSettingJson({
        ...appSettingJson,
        [node.key]: node,
      });
    }
  }, [appSettingChange]);

  useEffect(()=>{
    // if(!appSettingJson.console_log) console.log = ()=>{}
  }, [appSettingJson])
  return (
    <AppSettingsContext.Provider value={appSettingJson}>
      {children}
    </AppSettingsContext.Provider>
  );
}

export const useAppSettings = (key = '') => {
  const appSettingJson = useContext(AppSettingsContext);
  return appSettingJson?.[key];
};


export default AppSettingContextProvider;