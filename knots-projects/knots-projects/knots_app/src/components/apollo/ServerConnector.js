import React, { useEffect, useContext } from 'react';
// import { NetworkInfo } from "react-native-network-info";
import ApolloProvider from './ApolloProvider';
import { ServerConnectionContext } from '../appContext/ServerConnectionContext';
import DeviceInfo from 'react-native-device-info';
import { APPInfoContext } from '../appContext/AppContextProvider';
const ServerConnector = ({ children }) => {
  // console.log("ServerConnector");
  const [appInfoContext, appInfoContextDispatch] = useContext(APPInfoContext)
  const [serverConnectionContext, serverConnectionContextDispatch] = useContext(ServerConnectionContext);
      // windows http://192.168.1.122:8003/graphql
      // mac http://192.168.1.195:8003/graphql
      console.log(appInfoContext.url_end_point)
      let devUrl = appInfoContext.dev_url_end_point;
      let url = appInfoContext.url_end_point;
  return (
    <ApolloProvider uri={appInfoContext.isReviewing?devUrl:url}>
      {children}
    </ApolloProvider>
  )
};

export default ServerConnector;