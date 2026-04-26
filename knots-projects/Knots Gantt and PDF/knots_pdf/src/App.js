import React from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client';
import { defaultDataIdFromObject } from 'apollo-cache-inmemory';
import { ApolloLink, split } from 'apollo-link';
import { onError } from 'apollo-link-error';
import { createUploadLink } from 'apollo-upload-client';
import { BatchHttpLink } from 'apollo-link-batch-http';
import { WebSocketLink } from 'apollo-link-ws';
import { getMainDefinition } from 'apollo-utilities';
import { fragmentMatcher } from './apollo/fragmentMatcher';
import { setContext } from 'apollo-link-context';
import PDFCompare from './components/PDFCompare';
import PDFUpload from './components/PDFUpload';
import PDFUploadMember from './components/PDFUploadMember';
import PDFList from './components/PDFList';
import { SnackbarProvider } from './components/SnackbarProvider';
import PDFCompareResult from './components/PDFCompareResult';
import { createTheme } from '@mui/material';
import { ThemeProvider } from '@mui/styles';
const theme = createTheme();

const appToken = window.app_token;
const REACT_APP_TODO_GRAPHQL_ENDPOINT = window.REACT_APP_TODO_GRAPHQL_ENDPOINT;
const REACT_APP_TODO_WEBSOCKET_ENDPOINT = window.REACT_APP_TODO_WEBSOCKET_ENDPOINT;
const REACT_APP_PDF_SHARE_LINK = window.REACT_APP_PDF_SHARE_LINK;

const batchHttpLink = new BatchHttpLink({
  batchMax: 20,
  headers: {
    batch: 'true',
  },
  uri: REACT_APP_TODO_GRAPHQL_ENDPOINT,
  credentials: 'include',
});

const uploadLink = createUploadLink({
  uri: REACT_APP_TODO_GRAPHQL_ENDPOINT,
  credentials: 'include',
});

const wsLink = new WebSocketLink({
  uri: REACT_APP_TODO_WEBSOCKET_ENDPOINT,
  options: {
    reconnect: true,
    connectionParams: () => {
      //console.log("connectionParams : " + appToken);
      return { Authorization: appToken };
    },
  }
});

export const wsClient = wsLink.subscriptionClient;

const authLink = setContext((_, { headers }) => {
  const token = appToken ? `Bearer ${appToken}` : undefined;
  return {
    headers: {
      ...headers,
      authorization: token,
    }
  }
});

const batchOrUploadLink = split(
  operation => operation.getContext().batch ? true : false,
  batchHttpLink,
  uploadLink,
);

let suppressErrors = false;
const client = new ApolloClient({
  link: ApolloLink.from([
    authLink,
    onError(({ graphQLErrors, networkError, operation }) => {
      console.error('[onError] operation', operation);
      const errors = [];
      let includedForbiddenError = false;
      if (graphQLErrors) {
        graphQLErrors.map(({ message, locations, path }) =>
          console.error(
            `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`,
          ),
        );
        errors.push(...graphQLErrors.map((x) => ({ name: 'GraphQLError', ...x })));
        includedForbiddenError = includedForbiddenError || graphQLErrors.some((x) => x.extensions.code === 'FORBIDDEN');

        // alert(JSON.stringify(graphQLErrors.map(({ message, locations, path }) => message)));
        // if (graphQLErrors.some(x => x.extensions.code === "FORBIDDEN")) {
        //   wsClient.unsubscribeAll();
        //   //localStorage.clear();
        //   window.location = "/cms/login";
        // }
      }
      if (networkError) {
        console.error("[Network error]", networkError);
        errors.push(networkError);
        includedForbiddenError = includedForbiddenError ||
          networkError?.result?.errors.some((x) => x?.extensions?.code === 'FORBIDDEN') ||
          networkError?.message?.includes('登入憑證');
        // alert(`${networkError.message}`);
      }
      if (errors.length > 0) {
        if (suppressErrors) {
          console.log('Suppressed Errors', errors);
        } else {
          console.log('Alert Error', errors);
          if (includedForbiddenError) {
            suppressErrors = true;
          }
          const messages = errors.map((x) => {
            if (x.name === 'GraphQLError') {
              return `[${x.name}]: ${x?.message}`;
            } else if (x.name === 'ServerError') {
              return `[${x.name}]: ${x?.result?.errors?.map(err => err.message).join('\n')}`;
            } else {
              return `[Error]: ${x?.message || x}`;
            }
          }).join('\n');
          alert(messages);
          if (includedForbiddenError) {
            console.log("Reset to login");
            wsClient.unsubscribeAll();
            //localStorage.clear();
            window.location = "/cms/login";
          }
        }
      }
    }),
    //new LoggingLink({ logger: console.log }),
    split(
      // split based on operation type
      ({ query }) => {
        const definition = getMainDefinition(query);
        return (
          definition.kind === 'OperationDefinition' &&
          definition.operation === 'subscription'
        );
      },
      wsLink,
      batchOrUploadLink,
    ),
  ]),
  cache: new InMemoryCache({
    dataIdFromObject: object => {
      switch (object.__typename) {
        default: return defaultDataIdFromObject(object); // fall back to default handling
      }
    },
    fragmentMatcher
  }),
  connectToDevTools: true,
});

const App = props => {
  return (
    <ApolloProvider client={client} >
      <SnackbarProvider>
        <ThemeProvider theme={theme}>
          <Router>
            <Switch>
              <Route exact path="/cms/pdf_compare/upload/:pdfId">
                <PDFUploadMember />
              </Route>
              <Route exact path="/cms/pdf_compare/:projectId">
                <PDFList appToken={appToken} webEndpoint={REACT_APP_TODO_GRAPHQL_ENDPOINT} socketEndpoint={REACT_APP_TODO_WEBSOCKET_ENDPOINT} shareLink={REACT_APP_PDF_SHARE_LINK} />
              </Route>
              <Route exact path="/cms/pdf_compare/:projectId/:id">
                <PDFCompare />
              </Route>
              <Route exact path="/cms/pdf_compare/:projectId/:id/result">
                <PDFCompareResult />
              </Route>
              <Route path="/pdf/upload/:code">
                <PDFUpload />
              </Route>
            </Switch>
          </Router>
        </ThemeProvider>
      </SnackbarProvider>
    </ApolloProvider>
  );
};

export default App;
