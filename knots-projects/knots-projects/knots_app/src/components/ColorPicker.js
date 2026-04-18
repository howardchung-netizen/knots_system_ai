import React, { useState, useRef } from 'react'
import { View, Text, FlatList, StyleSheet, Dimensions, TouchableOpacity } from 'react-native'
import ColorPicker from 'react-native-wheel-color-picker'
import { ModalButton } from './modal/ModalButton';
import ErrorMsg from './ErrorMsg';
import { LabelShadow } from './Shadow';
import { TaskUpdateUseMutation} from '../components/tasks/TaskUseMutation'

const window = Dimensions.get('window');
const windowWidth = window.width;
const windowHeight = window.height;

const defaultPalette = [
  "#ff43f9",
  "#F44336",
  "#E91E63",
  "#9C27B0",
  "#673AB7",
  "#3F51B5",
  "#2196F3",
  "#03A9F4",
  "#00BCD4",
  "#009688",
  "#4CAF50",
  "#8BC34A",
  "#CDDC39",
  "#FFEB3B",
  "#FFC107",
  "#FF9800",
  "#FF5722",
  "#795548",
  "#9E9E9E",
  "#607D8B"
]

export const ColorPickerModal = ({color, onModalOpen, onConfirmPress, onColorChange, ...props }) => {
  // console.log("ColorPickerModalContainer", props)
  const modalButtonRef = useRef();
  const [errorMsg, setErrorMsg] = useState(null);
  const palette = props.Palette ?? defaultPalette;
  const [currentColor, setCurrentColor] = useState(color);
  const width = props.width ? { width: props.width } : null;
  const height = props.height ? { height: props.height } : null;
  const ColorSquare = ({ colorCode }) => {
    const color = { backgroundColor: colorCode };
    const shadow = currentColor == colorCode ? styles.currentColor : null;
    const onPress = () => {
      setCurrentColor(colorCode);
      if(onColorChange) modalButtonRef.current.setModalVisible(onColorChange(colorCode));
    };
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.85}>
        <View style={[styles.colorSquareStyle, color, shadow, width, height]}>
        </View>
      </TouchableOpacity>
    )
  }
  const _onConfirmPress = () => { onConfirmPress(currentColor); }
  const _onClosePress = () => setCurrentColor(color);
  return (<>
    <ModalButton
      modalButtonRef={(ref)=>modalButtonRef.current = ref}
      loading={null}
      title={props.title}
      width="90%"
      modalButtonStyle={props.modalButtonStyle}
      onModalOpen={onModalOpen}
      closeButton
      onClosePress={() => {setCurrentColor(color)}}
      body={
        <View style={{ marginHorizontal: 10 }}>
          <ErrorMsg text={errorMsg} />
          <FlatList
            columnWrapperStyle={{ justifyContent: 'space-between' }}
            numColumns={4}
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}
            data={palette}
            renderItem={({ item }) => {
              return <ColorSquare colorCode={item}
              />
            }}
            keyExtractor={(item, index) => index}
          />
        </View>
      }
    >
    {props.children}
    </ModalButton>
  </>)
}

const styles = StyleSheet.create({
  ButtonStyle: {
    width: 38,
    height: 38,
    // borderWidth: 4,
    marginTop:3,
    borderRadius: 5
  },
  colorSquareStyle: {
    width: windowWidth / 4 - 30,
    height: windowWidth / 4 - 30,
    margin: 5
  },
  currentColor: {
    width: windowWidth / 4 - 30,
    height: windowWidth / 4 - 30,
    borderWidth: 4,
    borderRadius: 5,
    borderColor: "#1a73e875"
  }
})
