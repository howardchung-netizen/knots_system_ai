import React, { useContext, useEffect, useState, useMemo } from 'react';
import { useRef } from 'react';
import { StyleSheet, TouchableOpacity, View , BackHandler} from 'react-native';
import { Camera as VisionCamera, useCameraDevices } from 'react-native-vision-camera';
import Loading from './Loading';
import { usePermissionsAdnroid } from '../helpers/hooks/usePermissionsAndroid';
import { NoPermissions, NoPermissionsAlert } from './NoPermissions';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { FABGroup } from './FAB';
import { ThemeContext } from './appContext/ThemeContext';
import Geolocation from 'react-native-geolocation-service';
import { addImageToGalleryAsynStorage } from '../helpers/asyncStorage/galleryAsynStorage';
import CameraRoll from "@react-native-community/cameraroll";
import { useLaunchCamera } from '../helpers/hooks/useLaunchCamera';

import moment from 'moment';
export const TakePhotoBtn = ({onPress}) => { 
  return (
    <TouchableOpacity
      style={styles.takePhotoBtnStyle}
      onPress={onPress}
    >
    <FontAwesome5
      color={"#ffffffd1"}
      size={50}
      name={'camera'} solid
    />
     </TouchableOpacity> 
  )
}
function getMaxFps(format) {
  return format.frameRateRanges.reduce((prev, curr) => {
    if (curr.maxFrameRate > prev) return curr.maxFrameRate
    else return prev
  }, 0)
}

export const Camera = ({route, navigation}) => {
  console.log("Camera");
  console.log(route)
  const [{ theme }] = useContext(ThemeContext);
  const camera = useRef(VisionCamera);
  const cameraPermi = usePermissionsAdnroid("CAMERA");
  const gpsPermi = usePermissionsAdnroid("ACCESS_FINE_LOCATION");
  const devices = useCameraDevices();
  const device = devices.back;
  const [loading, setLoading] = useState(false);
  const [flash, setFlash] = useState('off');

  useEffect(() => {
    if (gpsPermi.permissionState === false) NoPermissionsAlert("已拒絕存取位置權限", "請到設定更改位置權限");
    const backAction = async () => {
      route.params.reload();
      navigation.goBack();
    };
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );
  }, [])

  const format = useMemo(() => {
    return device?.formats.reduce((prev, curr) => {
      if (prev == null) return curr
      if (getMaxFps(curr) > getMaxFps(prev)) return curr
      else return prev
    }, undefined)
  }, [device?.formats])

  if (cameraPermi.permissionState) return (
    <>
      {device ?
        <View style={{flex:1}}>
          <VisionCamera
          enableZoomGesture  
          style={StyleSheet.absoluteFill}
          ref={camera}
          device={device}
          isActive={true}
          photo={true}
          format={format}
        />
          <TakePhotoBtn
            onPress={async () => { 
              setLoading(true);
              let temp = {};
              // if(gpsPermi.permissionState)
              // Geolocation.getCurrentPosition(
              //   (position) => {
              //     console.log(position)
              //     temp.timestamp = position.timestamp;
              //     temp.latitude = position.latitude;
              //     temp.longitude = position.longitude;
              //   },
              //   (error) => {
              //     console.log(error.code, error.message);
              //   },
              //   { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
              // );
              const photo = await camera.current.takePhoto({flash: flash}).then(async (res) => {
                let name = res.path.split('/');
                name = name[name.length - 1];
                await CameraRoll.save(`file://${res.path}`, { album: "KNOTS", type: "photo" });
                await CameraRoll.getPhotos({
                  first: 5,
                  groupTypes: "Album",
                  groupName: "KNOTS",
                  assetType: "Photos",
                  include: ['filename', 'fileSize', 'imageSize', 'location'],
                  // toTime:parseInt(moment(moment(res.metadata["{TIFF}"].DateTime, 'YYYY:MM:DD HH:mm:ss').format()).format("x"))
                }).then(async (e) => { 
                  let node = e.edges.find(x => x.node.image.filename == name);
                  console.log(node)
                  // node.location = {
                  //   latitude: temp.latitude??null,
                  //   longitude: temp.longitude??null
                  // } 
                  await addImageToGalleryAsynStorage(node);
                })
              })
              console.log(photo)                
              setLoading(false);
            }}
          />
          <FABGroup
            icon={"dots-vertical-circle"}
            color={"#ffffffb3"}
            fabStyle={{backgroundColor:"#ffffffb3"}}
            actions={
             [
              {
                icon: 'map-marker-radius',
                 onPress: async () => {
                   await gpsPermi.requestPermission();
                   if (gpsPermi.permissionState === false) NoPermissionsAlert("已拒絕存取位置權限", "請到設定更改位置權限");
                 }
              },
              {
                icon: flash == 'off' ? 'lightbulb-on' : 'lightbulb-off',
                onPress: async () => { setFlash(flash == 'off' ? 'on' : 'off'); }
              },
            ]
          } />
        </View>
        : <Loading />
      }
      { loading ? <Loading /> : null}
    </>
  )
  else if (!cameraPermi.permissionState) return <NoPermissions />
  else return (<Loading />)
}

export const LaunchCamera = () => { 
  const { permissions, launchCamera } = useLaunchCamera(null, async (res) => { 
    // console.log("LaunchCamera");
    // console.log(res);
    if (res.assets){
      let album = "KNOTS";
      for (let i of res.assets) {
        await CameraRoll.save(i.uri, { album: album, type: "photo" });
        let {edges} = await CameraRoll.getPhotos({
          first: 1,
          groupTypes: "Album",
          groupName: album,
          assetType: "Photos",
          include: ['filename', 'fileSize', 'imageSize', 'location'],
          toTime:parseInt(moment(i.timestamp).format("x"))
        })
        await addImageToGalleryAsynStorage(edges[0]);
        launchCamera();
      }
    }
  });
  useEffect(() => {
    launchCamera({quality:1});
  },[])
  return (
   <></>
  )
}

const styles = StyleSheet.create({
  takePhotoBtnStyle: {
    position: "absolute",
    bottom: "10%",
    alignSelf:"center",
  }
})