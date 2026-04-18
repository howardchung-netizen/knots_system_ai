import { createContext, useContext, useLayoutEffect, useReducer, useState } from "react";
import ImageViewer from 'react-simple-image-viewer';
import ConfirmModal from "../components/ConfirmModal";


export const ModalContext = createContext({
  open: false,
  title: null,
  content: null,
  mode: null,
  onConfirm: ()=>{},
  onClose: ()=>{}
});

export const ModalContextProvider = ({ children }) => {

  const [myConfirmModalOpen, setMyConfirmModalOpen] = useState({
    open: false,
    title: null,
    content: null,
    mode: null,
    onConfirm: ()=>{},
    onClose: ()=>{}
  });

    const handleMyConfirmModalOpen = (title, content, mode, onConfirm) => setMyConfirmModalOpen({
      open: true,
      title: title,
      content: content,
      onConfirm: onConfirm,
      mode: mode,
      onClose: handleMyConfirmModalClose
    });
  
    const handleMyConfirmModalClose = () => setMyConfirmModalOpen({
      open: false,
      title: null,
      content: null,
      onConfirm: ()=>{},
      onClose: handleMyConfirmModalClose
    });
    
    return (
      <ModalContext.Provider value={[myConfirmModalOpen, handleMyConfirmModalOpen, handleMyConfirmModalClose]}>
        <ConfirmModal
          mode={myConfirmModalOpen.mode}
          open={myConfirmModalOpen.open}
          title={myConfirmModalOpen.title}
          content={myConfirmModalOpen.content}
          onCloseClick={myConfirmModalOpen.onClose}
          onConfirmClick={() => {
            if (myConfirmModalOpen.onConfirm) myConfirmModalOpen.onConfirm();
            handleMyConfirmModalClose();
          }}
        />
        {children}
      </ModalContext.Provider>
    );
};
