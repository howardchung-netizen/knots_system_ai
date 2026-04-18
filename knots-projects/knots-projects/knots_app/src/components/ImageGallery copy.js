import * as React from 'react';
import { DeviceEventEmitter } from "react-native";
import { useState, useContext, useEffect, useCallback, useRef, useReducer, useLayoutEffect, useMemo } from 'react'; 
import { ThemeContext } from './appContext/ThemeContext';
import { UserContext } from '../components/appContext/UserContext';
import { ProjectsAlbumContext } from './appContext/ProjectsAlbumContext';
import { PermissionsAndroid, AppState, TouchableOpacity, StyleSheet, View, Image, Dimensions, Alert, RefreshControl, FlatList, ActivityIndicator, Platform, ScrollView } from 'react-native';
// import Header from './header/Header';
import Content from './header/Content';
import { MenuButton } from './MenuButton';
import Button from './button/Button';
import { LabelShadow } from './Shadow';
import FontAwesome5Icon from 'react-native-vector-icons/FontAwesome5';
import CameraRoll from "@react-native-community/cameraroll";
import Loading from './Loading'
import { LoadingWithContent } from './LoadingWithContent';
import CenterView from './CenterView';
import { CheckBox } from './CheckBox';
import ImageView from "react-native-image-viewing";
import { NoPermissionsAlert } from './NoPermissions';
import { Provider, Appbar } from 'react-native-paper';
import { Text } from './Text';
import { FABGroup } from './FAB';
import { NoPermissions } from './NoPermissions';
import moment from 'moment';
import { getAlbum, setAlbum, deleteAlbum, addImageToAlbumAsynStorage, removeImageFormAlbumAsynStorage, node } from '../helpers/asyncStorage/albumAsynStorage'; 
import { useNavigation } from '@react-navigation/native';
import { useLaunchCamera } from '../helpers/hooks/useLaunchCamera';
import { Modal } from './modal/Modal';
import TextInput from './TextInput';
import promiseAll from '../helpers/promiseAll'
import * as RNFS from 'react-native-fs';
import proj4 from '../helpers/proj4/proj4';
import { CaptureMultiView, useMultiCapture } from './CaptureComponent';
import { createAlbum, joinAlbum, shareAlbum, listShareAlbum, uploads, batchCreate } from '../helpers/googleAlbumApi';
import { AlertError } from './AlertError';
import { albumReducer } from './ProjectGalleryList';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import Geolocation from 'react-native-geolocation-service';
import ViewShot, { captureRef } from "react-native-view-shot";
import { gql, useApolloClient } from '@apollo/client';
import { projectUpdateMutation } from '../helpers/GQL/mutation';

proj4.defs("EPSG:2326","+proj=tmerc +lat_0=22.31213333333334 +lon_0=114.1785555555556 +k=1 +x_0=836694.05 +y_0=819069.8 +ellps=intl +towgs84=-162.619,-276.959,-161.764,0.067753,-2.24365,-1.15883,-1.09425 +units=m +no_defs");
proj4.defs("EPSG:4326", "+proj=longlat +datum=WGS84 +no_defs");
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

export const ImageGalleryHeader = React.forwardRef(({title, subTitle, items }, ref) => {
  const [_title, setTitle] = useState(title);
  const [_subTitle, setSubTitle] = useState(subTitle);
  const [_items, setItems] = useState(items);
  const [{ theme }] = useContext(ThemeContext);
  const buttonColor = theme.colors.accent;

  const itemsList = useMemo(() =>
    _items ? _items.map(e => {
      let _item = JSON.parse(JSON.stringify(e));
      _item.onPress = () => {
        if (e.onPress) e.onPress();
      }
      return _item
    }) : []
    , [_items])
  
  useEffect(() => {
    if (ref) ref({
      setTitle: setTitle,
      setSubTitle: setSubTitle,
      setItems: setItems
    });
  },[])
  return (
    <Header
      style={{ alignContent: "space-between", width: "100%", justifyContent: "space-between" }} goBackBtn>
      <Content title={_title } subtitle={_subTitle} />
      <MenuButton button={<FontAwesome5Icon style={{ marginHorizontal: 12, marginVertical: 10 }} size={20} color={buttonColor} name="ellipsis-v" />} items={itemsList}/>
    </Header>
  )
})  

export const ImageList = ({ list, renderItem, loadMore, hasNext }) => {
  console.log("ImageList")
  const onTouchStartY = useRef(null);
  const refreshing = useRef(false);
  const [loading, setLoading] = useState(false);
  const [scrollEnabled, setScrollEnabled] = useState(true);
  const  flatListRef= useRef(null);
  const isCloseToBottom = ({layoutMeasurement, contentOffset, contentSize}) => {
    const paddingToBottom = 0;
    return layoutMeasurement?.height??0 + contentOffset?.y??0 >=
      contentSize.height - paddingToBottom;
  };
  const _loadMore = () => {
    if (hasNext && loadMore && refreshing.current === false) {
      refreshing.current = true;
      // setLoading(true);
      loadMore()
      refreshing.current = false;
      setLoading(false);
      //   .then(() => {
      //   refreshing.current = false;
      //   setLoading(false);
      // });
    }
  }
  const _renderItem = useCallback((p, index) => { return (renderItem(p, index)) }, []);
  const _keyExtractor = useCallback((p, index) => index.toString());
  const _getItemLayout = useCallback((data, index) => ({ length: styles.ImageContainerStyle.height, offset: styles.ImageContainerStyle.height * index, index }), []);
  return (
    <>
      {loading?<Loading/>:null}
      <FlatList
        ref={flatListRef}
        onContentSizeChange={() => flatListRef.current.scrollToEnd() }
        onLayout={() => flatListRef.current.scrollToEnd() }
        removeClippedSubviews={false}
        extraData={true}
        ListEmptyComponent={() => <ActivityIndicator color={"blue"}/>}
        windowSize={50}
        getItemLayout={_getItemLayout}
        contentContainerStyle={{ alignSelf: 'flex-start' }}
        numColumns={3}
        // onEndReached={_loadMore}
        // onScrollBeginDrag={({ nativeEvent }) => { if (isCloseToBottom(nativeEvent)) _loadMore(); }}
        // onScroll={({ nativeEvent }) => { if (isCloseToBottom(nativeEvent)) _loadMore(); }}
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

const Greeting = React.memo(props => {
  const [a, setA] = useState(Math.random() * 100)
  console.log("Greeting Comp render", props, a);
  return <></>;
});

export const ImageItem =  React.memo(React.forwardRef(({item, uri, name, size, timestamp, onPressImage, onCheckBoxPress, onCapture }, ref) => {
  // console.log("ImageItem");
  const [{ theme }] = useContext(ThemeContext);
  const [selected, setSelected] = useState(false);
  const loadingWithContentRef = useRef();
  const [inited, setInited] = useState(item.isNewFile ? false : true);
  const uuid = inited?"":"?"+uuidv1();
  // const _checkboxRef = createRef(setSelected);
  // checkboxRef.current = setSelected;
  // const color = {color: theme.colors[selected ? "primary" : "disabled"] }
  // console.log("item", item)
  // if (ref) ref({
  //   setSelected: (checked) => { setSelected(checked) }
  // });
  const CaptureViewShot = () => {
    // console.log("CaptureViewShot", !inited && item.isNewFile)
    const ratio = 0.5;
    const viewShotRef = React.createRef();
    const onLoad = () => {
      loadingWithContentRef.current.setStatus("loading");
      loadingWithContentRef.current.setVisible(true);
      setTimeout(async () => {
        // console.log("onLoad");
        captureRef(viewShotRef, {
          format: "jpg",
          quality: 1,
          height: item.image.height * ratio ?? 1,
          width: item.image.width * ratio ?? 1
        }).then(
          async cache => {
            // console.log("cache", cache);
            await RNFS.unlink(uri);
            await RNFS.copyFile(cache, uri);
            loadingWithContentRef.current.setVisible(false);
            onCapture()
            setInited(true);
            console.log("capture finished");
          },
          error => console.error("Oops, snapshot failed", error)
        )
      }, 1000)

    }
    useEffect(() => { 
      if (item.isNewFile) onLoad();
    }, [])
    if(item.isNewFile)
    return (
      <ScrollView style={{ position: "absolute", top: 0, height: 1, width: 1, zIndex: -1 }}>
        <ScrollView horizontal={true}>
          <ViewShot ref={(ele) => { if (ele) viewShotRef.current = ele }} >
            <Image
              source={{ uri: uri + uuid }}
              style={{ height: (item.image.height * ratio), width: (item.image.width * ratio) }} />
            <ImageViewFooterComponent
              windowHeight={(item.image.height * ratio)}
              windowWidth={(item.image.width * ratio)}
              imageWrap={{ ...styles.imageViewFooterWrap, ...{ height: "100%", width: "100%" } }}
              item={item}
              imageIndex={item.index} />
          </ViewShot>
        </ScrollView>
      </ScrollView>
      )
    return <></>
  }
  useEffect(() => {
    // if(item.location.latitude && item.location.longitude && !item.address)
   },[])
  useEffect(() => {
    if (ref) ref({
      setSelected: (checked) => { console.log("setSelected"); setSelected(checked); }
    });
    // setSelected(false);
  }, [item])
  return (
    <>
      {/* {<Greeting/>} */}
      <CaptureViewShot/> 
      <View style={[styles.ImageContainerStyle]}>
        <View style={[styles.ImageInnerStyle, { borderColor: theme.colors.secondary }, selected ? styles.selected : null]}>
          <TouchableOpacity onPress={onPressImage}>
            <LoadingWithContent ref={(ref)=>loadingWithContentRef.current = ref}/>
            <Image
              style={styles.imageStyle}
              source={{ uri: uri + uuid }}
            />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.imageInfoContainerStyle]} onPress={() => {
            // console.log("CheckBoxlclick");
            if (onCheckBoxPress) onCheckBoxPress(item, !selected);
            setSelected(!selected);
          }}>
            <CheckBox
              onPress={() => {
                // console.log("CheckBoxlclick");
                if (onCheckBoxPress) onCheckBoxPress(item, !selected);
                setSelected(!selected);
              }}
              status={selected}
            />
            <View style={{ flex: 1 }}>
              <Text numberOfLines={1} style={[styles.imageNameStyle]} color={theme.colors.titleText} >{name}</Text>
              <Text numberOfLines={1} style={[styles.imageDateStyle]} color={theme.colors.text}>{timestamp} {size}</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </>
  )
}));

const saveToAlbum = async (assets, location, cb) => {
  let album = "KNOTS";
  let saveList = [];
  console.log("saveToAlbum", assets)
  await promiseAll(assets.map(i =>
    new Promise(async (r, s) => {
      try {
      let now = Date.now();
      let timestamp = moment(now).format("X");
      let today = moment(now).format("YYYY-MM-DD");
      let uuid = uuidv1();
      let fileName = `KNOTS_${timestamp}_${uuid}_${today}.jpg`;
      let newPath = `${RNFS.CachesDirectoryPath}/${fileName}`;
      // console.log("newPath", newPath);
      await RNFS.copyFile(i.uri ?? i.path, newPath).catch(err => console.log(err));
      // RNFS.unlink(i.uri ?? i.path);
      await CameraRoll.save(newPath, { album: album, type: "photo" }).catch(err => console.log(err));
        let node = {
        isNewFile: true,
        location: {
          longitude: i.exif?.Longitude ?? location?.longitude ?? null,
          latitude: i.exif?.Latitude ?? location?.latitude ?? null
        },
        address: null,
        modified: parseInt(i.modificationDate) / 1000,
        timestamp: timestamp,
        image: {
          fileSize: i.size,
          filename: fileName,
          height: i.height,
          playableDuration: null,
          uri: `file:///storage/emulated/0/Pictures/${album}/${fileName}`,
          width: i.width,
        }
      }
      // let { edges } = await CameraRoll.getPhotos({
      //   first: 10,
      //   groupTypes: "album",
      //   groupName: album,
      //   assetType: "Photos",
      //   include: ['filename', 'fileSize', 'imageSize', 'location'],
      //   toFrom: parseInt(moment(i.timestamp??i.exif.dateTime).format("x"))
      // })
      // console.log("edges1", edges[0].node);
      // edges = [edges.find(e => e.node.image.filename == fileName)]
      // console.log("edges2", edges);
      if (node.location?.longitude && node.location?.latitude) {
        node.address = await getAddressformLocation(node.location.longitude, node.location.latitude);
      }
      // console.log("node", node);
        r({ node })
      } catch (error) {
        s()
      }
      // saveList.push(edges[0]);
    })), (res) => {
      console.log("saveList", res)
      saveList = res;
  })
  if (cb) await cb(saveList);
  return saveList;
}

const getAddressformLocation = async (longitude, latitude) => {
  console.log("getAddressformLocation", longitude, latitude)
  const [easting, northing] = proj4('EPSG:4326', 'EPSG:2326', [longitude, latitude]);
  return await fetch(
    `https://www.map.gov.hk/gih-ws2/identify/${easting}/${northing}/1/WEB`
    // `https://geodata.gov.hk/gs/api/v1.0.0/identify?x=${easting}&y=${northing}`
    // `https://geodata.gov.hk/gs/api/v1.0.0/searchNearby?x=${easting}&y=${northing}&lang=zh`
  ).then(async (response) => {
    // console.log("response", response);
    let r = await response.json();
    // console.log("r", r);
    return `${r[0].addressInfo[0].caddress??''}${r[0].addressInfo[0].cname??''}`;
  }).catch(() => null)
    // .then((responseJson) => {
    //   console.log("responseJson", responseJson);
    //   return responseJson[0].addressInfo[0].caddress + responseJson[0].addressInfo[0].cname;
    // })
    // .catch((error) => {
    //   return ''
    // });
}

function init(album) {
  return album;
}

export const ImageGallery = (props) => {
  console.log("ImageGallery")
  const projectID = props.route.params.id;
  const albumTitle = props.route.params.title;
  const setSyncStatus = props.route.params.setSyncStatus;
  const shareToken = props.route.params.shareToken;
  // const [_album, albumDispatch] = useReducer(albumReducer, props.route.params.album, init);
    // const album = _album //useMemo(() => { return _album }, []);
  const [albumSource, albumDispatch] = useContext(ProjectsAlbumContext);
  const album = useMemo(() => {
    return albumSource[projectID]
  },[albumSource]);
  const edges = useMemo(() => { return album.edges }, [album]);
  const takenPictures = useRef([]);
  const { launchCamera, launchImageLibrary, cleanTempFiles } = useLaunchCamera();
  const [userContext] = useContext(UserContext);
  const [{ theme }] = useContext(ThemeContext);
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [addressInputVisible, setAddressInputVisible] = useState(false);
  const [address, setAddress] = useState(null);
  const [allSelected, setAllSelected] = useState(false); 
  const selectedImg = useRef([]);
  const imagesUri = album ? album?.edges.map(e => { return { uri: e.node.image.uri } }) : [];
  const [imageViewVisible, setImageViewVisible] = useState(false);
  const viewingIndex = useRef(0);
  const loadingWithContentRef = useRef();
  const ImageGalleryHeaderRef = useRef();
  const captureMultiViewRef = useRef();
  const checkboxRef = useRef([]);
  const client = useApolloClient();
  const getCheckboxRef = useCallback(ref => {
    let temp = [...checkboxRef.current];
    temp.push(ref);
    checkboxRef.current = temp;
    // console.log(temp)
  }, [])
  // console.log(props.route.params)
  const _albumDispatch = (type, payload) => { 
    // props.route.params.albumDispatch({ type, payload });
    albumDispatch({ type, payload })
  }
  const _setAddress = () => { 
    setAddress(selectedImg.current.length == 1 ? selectedImg.current[0].address : null);
  }
  const _getGallery = async () => {
    setLoading(false);
    return album;
  }
  
  const selectImg = (node, index) => { 
    // console.log("selectImg")
    node.index = index;
    let temp = selectedImg.current.map(e => e);
    temp.push(node);
    selectedImg.current = temp;
    // console.log(selectedImg.current);
    ImageGalleryHeaderRef.current.setSubTitle(`已選擇${selectedImg.current.length}個檔案`);
    _setAddress();
  }
  const unselectImg = (node, index) => {
    // console.log("unselectImg")
    let temp = selectedImg.current.map(e => e);
    selectedImg.current = temp.filter(e => e.index != index);
    ImageGalleryHeaderRef.current.setSubTitle(selectedImg.current.length ? `已選擇${selectedImg.current.length}個檔案` : null);
    _setAddress();
  }
  const loadMore = useCallback(() => _getGallery, []);
  const _setAllSelected = () => { 
    // console.log("_setAllSelected", checkboxRef.current);
    checkboxRef.current.map(e => console.log(e));
    if (selectedImg.current.length < album.edges.length || selectedImg.current.length == 0) {
      selectedImg.current = album.edges.map((e, i) => { e.node.index = i; return e.node });
      checkboxRef.current.map(e => e.setSelected(true));
      setAllSelected(true);
    }
    else {
      selectedImg.current = [];
      checkboxRef.current.map(e => e.setSelected(false));
      setAllSelected(false);
    }
    ImageGalleryHeaderRef.current.setSubTitle(selectedImg.current.length ? `已選擇${selectedImg.current.length}個檔案` : null);
    _setAddress();
  }
  const openCamera = (reOpen) => {
    setLoadingWithContentRef(null, null, "loading", true);
    let location = {};
    try {
      Geolocation.getCurrentPosition(
        (position) => {
          // console.log("position", position);
          location.latitude = position.coords.latitude;
          location.longitude = position.coords.longitude;
        },
        (error) => {
          // See error code charts below.
          console.log("Geolocation error", error.code, error.message);
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 10000 }
      );
    } catch (error) {
    }
    // setLoadingWithContentRef(null, null, "loading", true);
    launchCamera(null, async (res) => {
      console.log("launchCamera", res)
      try {
        if (res) {
          if (reOpen) openCamera(true);
          addTakenPictureUri(res);
        } else if (takenPictures.current) {

          await saveToAlbum(takenPictures.current, location, async (saveList) => {
            // console.log("saveList", saveList);
            addImageToAlbumAsynStorage(albumTitle, projectID, saveList);
            _albumDispatch("ADD_IMAGES", {projectID: projectID, images:saveList});
            // setSyncStatus("unsynced");

            // await captureMultiView(saveList.map(e => e.node), async (edges) => { 
            //    // console.log("edges", edges)
            //     addImageToAlbumAsynStorage(albumTitle, projectID, edges);
            //    _albumDispatch("ADD_IMAGES", {projectID: projectID, images:edges});
            //    setSyncStatus("unsynced");
            // });

            // cleanTempFiles(takenPictures.current);
            takenPictures.current = [];
            setLoadingWithContentRef(null, null, null, false);
          })
        }
        else setLoadingWithContentRef(null, null, null, false);
      } catch (error) {
        cleanTempFiles(takenPictures.current);
        takenPictures.current = [];
        AlertError("糸統出錯，請重新再試一次...", '');
        setLoadingWithContentRef(null, null, null, false);
      }
    }).catch(error=>NoPermissionsAlert("權限不足", error.message));
  } 
  const openImagesLibrary = () => { 
    launchImageLibrary({ multiple: true, includeExif: true }, async (res) => {
      setLoadingWithContentRef(null, null, "loading", true)
      await saveToAlbum(res, null, async (saveList) => {
        addImageToAlbumAsynStorage(albumTitle, projectID, saveList);
        _albumDispatch("ADD_IMAGES", {projectID: projectID, images:saveList});
        headerInit();
        selectedImg.current = [];
        setLoadingWithContentRef(null, null, null, false); 
        // await captureMultiView(saveList.map(e => e.node), async (edges) => { 
        //    // console.log("edges", edges)
        //     addImageToAlbumAsynStorage(albumTitle, projectID, edges);
        //    _albumDispatch("ADD_IMAGES", {projectID: projectID, images:edges});
        //    setSyncStatus("unsynced");
        // });
        setLoadingWithContentRef(null, null, null, false); 
      })
    }).catch(error=>NoPermissionsAlert("權限不足", error.message));
  }
  const captureMultiView = async (list, cb) => {
    let tempList = list;
    const chunkSize = 9;
    for (let index = 0; index < tempList.length; index += chunkSize) {
      let chunkList = tempList.slice(index, index + chunkSize);
      console.log("captureMultiViewRef")
      await new Promise(async (s, r) => { 
        await captureMultiViewRef.current.startToCapture(chunkList, async (res) => {
          let path = `file:///storage/emulated/0/Pictures/KNOTS/`;
          await promiseAll(res.map(e => RNFS.unlink(e.image.uri)
            .then(async () => {
              await RNFS.copyFile(e.cache, e.image.uri)
              // e.image.uri = path + e.image.filename;
              return { node: e };
            }).catch(err => console.log(err))), async (edges) => {
             if(cb) await cb(edges)
            }
          )
          s();
        })
      })
    }
  }
  
  const onUpload = async (files) => {
    if (selectedImg.current.length == 0) return;
    ImageGalleryHeaderRef.current.setSubTitle(`同步中...`);
    setLoadingWithContentRef('同步中', `0/${selectedImg.current.length}`, "loading", true); 
    const updateProjectShareToken = async (projectID, shareToken) => { 
      await client.mutate({
        mutation: gql`${projectUpdateMutation}`,
        variables: {
          data: {
            id: projectID,
            albumShareToken: shareToken
          }
        },
      }).then(res => {
        _albumDispatch("UPDATE_SHARETOKEN", res.data.projectUpdate.project.albumShareToken);
      }).catch(err => { throw err })
    }
    setSyncStatus("synchronizing");
    ImageGalleryHeaderRef.current.setSubTitle(`同步中 0/${selectedImg.current.length}`);
    setLoadingWithContentRef('同步中', `0/${selectedImg.current.length}`, "loading", true);
    
    // let tempEdges = [...album.edges];
    let uploadedCount = 0;
    let totalCount = files.length;
    let { accessToken } = await GoogleSignin.getTokens();
    let _album;
    
    const createAndShareAlbum = async () => {
      let album = await createAlbum(accessToken, albumTitle+"_"+projectID);
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
      _album = (await listShareAlbum(accessToken)).sharedAlbums.find(e => e.title == albumTitle+"_"+projectID);
      console.log("shareToken", shareToken)
      if (!_album) {
        if (shareToken) {
          _album = await joinAlbum(accessToken, shareToken);
          if (_album.error) _album = await createAndShareAlbum().catch(err => { throw err });
        }
        else {
          _album = createAndShareAlbum.catch(err => { throw err });
        }
      } 
    } catch (error) {
      initSelecttionAndLoadingMessage();
      AlertError("上載失敗，請重新再試一次...", error.message);
      return;
    }

    try {
      let _batchCreate = async (uploadTokenArr, albumID) => {
        // console.log(uploadTokenArr);
        const chunkSize = 50;
        for (let i = 0; i < uploadTokenArr.length; i += chunkSize) {
          let chunkUploadTokenArr = uploadTokenArr.slice(i, i + chunkSize);
          let { newMediaItemResults, error } = await batchCreate(accessToken, albumID, chunkUploadTokenArr);
          if (error) {
            setLoadingWithContentRef(null, null, null, false);
            AlertError("上載失敗，請重新再試一次...", error.message);
            throw `${error.message}`
          }
          // console.log("newMediaItemResults", newMediaItemResults)
          newMediaItemResults = newMediaItemResults.map(e => {
            e.fileName = uploadTokenArr.find(x => x.uploadToken == e.uploadToken).fileName;
            return e;
          });
          let uploadList = newMediaItemResults.filter(e => !e.mediaItem).map(e => {
            e.fileName = uploadTokenArr.find(x => x.uploadToken == e.uploadToken).fileName;
            return e
          });
          let removeList = newMediaItemResults.filter(e => e.mediaItem).map(e => e.mediaItem.filename);
          await removeImages(removeList);
          _albumDispatch("REMOVE_IMAGES", {projectID:projectID, images: removeList});
          // console.log("uploadList", uploadList)
          // console.log("removeList", removeList)
          // await removeImages(removeList);
          // tempEdges = tempEdges.filter(e => {
          //   return !removeList.includes(e.node.image.filename);
          // })
          // let tempAlbum = { ...album, ...{ edges: tempEdges } };
          // console.log("tempEdges", tempEdges);
          // console.log("tempAlbum", tempAlbum);
          // _albumDispatch("UPDATE_ABLUM", { title: albumTitle, album: tempAlbum });
          ImageGalleryHeaderRef.current.setSubTitle(`同步中 ${uploadedCount += removeList.length}/${totalCount}`);
          setLoadingWithContentRef("同步中", `${uploadedCount += removeList.length}/${totalCount}`, "loading", true);
          console.log("batchCreate", newMediaItemResults);
          // console.log("uploadList", uploadList);
          if (uploadedCount < totalCount) {
          promiseAll([
              _batchCreate(uploadList, albumID),
            ], () => { })
          }
          else {
            let removeList = files.map(e => e.image.filename);
            await removeImages(removeList);
            _albumDispatch("REMOVE_IMAGES", {projectID:projectID, images: removeList});
            ImageGalleryHeaderRef.current.setSubTitle(`已完成 ${files.length}/${files.length}`);
            setLoadingWithContentRef("已完成", `${files.length}/${files.length}`, "finish", true);
            setTimeout(() => {
              initSelecttionAndLoadingMessage();
              loadingWithContentRef.current.onClosePress();
              setSyncStatus("synced");
            }, 1000)
          }
        }
      }
      await promiseAll(files.map(async e => uploads(accessToken, e.image.filename, e.cache??e.image.uri)), async (uploadTokenArr, err) => {
        // console.log("uploadTokenArr", uploadTokenArr, err);
        console.log("_album.id", _album.id)
        if (err) throw `${err}`
        else await _batchCreate(uploadTokenArr, _album.id)
      })                                           
    } catch (error) {
      console.log("error", error)
      initSelecttionAndLoadingMessage();
      AlertError("上載失敗，請重新再試一次...", error);
    }
  }
  const onAddressChange = (name, text) => {
    setAddress(text)
  }
  const addTakenPictureUri = (uri) => { 
    let temp = [...takenPictures.current];
    temp.push(uri);
    takenPictures.current = temp;
    return takenPictures.current
  }
  const removeImages = async (nameList) => { 
    await removeImageFormAlbumAsynStorage(albumTitle, projectID, nameList);
    // _albumDispatch("REMOVE_IMAGES", {projectID:projectID, images: nameList});
  }
  const setLoadingWithContentRef = (title, content, status, visible) => { 
    loadingWithContentRef.current.setVisible(visible);
    loadingWithContentRef.current.setTitle(title);
    loadingWithContentRef.current.setContent(content);
    loadingWithContentRef.current.setStatus(status);
  }
  const headerInit = () => {
    let items = [{
      title: "未同步", onPress: async () => {
      }
    },
    ] 
    ImageGalleryHeaderRef.current.setTitle(albumTitle);
    ImageGalleryHeaderRef.current.setSubTitle(null);
    ImageGalleryHeaderRef.current.setItems(items);
  }
  const initSelecttionAndLoadingMessage = () => {
    headerInit();
    checkboxRef.current.map(e => e.setSelected(false));
    selectedImg.current = [];
    setLoadingWithContentRef(null, null, null, false);
    setSyncStatus(album.edges.length == 0 ? "synced" : "unsynced");
  }
  useEffect(() => {
    headerInit();
    fileList();
    // const subscription = AppState.addEventListener("change", async (nextAppState) => {
    //  if (nextAppState === "active" && permissions.WRITE_EXTERNAL_STORAGE.permissionState) albumDispatch({type:"INITIAL", payload: props.route.params.album});
    // });
    return () => {
      (async () => {
        // console.log("await getAlbum(albumTitle, projectID)", { title: albumTitle, album: await getAlbum(albumTitle, projectID, 9999999) })
        // props.route.params.albumDispatch({ type:"UPDATE_ABLUM", payload: { title: albumTitle, album: await getAlbum(albumTitle, projectID, 9999999) }});
        // _albumDispatch("UPDATE_ABLUM", { title: albumTitle, album: await getAlbum(albumTitle, projectID, 9999999) })
      })()
    //  subscription.remove();
    };
  }, []);
  
  const a = useMemo(() => 1 ,[])
  const ItemUseCallback = useCallback(({ item, index }) => {
    return <>
      {/* <Greeting/> */}
      <ImageItem
        ref={ref => { if (ref) getCheckboxRef(ref); }}
        projectID={projectID}
        selectedImg={selectedImg.current}
        checked={selectedImg.current.find(e => { return e.index == index }) ? true : false}
        onPressImage={() => {
          viewingIndex.current = index;
          setImageViewVisible(true)
        }}
        onCheckBoxPress={(node, selected) => {
          selected ? selectImg(node, index) : unselectImg(node, index);
        }}
        item={item.node}
        name={item.node.image.filename}
        size={item.node.image.imageSize}
        uri={item.node.image.uri}
        timestamp={moment(item.node.timestamp * 1000).format('YYYY/MM/DD')}
        onCapture={()=>albumDispatch({type:"INITIAL_IMAGE", payload:{projectID:projectID, filename:item.node.image.filename}} )}
      />
    </>
  }, [])
  const aaa = useCallback(() => function () { console.log("aaa")}, [])
  return (
    <>
      <ImageGalleryHeader
        ref={(ref) => { if (ref) ImageGalleryHeaderRef.current = ref }}
        title={albumTitle}
      />
      <Provider>
        <LoadingWithContent visible={loading} ref={(ref) => {
          if (ref) loadingWithContentRef.current = ref
        }} />
        <CaptureMultiView
          ref={(ref) => { if (ref) captureMultiViewRef.current = ref }}
          ratio={0.5}
          view={(e) => {
            let ratio = 0.5;
            return (<>
              <Image source={{ uri: e.image.uri }} style={{ height: (e.image.height * ratio), width: (e.image.width * ratio) }} />
              <ImageViewFooterComponent
                windowHeight={(e.image.height * ratio)}
                windowWidth={(e.image.width * ratio)}
                imageWrap={{ ...styles.imageViewFooterWrap, ...{ height: "100%", width: "100%" } }}
                item={e}
                imageIndex={e.index} />
            </>)
          }}
        />
        <View style={styles.imageGalleryContainerStyle}>
          {album.edges.length > 0 ?
            <>
              <Modal
                title="更改圖片地址"
                visible={addressInputVisible}
                transparent={true}
                onRequestClose={() => {
                  setAddressInputVisible(false);
                }}
                confirmButton
                onConfirmPress={async () => {
                  // let tempEdges = [{...album.edges, edges}];
                  // for (let i in selectedImg.current) {
                  //   let index = selectedImg.current[i].index;
                  //   tempEdges[index].node.address = address;
                  // }
                  // let tempAlbum = { ...album, ...{ edges: tempEdges } };
                  // await setAlbum(albumTitle, projectID, tempAlbum);
                  // _albumDispatch("UPDATE_ABLUM", { title: albumTitle, album: tempAlbum });

                  setAddressInputVisible(false);
                  setLoadingWithContentRef("正在更改圖片地止", "請不要關閉程式", "loading", true);
                  await captureMultiView(selectedImg.current.map(e => { e.address = address; return e }), async (edges) => {
                    console.log("edges", edges);
                    console.log("album", album);
                    let tempEdges = album.edges.map(e => {
                      let changeedNode = edges.find(x => x.node.image.filename == e.node.image.name);
                      console.log("changeedNode", changeedNode);
                      if (changeedNode) return changeedNode;
                      else return e;
                    })
                    let tempAlbum = { ...album, ...{ edges: tempEdges } };
                    // console.log("tempEdges", tempEdges)
                    // console.log("tempAlbum", tempAlbum)
                    await setAlbum(albumTitle, projectID, tempAlbum);
                    _albumDispatch("UPDATE_ABLUM", { title: albumTitle, album: tempAlbum });
                  })
                  selectedImg.current.map(e => checkboxRef.current[e.index].setSelected(false));
                  selectedImg.current = [];
                  setLoadingWithContentRef(null, null, null, false);
                }}
                closeButton
                onClosePress={() => {
                  if (props.onClosePress) props.onClosePress();
                  setAddressInputVisible(false);
                }}
                body={
                  <View style={{ paddingHorizontal: 10 }}>
                    <TextInput
                      style={{ backgroundColor: theme.colors.secondary }}
                      underlineColor="transparent"
                      textColor={theme.colors.primary}
                      name="address"
                      title="地址"
                      onChangeText={onAddressChange}
                      value={address}
                      width={"100%"}
                    />
                  </View>
                }
              />
              <GalleryImageView album={album.edges} uriList={imagesUri} imageIndex={viewingIndex.current} visible={imageViewVisible} onRequestClose={() => { setImageViewVisible(false) }} />
              {/* <FlatList
                    windowSize={50}
                    getItemLayout={(data, index) => ({ length: styles.ImageContainerStyle.height, offset: styles.ImageContainerStyle.height * index, index })}
                    contentContainerStyle={{ alignSelf: 'flex-start' }}
                    numColumns={3}
                    data={edges}
                    keyExtractor={(p, index)=> index.toString()}
                    renderItem={({ item, index }) => { 
                      return <>
                        <Greeting
                          key={index.toString()}
                          // item={item.node}
                          // name={item.node.image.filename}
                          // size={item.node.image.imageSize}
                          // uri={item.node.image.uri}
                        />
                        <ImageItem
                        ref={ref => { if (ref) getCheckboxRef(ref) }}
                        onPressImage={() => {
                          viewingIndex.current = index;
                          setImageViewVisible(true)
                        }}
                        onCheckBoxPress={(node, selected) => {
                          selected ? selectImg(node, index) : unselectImg(node, index);
                        }}
                        item={item.node}
                        name={item.node.image.filename}
                        size={item.node.image.imageSize}
                        uri={item.node.image.uri}
                        timestamp={moment(item.node.timestamp * 1000).format('YYYY/MM/DD')}
                      />
                      </>
                    }}>
                  </FlatList> */}
              <ImageList
                hasNext={album.page_info.has_next_page}
                loadMore={loadMore}
                list={albumSource[projectID].edges}
                renderItem={ItemUseCallback}
              />
            </>
            :
            <CenterView>
              <FontAwesome5Icon size={180} name="image" color={theme.colors.secondary} />
            </CenterView>
          }
        </View>
        <FABGroup actions={
          (() => {
            let actions = [
              {
                icon: 'file-upload',
                onPress: async () => {
                  onUpload(selectedImg.current)
                  // startToCapture();                    
                }
              },
              {
                icon: 'pen-plus',
                onPress: () => { setAddressInputVisible(true) }
              },
              {
                icon: 'checkbox-multiple-marked',
                onPress: _setAllSelected,
              },
              {
                icon: 'delete',
                onPress: () => {
                  Alert.alert(
                    "刪除圖片",
                    "刪除後無法復原",
                    [
                      {
                        text: "取消",
                        style: "cancel"
                      },
                      {
                        text: "確定", onPress: async () => {
                          let nameList = selectedImg.current.map(e => e.image.filename);
                          let unlinkList = selectedImg.current.map(e => e.image.uri);
                          // console.log("nameList", nameList)
                          await removeImages(nameList);
                          _albumDispatch("REMOVE_IMAGES", {projectID:projectID, images: nameList});
                          promiseAll(unlinkList.map(e => RNFS.unlink(e)), res => { }).catch(err => console.log(err));
                          setSyncStatus(selectedImg.current.length == album.edges.length ? "synced" : "unsynced");
                          checkboxRef.current.map(e => e.setSelected(false));
                          setAllSelected(false);
                          selectedImg.current = [];
                          headerInit();
                        }
                      }
                    ]
                  );
                },
              },
              {
                icon: 'image',
                onPress: () => {                 
                  openImagesLibrary();
                },
              },
              {
                icon: 'camera',
                onPress: () => {
                  openCamera(true);
                },
              },
            ]
            if (userContext.loginType != 'google') actions = actions.splice(1, 5);
            return actions
          })()
        } />
      </Provider>
    </>
  )
}

export const GalleryImageView = ({ album, uriList, imageIndex, visible, onRequestClose }) => {  
  // console.log(uriList)
  return (
    <ImageView
      images={uriList.map(e => { e.uri = e.uri + "?" + uuidv1();return e } )}
      imageIndex={imageIndex}
      visible={visible}
      onRequestClose={onRequestClose}
      // HeaderComponent={({ imageIndex }) => <ImageViewHeaderComponent imageIndex={imageIndex}/>}
      // FooterComponent={({ imageIndex }) => <ImageViewFooterComponent
      //   windowWidth={windowWidth}
      //   windowHeight={windowHeight}
      //   imageWrap={styles.imageViewFooterWrap}
      //   height={album[imageIndex].node.image.height}
      //   width={album[imageIndex].node.image.width}
      //   item={album[imageIndex].node}
      //   imageIndex={imageIndex} />}
   />
  )
}

export const ImageViewHeaderComponent = ({imageIndex}) => { 
  return (
    <View style={{width: "100%", zIndex: 1000 , backgroundColor:"blue"}}><Text size={15} color="white">{imageIndex + 1}</Text></View>
  )
}

export const ImageViewFooterComponent = ({ imageWrap, item, imageIndex, windowWidth, windowHeight }) => {
  // console.log("window", window, windowHeight)
  const [{theme}] = useContext(ThemeContext)
  const ratio = item.image.width / windowWidth;
  const size = { width: item.image.width / ratio, height: item.image.height / ratio};
  // const size = { width: "100%", height: "100%" };
  const backgroundColor = { backgroundColor: theme.colors.primary}
  const addressText = {};
  const dateText = { textAlign:"right"}
  const textColor = theme.colors.accent;
  const [address, setAddress] = useState(null);
  const takePictureTime = moment(item.timestamp * 1000).format("YYYY-MM-DD");
  useEffect(() => {
    // console.log("FooterComponent useEffect");
    // (async () => { 
    //   setAddress( await getAddressformLocation(edges[0].node.location.longitude, edges[0].node.location.latitude))
    // })()
    setAddress(item.address)
  }, [imageIndex])

  return (
    <>
      <View style={[imageWrap]} pointerEvents="none">
        <View style={[size]}>
          <View style={[styles.imageViewFooterContainer, backgroundColor]}>
            <Text><Text size={windowHeight/40} color={textColor}>{address}</Text></Text>
            {takePictureTime ? <Text style={[dateText]} size={windowHeight/40} color={textColor}>{takePictureTime}</Text> : null}
          </View>
        </View>
      </View>
    </>   
  )
}

const styles = StyleSheet.create({
  imageGalleryContainerStyle: {
    flex: 1,
    zIndex: 100,
    backgroundColor:"white"
  },
  menuStyle: {
    margin: 2,
    alignSelf: "center"
  },
  ImageContainerStyle: {
    width: (windowWidth / 3),
    height: (windowWidth / 3),
    padding: 2,
  },
  ImageInnerStyle: {
    borderWidth:1
  },
  imageStyle: {
    alignSelf: "center",
    width: "100%",
    height: (windowWidth / 3) - 44,
    resizeMode:"cover"
  },
  imageCheckboxStyle: {
    position: "absolute",
    top: 0,
    right: 2,
    zIndex: 100,
    borderRadius: 50,
  },
  selected: {
    borderWidth:2,
    borderColor:"#0188ff"
  },
  imageInfoContainerStyle: {
    flexDirection: "row",
    paddingHorizontal:1
  },
  imageNameStyle: {
    fontSize: 15,
    fontWeight: "bold",
    flexWrap: "wrap",
  },
  imageDateStyle: {
    fontSize: 13,
    alignSelf:"center",
    flexWrap: "wrap"
  },
  addressContainer: {
    position: "absolute",
    bottom: 0
  },
  imageViewFooterWrap: {
    position:"absolute",
    bottom: 0,
    height: windowHeight,
    width: windowWidth,
    zIndex: 100,
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    alignContent: "center"
  },
  imageViewFooterContainer: {
    position:"absolute",
    bottom: 0,
    // paddingHorizontal: 10,
    justifyContent: "space-between",
    width: "100%",
    flexDirection: "row",
    alignItems:"center"
  },
})