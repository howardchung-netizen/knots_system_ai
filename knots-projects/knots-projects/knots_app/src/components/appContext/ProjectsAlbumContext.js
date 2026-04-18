import React, { createContext, useEffect, useState, useReducer , useContext, useRef, createRef} from "react";
import { shareAlbum, listShareAlbum } from "../../helpers/googleAlbumApi";
import { albumsList as albumsListAsynStorage, getAlbum } from "../../helpers/asyncStorage/albumAsynStorage";
import { Text } from 'react-native';
import promiseAll from "../../helpers/promiseAll";
import { GoogleSignin } from "@react-native-google-signin/google-signin";

export const combineComponents = (components => {
 console.log("components", components[0].props)
 return components.reduce(
  (AccumulatedComponents, CurrentComponent) => { 
   console.log("AccumulatedComponents", AccumulatedComponents)
   console.log("CurrentComponent", CurrentComponent)
   return <AccumulatedComponents>{CurrentComponent.props.children}</AccumulatedComponents>
  },
  ({children}) => {
   console.log("CCurrentComponentCurrentComponentCurrentComponent", ComponentProps)
   return <>{children}</>
  }
 )
})

export const ProjectsAlbumContext = createContext({});

export const projectsAlbumReducer = (state, action) => {
  // console.log("projectsAlbumReducer", action);
  switch (action.type) {
    case 'INITIAL':
      return { ...state, ...action.payload };
    case 'INITIAL_ALBUM': {
      return {
        ...state, [action.payload]: {
          edges: [],
          page_info: { has_next_page: false },
          status: "synced"
        }
      }
    }
    case 'SET_ABLUM_STATUS': { 
      let temp = {...state};
      temp[action.payload.projectID].status = action.payload.status
      return temp
    }
    case 'ADD_IMAGES': {
      let temp = state;
      // console.log("ADD_IMAGES", temp[action.payload.projectID])
      temp[action.payload.projectID]
      action.payload.images.map(e => { temp[action.payload.projectID].edges.push(e) });
      //  temp[action.payload.projectID].edges = temp[action.payload.projectID].edges.reverse()
      temp[action.payload.projectID].status = "unsynced"
      return { ...state, ...temp }
    }
    case 'REMOVE_IMAGES': {
      let temp = { ...state };
      temp[action.payload.projectID].edges = temp[action.payload.projectID].edges.filter(e => !action.payload.images.includes(e.node.image.filename))
      if (temp[action.payload.projectID].status == "synchronizing") temp[action.payload.projectID].status = temp[action.payload.projectID].edges.length > 0 ? "synchronizing" : "synced";
      if (temp[action.payload.projectID].status == "unsynced") temp[action.payload.projectID].status = temp[action.payload.projectID].edges.length > 0 ? "unsynced" : "synced";
      // console.log("edges", edges)
      // let nameList = action.payload.map(e => e.image.filename);
      // console.log("edges2", edges)
      // console.log("REMOVE_IMAGES", { ...state, edges:edges })
      // console.log(temp[action.payload.projectID].edges.length, temp[action.payload.projectID].status);
      return temp
    }
    // case 'REMOVE_ABLUM': {
    //   let temp = JSON.parse(JSON.stringify(state));
    //   delete temp[action.payload];
    //   return [...state, ...temp]
    // }
    case 'UPDATE_ALBUM': {
      // let newVal = {}
      // newVal[action.payload.title] = action.payload.album;
      // console.log(newVal);
      let temp = { ...state }
      temp[action.payload.projectID] = {...temp[action.payload.projectID], ...action.payload.album };
      if (state[action.payload.projectID].status !== "synchronizing") temp[action.payload.projectID].status = temp[action.payload.projectID].edges.length > 0 ? "unsynced" : "synced";
      return temp;
    }
    case 'INITIAL_IMAGE': {
      let temp = state;
      // console.log("INITIAL_IMAGE", action)
      for (let i in temp[action.payload.projectID].edges) {
        if (temp[action.payload.projectID].edges[i].node.image.filename == action.payload.filename) {
          temp[action.payload.projectID].edges[i].node.isNewFile = false
        }
      }
      return temp
    }
    case 'UPDATE_SHARETOKEN': {
      return { ...state, shareToken: action.payload };
    }  
  }
}

export const ProjectsAlbumContextPovider = (props) => { 
 const [projectsAlbumContext, ProjectsAlbumContextDispatch] = useReducer(projectsAlbumReducer, useContext(ProjectsAlbumContext));
 // const [albumsList, setAlbumsList] = useState([]);
 // console.log("ProjectsAlbumContextPovider", albumsList);
 console.log("projectsAlbumContext", projectsAlbumContext);
 const albumContextRef = useRef({});
 // const [inited, setInited] = useState(false);
 // albumContextRef.current = [{ projectName: "1111", projectID: 1111 }, { projectName: "2222", projectID: 2222 }];
 
 // [{ projectName: "1111", projectID: 1111 }, { projectName: "2222", projectID: 2222 }].map(e => {
 //  let Context = createContext({ projectName: e.projectName,
 //   projectID: e.projectID,
 //  })
  // let [projectAblum, setProjectAblum] = useReducer(projectsAlbumReducer, useContext(Context));
  // albumContextRef.current.push({ projectAblum, setProjectAblum, Context });
 // })
 // console.log("albumContextRef.current", albumContextRef.current)
 // let a = [<ProjectsAlbumContext.Provider value={1} >{props.children}</ProjectsAlbumContext.Provider>];
 // const combineComponents = (components => {
 //  console.log("components", components);
 //  let ContextProvider = components[0].Context.Provider;
 //  return <ContextProvider>{props.children}</ContextProvider>
 //  let AA = React.cloneElement(components[0].ContextProvider, props);
 //  ;
 //  return AA;
 //  return components[0].ContextProvider;
 //  return React.createElement(components[0].type, props, null);
 //  let Component = React.cloneElement(components[0]); //{ value: components[0].projectAblum }
 //  return <Component/>
 //  return components.reduce(
 //   (AccumulatedComponents, CurrentComponent) => {
 //    console.log("AccumulatedComponents", AccumulatedComponents);
 //    console.log("CurrentComponent", CurrentComponent);
 //    // let Component = React.cloneElement(CurrentComponent.ContextProvider, { value: CurrentComponent.projectAblum });
 //    // let ContextProvider = React.cloneElement(CurrentComponent.Context.Provider);
 //    // CurrentComponent.ContextProvider
 //    console.log("ContextProvider", CurrentComponent);
 //    return ({ children }) => {
 //     console.log("children", children)
 //     return (
 //      <AccumulatedComponents.Context.Provider>
 //       <CurrentComponent.Context.Provider>{props.children}</CurrentComponent.Context.Provider>
 //      </AccumulatedComponents.Context.Provider>)
 //    }
 //   }
 //  )
 // })

 useEffect(() => {
  (async () => {
   let albumsList = await albumsListAsynStorage()
   console.log("albumsList", albumsList)
    await promiseAll(albumsList.map(async e => { 
      let album = getAlbum(e.projectName, e.projectID);
      album.status = album.edges.length > 0 ? "synced" : "unsynced"
      console.log(album)
    albumContextRef.current[projectID] = { projectName: e.projectName, projectID: e.projectID, album: await album }
    console.log("albumContextRef.current", albumContextRef.current);
   }),
    (res) => { 
     ProjectsAlbumContextDispatch({ type: "INITIAL", payload: albumContextRef.current });
   })
  })()
 }, [])

 // useEffect(() => { 
 //  (async () => { 
 //    ProjectsAlbumContextDispatch({ type: "INITIAL", payload: albumContextRef.current })
 //    console.log("projectsAlbumContext", projectsAlbumContext);
 //    setInited(true);
 //   })()
 // }, [])
 return <>
  <ProjectsAlbumContext.Provider value={[projectsAlbumContext, ProjectsAlbumContextDispatch]} >{props.children}</ProjectsAlbumContext.Provider>
  {/* {<_ContextProvider value={albumContextRef.current}>{props.children}</_ContextProvider>} */}
  {/* {combineComponents(albumContextRef.current)} */}
  {/* {combineComponents([a])} */}
  {/* {<_ContextProvider>{ props.children}</_ContextProvider>} */}
  {/* {props.children} */}
  </>
 return <></>
}
