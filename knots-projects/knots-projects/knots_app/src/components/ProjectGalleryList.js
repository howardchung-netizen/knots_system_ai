import * as React from 'react';
import { DeviceEventEmitter, PixelRatio } from "react-native";
import { useState, useContext, useEffect, useCallback, useRef, useMemo, useReducer, createContext, createRef } from 'react'; 
import { ThemeContext } from './appContext/ThemeContext';
import { UserContext } from '../components/appContext/UserContext';
import { ProjectsAlbumContext } from './appContext/ProjectsAlbumContext';
import { UploadStateContext } from './appContext/UploadStateContext';
import { AppState, TouchableOpacity, StyleSheet, View, Dimensions, Alert, RefreshControl, FlatList, ActivityIndicator, Platform, Pressable } from 'react-native';
import { Header as HeaderComponent } from './header/Header';
import { FilterButton } from './FilterButton';
import Content from './header/Content';
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
import {node, getAlbum, setAlbum, deleteAlbum, addImageToAlbumAsynStorage, removeImageFormAlbumAsynStorage, albumsList } from '../helpers/asyncStorage/albumAsynStorage'; 
import { useNavigation, useFocusEffect, useIsFocused  } from '@react-navigation/native';
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
import BackgroundService from 'react-native-background-actions';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { useToast } from "react-native-toast-notifications";
import scalesStyle, { scaledFontSize } from '../utils/scalesStyle';
const window = Dimensions.get('window');
const windowWidth = window.width;
const windowHeight = window.height;

const pathBegin = Platform.OS == 'ios' ? '': 'file://';
const CachesDirectoryPath = pathBegin + RNFS.CachesDirectoryPath + '/KNOTS'; 
const DocumentDirectoryPath = pathBegin + RNFS.CachesDirectoryPath + '/KNOTS'; 
let fileList = async () => {
  if (!(await RNFS.exists(CachesDirectoryPath))) await RNFS.mkdir(CachesDirectoryPath);
  if (!(await RNFS.exists(DocumentDirectoryPath))) await RNFS.mkdir(DocumentDirectoryPath);
  // console.log('DocumentDirectoryPath', await RNFS.exists(DocumentDirectoryPath))
  RNFS.readDir(DocumentDirectoryPath)
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
//  console.log("ProjectsUseQuery")
 const { loading, error, data, refetch } = useQuery(gql`${projectQuery}`, {
  // fetchPolicy: "no-cache",   // Used for first execution
  // nextFetchPolicy: "no-cache", // Used for subsequent executions
 })
 if (loading) return <Loading/>
 if (error) return <CenterView><Text>載入失敗:{error.message}</Text></CenterView>
 if (data) return React.cloneElement(props.children, { data: data, refetch: () => { console.log("ProjectsUseQuery refetch"); refetch(); }  })
})

export const Header = ({ items }) => {
  const [{ theme }] = useContext(ThemeContext);
  const [filterState, setState] = useContext(ProjectFilterContext);
  const buttonColor = theme.colors.primary;
  const _items = items?.map(e => {
    let _item = JSON.parse(JSON.stringify(e));
    _item.onPress = () => {
      if (e.onPress) e.onPress();
    }
    return _item
  })??[]
  const [keyword, setKeyword] = useState(filterState.keyword);
  const onFilterConfirmPress = async () => {
    setState({ ...filterState, keyword: keyword });
  }

  return (
    <HeaderComponent title="專案相簿">
      <FilterButton filterContext={ProjectFilterContext}
        onConfirmPress={onFilterConfirmPress}
        onClosePress={() => setKeyword(filterState.keyword)}
        body={<>
        <View style={{ marginHorizontal: 10 }}>
          <Searchbar value={keyword} onChangeText={text => { setKeyword(text)}} placeholder="專案..." style={{ margin: 3 }}/>
        </View>
      </>} />
    </HeaderComponent>
  )
}  

export const Columns = (backgroundColor) => {
  const columns = [
    { name: "專案", style: [styles.column1]},
    { name: "未同步檔案", style: [styles.column2]},
    { name: "狀態", style: [styles.column3]},
  ]
  return (
    <>
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
      let temp = {...state};
      // console.log("ADD_IMAGES", temp[action.payload.projectID])
      temp[action.payload.projectID]
      action.payload.images.map(e => { temp[action.payload.projectID].edges.push(e) });
      //  temp[action.payload.projectID].edges = temp[action.payload.projectID].edges.reverse()
      temp[action.payload.projectID].edges = [...new Set(temp[action.payload.projectID].edges)]
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

export const Item = React.forwardRef(({ id, title, color, backgroundColor, shareToken, isLastItem }, ref) => {
  // console.log("Item")
  const isFocused = useIsFocused();
  const [uploadStateContext, uploadStateContextDispatch] = useContext(UploadStateContext);
  const navigation = useNavigation();
  const netInfo = useNetInfo();
  const [{ theme }] = useContext(ThemeContext);
  const [{ loginType }] = useContext(UserContext);
  const [album, albumDispatch] = useReducer(projectsAlbumReducer, {
    [id]: {
      edges: [],
      page_info: { has_next_page: false },
      status: "synced",
      shareToken: shareToken
    }
  });
  const currentAlbum = useMemo(()=> album[id], [album[id]]);
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
  const client = useApolloClient();
  const [events, setEvents] = useState([]);
  const [backgroundFetchStatus, setBackgroundFetchStatus] = useState(null);
  const isOnProgress = useRef(false);
  const forceStop = useRef(false);
  const toast = useToast();

  const initBackgroundFetch = async () => {
    // BackgroundFetch event handler.
    const onEvent = async (taskId) => {
      console.log("onEvent", 
      Math.random() * 100)
      switch (taskId) {
        case 'com.transistorsoft.customtask':
          console.log("Received custom task");
          break;
        default:
          console.log("Default fetch task");
      }
      // Finish, providing received taskId.
      console.log('[BackgroundFetch] task: ', taskId);
      // Do your background work...
      await addEvent(taskId);
      await upload();
      BackgroundFetch.finish(taskId);
      // IMPORTANT:  You must signal to the OS that your task is complete.
    }

    // Timeout callback is executed when your Task has exceeded its allowed running-time.
    // You must stop what you're doing immediately BackgroundFetch.finish(taskId)
    const onTimeout = async (taskId) => {
      console.log('[BackgroundFetch] TIMEOUT task: ', taskId);
      BackgroundFetch.finish(taskId);
    }

    // Initialize BackgroundFetch only once when component mounts.
    let status = await BackgroundFetch.configure({
      taskId: "com.transistorsoft.customtask",
      forceAlarmManager: true,
      periodic: false,
      delay: 0,
      requiredNetworkType: BackgroundFetch.NETWORK_TYPE_ANY 
       }, onEvent, onTimeout);
    setBackgroundFetchStatus(status);
    console.log('[BackgroundFetch] configure status: ', status);
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
  const onUploadError = (message) => { 
    toast.show("同步失敗...", {
      type: "danger",
      placement: "bottom",
      duration: 2500,
      offset: 30,
      animationType: "slide-in",
      textStyle:{ fontSize: scaledFontSize(20) }
    });
    uploadStateContextDispatch({
      type: "SET_HEADER_CONTENT",
      payload: ""
    });
    uploadStateContextDispatch({
      type: "REMOVE_UPLOAD_ID",
      payload: id
    });
    uploadStateContextDispatch({
      type: "SET_IS_UPLOADING",
      payload: false
    });
  }
  const veryIntensiveTask = async () => {
    // Example of an infinite loop task
    await new Promise(async (resolve) => {
      const getTokens = async () => { 
        return await GoogleSignin.getTokens().catch(async err =>await getTokens());
      }
      let { accessToken } = await getTokens();
      const upload = async () => { 
        isOnProgress.current = true;
        let uploadedCount = 0;
        let totalCount = currentAlbum.edges.length;
        console.log("accessToken", accessToken);
        let _album;

        const createAndShareAlbum = async () => {
          let album = await createAlbum(accessToken, title);
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
          // console.log("await listShareAlbum(accessToken)", await listShareAlbum(accessToken))
          _album = (await listShareAlbum(accessToken)).sharedAlbums?.find(e => e.title == title);
          // console.log("shareToken", shareToken);
          if (!_album) {
            if (shareToken) {
              let joinedAlbum = await joinAlbum(accessToken, shareToken);
              console.log("joinedAlbum", joinedAlbum)
              if (joinedAlbum.error) _album = await createAndShareAlbum().catch(err => { throw err });
              else _album = joinedAlbum.album;
            }
            else {
              _album = await createAndShareAlbum().catch(err => { throw err });
            }
          }
        } catch (error) {
          console.log(error)
          isOnProgress.current = false;
          forceStop.current = true;
          console.log("同步失敗4");
          AlertError("同步失敗...", error.message);
          // console.log(album)
          albumDispatch({ type: "SET_ABLUM_STATUS", payload: { projectID: id, status: currentAlbum.edges.length > 0 ? "unsynced" : "synced" }})
          // if (currentAlbum.edges.length > 0) setStatus("unsynced");
          // else if ((currentAlbum.edges.length == 0)) setStatus("synced");
          resolve();
          return;
        }
       console.log(_album, shareToken, accessToken)
      //  console.log("currentAlbum", currentAlbum)
        let _batchCreate = async (uploadTokenArr, albumID) => {
          console.log("_batchCreate")
          try {
            if (forceStop.current == true) throw "已取消同步";
            const chunkSize = 50;
            for (let i = 0; i < uploadTokenArr.length; i += chunkSize) {
              let chunkUploadTokenArr = uploadTokenArr.slice(i, i + chunkSize);
              let { newMediaItemResults, error } = await batchCreate(accessToken, albumID, chunkUploadTokenArr);
              if (error) {
                console.log("同步失敗1")
                AlertError("同步失敗...", error.message);
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
              // console.log("batchCreate", newMediaItemResults);
              // console.log("uploadList", uploadList);
              if (forceStop.current == true) throw "已取消同步";
              if (uploadedCount < totalCount) {
                promiseAll([
                  _batchCreate(uploadList)
                ], () => { })
              }
              else {
                // BackgroundFetch.finish("com.transistorsoft.customtask")
                let removeList = currentAlbum.edges.map(e => e.node.image.filename);
                await removeImages(removeList);
                isOnProgress.current = false;
                albumDispatch({ type: "SET_ABLUM_STATUS", payload: { projectID: id, status: "synced" } });
                // setStatus("synced");
                uploadStateContextDispatch({
                  type: "REMOVE_UPLOAD_ID",
                  payload: id
                });
                resolve();
                console.log("finish");
              }
            }
          } catch (error) {
            console.log("同步失敗2", error);
            if(!forceStop.current) AlertError("同步失敗...", error?.error??error.toString()??'');
            isOnProgress.current = false;
            forceStop.current = true;
            albumDispatch({ type: "SET_ABLUM_STATUS", payload: { projectID: id, status: currentAlbum.edges.length > 0 ? "unsynced" : "synced" }})
            // if (currentAlbum.edges.length > 0) setStatus("unsynced");
            // else if ((currentAlbum.edges.length == 0)) setStatus("synced");
            resolve();
          }
        }
        // console.log("promiseAll _batchCreate")
        let uploadTokenArr = await promiseAll(currentAlbum.edges.map(e => uploads(accessToken, e.node.image.filename, e.node.image.uri)), async (uploadTokenArr, err) => {
          console.log("uploadTokenArr", uploadTokenArr);
          // BackgroundFetch.finish("com.transistorsoft.customtask")
        })
        if (uploadTokenArr.err) {
          isOnProgress.current = false;
          forceStop.current = true;
          albumDispatch({ type: "SET_ABLUM_STATUS", payload: { projectID: id, status: currentAlbum.edges.length > 0 ? "unsynced" : "synced" }});
          AlertError("同步失敗...", uploadTokenArr.err.message);
          resolve();
        }
        else await _batchCreate(uploadTokenArr, _album.id);
      }
      await upload();
    });
  }
  const scheduleTask = async () => {
    // console.log("scheduleTask", currentAlbum)
    uploadStateContextDispatch({
      type: "ADD_UPLOAD_ID",
      payload: id
    });
    if (!uploadStateContext.isUploading) {
      toast.show("正在同步圖片中...", {
        type: "normal",
        placement: "bottom",
        duration: 2500,
        offset: 30,
        animationType: "slide-in",
        textStyle: { fontSize: scaledFontSize(20) }
      });
      uploadStateContextDispatch({
        type: "SET_HEADER_CONTENT",
        payload: "正在同步圖片中..."
      });
      uploadStateContextDispatch({
        type: "SET_IS_UPLOADING",
        payload: true
      });
    }  
    isOnProgress.current = true;
    const backgroundTaskOptions = {
      taskName: `同步 ${title} 圖片`,
      taskTitle: `${title}`,
      taskDesc: `同步 ${title} 圖片`,
      taskIcon: {
          name: 'ic_launcher',
          type: 'mipmap',
          package: 'com.knots.todolist'
      },
      color: '#ff00ff',
      // linkingURI: 'yourSchemeHere://chat/jane', // See Deep Linking for more info
      parameters: {
          delay: 1000,
      },
    };
    BackgroundService.start(veryIntensiveTask, backgroundTaskOptions);
    // await BackgroundService.updateNotification({taskDesc: 'New ExampleTask description'}); // Only Android, iOS will ignore this call
    // iOS will also run everything here in the background until .stop() is called
    // await BackgroundService.stop();
    // BackgroundFetch.status((status) => {
    //   switch (status) {
    //     case BackgroundFetch.STATUS_RESTRICTED:
    //       console.log('BackgroundFetch restricted')
    //       break
    //     case BackgroundFetch.STATUS_DENIED:
    //       console.log('BackgroundFetch denied')
    //       break
    //     case BackgroundFetch.STATUS_AVAILABLE:
    //       console.log('BackgroundFetch is enabled')
    //       break
    //   }
    // })
    // initBackgroundFetch()
    // BackgroundFetch.scheduleTask({
    //   taskId: "com.transistorsoft.customtask",
    //   forceAlarmManager: true,
    //   periodic: false,
    //   delay: 3000 ,
    //   requiredNetworkType: BackgroundFetch.NETWORK_TYPE_ANY  // <-- milliseconds
    // }).then(()=>{console.log("1231")}).catch(err => console.log("err", err))
  }
  const removeImages = async (nameList) => {
    // console.log("removeImages")
    await removeImageFormAlbumAsynStorage(title, id, nameList);
    albumDispatch({type: "REMOVE_IMAGES", payload:{ projectID:id, images: nameList }});
  }
  const onUploadPress = () => {
    // console.log(backgroundFetchStatus == 2 && isOnProgress.current == false)
    if (loginType != "Google") { 
      AlertError("無法同步", "請使用Google登入");
      return 
    }
    else if (currentAlbum.status == "synchronizing") { 
      Alert.alert(
        "取消同步",
        "己同步的圖片不會還原",
        [
          {
            text: "取消",
            style: "cancel"
          },
          {
            text: "確定", onPress: async () => {
              forceStop.current = true;
              isOnProgress.current = false;
              albumDispatch({ type: "SET_ABLUM_STATUS", payload: { projectID: id, status: currentAlbum.edges.length > 0 ? "unsynced" : "synced" } });

            }
          }
        ]
      );
    }
    else if (currentAlbum.status !== "synchronizing" && currentAlbum.edges.length > 0 && isOnProgress.current == false) {
      forceStop.current = false;
      // console.log(forceStop.current)
      albumDispatch({ type: "SET_ABLUM_STATUS", payload: { projectID: id, status: "synchronizing" } })
      scheduleTask();
    }
  }
  const onAllUploadFinish = () => {
    toast.show("同步完成", {
      type: "success",
      placement: "bottom",
      duration: 2500,
      offset: 30,
      animationType: "slide-in",
      textStyle: { fontSize: scaledFontSize(20) }
    });
    uploadStateContextDispatch({
      type: "SET_HEADER_CONTENT",
      payload: ""
    });
    uploadStateContextDispatch({
      type: "SET_IS_UPLOADING",
      payload: false
    });
    uploadStateContextDispatch({
      type: "ALL_UPLOADED"
    });
  }

  useEffect(() => {
    // initBackgroundFetch(); 
    (async () => { 
      getAlbum(title, id).then(album => {
        albumDispatch({ type: "UPDATE_ALBUM", payload: { projectID: id, album: { ...album, shareToken: shareToken } } })
      }).catch(err => console.log(err));
    })()
    const unsubscribe = navigation.addListener('focus', () => {
      (async () => {
        getAlbum(title, id).then(a => {
            albumDispatch({ type: "UPDATE_ALBUM", payload: { projectID: id, album: { ...a, shareToken: shareToken } } })
          }).catch(err => console.log(err));
      })()
    });
    return unsubscribe;
  }, [])

  useEffect(() => { 
    if (!uploadStateContext.inited && isLastItem) {
      setTimeout(function () {
        navigation.jumpTo("GanttChartAgendaScreen");
      }, 0)
    }
    if (currentAlbum.edges.length > 0 && netInfo?.type == "wifi" && forceStop.current == false && isOnProgress.current == false && loginType == "Google" && album[id].status != "synchronizing" && isFocused) {
      albumDispatch({ type: "SET_ABLUM_STATUS", payload: { projectID: id, status: "synchronizing" } });
      // initBackgroundFetch();
      scheduleTask();
    }
  }, [album, netInfo])

  useEffect(() => {
    if (uploadStateContext.uploadingList.length == 0 && uploadStateContext.lastUploadedID == id) {
      onAllUploadFinish();
    }
  }, [uploadStateContext])

  return (
    <>
      <TouchableOpacity onPress={() => {
        if (currentAlbum.status == "synchronizing") return;
        navigation.navigate('ImageGallery', {
          id: id,
          title: title,
          album: album,
          albumDispatch: albumDispatch,
        })
      }}>
        <View style={styles.itemContainer} >
          <>
            <View style={[styles.column1, { backgroundColor: backgroundColor }]}><Text numberOfLines={1} style={{ fontWeight: "bold" }} color={color}>{title}</Text></View>
            <View style={[styles.column2, { backgroundColor: backgroundColor }]}><Text color={color}>{currentAlbum.edges.length}</Text></View>
            <TouchableOpacity style={[styles.column3, { backgroundColor: backgroundColor }]} onPress={onUploadPress}>
              {currentAlbum.status == "synchronizing" ? <Loading style={{backgroundColor:null}}/> :
                <View style={[styles.snycButton, { backgroundColor: syncStatus[currentAlbum.status].backgroundColor }]}>
                  <Text style={{ fontWeight: "bold" }} color={theme.colors.accent}>{syncStatus[currentAlbum.status].name ?? null}</Text>
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

export const ProjectGalleryList = (props) => {
  // console.log("ProjectGalleryList")
  const value = useFilter(ProjectFilterContext);
  const InitLoading = () => {
    const [uploadStateContext, uploadStateContextDispatch] = useContext(UploadStateContext);
    if (uploadStateContext.inited) return <></>
    else return <Loading style={{ backgroundColor: "white" } }/>
  }
  return (
    <>
      <InitLoading />
      <ProjectFilterContext.Provider value={value}>
        <ProjectsUseQuery >
          <ProjectGalleryListContainer />
        </ProjectsUseQuery>
      </ProjectFilterContext.Provider>
    </>
  )
}

export const ProjectGalleryListContainer = ({data, refetch}) => {
  // console.log("ProjectGalleryListContainer", data);
  // const [uploadStateContext, uploadStateContextDispatch] = useContext(UploadStateContext);
  const [projectFilterContext] = useContext(ProjectFilterContext);
  const [userContext] = useContext(UserContext);
  const [{ theme }] = useContext(ThemeContext);
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);
  const [sortBy, setSortBy] = useState("dueDate");//tasksFilterContext.sortBy
  const [orderBy, setOrderBy] = useState("ASC");//tasksFilterContext.orderBy
  const filter = (data) => {
    // console.log(data);
    let { keyword, status } = projectFilterContext;
    return data.filter(e => {
      return (keyword ? e.node.code.includes(keyword) : true)
    }).sort((x, y) => { 
      let nameA = x.node.code.toUpperCase(), nameB = y.node.code.toUpperCase();
      if (nameA < nameB) return -1;
      if (nameA > nameB) return 1;
      return 0;
    }).sort(async(x, y) => { 
      let lengthX = await getAlbum(x.node.code, x.node.id).then(album => album.edges.length).catch(err => console.log(err));
      let lengthY = await getAlbum(y.node.code, y.node.id).then(album => album.edges.length).catch(err => console.log(err));
      // console.log(lengthX, lengthY)
      // return Math.random(1* 100) - Math.random(1* 100) 
      return  lengthY - lengthX;
    })
  }
  const projects = useMemo(() => data.projects.edges, [data.projects.edges]);
  
  useEffect(() => { 
      fileList();
      // getAlbums();
  }, [])

  if(projects.length > 0)
  return (
    <>
        <Header />
        <Divider />
        <View style={[styles.imageGalleryContainerStyle, { backgroundColor: theme.colors.accent }]}>
          <Columns backgroundColor={theme.colors.accent} />
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
            data={filter(data.projects.edges)}
            contentContainerStyle={{ flexGrow: 1, alignItems: "center" }}
            ListEmptyComponent={<View style={{flex:1}}><CenterView><Text>沒有資料</Text></CenterView></View>}
            renderItem={({ item, index }) => {
              return (
                <Item
                  key={item.node.id}
                  isLastItem={index + 1 == projects.length}
                  // UploadStateContextContext={[uploadStateContext, uploadStateContextDispatch]}
                  color={theme.colors.titleText}
                  backgroundColor={theme.colors.secondary}
                  title={item.node.code}
                  id={item.node.id}
                  shareToken={item.node.albumShareToken}
                />
              )
            }}
            keyExtractor={(item, index) => item.node.id}>
          </FlatList>
        </View>

    </>
    )
  return <></>
}

const styles = StyleSheet.create(scalesStyle({
  imageGalleryContainerStyle: {
    flex: 1,
    zIndex: 100,
    backgroundColor:"white",
    paddingTop:5
  },
  itemContainer: {
    width:"100%",
    padding: 0,
    margin: 0,
    flexDirection: "row",
    justifyContent: "center",
    alignContent: "center",
    alignItems: "center",
    marginBottom: 5,
    height: 40,
    paddingHorizontal:12,
  },
  columnContainer: {
    width:"100%",
    paddingHorizontal: 10,
    flexDirection: "row",
    justifyContent: "center",
    alignContent: "center",
    alignItems: "center",
    height: 20
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
  sortIcon:{
    position:"absolute",
    justifyContent: 'center',
    alignItems: 'center',
    right: 3,
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
}))