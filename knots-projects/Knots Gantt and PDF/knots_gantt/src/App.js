import React from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import './App.scss';
import ApolloClient from 'apollo-client';
import { InMemoryCache, defaultDataIdFromObject } from 'apollo-cache-inmemory';
import { ApolloProvider } from '@apollo/react-hooks';
import { ApolloLink, split } from 'apollo-link';
import { onError } from 'apollo-link-error';
import { createUploadLink } from 'apollo-upload-client';
import { BatchHttpLink } from 'apollo-link-batch-http';
import { WebSocketLink } from 'apollo-link-ws';
import { getMainDefinition } from 'apollo-utilities';
import { fragmentMatcher } from './apollo/fragmentMatcher';
import * as uuid from "uuid";
import ScreenGantt from './components/ScreenGantt';
import ScreenGanttReadMode from './components/ScreenGanttReadMode';
import { setContext } from 'apollo-link-context';
const { unescape } = require('underscore');

const urlParams = new URLSearchParams(window.location.search);
const appToken = urlParams.get('ganttChart_token');
const REACT_APP_KQS_HTTPS_ENDPOINT = urlParams.get('REACT_APP_KQS_HTTPS_ENDPOINT');
const REACT_APP_TODO_HTTP_ENDPOINT = urlParams.get('REACT_APP_TODO_HTTP_ENDPOINT');
const REACT_APP_TODO_GRAPHQL_ENDPOINT = urlParams.get('REACT_APP_TODO_GRAPHQL_ENDPOINT');
const REACT_APP_TODO_WEBSOCKET_ENDPOINT = urlParams.get('REACT_APP_TODO_WEBSOCKET_ENDPOINT');
const REACT_APP_KQS_SHARE_LINK = urlParams.get('REACT_APP_KQS_SHARE_LINK');
const REACT_APP_EXPORT_SERVER_HOST = urlParams.get('REACT_APP_EXPORT_SERVER_HOST');
const projectName = unescape(urlParams.get('project_name'));

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
  return {
    headers: {
      ...headers,
      authorization: `Bearer ${appToken}`,
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

const appUUID = uuid.v4();

export const UserContext = React.createContext();

const App = props => {
  return (
    <ApolloProvider client={client}>
      <Router>
        <Switch>
          <Route path="/iframe/gantt_chart/share/:code/:projectId">
            <ScreenGanttReadMode appUUID={appUUID}
            appToken={appToken}
            REACT_APP_KQS_HTTPS_ENDPOINT={REACT_APP_KQS_HTTPS_ENDPOINT}
            REACT_APP_TODO_HTTP_ENDPOINT={REACT_APP_TODO_HTTP_ENDPOINT}
            REACT_APP_TODO_WEBSOCKET_ENDPOINT={REACT_APP_TODO_WEBSOCKET_ENDPOINT}
            REACT_APP_KQS_SHARE_LINK={REACT_APP_KQS_SHARE_LINK}
            projectName={projectName}
            language="chi"
            />
          </Route>
          <Route path="/iframe/gantt_chart/share_en/:code/:projectId">
            <ScreenGanttReadMode appUUID={appUUID}
            appToken={appToken}
            REACT_APP_KQS_HTTPS_ENDPOINT={REACT_APP_KQS_HTTPS_ENDPOINT}
            REACT_APP_TODO_HTTP_ENDPOINT={REACT_APP_TODO_HTTP_ENDPOINT}
            REACT_APP_TODO_WEBSOCKET_ENDPOINT={REACT_APP_TODO_WEBSOCKET_ENDPOINT}
            REACT_APP_KQS_SHARE_LINK={REACT_APP_KQS_SHARE_LINK}
            projectName={projectName}
            language="eng"
            />
          </Route>
          <Route path="/iframe/cms/gantt_chart/project/:projectId">
            <ScreenGantt appUUID={appUUID}
            appToken={appToken}
            REACT_APP_KQS_HTTPS_ENDPOINT={REACT_APP_KQS_HTTPS_ENDPOINT}
            REACT_APP_TODO_HTTP_ENDPOINT={REACT_APP_TODO_HTTP_ENDPOINT}
            REACT_APP_TODO_WEBSOCKET_ENDPOINT={REACT_APP_TODO_WEBSOCKET_ENDPOINT}
            REACT_APP_KQS_SHARE_LINK={REACT_APP_KQS_SHARE_LINK}
            REACT_APP_EXPORT_SERVER_HOST={REACT_APP_EXPORT_SERVER_HOST}
            projectName={projectName}
            language="chi"
            />
          </Route>
          <Route path="/iframe/cms/gantt_chart_en/project/:projectId">
            <ScreenGantt appUUID={appUUID}
            appToken={appToken}
            REACT_APP_KQS_HTTPS_ENDPOINT={REACT_APP_KQS_HTTPS_ENDPOINT}
            REACT_APP_TODO_HTTP_ENDPOINT={REACT_APP_TODO_HTTP_ENDPOINT}
            REACT_APP_TODO_WEBSOCKET_ENDPOINT={REACT_APP_TODO_WEBSOCKET_ENDPOINT}
            REACT_APP_KQS_SHARE_LINK={REACT_APP_KQS_SHARE_LINK}
            REACT_APP_EXPORT_SERVER_HOST={REACT_APP_EXPORT_SERVER_HOST}
            projectName={projectName}
            language="eng"
            />
          </Route>
        </Switch>
      </Router>
    </ApolloProvider>
  );
};

export default App;
