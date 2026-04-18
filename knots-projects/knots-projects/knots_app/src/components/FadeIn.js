import React, { useEffect, useRef } from "react";
import { Animated } from 'react-native';

export default function (props) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: props.duration ? props.duration : 1000,
      useNativeDriver: true
    }).start();
  }, []);
  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
      }}
    >
      {props.children}
    </Animated.View>
  );
}