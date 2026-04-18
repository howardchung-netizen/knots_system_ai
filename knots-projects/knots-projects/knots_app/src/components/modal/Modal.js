import React, {useContext} from 'react';
import { Modal as Modal_, StyleSheet, View, Text, ScrollView, Dimensions, KeyboardAvoidingView } from 'react-native';
import Button from '../button/Button';
import Loading from '../Loading';
import { ThemeContext } from '../appContext/ThemeContext'
import Container from '../Container';
import Pressable from 'react-native/Libraries/Components/Pressable/Pressable';
import scalesStyle, { scaledFontSize } from '../../utils/scalesStyle';

const window = Dimensions.get("window");
const screen = Dimensions.get("screen");

export const Modal = ({header, body, footer, ...props}) => {
  const [{ theme }] = useContext(ThemeContext)
  // console.log("Modal")
  const onBackgroundPress = (e) => {
    if(props.onBackgroundPress) props.onBackgroundPress();
  }
  return (
  <Modal_ {...props}>
    <KeyboardAvoidingView style={{flex:1}} behavior="padding">
    {props.loading ? <Loading/> : null} 
    <Pressable style={[styles.centeredView]} onPress={onBackgroundPress}>
      <Pressable style={[styles.modalView, { backgroundColor: theme.colors.accent }, props.viewStyle, { width: props.width ? props.width : "80%" }]}>
          {header ? header : <Text style={[styles.modalHeader, styles.modalHeaderText, {color:theme.colors.text}, props.modalHeaderTextStyle]}>{props.title}</Text>}
        {/* <ScrollView style={[styles.modalBody,{overflow:"hidden"}]}>{body}</ScrollView> */}
        {body}
        <View style={[styles.modalFooter]}>            
          {footer}
          {props.confirmButton ? <ConfirmButton onPress={props.onConfirmPress}/> : null}
          {props.closeButton ? <CloseButton onPress={props.onClosePress} /> : null}    
        </View>
      </Pressable>
    </Pressable>
    </KeyboardAvoidingView>
  </Modal_>)
}

export const ConfirmButton = (props) => {
  return (
    <View style={{marginHorizontal:10}}>
      <Button
        mode="contained"
        fontSize={12} 
        padding={1}
        onPress={props.onPress}
      >確定</Button>
    </View>
  )
}

export const CloseButton = (props) => {
  return (
    <View style={{marginHorizontal:10}}>
      <Button
        mode="outlined"
        fontSize={12}
        padding={1}
        onPress={props.onPress}
      >關閉</Button>
    </View>  
  )
}

export const HeaderModal = ({ header, ...props }) => {
  const [{ theme }] = useContext(ThemeContext)
  console.log("Modal")
  if (props.visible) return (
    <View style={[styles.headerModalContainerStyle, { backgroundColor: theme.colors.accent }, props.viewStyle, { width: props.width ? props.width : "100%" }]}>
      {header ? header : <Text style={[styles.modalHeader, styles.modalHeaderText, { color: theme.colors.text }, props.modalHeaderTextStyle]}>{props.title}</Text>}
    </View>)
  return <></>
}


const styles = StyleSheet.create(scalesStyle({
  centeredView: { 
   flex: 1,
   justifyContent: "center",
   alignItems: "center",
   marginTop: 0,
   backgroundColor: "#00000085",
  },
  modalView: {
   flexDirection: 'column',
   padding: 0,
   width: "100%",
   zIndex: 100,
  //  maxHeight: "95%",
  //  flex:1
  },
  modalHeader: {
   fontWeight: 'bold',
    padding: 10,
  },
  modalHeaderText: {
   fontSize: 15,
   fontWeight: "bold",
   textAlign:"center"
  },
  modalBody: {
    width: "100%",
    maxHeight: "75%",
    overflow:"hidden"
  },
  modalFooter: {
   flexDirection: 'row',
   justifyContent: 'flex-end',
   paddingTop: 15,
   paddingBottom: 15,
  },
  button: {
    fontSize: 15,
    marginHorizontal: 10,
  },
  headerModalContainer: {
    position: "absolute",
    bottom: 300,
    height:30
  }
 }));

