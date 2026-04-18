import * as React from 'react';
import { DeviceEventEmitter } from "react-native";
import { useState, useContext, useEffect, useCallback, useRef, useMemo, useReducer, createContext, createRef } from 'react'; 
import { ThemeContext } from './appContext/ThemeContext';
import { UserContext } from '../components/appContext/UserContext';
import { ProjectsAlbumContext } from './appContext/ProjectsAlbumContext';
import { AppState, TouchableOpacity, StyleSheet, View, Dimensions, Alert, RefreshControl, FlatList, ActivityIndicator, Image } from 'react-native';
import { default as HeaderComponent } from './header/Header';
import { FilterButton } from './FilterButton';
import Content from './header/Content';
import Action from './header/Action';
import { MenuButton } from './MenuButton';
import Button from './button/Button';
import FontAwesome5Icon from 'react-native-vector-icons/FontAwesome5';
import Loading from './Loading'
import CenterView from './CenterView';
// import { CheckBox } from './CheckBox';
// import { NoPermissionsAlert } from './NoPermissions';
import { Provider, Divider } from 'react-native-paper';
import { Text } from './Text';
// import { FABGroup } from './FAB';
import { NoPermissions } from './NoPermissions';
import { createAlbum, shareAlbum, joinAlbum, listShareAlbum, uploads, batchCreate } from '../helpers/googleAlbumApi';
import {node, getAlbum, setAlbum, deleteAlbum, addImageToAlbumAsynStorage, removeImageFormAlbumAsynStorage } from '../helpers/asyncStorage/albumAsynStorage'; 
import { useNavigation } from '@react-navigation/native';
import { useLaunchCamera } from '../helpers/hooks/useLaunchCamera';
import promiseAll from '../helpers/promiseAll'
import * as RNFS from 'react-native-fs';
import { AlertError } from './AlertError';
import { ListColumn } from './ListColumns';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
// import { CaptureMultiView, useMultiCapture } from './CaptureComponent';
// import { ImageViewFooterComponent } from './ImageGallery';
import { useFilter } from './useFilter';
import { gql, useQuery, useApolloClient } from '@apollo/client';
import { projectQuery } from '../helpers/GQL/query';
import { projectUpdateMutation } from '../helpers/GQL/mutation';
import BackgroundFetch from "react-native-background-fetch";
import { useNetInfo } from "@react-native-community/netinfo";
import { List as PaperList } from 'react-native-paper';
import { Searchbar } from './SearchBar';
const window = Dimensions.get('window');
const windowWidth = window.width;
const windowHeight = window.height;

function uuidv1() {
  return Math.random().toString(36).slice(-6);
}

let fileList = async () => {
  // console.log(RNFS.CachesDirectoryPath + '/KNOTS', await RNFS.exists(RNFS.CachesDirectoryPath + '/KNOTS'))
  if (!(await RNFS.exists(RNFS.CachesDirectoryPath + '/KNOTS'))) await RNFS.mkdir(RNFS.CachesDirectoryPath + '/KNOTS')
  if (!(await RNFS.exists(`file:///storage/emulated/0/Pictures/KNOTS`))) await RNFS.mkdir('file:///storage/emulated/0/Pictures/KNOTS')
  RNFS.readDir(`${RNFS.CachesDirectoryPath}/KNOTS`)
    .then((result) => {
      // console.log('GOT RESULT', result);
      // stat the first file
      // return Promise.all([RNFS.stat(result[6].path), result[6].path]);
      // return RNFS.readDir(result[5].path, 'utf8')
    })
    // .then(async (statResult) => {
    //   console.log(statResult)
    //   if (statResult[0].isFile()) {
    //     // if we have a file, read it
    //     return await RNFS.readFile(statResult[1], 'utf8');
    //   }
    //   if (statResult[0].isDirectory()) {
    //     return await RNFS.readDir(statResult[1], 'utf8');
    //     // await RNFS.stat(statResult[1], 'utf8')
    //   }
    //   return 'no file';
    // })
    // .then(async (contents) => {
    //   // log the file contents
    //   console.log("contents", contents)
    //   // console.log(await RNFS.readFile(contents[5].path, 'utf8'));
    // })
    .catch((err) => {
      console.log(err.message, err.code);
    });
}

export const ProjectsUseQuery = React.memo((props) => { 
 const { loading, error, data, refetch } = useQuery(gql`${projectQuery}`, {
  // fetchPolicy: "network-only",   // Used for first execution
  // nextFetchPolicy: "cache-first", // Used for subsequent executions
 })
if(data) console.log("data")
 if (loading) return <Loading/>
 if (error) return <CenterView><Text>載入失敗:{error.message}</Text></CenterView>
 if (data) return React.cloneElement(props.children, { data: data, refetch : refetch  })
})

export const Header = ({ items }) => {
  const [{ theme }] = useContext(ThemeContext);
  const [filterState, setStatus] = useContext(ProjectFilterContext);
  const buttonColor = theme.colors.primary;
  const _items = items?.map(e => {
    let _item = JSON.parse(JSON.stringify(e));
    _item.onPress = () => {
      if (e.onPress) e.onPress();
    }
    return _item
  })??[]
  const [keyword, setKeyword] = useState(filterState.keyword);
  // const keyword = useRef();
  // keyword.current = filterState.keyword;
  // console.log("Header", filterState.keyword, keyword.current);
  return (
    <HeaderComponent style={{ alignContent: "space-between", width: "100%", justifyContent: "space-between", backgroundColor: "white", alignContent: "center", alignItems: "center", paddingRight: 10 }}>
      <Content title="專案相簿" style={{ backgroundColor: theme.colors.accent }} titleStyle={{ color: theme.colors.primary }} />
      <FilterButton filterContext={ProjectFilterContext}
        onConfirmPress={(filterState) => { return { ...filterState, keyword: keyword } }}
        onClosePress={() => setKeyword(filterState.keyword)}
        body={<>
        <View style={{ marginHorizontal: 10 }}>
            <Searchbar value={keyword} onChangeText={text => { setKeyword(text)}} placeholder="專案..." style={{ margin: 3 }}/>
          {/* <PaperList.Section>
            <PaperList.Subheader>任務狀態</PaperList.Subheader>
            <PaperList.Item styles={[styles.item]} title="未完成" right={() =>
              <Pressable onPress={() => { setStatus({ ...status, ...{ TODO: !status.TODO } }) }}>
                <PaperList.Icon color={iconColor(status.TODO)} icon="checkbox-marked" />
              </Pressable>
            } />
            <PaperList.Item styles={[styles.item]} title="已完成" right={() =>
              <Pressable onPress={() => { setStatus({ ...status, ...{ DONE: !status.DONE } }) }}>
                <PaperList.Icon color={iconColor(status.DONE)} icon="checkbox-marked" />
              </Pressable>
            } />
          </PaperList.Section> */}
        </View>
      </>} />
      {/* <MenuButton
        button={<FontAwesome5Icon style={{marginHorizontal:12, marginVertical:10}} size={20} color={buttonColor} name="ellipsis-v"/>}
        items={_items}
      /> */}
    </HeaderComponent>
  )
}  

export const Columns = (backgroundColor) => {
  const columns = [
    { name: "專案", style: [styles.column1] },
    { name: "未同步檔案", style: [styles.column2] },
    { name: "狀態", style: [styles.column3] },
  ]
  return (
    <>
      <Divider />
      <ListColumn
        columns={columns}
        backgroundColor={backgroundColor}
      />
    </>
  )
}

export const List =async ({ list, renderItem, loadMore, hasNext, children }) => {
  const [loading, setLoading] = useState(false);
  const [scrollEnabled, setScrollEnabled] = useState(true);
  const _loadMore = () => { };
  const _renderItem = useCallback((p, index) => { return (renderItem(p, index)) }, []);
  const _keyExtractor = useCallback((p, index) => index);
  const _getItemLayout = useCallback((data, index) => ({ length: styles.ImageContainerStyle.height, offset: styles.ImageContainerStyle.height * index, index }), []);
  return (
    <>
      {loading?<Loading/>:null}
      <FlatList
        ListEmptyComponent={() => <ActivityIndicator color={"blue"}/>}
        windowSize={50}
        getItemLayout={_getItemLayout}
        contentContainerStyle={{ alignSelf: 'flex-start' }}
        numColumns={2}
        onEndReached={_loadMore}
        scrollEnabled={scrollEnabled}
        data={list}
        renderItem={_renderItem}
        keyExtractor={_keyExtractor}
        ListFooterComponent={hasNext ? <Button onPress={loadMore}>更多</Button> : null}
      >
      </FlatList>
    </>
  )
}

// const albumReducer = (state, action) => {
//   // console.log("albumDispatch", state, action)
//   switch (action.type) {
//     case 'INITIAL':
//       return { ...state, ...action.payload };
//     case 'ADD_IMAGES': {
//       let edges = [...state.edges].reverse();
//       action.payload.map(e => { edges.unshift(e) });
//       return { ...state, edges:edges }
//     }
//     case 'REMOVE_IMAGES': { 
//       let edges = state.edges.map(e => e);
//       // console.log("edges", edges)
//       // let nameList = action.payload.map(e => e.image.filename);
//       edges = edges.filter(e => !action.payload.includes(e.node.image.filename))
//       // console.log("edges2", edges)
//       // console.log("REMOVE_IMAGES", { ...state, edges:edges })
//       return { ...state, edges:edges }
//     }  
//     case 'REMOVE_ABLUM': {
//       let temp = JSON.parse(JSON.stringify(state));
//       delete temp[action.payload];
//       return { ...state, ...temp }
//     }
//     case 'UPDATE_ABLUM': {
//       // let newVal = {}
//       // newVal[action.payload.title] = action.payload.album;
//       // console.log(newVal);
//       return action.payload.album
//     }
//     case 'UPDATE_SHARETOKEN': { 
//       return { ...state, shareToken: action.payload };
//     }  
//   }
// }

export const Item = React.forwardRef(({ id, title, color, backgroundColor, shareToken }, ref) => {
  console.log("Item")
  const navigation = useNavigation();
  const netInfo = useNetInfo();
  const [{ theme }] = useContext(ThemeContext);
  // const [album, albumDispatch] = useReducer(albumReducer, {
  //   edges: [],
  //   page_info: { has_next_page: false }
  // });
  const [albumSource, albumDispatch] = useContext(ProjectsAlbumContext);
  if (!albumSource[id]) { 
    albumDispatch({ type: "INITIAL_ALBUM", payload: id });
    return<></>;
  }
  console.log("albumSource", albumSource);
  const album = useMemo(() => {
    return albumSource[id]
  }, [albumSource]);
  console.log(album)
  const forceStop = useRef(false);
  const [loading, setLoading] = useState(false);
  const client = useApolloClient();
  const [events, setEvents] = useState([]);
  const [backgroundFetchStatus, setBackgroundFetchStatus] = useState(null);
  const isOnProgress = useRef(false);
  // console.log("album item", album)
  const syncStatus = {
    synced: {
      name: "已同步",
      backgroundColor: "green"
    },
    synchronizing: {
      name: "同步中",
      backgroundColor: "orange"
    },
    unsynced: {
      name: "同步檔案",
      backgroundColor: "orange"
    }
  }
  const [status, setStatus] = useState("synced"); 
  const initBackgroundFetch = async () => {
    // BackgroundFetch event handler.
    const onEvent = async (taskId) => {
      console.log('[BackgroundFetch] task: ', taskId);
      // Do your background work...
      await addEvent(taskId);
      // IMPORTANT:  You must signal to the OS that your task is complete.
      BackgroundFetch.finish(taskId);
    }

    // Timeout callback is executed when your Task has exceeded its allowed running-time.
    // You must stop what you're doing immediately BackgroundFetch.finish(taskId)
    const onTimeout = async (taskId) => {
      // console.warn('[BackgroundFetch] TIMEOUT task: ', taskId);
      BackgroundFetch.finish(taskId);
    }

    // Initialize BackgroundFetch only once when component mounts.
    let status = await BackgroundFetch.configure({ minimumFetchInterval: 15 }, onEvent, onTimeout);
    setBackgroundFetchStatus(status);
    // console.log('[BackgroundFetch] configure status: ', status);
  }
  const addEvent = (taskId) => {
    // Simulate a possibly long-running asynchronous task with a Promise.
    return new Promise((resolve, reject) => {
      setEvents([{
        ...events,
        taskId: taskId,
        timestamp: (new Date()).toString()
      }])
      resolve();
    });
  }
  const upload = async () => { 
    isOnProgress.current = true;
    forceStop.current = false;
    let uploadedCount = 0;
    let totalCount = album.edges.length;
    let { accessToken } = await GoogleSignin.getTokens();
    let _album;

    const createAndShareAlbum = async () => {
      let album = await createAlbum(accessToken, title+"_"+id);
      console.log("createAlbum", album);
      let { shareInfo } = await shareAlbum(accessToken, album.id);
      console.log("shareAlbum", shareInfo);
      await client.mutate({
        mutation: gql`${projectUpdateMutation}`,
        variables: {
          data: {
            id: id,
            albumShareToken: shareInfo.shareToken
          }
        },
      }).then(res => {
        albumDispatch({ type: "UPDATE_SHARETOKEN", payload: res.data.projectUpdate.project.albumShareToken });
      }).catch(err => { throw err });
      return album
    }
    try {
      console.log("await listShareAlbum(accessToken)", await listShareAlbum(accessToken))
      _album = (await listShareAlbum(accessToken)).sharedAlbums.find(e => e.title == title+"_"+id);
      console.log("shareToken", shareToken);
      if (!_album) {
        if (shareToken) {
          _album = await joinAlbum(accessToken, shareToken);
          if (_album.error) _album = await createAndShareAlbum().catch(err => { throw err });
            // throw _album.error;
        }
        else {
          _album = createAndShareAlbum.catch(err => { throw err });
        }
      }
    } catch (error) {
      console.log(error)
      isOnProgress.current = false;
      AlertError("同步失敗，請重新再試一次...", error.message);
      console.log(album)
      albumDispatch({ type: "SET_ABLUM_STATUS", payload: { projectID: id, status: album.edges.length > 0 ? "unsynced" : "synced" }})
      // if (album.edges.length > 0) setStatus("unsynced");
      // else if ((album.edges.length == 0)) setStatus("synced");
      return;
    }

    let _batchCreate = async (uploadTokenArr, albumID) => {
      try {
        if (forceStop.current == true) throw "已強制停止";
        const chunkSize = 10;
        for (let i = 0; i < uploadTokenArr.length; i += chunkSize) {
          let chunkUploadTokenArr = uploadTokenArr.slice(i, i + chunkSize);
          let { newMediaItemResults, error } = await batchCreate(accessToken, albumID, chunkUploadTokenArr);
          if (error) {
            AlertError("同步失敗，請重新再試一次...", error.message);
            throw `${error.message}`;
          }
          // console.log("newMediaItemResults", newMediaItemResults)
          newMediaItemResults = newMediaItemResults.map(e => {
            e.fileName = uploadTokenArr.find(x => x.uploadToken == e.uploadToken).fileName;
            return e;
          });
          let uploadList = newMediaItemResults.filter(e => !e.mediaItem).map(e => {
            e.fileName = uploadTokenArr.find(x => x.uploadToken == e.uploadToken).fileName;
            return e;
          });
          let removeList = newMediaItemResults.filter(e => e.mediaItem).map(e => e.mediaItem.filename);
          await removeImages(removeList);
          uploadedCount += removeList.length;
          console.log("batchCreate", newMediaItemResults);
          console.log("uploadList", uploadList);
          if (forceStop.current == true) throw "已強制停止";
          if (uploadedCount < totalCount) {
            promiseAll([
              _batchCreate(uploadList)
            ], () => { })
          }
          else {
            let removeList = album.edges.map(e => e.node.image.filename);
            await removeImages(removeList);
            isOnProgress.current = false;
            albumDispatch({ type: "SET_ABLUM_STATUS", payload: { projectID: id, status: album.edges.length > 0 ? "unsynced" : "synced" }})
            // setStatus("synced");
          }
        }
      } catch (error) {
        console.log(error)
        AlertError("同步失敗，請重新再試一次...", error.error ?? error);
        isOnProgress.current = false;
        albumDispatch({ type: "SET_ABLUM_STATUS", payload: { projectID: id, status: album.edges.length > 0 ? "unsynced" : "synced" }})
        // if (album.edges.length > 0) setStatus("unsynced");
        // else if ((album.edges.length == 0)) setStatus("synced");
        return
      }
    }
    await promiseAll(album.edges.map(async e => uploads(accessToken, e.node.image.filename, e.node.image.uri)), async (uploadTokenArr, err) => {
      console.log("uploadTokenArr", uploadTokenArr, err)
      if (err) AlertError("同步失敗，請重新再試一次...", err);
      else await _batchCreate(uploadTokenArr, _album.id);
    })
  }
  const scheduleTask = async () => {
    console.log("scheduleTask")
    BackgroundFetch.scheduleTask({
      taskId: title + "_upload_start",
      forceAlarmManager: true,
      delay: 1000  // <-- milliseconds
    }).then(async ()=> await upload()).catch(err => console.log("err", err))
  }
  const onForceStop = () => { 
    if (status != "synchronizing") return;
    Alert.alert(
      "強制停止",
      "",
      [
        {
          text: "取消",
          style: "cancel"
        },
        {
          text: "確定", onPress: async () => {
            forceStop.current = true;
            albumDispatch({ type: "SET_ABLUM_STATUS", payload: { projectID: id, status: album.edges.length > 0 ? "unsynced" : "synced" }})
          }
        }
      ]
    );
  }
  const removeImages = async (nameList) => {
    console.log("removeImages")
    await removeImageFormAlbumAsynStorage(title, id, nameList);
    albumDispatch({type: "REMOVE_IMAGES", payload:{ projectID:id, images: nameList }});
  }
  const onUploadPress = () => {
    if (status !== "synchronizing" && album && album.edges.length > 0 && netInfo?.type == "wifi" && backgroundFetchStatus == 2) {
      // setStatus("synchronizing");
      albumDispatch({type:"SET_ABLUM_STATUS", payload: { projectID:id, status: "synchronizing"}})
    }
  }
  useEffect(() => {
    if (!album) albumDispatch({ type: "INITIAL_ALBUM", payload: id });
    initBackgroundFetch();
    (async () => { 
      // getAlbum(title, id).then(album => albumDispatch({ type: "INITIAL", payload: album })).catch(err=>console.log(err));
    })()
  }, [])
  useEffect(() => { 
    // onUploadPress();
    if (album?.status == "synchronizing" && isOnProgress.current == false) {
      console.log("useEffect")
      scheduleTask();
    }
  }, [album?.status, backgroundFetchStatus, netInfo])

  if (!album) return <></>
  return (
    <>
      <TouchableOpacity onPress={() => {
        if (status == "synchronizing") return;
        navigation.navigate('ImageGallery', {
          id: id,
          title: title,
          album: album,
          albumDispatch: albumDispatch,
          setSyncStatus: setStatus,
          shareToken: shareToken,
        })
      }}>
        <View style={styles.itemContainer} >
          <>
            <View style={[styles.column1, { backgroundColor: backgroundColor }]}><Text style={{ fontWeight: "bold" }} color={color}>{title}</Text></View>
            <View style={[styles.column2, { backgroundColor: backgroundColor }]}><Text color={color}>{album?.edges?.length??null}</Text></View>
            <TouchableOpacity style={[styles.column3, { backgroundColor: backgroundColor }]} onPress={onUploadPress} onLongPress={onForceStop}>
              {album?.status == "synchronizing" ? <Loading style={{backgroundColor:null}}/> :
                <View style={[styles.snycButton, { backgroundColor: syncStatus[album?.status?? "synced"]?.backgroundColor }]}>
                  <Text style={{ fontWeight: "bold" }} color={theme.colors.accent}>{syncStatus[album?.status?? "synced"]?.name ?? null}</Text>
                </View>
              }
            </TouchableOpacity>
          </>
        </View>
      </TouchableOpacity>
    </>
  )
})

export const ProjectFilterContext = createContext({
  keyword: null,
  status: {
    synced: true,
    synchronizing: true,
    unsynced: true
  },
});

export const ProjectGalleryList = () => {
  console.log("ProjectGalleryList")
  const value = useFilter(ProjectFilterContext)
  return(
  <ProjectFilterContext.Provider value={value}>
  <ProjectsUseQuery >
      <ProjectGalleryListContainer />
    </ProjectsUseQuery>
  </ProjectFilterContext.Provider>)
}

export const ProjectGalleryListContainer = ({data, refetch}) => {
  console.log("ProjectGalleryListContainer", data);
  const [projectFilterContext] = useContext(ProjectFilterContext);
  const [userContext] = useContext(UserContext);
  const [{ theme }] = useContext(ThemeContext);
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);
  const filter = (data) => {
    let { keyword, status } = projectFilterContext;
    return data.filter(e => {
      return (keyword ? e.node.code.includes(keyword) : true)
     })
  }
  const projects = useMemo(() => data.projects.edges, [data.projects.edges]);
  // console.log(data)
  const getAlbums = async () => {
    // let {accessToken} = await GoogleSignin.getTokens();
    // let albums = await listShareAlbum(accessToken);
    // if (albums.sharedAlbums) setAlbums(albums.sharedAlbums);
    // console.log("getAlbums", albums);
    refetch();
  }
  useEffect(() => { 
      fileList();
      getAlbums();
  }, [])
  if(projects.length > 0)
  return (
    <>
      <Provider>
        <Header
          // items={
          //   [{
          //     title: "新增相簿", onPress: async () => {
          //       let { accessToken } = await GoogleSignin.getTokens();
          //       let newAlbums = await createAlbum(accessToken, `Project_${uuidv1()}`).then((res) => {
          //         console.log("createAlbum", res)
          //         return res
          //       });
          //       if (newAlbums.error) AlertError("新增相簿失敗，請重新再試一次...", newAlbums.error.message);
          //       else {
          //         let share = await shareAlbum(accessToken, newAlbums.id)
          //         console.log("share", share)
          //         if (share.error) AlertError("新增相簿失敗，請重新再試一次...", share.error.message);
          //         else await getAlbums();
          //       }
          //     }
          //   }
          //   ]
          // }
        />
        <View style={[styles.imageGalleryContainerStyle, { backgroundColor:theme.colors.accent }]}>
          <Columns backgroundColor={theme.colors.secondary} />
          <FlatList
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={async () => {
                  setRefreshing(true);
                  refetch();
                  setRefreshing(false);
                }}
              />}
            // contentContainerStyle={{ alignSelf: 'flex-start' }}
            numColumns={1}
            // onEndReached={_loadMore}
            data={filter(projects)}
            ListEmptyComponent={<View style={{width:"100%", height:windowHeight/2}}><CenterView><Text>沒有資料</Text></CenterView></View>}
            renderItem={({ item }) =>
              <Item
                color={theme.colors.titleText}
                backgroundColor={theme.colors.secondary}
                title={item.node.code}
                id={item.node.id}
                shareToken={item.node.albumShareToken}
              />
            }
            keyExtractor={(item, index) => index}>
          </FlatList>
        </View>
      </Provider>
    </>
    )
}

export const ProjectGalleryList2 = (props) => {
  console.log("ProjectGalleryList");
  const { permissions, launchCamera, launchImageLibrary } = useLaunchCamera();
  const [userContext] = useContext(UserContext);
  const [{ theme }] = useContext(ThemeContext);
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [allSelected, setAllSelected] = useState(false); 
  const [albums, setAlbums] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const appState = useRef(AppState.currentState);
  const getAlbums = async () => {
    let {accessToken} = await GoogleSignin.getTokens();
    let albums = await listShareAlbum(accessToken);
    if (albums.sharedAlbums) setAlbums(albums.sharedAlbums);
    setLoading(false)
    // console.log("getAlbums", albums)
  }
  const selectImg = (node, index) => { 
    // console.log("selectImg")
    node.index = index;
    let temp = selectedImg.current.map(e => e);
    temp.push(node);
    selectedImg.current = temp;
    // _setAddress();
  }
  const unselectImg = (node, index) => {
    // console.log("unselectImg")
    let temp = selectedImg.current.map(e => e);
    selectedImg.current = temp.filter(e => e.index != index);
    _setAddress();
  }

  const _setAllSelected = () => { 
    if (!allSelected) selectedImg.current = albums?.edges.map((e, i) => { e.node.index = i;return e.node});
    else selectedImg.current = [];
    setAllSelected(!allSelected);
    // _setAddress();
  }

  useEffect(() => {
    const subscription = AppState.addEventListener("change", async (nextAppState) => {
      if (nextAppState === "active" && albums.length==0 && permissions.WRITE_EXTERNAL_STORAGE.permissionState) getAlbums();
    });
    return () => {
     subscription.remove();
    };
  }, []);
  
  useEffect(() => { 
    if (permissions.WRITE_EXTERNAL_STORAGE.permissionState) {
      fileList();
      getAlbums();
      // setLoading(false)
    }
    
  }, [permissions.WRITE_EXTERNAL_STORAGE.permissionState])

  if (permissions.WRITE_EXTERNAL_STORAGE.permissionState === true) return (
    <>
      <Provider>
        {loading ? <Loading /> : null}
        <Header
          items={
            [{
              title: "新增相簿", onPress: async () => {
                setLoading(true)
                let { accessToken } = await GoogleSignin.getTokens();
                let newAlbums = await createAlbum(accessToken, `Project_${uuidv1()}`).then((res) => {
                  console.log("createAlbum", res)
                  return res
                });
                if (newAlbums.error) AlertError("新增相簿失敗，請重新再試一次...", newAlbums.error.message);
                else {
                  let share = await shareAlbum(accessToken, newAlbums.id)
                  console.log("share", share)
                  if (share.error) AlertError("新增相簿失敗，請重新再試一次...", share.error.message);
                  else await getAlbums();
                }
                setLoading(false)
              }
            }
            ]
          }
        />
        <View style={[styles.imageGalleryContainerStyle, { backgroundColor:theme.colors.accent }]}>
          <Columns backgroundColor={theme.colors.secondary} />
          <FlatList
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={async () => {
                  setRefreshing(true);
                  await getAlbums()
                  setRefreshing(false);
                }}
              />}
            contentContainerStyle={{ alignSelf: 'flex-start' }}
            numColumns={1}
            // onEndReached={_loadMore}
            data={albums}
            renderItem={({ item }) =>
              <Item
                color={theme.colors.titleText}
                backgroundColor={theme.colors.secondary}
                title={item.title}
                id={item.id} />
            }
            keyExtractor={(item, index) => index}>
          </FlatList>
        </View>
      </Provider>
    </>
  )
  else if (permissions.WRITE_EXTERNAL_STORAGE.permissionState === false)
    return <NoPermissions/>
  else return <Loading/>
}

const styles = StyleSheet.create({
  imageGalleryContainerStyle: {
    flex: 1,
    zIndex: 100,
    backgroundColor:"white"
  },
  itemContainer: {
    width:windowWidth,
    padding: 0,
    margin: 0,
    flexDirection: "row",
    justifyContent: "center",
    alignContent: "center",
    alignItems: "center",
    marginTop: 5,
    marginBottom: 5,
    height: 40,
    paddingHorizontal:12,
  },
  columnContainer: {
    paddingHorizontal: 5,
    height: "100%",
    margin: 2,
  },
  column1: {
    width: "50%",
    paddingHorizontal: 5,
    margin: 2,
    height: "100%",
    justifyContent: "center",
  },
  column2: {
    width: "25%",
    paddingHorizontal: 5,
    margin: 2,
    height: "100%",
    alignItems:"center",
    justifyContent: "center",
    textAlign:"center"
  },
  column3: {
    width: "25%",
    paddingHorizontal: 5,
    margin: 2,
    height: "100%",
    alignItems:"center",
    justifyContent: "center",
    textAlign:"center"
  },
  snycButton: {
    borderRadius: 20,
    padding: 5,
    paddingHorizontal:8
  },
  imageViewFooterWrap: {
    position:"absolute",
    bottom: 0,
    height: windowHeight,
    width: windowWidth,
    zIndex: 100,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
})