import React, { useState, useRef, useContext } from 'react';
import { StyleSheet, View } from 'react-native';
import { ModalButton } from '../modal/ModalButton';
import { FAB } from 'react-native-paper';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import TextInput from '../TextInput';
import ErrorMsg from '../ErrorMsg';
import Loading from '../Loading';
import { useNavigation } from '@react-navigation/native';
import { TaskUpdateUseMutation } from './TaskUseMutation'
import { InputModal } from '../modal/InputModal';
import { ThemeContext } from '../appContext/ThemeContext';

export const TaskDescriptionBtn = (props) => {
  const [{ theme }] = useContext(ThemeContext);
  const value = { description: props.description };
  const inputTextStyle = { ...styles.inputTextStyle, backgroundColor: theme.colors.secondary, borderColor: theme.colors.primary}
  const hasInputError = (name, value) => { 
    switch (true) { 
      case (name == "description" && value[0] == ' '):
        return "不能以空格開頭..."
      default:
        return false;
    }
  }
  
  return (
    <TaskUpdateUseMutation>
      <InputModal
        {...props}
        value={{description:props.description}}
        hasInputError={hasInputError}
        onCompleted={props.onCompleted}
        body={({value, setValue, inputError, hasInputError, setErrorMsg}) =>
        {
          return <View style={{ marginHorizontal: 10 }}>
            <TextInput
              textAlignVertical='top'
              multiline
              style={inputTextStyle}
              errorText={inputError.current ? inputError.current.description : null}
              name="description"
              title="任務描述"
              returnKeyType="next"
              value={value.description}
              autoCapitalize="none"
              width="100%"
              autoFocus={true}
              onChangeText={(name, text) => {
                hasInputError(name, text);
                setValue({ ...value, ...{ description: text } });
              }}
            />
          </View>
        }
      }
        title={"更改任務描述"}>
        <View pointerEvents="none" style={styles.textInputWrap}>
          <TextInput
            multiline
            titleWrapStyle={styles.titleWrapStyle}
            underlineColor="transparent" 
            textAlignVertical= "top"
            width="100%"
            style={inputTextStyle}
            titleStyle={styles.titleStyle}
            title="任務描述"
            returnKeyType="next"
            value={props.description}
            autoCapitalize="none"
            autoFocus={true}
            editable={false}
          />
        </View>
      </InputModal>
    </TaskUpdateUseMutation>  
  )
}

const styles = StyleSheet.create({
 ModalButton:
 {
   backgroundColor: "#1E90FF",
   position: "absolute",
   bottom: 30,
   right: 30,
   width: 50,
   height: 50,
   textAlign: "center",
   textAlignVertical: "center",
   borderRadius: 75,
   padding: 7,
   borderWidth: 0,
   zIndex:100,
   shadowColor: "#000",
   shadowOffset: {
     width: 0,
     height: 5,
   },
   shadowOpacity: 0.34,
   shadowRadius: 6.27,
   elevation: 10,
 },
 icon: {
  fontSize: 35,
  color: "white",
  textAlign: "center",
  textAlignVertical: "center",
  },
  inputTextStyle: {
    paddingTop:10,
    // borderWidth: 1,
    borderRadius: 5,
    fontSize: 14,
    textAlignVertical: 'top'
  }, 
  textInputWrap: {
    alignContent: "center",
    justifyContent: "center",
    marginHorizontal: 5,
  },
  titleWrapStyle: {
    left:10
  },
  titleStyle: {
    fontSize: 12
  }
});