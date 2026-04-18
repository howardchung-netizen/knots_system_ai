import React, { useContext, useEffect, useState } from 'react';
import { TouchableOpacity, Keyboard } from 'react-native';
import { ThemeContext } from '../appContext/ThemeContext';
import { Modal, HeaderModal } from '../modal/Modal';

export const ModalButton = (props) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [{ theme }] = useContext(ThemeContext);
  const backgroundColor = null;
  const _onModalOpen = () => {
    Keyboard.dismiss();
    if (props.onModalOpen) props.onModalOpen();
    setModalVisible(true);
  }
  if(props.modalButtonRef) props.modalButtonRef(
    {
      setModalVisible:setModalVisible
    }
  )
  return (
    <>
      <Modal
        loading={props.loading}
        title={props.title}
        width={props.width}
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        header={props.header}
        body={props.body}
        footer={props.footer}
        onBackgroundPress={()=>{
          if (props.onClosePress) props.onClosePress();
          if (props.onRequestClose) props.onRequestClose();
          setModalVisible(false);
        }}
        onModalOpen={props.onModalOpen}
        confirmButton={props.confirmButton}
        onConfirmPress={async () => {
          if (props.onConfirmPress) setModalVisible(!await props.onConfirmPress());
          if (props.onConfirmclose) setModalVisible(false);
        }}
        closeButton={props.closeButton}
        onClosePress={() => {
          if (props.onClosePress) props.onClosePress();
          setModalVisible(false);
        }}
        onRequestClose={() => {
          if (props.onClosePress) props.onClosePress();
          if (props.onRequestClose) props.onRequestClose();
          setModalVisible(false);
        }}
      />
      <TouchableOpacity style={[props.modalButtonStyle]} activeOpacity={0.85} onPress={_onModalOpen}>
        {props.children}
      </TouchableOpacity>
    </>
  )
}

export const ModalOnFocus = (props) => {
 const [{ theme }] = useContext(ThemeContext);
 return (
  <>
  <HeaderModal
    loading={props.loading}
    title={props.title}
    width={props.width}
    animationType="fade"
    transparent={true}
    visible={props.modalVisible}
    header={props.header}
    confirmButton={props.confirmButton}
    onConfirmPress={async () => {
     if (props.onConfirmPress) await props.onConfirmPress();
    }}
    closeButton={props.closeButton}
    onClosePress={() => {
     if(props.onClosePress) props.onClosePress();
    }}
    onRequestClose={() => {
     if(props.onClosePress) props.onClosePress();
     if (props.onRequestClose) props.onRequestClose();
    }}
   />
    {props.children}
  </>
 )
}

