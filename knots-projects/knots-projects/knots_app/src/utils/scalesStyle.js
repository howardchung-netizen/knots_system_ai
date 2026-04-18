import { PixelRatio, Dimensions } from "react-native";

const { width, height, fontScale } = Dimensions.get('window');
console.log(Dimensions.get('screen'))
// Use iPhone6 as base size which is 375 x 667
const baseWidth = 375;
const baseHeight = 667;
const dpi = PixelRatio.get() * 160;
const scaleWidth = width / baseWidth;
const scaleHeight = height / baseHeight;
const scale = Math.min(scaleWidth, scaleHeight);

export const scaledSize = (size) => {
  return size / PixelRatio.getFontScale() 
 };

export const scaledFontSize = (size) => {
  const newSize = size * scale / fontScale;
  return newSize
  if (Platform.OS === 'ios') {
   return Math.round(PixelRatio.roundToNearestPixel(newSize))
  } else {
   return Math.round(PixelRatio.roundToNearestPixel(newSize))
  }
 };

const scalesStyle = (style) => { 
 if (typeof style == 'string') return;   
 if (typeof style == 'number') return scaledFontSize(style);
 let _style = style;
 for (let e in _style) {
  try {
   let i = _style[e];
   if (i.fontSize) i.fontSize = scaledFontSize(i.fontSize);

  //  if (i.padding) i.padding = scaledPadding(i.padding, 667);
  //  if (i.paddingTop) i.paddingTop = scaledPadding(i.paddingTop);
  //  if (i.paddingBottom) i.paddingBottom = scaledPadding(i.paddingBottom, 667);
  //  if (i.paddingLeft) i.paddingLeft = scaledPadding(i.paddingLeft, 667);
  //  if (i.paddingRight) i.paddingRight = scaledPadding(i.paddingRight, 667);
  //  if (i.paddingHorizontal && typeof i.paddingHorizontal == 'number') i.paddingHorizontal = scaledPadding(i.paddingHorizontal, 667);
  //  if (i.paddingVertical && typeof i.paddingVertical == 'number') i.paddingVertical = scaledPadding(i.paddingVertical, 667);

  //  if (i.margin) i.margin = scaledPadding(i.margin, 667);
  //  if (i.marginTop) i.marginTop = scaledPadding(i.marginTop, 667);
  //  if (i.marginBottom) i.marginBottom = scaledPadding(i.marginBottom, 667);
  //  if (i.marginLeft) i.marginLeft = scaledPadding(i.marginLeft, 667);
  //  if (i.marginRight) i.marginRight = scaledPadding(i.marginRight, 667);
  //  if (i.marginHorizontal && typeof i.marginHorizontal == 'number') i.marginHorizontal = scaledPadding(i.marginHorizontal, 667);
  //  if (i.marginVertical && typeof i.marginVertical == 'number') i.marginVertical = marginVertical / fontScale;

   if (i.height && typeof i.height == 'number') i.height = (i.height);
   if (i.minHeight && typeof i.minHeight == 'number') i.minHeight = (i.minHeight);
   if (i.maxHeight && typeof i.maxHeight == 'number') i.maxHeight = (i.maxHeight);

   if (i.width && typeof i.width == 'number') i.width = (i.width);
   if (i.minWidth && typeof i.minWidth == 'number') i.minWidth = (i.minWidth);
   if (i.maxWidth && typeof i.maxWidth == 'number') i.maxWidth = (i.maxWidth);

   if (i.top) i.top = scaledFontSize(i.top);
   if (i.bottom) i.bottom = scaledFontSize(i.bottom);
   if (i.left) i.left = scaledFontSize(i.left);
   if (i.right) i.right = scaledFontSize(i.right);

  } catch (error) {
   console.log(error)
  }
 }

 return _style
} 

export default scalesStyle