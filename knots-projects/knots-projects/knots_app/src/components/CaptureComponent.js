import React, { createRef, useCallback, useEffect, useRef, useState } from "react";
import { View, Image, Dimensions, Text, ScrollView } from 'react-native';
import { set } from "react-native-reanimated";
import ViewShot, { captureRef } from "react-native-view-shot";
import promiseAll from "../helpers/promiseAll";
import Button from "./button/Button";
import CenterView from "./CenterView";
import Loading from "./Loading";
const window = Dimensions.get('window');
const windowWidth = window.width;
const windowHeight = window.height;

export const useMultiCapture = () => {
  // console.log("useMultiCapture")
  const [multiCaptureState, setMultiCaptureState] = useState("init")
  const startToCapture = (state = "start") => {
    setMultiCaptureState(state);
  }
  return {
    startToCapture, multiCaptureState
  };
}

export const CaptureMultiView = React.forwardRef(({ ratio, view, onCapture }, ref) => {
  // console.log("CaptureMultiViewlist", list)
  const [state, setStatus] = useState(null);
  const [list, setList] = useState([]);
  const viewShotRef = useRef([]);

  const startToCapture = async (list, cb) => {
    setList(list);
    setStatus('start');
    // viewShotRef.current = list.map(e => createRef());
    setTimeout(async () => {
      let result = [];
      // console.log("viewShotRef.current before promiseAll", viewShotRef.current);
      const chunkSize = 10;
      for (let index = 0; index < list.length; index += chunkSize) {
        let chunkRef = viewShotRef.current.slice(index, index + chunkSize);
        let chunkList = list.slice(index, index + chunkSize);
        await promiseAll(chunkList.map((e, i) => {
          // console.log("chunkRef[i]", chunkRef[i])
          return captureRef(chunkRef[i], {
            format: "jpg",
            quality: 1,
            height: e.image.height * ratio ?? 1,
            width: e.image.width * ratio ?? 1
          }).then(
            uri => { return { ...e, cache: uri } },
            error => console.error("Oops, snapshot failed", error)
          )
        }), (res) => {
          result = result.concat(res);
        })
      }
      setList([]);
      viewShotRef.current = [];
      setStatus('finish');
      if (cb) cb(result);
    }, 1000)
  }
  useEffect(() => { 
    if (ref) ref({
      startToCapture: startToCapture,
    })
  }, [])
  useEffect(() => {
    // if (state == 'start')
    //   setTimeout(async () => {
    //   let result = [];
    //   // console.log("ref.current before promiseAll", ref.current);
    //    const chunkSize = 1;
    //    for (let index = 0; index < list.length; index += chunkSize) {
    //      let chunkRef = ref.current.slice(index, index + chunkSize);
    //      let chunkList = list.slice(index, index + chunkSize);
    //      await promiseAll(chunkList.map((e, i) => {
    //       console.log("chunkList", e, i)
    //        return captureRef(chunkRef[i], {
    //          format: "jpg",
    //          quality: 1,
    //          height: e.image.height * ratio ?? 1,
    //          width: e.image.width * ratio ?? 1
    //        }).then(
    //          uri => { return { ...e, cache: uri } },
    //          error => console.error("Oops, snapshot failed", error)
    //        )
    //      }), (res) => {
    //        result = result.concat(res);
    //      })
    //    }
    //    ref.current = [];
    //    startToCapture('finish');
    //    if (onCapture) onCapture(result);
    // }, 500)
  })  
  if (state == 'start')
  return (
    <>
      {
        list?.map((e, i) =>
        <View style={{position:"absolute", top: windowHeight, left: 0, right: 0, bottom: 0, height: windowHeight, width: windowWidth, zIndex: -1 }} key={i.toString()}>
            <ScrollView key={i}>
             <ScrollView horizontal={true}>
                <ViewShot ref={(ele) => { viewShotRef.current[i] = ele }}>
                  {view(list[i])}
              </ViewShot>
             </ScrollView>
            </ScrollView>
        </View>
        )
      }
    </>
  )
  else return <></>
})

