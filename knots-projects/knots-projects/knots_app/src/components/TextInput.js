import React, { useState, useContext, useEffect, useRef } from 'react';
import { View, StyleSheet, Text, Pressable, Keyboard ,TouchableOpacity} from 'react-native';
import { TextInput,  HelperText } from 'react-native-paper';
import { ThemeContext } from './appContext/ThemeContext';
import { useNavigation } from '@react-navigation/native';

export default ({ title, name, onChangeText, label, labelStyle, width, textColor, ...props }) => {
  const [themeContext] = useContext(ThemeContext);
  const theme = { ...themeContext.theme, colors: { text: textColor??themeContext.theme.colors.text } };
  const titleWrapStyle = {
    backgroundColor: themeContext.theme.colors.primary,
    borderColor: themeContext.theme.colors.primary, ...props.titleWrapStyle
  }
  const titleStyle = {
    color: themeContext.theme.colors.accent,
    backgroundColor: themeContext.theme.colors.primary, ...props.titleStyle
  }
  const _textColor = props.textColor ? props.textColor : theme.colors.text;
  const [errorText, setErrorText] = useState(null);
  useEffect(() => {
    setErrorText(props.errorText);
  })
  // console.log("TextInput", props.value);
  return (
    <>
      <View style={[styles.TextInputWrap, { width: width ? width : "80%" }, !title ? {marginTop:0}:null]}>
        <Pressable onPress={props.onPress}>
          {title ? <View style={[styles.titleWrapStyle, titleWrapStyle]}><Text style={[styles.titleStyle, titleStyle]}>{title}</Text></View> : null}
          <TextInput
            numberOfLines={1}
            autoCorrect={true}
            ref={props.inputRef}
            {...props}
            outlineColor={themeContext.theme.colors.accent}
            theme={theme}
            style={[{ width: props.width ? props.width : "100%", textAlign: 'auto'},
            { backgroundColor: themeContext.theme.colors.accent }, {...props.style}, ]}
            onChangeText={async (text) => {
              if (onChangeText) var hasErrorText = await onChangeText(name, text)
              if (hasErrorText) setErrorText(hasErrorText)
              else (setErrorText(hasErrorText))
            }}
            error={errorText}
          />
          {errorText ? <HelperText type="error" visible={errorText}>{errorText}</HelperText> : null}
        </Pressable>
      </View>
    </>
  )
}

export const InputWithErrorChecking = ({ children }) => {
  const navigation = useNavigation();
  const inputRef = useRef(null);
  const inputErrorText = useRef(null);
  const [{ theme }] = useContext(ThemeContext);
  const [currentValue, setCurrentValue] = useState(children.props.value);
  const hasInputError = children.props.hasInputError;
  const onChangeText = (name, text) => {
    inputErrorText.current = hasInputError(text);
    setCurrentValue(text);
    navigation.setOptions({inputValue:text, hasInputError:inputErrorText.current})
  }

  const cancel = ()=> {
    setCurrentValue(children.props.value);
    inputErrorText.current = null;
    Keyboard.dismiss();
  }
  const _onFocus = () => { 
    navigation.setOptions(
      {
        inputRef: inputRef,
        cancel: cancel,
        inputValue:currentValue
      }
    )
    if(children.props.onFocus) children.props.onFocus()
  }
  const _onBlur = () => {
    if (inputErrorText.current) { setCurrentValue(children.props.value); inputErrorText.current = null }
    else if (children.props.onBlur) {
      let clear = children.props.onBlur(currentValue);
      if (clear) setCurrentValue(null);
    }
  }
  const onSubmitEditing = () => { 
    if (inputErrorText.current) return;
    if (children.props.onSubmitEditing) {
      let clear = children.props.onSubmitEditing(currentValue);
      if (clear) setCurrentValue(null);
    }
    else setCurrentValue(null);
  }
  useEffect(() => {
    const hideSubscription = Keyboard.addListener("keyboardDidHide", () => {
      if (children.props.onKeyboardDidHide) children.props.onKeyboardDidHide();
    });
    return () => {
      hideSubscription.remove();
    }
  })
  return (
    <>
      {React.cloneElement(children, {
        errorText:inputErrorText.current,
        textColor:theme.colors.primary,
        style:children.props.style,
        errorText: inputErrorText.current,
        value: currentValue,
        inputRef: inputRef,
        onChangeText:onChangeText,
        onFocus:_onFocus,
        onBlur: _onBlur,
        onSubmitEditing:onSubmitEditing
      })}
  </>
  )
}

const styles = StyleSheet.create({
  TextInputWrap: {
    position: "relative",
    marginTop: 15,
  },
  titleWrapStyle: {
    borderRadius: 5,
    borderWidth: 1,
    position: "absolute",
    padding: 3,
    zIndex: 1,
    left: 15,
    top: -10,
  },
  titleStyle: {
    fontSize: 15,
    fontWeight: "bold",
    zIndex: 1
  }
})






