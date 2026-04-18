import React from 'react';
import ImagePicker from 'react-native-image-crop-picker';
import promiseAll from '../promiseAll';
import * as RNFS from 'react-native-fs';
import { PermissionsAndroid, Platform, } from 'react-native';
import { PERMISSIONS, request } from'react-native-permissions';
async function requestPermission(service) {
  // console.log("requestPermission")
  const permission = PERMISSIONS[Platform.OS.toUpperCase()][service];
  let status = await request(permission);
  // console.log(service, status)
  return status === 'granted' || status === 'limited';
}

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

export const useLaunchCamera = () => {
  // console.log("useLaunchCamera");
  let storage = {
    ios:"PHOTO_LIBRARY",
    android:"WRITE_EXTERNAL_STORAGE"
  };
  let location = {
    ios:"LOCATION_WHEN_IN_USE",
    android:"ACCESS_FINE_LOCATION"
  };
  
  const _launchCamera = async (options, cb) => {
    if (await requestPermission("CAMERA") === false) {
      throw {
        permissions: "CAMERA",
        message: "請到設定更改相機權限"
      }
    }
  
    if (await requestPermission(storage[Platform.OS]) === false) {
      throw {
        permissions: "WRITE_EXTERNAL_STORAGE",
        message: "請到設定更改存取檔案權限"
      }
    }
  
    await requestPermission(location[Platform.OS]);
    let _options = {
        mediaType: "photo",
        includeExtra: true,
        saveToPhotos: false,
        includeBase64: false
        , ...options}
    await ImagePicker.openCamera(_options).then(res => {
      if (cb) cb(res);
    }).catch(err => {
      console.log(err)
      if (cb) cb(null);
    })
  }
  const _launchImageLibrary = async (options, cb) => {
    if (await requestPermission(storage[Platform.OS]) === false) {
      throw {
        permissions: "WRITE_EXTERNAL_STORAGE",
        message: "請到設定更改存取檔案權限"
      }
    }
    let _options = {
      ...{
        mediaType: "photo",
      },
      ...options,
    }
    if(Platform.OS == "ios")_options.maxFiles = 20
    ImagePicker.openPicker(_options).then(res => {
      if(cb) cb(res)
    });
  }
  const _cleanTempFiles = async (assets, cb) => { 
    await promiseAll(assets.map(e => RNFS.unlink(e.path).then(() => {
      // console.log(e.path + " removed");
    }).catch(e => { })
    ), () => { if (cb) cb() })
    // await ImagePicker.clean().then(() => {
    //     console.log("removed");
    //   }).catch(e => {});
  }
 return { launchCamera: _launchCamera, launchImageLibrary: _launchImageLibrary, cleanTempFiles: _cleanTempFiles}
}
