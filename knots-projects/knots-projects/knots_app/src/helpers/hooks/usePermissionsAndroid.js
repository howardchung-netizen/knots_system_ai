import * as React from 'react';
import { useState, useContext, useEffect, createRef, useCallback, useRef } from 'react'; 
import { AppState, PermissionsAndroid, Platform } from 'react-native';
export const usePermissionsAdnroid = (service) => {
 const event = Platform.OS === 'ios' ? 'focus' : 'change';
 const [permissionState, setPermissionState] = useState(null);
 const processing = useRef(false);


 async function requestPermission() {
  // console.log("requestPermission")
  const permission = PermissionsAndroid.PERMISSIONS[service];
  let status = await PermissionsAndroid.request(permission);
  setPermissionState(status === 'granted');
 }

 const _setPermissionState = async() => {
  // console.log("setPermissionState")
  processing.current = true;
  await requestPermission();
  processing.current = false;
  // console.log("processing", processing.current)
 }
 useEffect(() => {
  const subscription = AppState.addEventListener("change",async (nextAppState) => {
   if (nextAppState === "active" && processing.current === false) await _setPermissionState();
  });
  return () => {
   subscription.remove();
  };
 }, []);

 useEffect(() => {
  if (AppState.currentState === 'active') _setPermissionState();
 },[])

 return { permissionState, requestPermission }
}