import { Dimensions } from 'react-native';
export const scalesImageOnScreen = (imageH, imageW, ratio = 1,) => {
 const Screen = Dimensions.get("screen");
 const ScreenWidth = Screen.width;
 const ScreenHeight = Screen.height;
 let scaleHeight = ScreenHeight;
 let scaleWidth = ScreenWidth;
 if(imageH > imageW) {
   ratio = scaleHeight / imageH;
   scaleWidth = imageW * ratio
 }
 else if(imageH < imageW) {
   ratio = scaleWidth / imageW;
   scaleHeight = imageH * ratio
 }
 return { scaleHeight: parseInt(scaleHeight), scaleWidth: parseInt(scaleWidth) }
}