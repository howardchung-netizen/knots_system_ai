import React, { useState, createRef, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { ModalButton, ModalOnFocus } from './ModalButton';
import { FAB } from 'react-native-paper';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import TextInput from '../TextInput';
import ErrorMsg from '../ErrorMsg';
import Loading from '../Loading';
import { useNavigation } from '@react-navigation/native';

const variables = (val, id) => { 
  let data = val;
  // v[colnum] = val;
  // for (let i in colnum) v[colnum[i]] = val[i];
  if (id) data.id = id;
  return { data }
}

const InitInputError = (value) => {
  let v = {};
  for (let i in value) v[i] = false;
  return v
}

export const InputModal = (props) => {
  const mutate = props.mutate;
  const [value, setValue] = useState(props.value);
  const [errorMsg, setErrorMsg] = useState(null);
  const inputError = useRef(InitInputError(value));
  const [loading, setLoading] = useState(false);
  const hasInputError = (name, value) => { 
    if (props.hasInputError) inputError.current = { ...inputError.current, [name]: props.hasInputError(name, value) }
    console.log(inputError.current)
  }
 
  return (<>
    {loading ? <Loading/> :null}
    <ModalButton
      loading={null}
      title={props.title}
      width="90%"
      style={props.ModalButtonStyle}
      confirmButton
      onConfirmPress={async () => {
        // setLoading(true);
        let closeModal = false;
        if (Object.keys(value).find(e => inputError.current[e])) { setErrorMsg("提交失敗");}
        else {
          if (props.onConfirmPress) props.onConfirmPress(value);
          mutate({
          variables: variables(value, props.id),
          onCompleted: (res) => {
            console.log(res)
            if (props.onCompleted) props.onCompleted(res)
            closeModal = true;
            // setLoading(false);
          },
          onError: (err) => {
            console.log(err)
            if (props.onError) props.onError(err)
            // setLoading(false);
          }
        });}
        return true
      }}
      closeButton
      onClosePress={() => {
        setValue(props.value);
        inputError.current = false;
        setErrorMsg(null)
      }}
      body={props.body ?
        <>
          <ErrorMsg text={errorMsg} />
          {
            props.body({
              value: value,
              setValue: setValue,
              inputError: inputError,
              hasInputError: hasInputError,
              setErrorMsg: setErrorMsg
            })
          }
        </> : null}
    >
      {props.children}
    </ModalButton>
  </>)
}

