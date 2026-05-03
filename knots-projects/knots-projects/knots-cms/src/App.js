import React, { useContext, useEffect } from 'react';
import { Routes, Route, Navigate, Outlet, useNavigate } from "react-router-dom";
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  ApolloLink,
  split,
  defaultDataIdFromObject
} from '@apollo/client';
import { onError } from '@apollo/client/link/error';
import { asyncMap, getMainDefinition } from "@apollo/client/utilities";
import { createUploadLink } from 'apollo-upload-client';
import { WebSocketLink } from 'apollo-link-ws';
import 'moment/locale/zh-hk'
import moment from 'moment-timezone'
import Cookies from 'universal-cookie';
import Login from './components/Login';
import AppSettingContextProvider from './contexts/AppSettingContextProvider';
import langeuage from './localization/language';
import { UserContext, UserContextProvider } from './contexts/UserContext';
import { zhHK } from '@mui/material/locale';
import { SnackbarProvider } from 'notistack';
import './App.scss';
import './App.css';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import { createTheme, Grid, ThemeProvider } from '@mui/material';
import { StyleRoot } from 'radium';
import Page404 from './pages/Page404';
import CMSPage from './pages/CMSPage';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { OptionsContextProvider } from './contexts/OptionsContextProvider';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import QuotationPrint from './pages/QuotationPrint';
import { ModalContextProvider } from './contexts/ModalContextProvider';
import InvoicePrint from './pages/InvoicePrint';
import ScreenGantt from './components/ScreenGantt';
import PDFUpload from './components/PDFUpload';
import PDFList from './components/PDFList';
import PDFCompare from './components/PDFCompare';
import PDFCompareResult from './components/PDFCompareResult';
import PDFUploadMember from './components/PDFUploadMember';
import { SnackbarProvider as CustomSnackbarProvider } from './components/SnackbarProvider';
import IframeGantt from './components/iframeGantt';
const REACT_APP_TOKEN = process.env.REACT_APP_TOKEN;
const REACT_APP_KQS_HTTPS_ENDPOINT = process.env.REACT_APP_KQS_HTTPS_ENDPOINT;
const REACT_APP_KQS_SHARE_LINK = process.env.REACT_APP_KQS_SHARE_LINK;
const REACT_APP_EXPORT_SERVER_HOST = process.env.REACT_APP_EXPORT_SERVER_HOST;
const REACT_APP_TODO_GRAPHQL_ENDPOINT = process.env.REACT_APP_TODO_GRAPHQL_ENDPOINT;
const REACT_APP_TODO_WEBSOCKET_ENDPOINT= process.env.REACT_APP_TODO_WEBSOCKET_ENDPOINT;
const REACT_APP_HOST_TYPE= process.env.REACT_APP_HOST_TYPE;
const REACT_APP_GOOLE_CLINET_ID = process.env.REACT_APP_GOOLE_CLINET_ID;
const REACT_APP_TODO_HTTP_ENDPOINT = process.env.REACT_APP_TODO_HTTP_ENDPOINT;
const REACT_APP_PDF_SHARE_LINK = process.env.REACT_APP_PDF_SHARE_LINK;

if(REACT_APP_HOST_TYPE == 'production') console.log = ()=>{};

moment.locale('en');
moment.tz.setDefault('Asia/Hong_Kong');

const cookies = new Cookies();
const defaultLang = 'zh-hk';
let appLang = cookies.get("appLang");
if (!appLang) appLang = defaultLang;
langeuage.setLanguage(appLang);

const uploadLink = createUploadLink({
  uri: REACT_APP_TODO_GRAPHQL_ENDPOINT,
  credentials: 'include',
});

const wsLink = new WebSocketLink({
  uri: REACT_APP_TODO_WEBSOCKET_ENDPOINT,
  options: {
    reconnect: true,
    connectionParams: (operation) => {
      return { Authorization: `Bearer ${cookies.get('authToken')}` };
    },
  }
});

export const wsClient = wsLink.subscriptionClient;
let suppressErrors = false;
const client = new ApolloClient({
  link: ApolloLink.from([
    async (operation, forward) => {
      // add the authorization to the headers
      if (operation.operationName !== 'login' &&
        operation.operationName !== 'appSettings' &&
        operation.operationName !== 'googleAuthEnable' && 
        operation.operationName !== 'googleAuthEnableConfirm')
        operation.setContext(({ headers = {} }) =>
        ({
          headers: {
            ...headers,
            authorization: `Bearer ${cookies.get('authToken')}` || null,
          }
        })
        );
      return asyncMap(forward(operation), async response => {
        //do something by async fucntion
        return response;
      });
    }
    ,
    onError(({ graphQLErrors, networkError, operation, forward }) => {
      //console.error('[onError] operation', operation)
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
        if (graphQLErrors.some(x => x.extensions.code === "FORBIDDEN")) {
          cookies.remove('authToken', { path: '/' });
          if (window.location.pathname != '/login') window.location.replace('/login');
          // wsClient.unsubscribeAll();
          // cookies.remove('authToken', { path: '/' });
          // window.location.replace('/login');
        }
      }
      if (networkError) {
        console.error("[Network error]", networkError);
        errors.push(networkError);
        includedForbiddenError = includedForbiddenError ||
          networkError?.result?.errors.some((x) => x?.extensions?.code === 'FORBIDDEN') ||
          networkError?.message?.includes('登入憑證');
          console.log(`${networkError.message}`);
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
          console.log(`${messages}`);
          if (includedForbiddenError) {
            console.log("Reset to login");
            cookies.remove('authToken', { path: '/' });
            if (window.location.pathname != '/login') window.location.replace('/login');
            wsClient.unsubscribeAll();
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
      uploadLink,
    )
  ]),
  cache: new InMemoryCache({
    dataIdFromObject: object => {
      switch (object.__typename) {
        default: return defaultDataIdFromObject(object); // fall back to default handling
      }
    }
  }),
  connectToDevTools: true,
  shouldBatch: true
});

const CheckLogin = (props) => {
  const [user] = useContext(UserContext);
  const navigate = useNavigate();
  useEffect(()=>{
    if(user.isLogedin){
      let role = user?.info?.roles[0];
      if(!role) return
      if(window.location.pathname == '/') {
        navigate(`/cms/dashboard`)
      }
    }
  }, [user])
  if(user.isLogedin) 
  return ( <Outlet/>)
  else return <Navigate to="/login" replace={true}/>
}

const calcFontSize = (expectedBodyFontSize)=>{
  return (14/16)*expectedBodyFontSize
}

const { palette } = createTheme();
const { augmentColor } = palette;
const createColor = (mainColor) => augmentColor({ color: { main: mainColor } });

export const _theme = createTheme(
  {
    palette: {
      mode: 'dark',
      primary: { main: '#007acc' }, // VSCode Blue
      background: {
        default: '#1e1e1e', // VSCode dark background
        paper: '#252526', // VSCode panel background
      },
      anger: createColor('#F40B27'),
      apple: createColor('#5DBA40'),
      steelBlue: createColor('#5C76B7'),
      violet: createColor('#BC00A3'),
      error: createColor('rgb(211, 47, 47)'),
      warning: createColor('rgb(237, 108, 2)'),
      success: createColor('rgb(46, 125, 50)'),
      whiteColor: createColor('#ffffff'),
      text: {
        primary: '#cccccc', // VSCode default text color
        secondary: '#858585', // VSCode dim text
        disabled: 'rgba(255, 255, 255, 0.38)',
        hint: 'rgba(255, 255, 255, 0.38)',
      },
      divider: '#3c3c3c', // VSCode border color
    },
    components : {
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            backgroundColor: '#000000',
            color: '#ffffff',
            boxShadow: 'rgba(0, 0, 0, 0.5) 0px 4px 6px',
            fontSize: '0.8rem',
            fontFamily: "'Consolas', 'Fira Code', 'Courier New', monospace",
          },
        },
      },
      MuiSvgIcon: {
        styleOverrides: {
          root: {
            fontSize: 22,
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none', // More professional IDE look
            fontFamily: "'Consolas', 'Fira Code', 'Courier New', monospace",
          }
        }
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none', // Remove MUI default dark mode elevation gradient
          }
        }
      }
    },
    typography: {
      fontFamily: "'Consolas', 'Fira Code', 'Courier New', monospace",
      fontSize: 13, // Smaller base font size
      h6: {
        fontWeight: 600,
        fontSize: '1rem',
        letterSpacing: '0.05em',
      },
      body1: {
        fontSize: '0.85rem',
      },
      body2: {
        fontSize: '0.8rem',
      }
    },
  },
  zhHK,
);

const App = props => {

  useEffect(() => {
    window.addEventListener('error', e => {
        if (e.message === 'ResizeObserver loop limit exceeded' || e.message === 'ResizeObserver loop completed with undelivered notifications') {
            const resizeObserverErrDiv = document.getElementById(
                'webpack-dev-server-client-overlay-div'
            );
            const resizeObserverErr = document.getElementById(
                'webpack-dev-server-client-overlay'
            );
            if (resizeObserverErr) {
                resizeObserverErr.setAttribute('style', 'display: none');
            }
            if (resizeObserverErrDiv) {
                resizeObserverErrDiv.setAttribute('style', 'display: none');
            }
        }
    });
  }, []);

  return (
    <StyleRoot>
      <DndProvider backend={HTML5Backend}>
        <LocalizationProvider dateAdapter={AdapterMoment} adapterLocale={"en"}>
          <SnackbarProvider maxSnack={3}>
            <CustomSnackbarProvider>
             <ThemeProvider theme={_theme}>
              <ApolloProvider client={client}>
                <GoogleOAuthProvider clientId={REACT_APP_GOOLE_CLINET_ID}>
                  <UserContextProvider>
                    <ModalContextProvider>
                      <AppSettingContextProvider>
                        <Routes>
                          <Route path="/login" element={<Login />} />
                          <Route path="/pdf/upload/:code" element={<PDFUpload />} />
                          <Route path="/" element={<CheckLogin />}>
                           <Route path="/gantt_chart/share/:code/:projectId"
                              element={<ScreenGantt
                                appToken={REACT_APP_TOKEN}
                                REACT_APP_KQS_HTTPS_ENDPOINT={REACT_APP_KQS_HTTPS_ENDPOINT}
                                REACT_APP_TODO_HTTP_ENDPOINT={REACT_APP_TODO_HTTP_ENDPOINT}
                                REACT_APP_TODO_GRAPHQL_ENDPOINT={REACT_APP_TODO_GRAPHQL_ENDPOINT}
                                REACT_APP_TODO_WEBSOCKET_ENDPOINT={REACT_APP_TODO_WEBSOCKET_ENDPOINT}
                                REACT_APP_KQS_SHARE_LINK={REACT_APP_KQS_SHARE_LINK}
                                REACT_APP_EXPORT_SERVER_HOST={REACT_APP_EXPORT_SERVER_HOST}
                              />
                              }
                            />
                            <Route path="/gantt_chart/share_en/:code/:projectId"
                              element={<ScreenGantt
                                appToken={REACT_APP_TOKEN}
                                REACT_APP_KQS_HTTPS_ENDPOINT={REACT_APP_KQS_HTTPS_ENDPOINT}
                                REACT_APP_TODO_HTTP_ENDPOINT={REACT_APP_TODO_HTTP_ENDPOINT}
                                REACT_APP_TODO_GRAPHQL_ENDPOINT={REACT_APP_TODO_GRAPHQL_ENDPOINT}
                                REACT_APP_TODO_WEBSOCKET_ENDPOINT={REACT_APP_TODO_WEBSOCKET_ENDPOINT}
                                REACT_APP_KQS_SHARE_LINK={REACT_APP_KQS_SHARE_LINK}
                                REACT_APP_EXPORT_SERVER_HOST={REACT_APP_EXPORT_SERVER_HOST}
                              />
                              }
                            />
                            <Route path="/cms/gantt_chart/project/:projectId"
                              element={<ScreenGantt
                                appToken={cookies.get('authToken')}
                                REACT_APP_KQS_HTTPS_ENDPOINT={REACT_APP_KQS_HTTPS_ENDPOINT}
                                REACT_APP_TODO_HTTP_ENDPOINT={REACT_APP_TODO_HTTP_ENDPOINT}
                                REACT_APP_TODO_GRAPHQL_ENDPOINT={REACT_APP_TODO_GRAPHQL_ENDPOINT}
                                REACT_APP_TODO_WEBSOCKET_ENDPOINT={REACT_APP_TODO_WEBSOCKET_ENDPOINT}
                                REACT_APP_KQS_SHARE_LINK={REACT_APP_KQS_SHARE_LINK}
                                REACT_APP_EXPORT_SERVER_HOST={REACT_APP_EXPORT_SERVER_HOST}
                              />
                              }
                            />
                            <Route path="/cms/quotation/:quotationId/print" element={<QuotationPrint />} />
                            <Route path="/cms/invoice/:id/print" element={<InvoicePrint />} />
                            <Route exact path="/cms/pdf_compare/upload/:pdfId" element={<PDFUploadMember />} />
                            <Route exact path="/cms/pdf_compare/:projectId"
                              element={<PDFList
                                appToken={REACT_APP_TOKEN}
                                webEndpoint={REACT_APP_TODO_GRAPHQL_ENDPOINT}
                                socketEndpoint={REACT_APP_TODO_WEBSOCKET_ENDPOINT}
                                shareLink={REACT_APP_PDF_SHARE_LINK}
                              />}
                            />
                            <Route exact path="/cms/pdf_compare/:projectId/:id" element={<PDFCompare />} />
                            <Route exact path="/cms/pdf_compare/:projectId/:id/result" element={<PDFCompareResult />} />
                            <Route path="/cms/*"
                              element={
                                <OptionsContextProvider>
                                  <CMSPage />
                                </OptionsContextProvider>
                              } />
                          </Route>
                          <Route path="/Page404" element={<Page404 />} />
                          <Route path="*" element={<Navigate to="/cms" />} />
                        </Routes>
                      </AppSettingContextProvider>
                    </ModalContextProvider>
                  </UserContextProvider>
                </GoogleOAuthProvider>
              </ApolloProvider>
             </ThemeProvider>
            </CustomSnackbarProvider>
          </SnackbarProvider>
        </LocalizationProvider>
      </DndProvider>
    </StyleRoot>
  );
};

export default App;
