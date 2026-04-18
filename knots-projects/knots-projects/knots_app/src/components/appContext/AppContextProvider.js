import React, { useContext, useReducer, createContext, useState } from "react";
import { UserContext, userContextReducer } from "./UserContext";
import { LangContext, langContextReducer } from "./LangContext";
import { ThemeContext, themeContextReducer } from "./ThemeContext";
import { UploadStateContextProvider } from "./UploadStateContext";
import { ServerConnectionContext, serverConnectionContextReducer } from "./ServerConnectionContext";
import { Provider as PaperProvider } from 'react-native-paper';
import { ProjectsAlbumContext, projectsAlbumReducer, ProjectsAlbumContextPovider } from "./ProjectsAlbumContext";
import { ImageGallerySettingContextProvider } from "./ImageGallerySettingContext";
import DeviceInfo from 'react-native-device-info';

const appInfoContext = {
  version : DeviceInfo.getVersion(),
  buildNumber: DeviceInfo.getBuildNumber(),
  smsNumber: '+85264433800',
  tasklistColumns:{
    name:{ width:"50%" },
    status:{ width:"15%" },
    dueDate:{ width:"20%" },
    priority:{ width:"15%"}
  }
};
export const appInfoContextReducer = (state, action) => {
  // console.log("appInfoContextReducer", state, action)
  switch (action.type) {
    case 'SET_APP_INFO':
      return { ...state, ...action.payload  }
  }
 }
export const APPInfoContext = createContext(appInfoContext)

export const AppContextProvider = ({ children }) => {
  console.log("AppContextProvider")
  const [userContext, userContextDispatch] = useReducer(userContextReducer, useContext(UserContext));
  const [langContext, langContextDispatch] = useReducer(langContextReducer, useContext(LangContext));
  const [themeContext, themeContextDispatch] = useReducer(themeContextReducer, useContext(ThemeContext));
  const [serverConnectionContext, serverConnectionContextDispatch] = useReducer(serverConnectionContextReducer, useContext(ServerConnectionContext));
  const [appInfoContext, appInfoContextDispatch] = useReducer(appInfoContextReducer, useContext(APPInfoContext));
  // console.log("AppContextProvider", appInfoContext)
  return (
    <ServerConnectionContext.Provider value={[serverConnectionContext, serverConnectionContextDispatch]}>
      <UserContext.Provider value={[userContext, userContextDispatch]}>
        <LangContext.Provider value={[langContext, langContextDispatch]}>
          <ThemeContext.Provider value={[themeContext, themeContextDispatch]}>
            <PaperProvider theme={themeContext.theme}>
              <UploadStateContextProvider>
                <APPInfoContext.Provider value={[appInfoContext, appInfoContextDispatch]}>
                  <ImageGallerySettingContextProvider>
                   {/* <ProjectsAlbumContextPovider> */}
                    {children}
                   {/* </ProjectsAlbumContextPovider> */}
                  </ImageGallerySettingContextProvider>
                </APPInfoContext.Provider>
              </UploadStateContextProvider>
            </PaperProvider>
          </ThemeContext.Provider>
        </LangContext.Provider>
      </UserContext.Provider>
    </ServerConnectionContext.Provider>
  );
};
