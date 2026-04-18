import { createContext, useContext, useLayoutEffect, useReducer } from "react";
import ImageViewer from 'react-simple-image-viewer';


export const ImageViewerContext = createContext({
 isOpen: false,
 src: [],
 currentIndex:0,
 disableScroll:false,
 closeOnClickOutside:true
});

const ImageViewerContextReducer = (state, action) => {
  switch (action.type) {
    case 'OPEN':
      return { ...state, ...{ isOpen: true }, ...action.payload }
    case 'CLOSE':
      return { ...state, isOpen: false, currentIndex: 0 }
    case 'CUERRENT_INDEX':
      return { ...state, currentIndex: action.payload }  
  }
}

export const ImageViewerContextProvider = ({ children }) => {
    const [context, dispatch] = useReducer(ImageViewerContextReducer, useContext(ImageViewerContext));
    const closeImageViewer = () => {
        dispatch({type: "CLOSE"});
    };
    
    return (
      <ImageViewerContext.Provider value={[context, dispatch]}>
        {context.isOpen && (
          <ImageViewer
            backgroundStyle={{ zIndex: 999999, position: 'absolute', height: '100%', width: '100%' }}
            src={context.src}
            currentIndex={context.currentIndex}
            disableScroll={context.disableScroll}
            closeOnClickOutside={context.closeOnClickOutside}
            onClose={closeImageViewer}
          />
        )}
        {children}
      </ImageViewerContext.Provider>
    );
};
