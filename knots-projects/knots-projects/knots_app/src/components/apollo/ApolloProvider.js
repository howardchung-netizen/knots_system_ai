import React, { useContext } from 'react';
import { ApolloClient, InMemoryCache, ApolloProvider, HttpLink, ApolloLink, from, createHttpLink, fromPromise } from '@apollo/client';
import { onError } from '@apollo/client/link/error';
import { asyncMap } from "@apollo/client/utilities";
import { UserContext } from '../appContext/UserContext';
import { useNavigation } from '@react-navigation/native';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { logout } from '../../helpers/asyncStorage/userAsyncStorage';
export default (props) => {
  // console.log("ApolloProvider")
  const [userContext, userContextDispatch] = useContext(UserContext);
  const navigation = useNavigation();
  const httpLink = createHttpLink({
    uri: props.uri
  })
 
  const authMiddleware = new ApolloLink(async (operation, forward) => {
    // add the authorization to the headers
    // console.log("operation")
    if (operation.operationName == "login") {
      operation.setContext(({ headers = {} }) => (
        {

        }
      ));
      return forward(operation)
    }

    if (operation.operationName != "login") {
      // console.log("userContext.token",userContext.token)
      operation.setContext(({ headers = {} }) =>
      ({
        headers: {
          ...headers,
          authorization: `Bearer ${userContext.token}` || null,
        }
      })
      );
      // return forward(operation)
      return asyncMap(forward(operation), async response => {
        return response;
      });
    }
  })

  const clearAccount = async () => {
    try {
      userContextDispatch({ type: "LOGOUT" })
      await logout()
      await GoogleSignin.signOut();
      await GoogleSignin.revokeAccess();
    } catch (error) {
      console.log(error)
    }
    try {
      if(Platform.OS == 'ios') await appleAuth.revokeAccess();
    } catch (error) {
      
    }
  };

  const errorLink = onError(({ forward, operation, graphQLErrors, networkError }) => {
    if (graphQLErrors) {
      let FORBIDDEN = false;
      // console.log(graphQLErrors)
      graphQLErrors.forEach(({ extensions, message, locations, path }) => {
        console.log(message)
        if (extensions?.code == "FORBIDDEN") FORBIDDEN = true;
      });
      if (FORBIDDEN) {
        return fromPromise(new Promise(async (resolve) => {
          await clearAccount();
           navigation.reset({
              index: 0,
              routes: [{ name: 'LoginScreen' }],
           })
          resolve();
        }))
      }
    }
    if (networkError)  console.log(`[Network error]: ${networkError}`);
  })

  const client = new ApolloClient({
    link: from([authMiddleware, errorLink, httpLink]),
    cache: new InMemoryCache(),
  });

  return (
    <ApolloProvider client={client}>
      {props.children}
    </ApolloProvider>
  )
}
