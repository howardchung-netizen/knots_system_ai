
import React, { useContext, useState, useRef, useEffect, createRef} from 'react'
import { StyleSheet, ActivityIndicator, View, TouchableOpacity } from 'react-native'
import { shadow } from 'react-native-paper';
import { color } from 'react-native-reanimated'
import CenterView from '../components/CenterView'
import { ThemeContext } from './appContext/ThemeContext';
import { Text } from './Text';
import FontAwesome5Icon from 'react-native-vector-icons/FontAwesome5';
export const LoadingWithContent = React.forwardRef((props, ref) => {
 const [{ theme }] = useContext(ThemeContext);
 const [visible, setVisible] = useState(false);
 const [title, setTitle] = useState(null);
 const [status, setStatus] = useState(null);
 const [content, setContent] = useState(null);
 const CloseButtonRef = createRef();
 const onClosePress = () => { 
  setVisible(false)
 }
  if (ref) ref({
    setVisible: (visible) => { setVisible(visible) },
    setTitle: (title) => { setTitle(title) },
    setStatus: (status) => { setStatus(status) },
    setContent: (content) => { setContent(content) },
    onClosePress: (cb) => {
      if (cb) cb();
      onClosePress();
    }
  });
  const CloseButton = React.forwardRef((props, ref) => (
    <TouchableOpacity ref={ref} style={styles.closeBtn} onPress={onClosePress}>
      <FontAwesome5Icon  size={20} color={theme.colors.text} name="times" solid />
    </TouchableOpacity>
  ));
  const backgroundColor = { backgroundColor: title || content ? theme.colors.accent : null
};
  
 if(visible)
 return (
   <CenterView style={styles.loadingContainer}>
     <View style={[backgroundColor, styles.loading, title || content ? styles.shadow : null]}>
       {/* <CloseButton ref={CloseButtonRef}/> */}
       {title ? <Text color={theme.colors.text} size={15}>{title}</Text> : null}
       <View style={[styles.content, {justifyContent: content ? 'space-between' : 'center'}]}>
         {
           status == "loading" ? <ActivityIndicator size="large" /> :
             <FontAwesome5Icon style={{ marginLeft: 0 }} size={30} color={"green"} name="check-circle" solid />
         }
         {content ? <Text style={{ textAlign: "right", fontWeight:"bold" }} color={theme.colors.titleText} size={18}>{content}</Text> : null}
       </View>
     </View>
   </CenterView>
  )
 return <></>
})
const styles = StyleSheet.create({
  loadingContainer: {
  position: "absolute",
  backgroundColor: "#bbbbbb99",
  zIndex: 999999999999,
  top: 0,
  bottom: 0,
  left: 0,
  right: 0,
 },
 closeBtn: {
  position: "absolute",
  right: 10,
  top:5
 },
 loading: {
  width:"50%",
  padding: 5,
  borderRadius: 5,
  alignContent: "center",
  alignItems: "center",
 },
 content: {
  flexDirection: "row",
  width:"100%",
  padding: 10,
  borderRadius: 10,
  alignContent: "center",
  alignItems: "center",
 },
 shadow: {
  shadowColor: "#000",
  shadowOffset:{
  width: 0,
  height: 3,
  },
  shadowOpacity: 0.29,
  shadowRadius: 4.65,
  elevation: 7,
 }
})
