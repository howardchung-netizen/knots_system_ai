import * as React from 'react';
import { useState, useContext, useEffect, useCallback, useRef, useReducer, useMemo } from 'react'; 
import { ThemeContext } from './appContext/ThemeContext';
import { UserContext } from '../components/appContext/UserContext';
import { TouchableOpacity, StyleSheet, View, Image, Dimensions, Alert, FlatList, ActivityIndicator, Platform, ScrollView, PixelRatio } from 'react-native';
import { Header } from './header/Header';
import { MenuButton } from './MenuButton';
import Button from './button/Button';
import FontAwesome5Icon from 'react-native-vector-icons/FontAwesome5';
import CameraRoll from "@react-native-community/cameraroll";
import { LoadingWithContent } from './LoadingWithContent';
import CenterView from './CenterView';
import { CheckBox } from './CheckBox';
import ImageView from "react-native-image-viewing";
import { NoPermissionsAlert } from './NoPermissions';
import { List as PaperList, Divider } from 'react-native-paper';
import { Text } from './Text';
import { FABGroup } from './FAB';
import moment from 'moment';
import { setAlbum, addImageToAlbumAsynStorage, removeImageFormAlbumAsynStorage } from '../helpers/asyncStorage/albumAsynStorage'; 
import { useNavigation, useRoute } from '@react-navigation/native';
import { useLaunchCamera } from '../helpers/hooks/useLaunchCamera';
import { Modal } from './modal/Modal';
import TextInput from './TextInput';
import promiseAll from '../helpers/promiseAll'
import * as RNFS from 'react-native-fs';
import proj4 from '../helpers/proj4/proj4';
import { CaptureMultiView } from './CaptureComponent';
import { createAlbum, joinAlbum, shareAlbum, listShareAlbum, uploads, batchCreate } from '../helpers/googleAlbumApi';
import { AlertError } from './AlertError';
import { projectsAlbumReducer } from './ProjectGalleryList';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import Geolocation from 'react-native-geolocation-service';
import ViewShot, { captureRef } from "react-native-view-shot";
import { gql, useApolloClient } from '@apollo/client';
import { projectUpdateMutation } from '../helpers/GQL/mutation';
import { projectQuery } from '../helpers/GQL/query';
import { scalesImageOnScreen } from '../helpers/scalesImage';
import BackgroundService from 'react-native-background-actions';
import { Context as ImageGallerySettingContext } from '../components/appContext/ImageGallerySettingContext';
import { imageGallerySetting as imageGallerySettingAsynStorage } from '../helpers/asyncStorage/appSettingAsynStorage';
import { SettingButton } from './SettingButton';
import ImageMarker from "react-native-image-marker";
import rnTextSize, { TSFontSpecs } from 'react-native-text-size';
import { useToast } from "react-native-toast-notifications";
import { uploads as uploadFile } from '../helpers/googleDriveApi';
import scalesStyle, { scaledFontSize } from '../utils/scalesStyle';

proj4.defs("EPSG:2326","+proj=tmerc +lat_0=22.31213333333334 +lon_0=114.1785555555556 +k=1 +x_0=836694.05 +y_0=819069.8 +ellps=intl +towgs84=-162.619,-276.959,-161.764,0.067753,-2.24365,-1.15883,-1.09425 +units=m +no_defs");
proj4.defs("EPSG:4326", "+proj=longlat +datum=WGS84 +no_defs");

const window = Dimensions.get('window');
const windowWidth = window.width;
const windowHeight = window.height;
const screen = Dimensions.get('screen');
let fontSize = scaledFontSize(40);
let fontFamily = 'Arial-BoldItalicMT';
let fontWeight = 'normal';
let fontStyle = 'italic';
function uuidv1() {
  return Math.random().toString(36).slice(-6);
}
const albumName = "KNOTS"
const pathBegin = Platform.OS == 'ios' ? '': 'file://';
const CachesDirectoryPath = pathBegin + RNFS.CachesDirectoryPath + '/' + albumName; 
const DocumentDirectoryPath = pathBegin + RNFS.DocumentDirectoryPath + '/' + albumName; 
let fileList = async () => {
  if (!(await RNFS.exists(CachesDirectoryPath))) await RNFS.mkdir(CachesDirectoryPath);
  if (!(await RNFS.exists(DocumentDirectoryPath))) await RNFS.mkdir(DocumentDirectoryPath);
}

export const ImageGalleryHeader = React.forwardRef(({ title, subtitle, items }, ref) => {
  const [imageGallerySettingContext, ImageGallerySettingDispatch] = useContext(ImageGallerySettingContext);
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
  
  const onFilterConfirmPress = async () => {
     
  }
  const onFilterClosePress = async () => {
    await imageGallerySettingAsynStorage(imageGallerySettingContext)
  }
  const onUseGPSPress = () => { 
    ImageGallerySettingDispatch({ type: "USE_GPS", payload: !imageGallerySettingContext.useGPS });
  }
  const onAutoUploadPress = () => {
    if(!imageGallerySettingContext.autoUpload)
      ImageGallerySettingDispatch({ type: "USE_AUTO_UPLOAD" });
    else ImageGallerySettingDispatch({ type: "CANCEL_AUTO_UPLOAD" });
  }
  const onAutoUploadWithWifiPress = () => {
    console.log("onAutoUploadWithWifiPress", imageGallerySettingContext.autoUpload)
    if (!imageGallerySettingContext.autoUpload) return;
    ImageGallerySettingDispatch({ type: "AUTO_UPLOAD_WITH_WIFI",  payload: !imageGallerySettingContext.autoUploadWithWifi });
  }

  useEffect(() => {
    (async () => { 
      ImageGallerySettingDispatch({ type: "INITIAL", payload: await imageGallerySettingAsynStorage() })
    })()
    if (ref) ref({
      setTitle: setTitle,
      setSubtitle: setSubtitle,
      setItems: setItems
    });
  },[])
  return (
    <Header
      style={{ alignContent: "space-between", width: "100%", justifyContent: "space-between" }} goBackBtn title={title} subtitle={subtitle}>
      <MenuButton button={<FontAwesome5Icon style={{ marginHorizontal: 12, marginVertical: 10 }} size={20} color={buttonColor} name="ellipsis-v" />} items={itemsList} />
      <SettingButton
        title="設定"
        onClosePress={onFilterClosePress}
        body={<>
          <View style={{ marginHorizontal: 10 }}>
            <PaperList.Section>
            <PaperList.Subheader style={{ color: theme.colors.text, margin: 0, fontSize: scaledFontSize(15) }}>位置</PaperList.Subheader>
              <PaperList.Item titleStyle={{ color: theme.colors.titleText, fontSize: scaledFontSize(18) }} styles={[styles.item]} title="拍照加入GPS位置地址" right={() =>
                <CheckBox status={imageGallerySettingContext.useGPS} onPress={onUseGPSPress} />
              } />
              <PaperList.Subheader style={{ color: theme.colors.text, margin: 0, fontSize: scaledFontSize(15) }}>同步</PaperList.Subheader>
              <PaperList.Item titleStyle={{ color: theme.colors.titleText, fontSize: scaledFontSize(18) }} styles={[styles.item]} title="圖片自動同步" right={() =>
                <CheckBox status={imageGallerySettingContext.autoUpload} onPress={onAutoUploadPress} />
              } />
              {/* {
              imageGallerySettingContext.autoUpload ?  
              <PaperList.Item titleStyle={{ color: theme.colors.titleText }} styles={[styles.item]} title="要求WIFI" right={() =>
                <CheckBox status={imageGallerySettingContext.autoUploadWithWifi} onPress={onAutoUploadWithWifiPress} />
              } /> : null
              } */}
            </PaperList.Section>
          </View>
        </>} />
    </Header>
  )
})  

export const ImageList = React.memo(({ list, renderItem, loadMore, hasNext }) => {
  const [loading, setLoading] = useState(false);
  const [scrollEnabled, setScrollEnabled] = useState(true);
  const  flatListRef= useRef(null);
  const _renderItem = useCallback((p, index) => { return (renderItem(p, index)) }, []);
  const _keyExtractor = useCallback((p, index) => p.node.image.fileName);
  const _getItemLayout = useCallback((data, index) => ({ length: styles.ImageContainerStyle.height, offset: styles.ImageContainerStyle.height * index, index }), []);
  return (
    <>
      <FlatList
        ref={flatListRef}
        onContentSizeChange={() => flatListRef.current.scrollToEnd() }
        onLayout={() => flatListRef.current.scrollToEnd() }
        removeClippedSubviews={false}
        extraData={true}
        ListEmptyComponent={() => <ActivityIndicator color={"blue"}/>}
        windowSize={150}
        getItemLayout={_getItemLayout}
        contentContainerStyle={{ alignSelf: 'flex-start' }}
        numColumns={3}
        scrollEnabled={scrollEnabled}
        data={list}
        renderItem={_renderItem}
        keyExtractor={_keyExtractor}
        ListFooterComponent={hasNext ? <Button onPress={loadMore}>更多</Button> : null}
      >
      </FlatList>
    </>
  )
})

export const ImageItem = React.memo(React.forwardRef(({ item, uri, name, size, date, onPressImage, onCheckBoxPress, projectID, albumTitle, removeImages, albumId, accessToken, _albumDispatch,  ...props }, ref) => {
  // console.log("uri", DocumentDirectoryPath + '/' + name);
  const toast = useToast();
  const route = useRoute();
  const albumDispatchformGalleryList = (type, payload)=> route.params.albumDispatch({ type: type, payload : payload});
  const [imageGallerySettingContext, ImageGallerySettingDispatch] = useContext(ImageGallerySettingContext);
  const [{ theme }] = useContext(ThemeContext);
  const [selected, setSelected] = useState(false);
  const loadingWithContentRef = useRef();
  const isUploading = useRef(false);
  console.log("ImageItem", name);
  const backgroundTaskOptions = {
    taskName: `同步 ${albumTitle} 圖片`,
    taskTitle: `${albumTitle}`,
    taskDesc: `同步 ${albumTitle} 圖片`,
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
  const uploadImage = async () => {
    console.log("uploadImage")
    const veryIntensiveTask = async () => {
      // Example of an infinite loop task
      // await new Promise(async (resolve, reject) => {
      //   try {
      //     let tryCount = 0
      //     const tryUpload = async () => {
      //       try {
      //         tryCount++
      //         console.log("tryUpload")
      //         _albumDispatch("SET_ABLUM_STATUS", { projectID: projectID, status: "synchronizing" });
      //         let UploadToken = await uploads(accessToken, item.image.filename, item.image.uri);
      //         let { newMediaItemResults, error } = await batchCreate(accessToken, albumId, [UploadToken]);
      //         if (error) throw `${error.message}`;
      //         await removeImages([name]);
      //         _albumDispatch("REMOVE_IMAGES", { projectID: projectID, images: [name] });
      //         // setIsUploading(false);
      //         isUploading.current = false
      //         console.log(item.image.filename, " uploaded");
      //         // _albumDispatch("SET_ABLUM_STATUS", { projectID: projectID, status: "synced" });
      //         // resolve();
      //       } catch (error) {
      //         console.log(error)
      //         if (tryCount > 5) {
      //           isUploading.current = false
      //           loadingWithContentRef.current.setVisible(false);
      //           // reject();
      //           return;
      //         }
      //         else setTimeout(async () => { await tryUpload() }, 30000);
      //         // AlertError("上載失敗，請重新再試一次...", error.message ?? error);
      //         // setIsUploading(false);
              
      //       }
      //     }
      //     await tryUpload();
      //   } catch (error) {
      //     console.log(error)
      //     isUploading.current = false
      //     loadingWithContentRef.current.setVisible(false);
      //     reject();
      //   }
      // });
      let tryCount = 0;
      const tryUpload = async () => {
        try {
          tryCount++
          console.log("tryUpload")
          _albumDispatch("SET_ABLUM_STATUS", { projectID: projectID, status: "synchronizing" });
          albumDispatchformGalleryList("SET_ABLUM_STATUS", { projectID: projectID, status: "synchronizing" });
          let UploadToken = await uploads(accessToken, item.image.filename, item.image.uri);
          let { newMediaItemResults, error } = await batchCreate(accessToken, albumId, [UploadToken]);
          if (error) throw `${error.message}`;
          await removeImages([name]);
          _albumDispatch("REMOVE_IMAGES", { projectID: projectID, images: [name] });
          albumDispatchformGalleryList("REMOVE_IMAGES", { projectID: projectID, images: [name] });
          isUploading.current = false;
          console.log(item.image.filename, " uploaded");
        } catch (error) {
          console.log(error)
          if (tryCount > 5) {
            isUploading.current = false
            loadingWithContentRef.current.setVisible(false);
            return;
          }
          else setTimeout(async () => { await tryUpload() }, 30000);
        }
      }
      await tryUpload();
    };
    BackgroundService.start(veryIntensiveTask, backgroundTaskOptions);
  }

  useEffect(() => {
    if (imageGallerySettingContext.autoUpload && !isUploading.current && accessToken && albumId) {
      loadingWithContentRef.current.setStatus("loading");
      loadingWithContentRef.current.setVisible(true);
      isUploading.current = true;
      uploadImage();
    }
  }, [accessToken, albumId])
  useEffect(() => {
    if (ref) ref({
      setSelected: (checked) => setSelected(checked)
    })
  }, [])

  return (
    <>
      <View style={[styles.ImageContainerStyle]}>
        <View style={[styles.ImageInnerStyle, { borderColor: theme.colors.secondary }, selected ? styles.selected : null]}>
          <TouchableOpacity onPress={()=> onPressImage()}>
            <LoadingWithContent ref={(ref)=>loadingWithContentRef.current = ref}/>
            <Image
              style={styles.imageStyle}
              source={{ uri: uri}}
            />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.imageInfoContainerStyle]} onPress={() => {
            if (onCheckBoxPress) onCheckBoxPress(!selected);
            setSelected(!selected);
          }}>
            <CheckBox
              onPress={() => {
                if (onCheckBoxPress) onCheckBoxPress(!selected);
                setSelected(!selected);
              }}
              status={selected}
            />
            <View style={{ flex: 1 }}>
              <Text numberOfLines={1} style={[styles.imageNameStyle]} color={theme.colors.titleText} >{name}</Text>
              <Text numberOfLines={1} style={[styles.imageDateStyle]} color={theme.colors.text}>{date} {size}</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </>
  )
}));

const addWaterMark = async (sourceUri, newPath, address, date, height, width) => {
  let fontSize = height / 10;
  fontSize = fontSize < 40 ? 40 : fontSize;
  fontSize = fontSize > 100 ? 100 : fontSize;
  console.log(sourceUri, newPath, address, date, height, width)
  let textY = height - fontSize;
  if (address, date) await ImageMarker.markText({
    src: sourceUri,
    text: " ",
    // position: "bottomCenter",
    X: 0,
    Y: textY, 
    color: "#ffffff",
    fontName: fontFamily,
    fontSize: fontSize,
    textBackgroundStyle: {
      type: 'stretchX',
      paddingX: 0,
      paddingY: 0,
      color: "#323594"
    },
    scale: 1,
    quality: 100
  }).then(async (cache) => {
    await RNFS.unlink(newPath);
    await RNFS.copyFile(cache, newPath);
  }).catch((err) => {
    console.log(err);
  })
  if (address)
  await ImageMarker.markText({
      src: sourceUri,
      text: address,
      X: 0,
      Y: textY, 
      color: "#ffffff",
      fontName: fontFamily,
      fontSize: fontSize,
      scale: 1,
      quality: 100
    }).then(async (cache) => {
      await RNFS.unlink(newPath);
      await RNFS.copyFile(cache, newPath);
    }).catch((err) => {
      console.log(err);
    })
  if (date) {
    let size = await rnTextSize.measure({
      text: date, 
      height,
      fontSize: scaledFontSize(fontSize),
      fontFamily,
      fontWeight,
      fontStyle    // RN font specification
    })
   console.log(size)
    await ImageMarker.markText({
      src: sourceUri,
      text: date,
      X: width - size.width,
      Y: textY,
      color: "#ffffff",
      fontName: fontFamily,
      fontSize: fontSize,
      scale: 1,
      quality: 100
    }).then(async (cache) => {
      await RNFS.unlink(newPath);
      await RNFS.copyFile(cache, newPath);
    }).catch((err) => {
      console.log(err);
    })
  }
}

const saveToAlbum = async (assets, isNewImage, location, cb) => {
  let saveList = [];
  console.log("saveToAlbum", assets)
  await promiseAll(assets.map(i =>
    new Promise(async (r, s) => {
      try {
        let now = Date.now();
        let timestamp = moment(now).format("X");
        let today = moment(now).format("YYYY-MM-DD");
        let uuid = uuidv1();
        let fileName = `KNOTS_${timestamp}_${uuid}_${today}.jpng`;
        let newPath = `${DocumentDirectoryPath}/${fileName}`;
        console.log("promiseAll", i)
        // console.log("newPath", newPath)
        // console.log(i.uri ?? i.path);
        await RNFS["copyFile"](i.uri ?? i.path, newPath).catch(err => console.log(err));
        // await ImageMarker.markText({
        //     src: i.uri ?? i.path,
        //     text: " ",
        //     position: "bottomCenter",
        //     color: "#ffffff",
        //     fontName: fontFamily,
        //     fontSize: fontSize,
        //     scale: 1,
        //     quality: 100
        //   }).then(async (cache) => {
        //     await RNFS.copyFile(cache, newPath);
        //   }).catch((err) => {
        //     console.log(err);
        //   })
        if (isNewImage) await CameraRoll.save(i.uri ?? i.path, { album: "KNOTS", type: "photo" }).catch(err => console.log(err)); // origin image
        // await RNFS[Platform.OS == "ios" ? "copyAssetsFileIOS" : "copyFile"](i.uri ?? i.path, newPath, 0, 0).catch(err => console.log(err));
        // RNFS.unlink(i.uri ?? i.path);
        // console.log("newPath", newPath, await RNFS.exists(newPath))
        // let assetsPath = await CameraRoll.save(i.uri ?? i.path, { album: album, type: "photo" }).catch(err => console.log(err));
        // await RNFS.copyAssetsFileIOS(assetsPath, newPath);
        // console.log("newPath", newPath, await RNFS.exists(newPath))
        let node = {};
        if (Platform.OS == "ios") {
          let gps = null;
          if (i.exif && i.exif['{GPS}']) gps = i.exif['{GPS}'];
          node = {
            location: {
              longitude: gps ? gps?.Longitude : location?.longitude??null ,
              latitude: gps ? gps?.Latitude : location?.latitude??null,
            },
            address: null,
            modified: parseInt(i.modificationDate) / 1000,
            timestamp: isNewImage ? timestamp : i.creationDate,
            date: isNewImage ? today : i.creationDate ? moment(parseInt(i.creationDate) * 1000).format('YYYY-MM-DD') : null,
            mime:i.mime,
            image: {
              fileSize: i.size,
              filename: fileName,
              height: i.height,
              playableDuration: null,
              uri: newPath,
              width: i.width,
            }
          }
        }
        else node = {
          // isNewFile: true,
          location: {
            longitude: i.exif?.Longitude ?? location?.longitude ?? null,
            latitude: i.exif?.Latitude ?? location?.latitude ?? null
          },
          address: null,
          modified: parseInt(i.modificationDate) / 1000,
          timestamp: isNewImage ? timestamp : i.exif ? i.exif.DateTime ? moment(i.exif.DateTime, 'YYYY:MM:DD HH:mm:ss').format('X') : null : null,
          date: isNewImage ? today : i.exif ? i.exif.DateTime ? moment(i.exif.DateTime, 'YYYY:MM:DD HH:mm:ss').format('YYYY-MM-DD') : null : null,
          mime:i.mime,
          image: {
            fileSize: i.size,
            filename: fileName,
            height: i.height,
            playableDuration: null,
            uri: newPath,
            width: i.width,
          }
        }
        if (node.location?.longitude && node.location?.latitude) {
          node.address = await getAddressformLocation(node.location.longitude, node.location.latitude);
        }
        await Image.getSize(newPath, (width, height) => { 
          node.image.width = width;
          node.image.height = height;
        });
        await addWaterMark(newPath, newPath, node.address, node.date, node.image.height, node.image.width)
        r({ node })
      } catch (error) {
        console.log(error)
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
  // console.log("getAddressformLocation", longitude, latitude)
  const [easting, northing] = proj4('EPSG:4326', 'EPSG:2326', [longitude, latitude]);
  return await fetch(
    `https://www.map.gov.hk/gih-ws2/identify/${easting}/${northing}/1/WEB`
  ).then(async (response) => {
    // console.log("response", response);
    let r = await response.json();
    // console.log("r", r);
    return `${r[0].addressInfo[0].caddress??''}${r[0].addressInfo[0].cname??''}`;
  }).catch(() => null)
}

function init(album) {
  return album;
}

export const ImageGallery = (props) => {

  const [imageGallerySettingContext, ImageGallerySettingDispatch] = useContext(ImageGallerySettingContext);
  const projectID = props.route.params.id;
  const albumTitle = props.route.params.title;
  const [_album, albumDispatch] = useReducer(projectsAlbumReducer, props.route.params.album, init);
  const album = useMemo(() => _album[projectID], [_album[projectID]]);
  const shareToken = album.shareToken;
  const takenPictures = useRef([]);
  const { launchCamera, launchImageLibrary, cleanTempFiles } = useLaunchCamera();
  const [{ loginType }] = useContext(UserContext);
  const [{ theme }] = useContext(ThemeContext);
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [addressInputVisible, setAddressInputVisible] = useState(false);
  const [address, setAddress] = useState(null);
  const [allSelected, setAllSelected] = useState(false); 
  const selectedImg = useRef([]);
  const imagesUri = album.edges.map(e => { return { uri: DocumentDirectoryPath + "/" + e.node.image.filename + (Platform.OS == "android" ? "?" + new Date() : "")} });
  const [imageViewVisible, setImageViewVisible] = useState(false);
  const viewingIndex = useRef(0);
  const loadingWithContentRef = useRef();
  const ImageGalleryHeaderRef = useRef(
    {
      setSubtitle: (subtitle)=>navigation.setOptions({subtitle:subtitle})
    }
  );
  const captureMultiViewRef = useRef();
  const checkboxRef = useRef([]);
  const client = useApolloClient();
  const [accessToken, setAccessToken] = useState();
  const [albumId, setAlbumId] = useState();
  const backgroundTaskOptions = {
    taskName: `同步 ${albumTitle} 圖片`,
    taskTitle: `${albumTitle}`,
    taskDesc: `同步 ${albumTitle} 圖片`,
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
  const initTokenAndAlbumId = async () => { 
    let { accessToken } = await GoogleSignin.getTokens().catch(async () => await GoogleSignin.getTokens())
    setAccessToken(accessToken);
    let album = await getGoogleAlbum(accessToken)
    setAlbumId(album.id);
  }
  const getCheckboxRef = useCallback(ref => {
    let temp = [...checkboxRef.current];
    temp.push(ref);
    checkboxRef.current = temp;
  }, [])
  const albumDispatchformGalleryList = (type, payload)=> props.route.params.albumDispatch({ type: type, payload : payload});
  const _albumDispatch = (type, payload) => albumDispatch({ type, payload });
  const _setAddress = () => { 
    setAddress(selectedImg.current.length == 1 ? selectedImg.current[0].address : null);
  }
  const selectImg = (node, index) => { 
    // console.log("selectImg")
    node.index = index;
    let temp = selectedImg.current.map(e => e);
    temp.push(node);
    selectedImg.current = temp;
    // console.log(selectedImg.current)
    ImageGalleryHeaderRef.current.setSubtitle(`已選擇${selectedImg.current.length}個檔案`);
    _setAddress();
  }
  const unselectImg = (node, index) => {
    // console.log("unselectImg")
    let temp = selectedImg.current.map(e => e);
    selectedImg.current = temp.filter(e => e.index != index);
    ImageGalleryHeaderRef.current.setSubtitle(selectedImg.current.length ? `已選擇${selectedImg.current.length}個檔案` : null);
    _setAddress();
  }
  const _setAllSelected = () => { 
    // console.log("_setAllSelected", checkboxRef.current);
    // checkboxRef.current.map(e => console.log(e));
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
    ImageGalleryHeaderRef.current.setSubtitle(selectedImg.current.length ? `已選擇${selectedImg.current.length}個檔案` : null);
    _setAddress();
  }
  const openCamera = async (reOpen) => {
    setLoadingWithContentRef(null, null, "loading", true);
    launchCamera(null, async (res) => {
      // console.log("launchCamera", res)
      try {
        let location = {};
        if(imageGallerySettingContext.useGPS)
          Geolocation.getCurrentPosition(
             (position) => {
               location.latitude = position.coords.latitude;
               location.longitude = position.coords.longitude;
             },
             (error) => {
               // See error code charts below.
               // console.log("Geolocation error", error.code, error.message);
             },
             { enableHighAccuracy: true, timeout: 5000, maximumAge: 10000 }
           );
        if (res) {
          if (reOpen) openCamera(true);
          addTakenPictureUri(res);
        } else if (takenPictures.current) {
          albumDispatchformGalleryList("SET_ABLUM_STATUS", { projectID: projectID, status: "synchronizing" });
          if (imageGallerySettingContext.autoUpload) await initTokenAndAlbumId();
          BackgroundService.start(async () => {
            await saveToAlbum(takenPictures.current, true, location, async (saveList) => {
              // console.log("saveList", saveList);
              addImageToAlbumAsynStorage(albumTitle, projectID, saveList);
              _albumDispatch("ADD_IMAGES", { projectID: projectID, images: saveList });
              albumDispatchformGalleryList("ADD_IMAGES", { projectID: projectID, images: saveList });
              // cleanTempFiles(takenPictures.current);
              takenPictures.current = [];
              initSelecttionAndLoadingMessage();
            })
        }, backgroundTaskOptions);
        }
        else setLoadingWithContentRef(null, null, null, false);
      } catch (error) {
        cleanTempFiles(takenPictures.current);
        takenPictures.current = [];
        initSelecttionAndLoadingMessage();
        AlertError("糸統出錯，請重新再試一次...", '');
      }
    }).catch(error=>{
      NoPermissionsAlert("權限不足", error.message);
      setLoadingWithContentRef(null, null, null, false);
    });
  } 
  const openImagesLibrary = () => {
    launchImageLibrary({ multiple: true, includeExif: true }, async (res) => {
      try {
        setLoadingWithContentRef(null, null, "loading", true);
        albumDispatchformGalleryList("SET_ABLUM_STATUS", { projectID: projectID, status: "synchronizing" });
        if (imageGallerySettingContext.autoUpload) await initTokenAndAlbumId();
        BackgroundService.start(async () => {
          await saveToAlbum(res, false, null, async (saveList) => {
            addImageToAlbumAsynStorage(albumTitle, projectID, saveList);
            _albumDispatch("ADD_IMAGES", { projectID: projectID, images: saveList });
            albumDispatchformGalleryList("ADD_IMAGES", { projectID: projectID, images: saveList });
            initSelecttionAndLoadingMessage();
          })
        }, backgroundTaskOptions);
      } catch (error) {
        initSelecttionAndLoadingMessage();
        AlertError("糸統出錯，請重新再試一次...", '');
      }
    }).catch(error => {
      NoPermissionsAlert("權限不足", error.message);
      setLoadingWithContentRef(null, null, null, false);
    });
  }
  const createAndShareAlbum = async (accessToken) => {
    let album = await createAlbum(accessToken, albumTitle);
    // console.log("createAlbum", album);
    let { shareInfo, error } = await shareAlbum(accessToken, album.id);
    console.log("shareAlbum", shareInfo, error);
    if (error) throw error;
    await client.mutate({
      mutation: gql`${projectUpdateMutation}`,
      variables: {
        data: {
          id: projectID,
          albumShareToken: shareInfo.shareToken
        }
      },
    }).then(res => {
      albumDispatch({ type: "UPDATE_SHARETOKEN", payload: res.data.projectUpdate.project.albumShareToken });
    }).catch(err => { throw err });
    return album
  }
  const getGoogleAlbum = async (accessToken) => { 
    try {
      // console.log("await listShareAlbum(accessToken)", await listShareAlbum(accessToken))
      let _album = (await listShareAlbum(accessToken)).sharedAlbums?.find(e => e.title == albumTitle);
      // console.log("shareToken", shareToken)
      if (!_album) {
        if (shareToken) {
          let joinedAlbum = await joinAlbum(accessToken, shareToken);
          // console.log("joinedAlbum", joinedAlbum)
          if (joinedAlbum.error) _album = await createAndShareAlbum(accessToken).catch(err => { throw err });
          else _album = joinedAlbum.album;
        }
        else {
          _album = await createAndShareAlbum(accessToken).catch(err => { throw err });
        }
      }
      return _album
    } catch (error) {
      console.log(error)
    }
  }
  const onUpload = async (files) => {
    // let { accessToken } = await GoogleSignin.getTokens().catch(async () => await GoogleSignin.getTokens())
    // console.log("selectedImg.current[0].image.uri", selectedImg.current[0].image.uri);
    // let file = await RNFS.readFile(selectedImg.current[0].image.uri, "base64");
    // await uploadFile(accessToken, "fileName.jpg", selectedImg.current[0].image.uri);
    if (selectedImg.current.length == 0) return;
    const backgroundTaskOptions = {
      taskName: `同步 ${albumTitle} 圖片`,
      taskTitle: `${albumTitle}`,
      taskDesc: `同步 ${albumTitle} 圖片`,
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
    const veryIntensiveTask = async (taskDataArguments) => {
      // Example of an infinite loop task
      await new Promise(async (resolve) => {
        ImageGalleryHeaderRef.current.setSubtitle(`同步中...`);
        setLoadingWithContentRef('同步中', `0/${selectedImg.current.length}`, "loading", true);
        ImageGalleryHeaderRef.current.setSubtitle(`同步中 0/${selectedImg.current.length}`);
        setLoadingWithContentRef('同步中', `0/${selectedImg.current.length}`, "loading", true);
        // let tempEdges = [...album.edges];
        let uploadedCount = 0;
        let totalCount = files.length;
        let { accessToken } = await GoogleSignin.getTokens().catch(async()=> await GoogleSignin.getTokens());
        try {
          let googleAlbum = await getGoogleAlbum(accessToken).catch(error => { 
              initSelecttionAndLoadingMessage();
              AlertError("上載失敗，請重新再試一次...", error.message);
              resolve();
              return;
          });
          let _batchCreate = async (uploadTokenArr, albumId) => {
            // console.log(uploadTokenArr);
            const chunkSize = 50;
            for (let i = 0; i < uploadTokenArr.length; i += chunkSize) {
              let chunkUploadTokenArr = uploadTokenArr.slice(i, i + chunkSize);
              let { newMediaItemResults, error } = await batchCreate(accessToken, albumId, chunkUploadTokenArr);
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
              _albumDispatch("REMOVE_IMAGES", { projectID: projectID, images: removeList });
              albumDispatchformGalleryList("REMOVE_IMAGES", { projectID: projectID, images: removeList });
              uploadedCount = uploadedCount + removeList.length;
              ImageGalleryHeaderRef.current.setSubtitle(`同步中 ${uploadedCount}/${totalCount}`);
              setLoadingWithContentRef("同步中", `${uploadedCount}/${totalCount}`, "loading", true);
              // console.log("batchCreate", newMediaItemResults);
              // console.log("uploadList", uploadList);
              if (uploadedCount < totalCount) {
                promiseAll([
                  _batchCreate(uploadList, albumId),
                ], () => { })
              }
              else {
                let removeList = files.map(e => e.image.filename);
                await removeImages(removeList);
                _albumDispatch("REMOVE_IMAGES", { projectID: projectID, images: removeList });
                albumDispatchformGalleryList("REMOVE_IMAGES", { projectID: projectID, images: removeList });
                ImageGalleryHeaderRef.current.setSubtitle(`已完成 ${files.length}/${files.length}`);
                setLoadingWithContentRef("已完成", `${files.length}/${files.length}`, "finish", true);
                setTimeout(() => {
                  initSelecttionAndLoadingMessage();
                  loadingWithContentRef.current.onClosePress();
                  resolve();
                }, 1000)
              }
            }
          }
          await promiseAll(files.map(async e => uploads(accessToken, e.image.filename, e.image.uri)), async (uploadTokenArr, err) => {
            // console.log("uploadTokenArr", uploadTokenArr, err);
            if (err) throw `${err}`
            else await _batchCreate(uploadTokenArr, googleAlbum.id)
          })
        } catch (error) {
          console.log("error", error)
          initSelecttionAndLoadingMessage();
          AlertError("上載失敗，請重新再試一次...", error);
          resolve();
        }
        //  resolve()
      });
    };
    BackgroundService.start(veryIntensiveTask, backgroundTaskOptions);
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
    ImageGalleryHeaderRef.current.setSubtitle(null);
  }
  const initSelecttionAndLoadingMessage = () => {
    headerInit();
    ImageGalleryHeaderRef.current.setSubtitle(null);
    // checkboxRef.current.map(e => e.setSelected(false));
    selectedImg.current = [];
    setLoadingWithContentRef(null, null, null, false);
  }
  useEffect(() => {
    (async () => {
      navigation.setOptions(
        {
          headerShown: true,
          header: (props) => { 
            return <>
            <ImageGalleryHeader title={albumTitle} subtitle={props.options.subtitle}>
            </ImageGalleryHeader>
            {/* <Divider/> */}
          </>
          }
        }
      )
     })()
    headerInit();
    fileList();
  }, []);
  
  useEffect(() => {
    if (imageGallerySettingContext.autoUpload && album.edges.length) (async () => {
      await initTokenAndAlbumId(); 
    })()
  }, [imageGallerySettingContext.autoUpload])
  
  const onCapture = useCallback((filename) => albumDispatch({ type: "INITIAL_IMAGE", payload: { projectID: projectID, filename: filename } }), [])
  const ImageItemUseCallBack = useCallback(({ item, index }) => { 
    const onPressImage = useCallback(() => {
      viewingIndex.current = index;
      setImageViewVisible(true)
    }, [])
    const onCheckBoxPress = useCallback((selected) => {
      selected ? selectImg(item.node, index) : unselectImg(item.node, index);
    }, [])
    return (
      <ImageItem
        key={item.node.image.filename}
        // index={index}
        ref={getCheckboxRef}
        projectID={projectID}
        onPressImage={onPressImage}
        onCheckBoxPress={onCheckBoxPress}
        item={item.node}
        name={item.node.image.filename}
        size={item.node.image.imageSize}
        uri={DocumentDirectoryPath + '/' + item.node.image.filename}
        date={item.node.timestamp ? moment(item.node.timestamp * 1000).format('YYYY/MM/DD') : ''}
        onCapture={onCapture}
        albumTitle={albumTitle}
        client={client}
        removeImages={removeImages}
        _albumDispatch={_albumDispatch}
        accessToken={accessToken}
        albumId={albumId}
      />
    )
  }, [accessToken, albumId])
  const List = useCallback(() => { 
    console.log("List")
    const  flatListRef= useRef(null);
    const _getItemLayout = useCallback((data, index) => ({ length: styles.ImageContainerStyle.height, offset: styles.ImageContainerStyle.height * index, index }), []);
    return (
      <ScrollView
        ref={flatListRef}
        onContentSizeChange={() => flatListRef.current.scrollToEnd()}
        onLayout={() => flatListRef.current.scrollToEnd()}
        removeClippedSubviews={false}
        extraData={true}
        ListEmptyComponent={() => <ActivityIndicator color={"blue"} />}
        windowSize={150}
        getItemLayout={_getItemLayout}
        scrollEnabled={true}>
        <View style={{ flex: 1, alignSelf: 'flex-start', flexDirection: "row", width: "100%", flexWrap: 'wrap', }}>
          {
            album.edges.map((item, index) => <ImageItemUseCallBack item={item} index={index} key={item.node.image.filename} />)
          }
        </View>
      </ScrollView>
    )
  }, [album, accessToken, albumId])

  return (
    <>
        <LoadingWithContent visible={loading} ref={(ref) => {
          if (ref) loadingWithContentRef.current = ref
        }} />
        {/* <CaptureMultiView
          ref={(ref) => { if (ref) captureMultiViewRef.current = ref }}
          ratio={0.5}
          view={(e) => {
            let { scaleHeight, scaleWidth } = scalesImageOnScreen(e.image.height, e.image.width);
            return (<>
              <Image source={{ uri: e.image.uri }} style={{ height: scaleHeight, width: scaleWidth }} />
              <ImageViewFooterComponent
                sizeRatio={scaleHeight}
                item={e}
                imageIndex={e.index} />
            </>)
          }}
        /> */}
        <Divider/>
        <View style={styles.imageGalleryContainerStyle}>
          {album.edges.length > 0 ?
            <>
              <Modal
                title="更改圖片地址"
                visible={addressInputVisible}
                transparent={true}
                onRequestClose={() => {
                  setAddressInputVisible(false);
                  setAddress(null);
                }}
                confirmButton
                onConfirmPress={async () => {
                  setAddressInputVisible(false);
                  setLoadingWithContentRef("正在更改圖片地止", "請不要關閉程式", "loading", true);
                  await promiseAll(selectedImg.current.map(e => { 
                    return addWaterMark(e.image.uri, e.image.uri, address, e.date, e.image.height, e.image.width);
                  }), () => { })
                  let tempEdges = album.edges.map(e => {
                    let changeedNode = selectedImg.current.find(x => x.image.filename == e.node.image.name);
                    if (changeedNode) {
                      changeedNode.node.address = address;
                      return changeedNode;
                    }
                    else return e;
                  })
                  let tempAlbum = { ...album, ...{ edges: tempEdges } };
                  // console.log("tempEdges", tempEdges)
                  // console.log("tempAlbum", tempAlbum)
                  await setAlbum(albumTitle, projectID, tempAlbum);
                  _albumDispatch("UPDATE_ALBUM", {projectID: projectID,  title: albumTitle, album: tempAlbum });
                  selectedImg.current.map(e => checkboxRef.current[e.index].setSelected(false));
                  selectedImg.current = [];
                  setAddress(null);
                  setLoadingWithContentRef(null, null, null, false);
                  headerInit();
                }}
                closeButton
                onClosePress={() => {
                  if (props.onClosePress) props.onClosePress();
                  setAddressInputVisible(false);
                  setAddress(null);
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
            <List/>
            </>
            :
            <CenterView>
              <FontAwesome5Icon size={180} name="image" color={theme.colors.secondary} />
            </CenterView>
          }
        </View>
        <FABGroup actions={
              [{
                icon: 'file-upload',
                onPress: async () => {
                  if (loginType != "Google") { 
                    AlertError("無法同步", "請使用Google登入");
                    return 
                  }
                  else onUpload(selectedImg.current)
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
        } />
    </>
    )
  return <></>
}

export const GalleryImageView = ({uriList, imageIndex, visible, onRequestClose }) => {  
  // console.log(uriList)
  return (
    <ImageView
      images={uriList}
      imageIndex={imageIndex}
      visible={visible}
      onRequestClose={onRequestClose}
   />
  )
}

export const ImageViewHeaderComponent = ({imageIndex}) => { 
  return (
    <View style={{width: "100%", zIndex: 1000 , backgroundColor:"blue"}}><Text size={15} color="white">{imageIndex + 1}</Text></View>
  )
}

export const ImageViewFooterComponent = ({ item, imageIndex, sizeRatio }) => {
  console.log("ImageViewFooterComponent")
  const [{theme}] = useContext(ThemeContext)
  const backgroundColor = { backgroundColor: theme.colors.primary}
  const addressText = { textAlign: 'justify' };
  const dateText = { textAlign: "right" };
  const textColor = theme.colors.accent;
  const [address, setAddress] = useState(null);
  const takePictureTime = item.timestamp ? moment(item.timestamp * 1000).format("YYYY-MM-DD") : null;
  let size = (17 * PixelRatio.getFontScale()) * (sizeRatio / windowHeight);
  size = size < 13 ? 13 : size;
  useEffect(() => {
    setAddress(item.address)
  }, [imageIndex])
  return (
    <>
      <View style={[styles.imageViewFooterContainer, backgroundColor, { height: size + 5 }]}>
        <Text style={addressText} size={size} color={textColor}>{address}</Text>
        {takePictureTime ? <Text style={[dateText]} size={size} color={textColor}>{takePictureTime}</Text> : null}
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
    height: (windowWidth / 3) - 48,
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
    alignItems: "center"
  },
  item: {
    backgroundColor: 'white',
    marginTop: 10,
    padding: 20,
    marginHorizontal: 10,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
})