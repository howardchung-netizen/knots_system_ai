import { DefaultTheme, configureFonts } from 'react-native-paper';
const fontConfig = {
  web: {
    regular: {
      fontFamily: 'sans-serif',
      fontWeight: 'normal',
    },
    medium: {
      fontFamily: 'sans-serif-medium',
      fontWeight: 'normal',
    },
    light: {
      fontFamily: 'sans-serif-light',
      fontWeight: 'normal',
    },
    thin: {
      fontFamily: 'sans-serif-thin',
      fontWeight: 'normal',
    },
  },
  ios: {
    regular: {
      fontFamily: 'System',
      fontWeight: '400',
    },
    medium: {
      fontFamily: 'System',
      fontWeight: '500',
    },
    light: {
      fontFamily: 'System',
      fontWeight: '300',
    },
    thin: {
      fontFamily: 'System',
      fontWeight: '100',
    },
  },
  android: {
    regular: {
      fontFamily: 'sans-serif',
      fontWeight: 'normal',
    },
    medium: {
      fontFamily: 'sans-serif-medium',
      fontWeight: 'normal',
    },
    light: {
      fontFamily: 'sans-serif-light',
      fontWeight: 'normal',
    },
    thin: {
      fontFamily: 'sans-serif-thin',
      fontWeight: 'normal',
    },
  }
};
export const theme = {
  default: {
    ...DefaultTheme,
    roundness: 5,
    colors: {
      ...DefaultTheme.colors,
      primary: '#323594',
      secondary: '#f4f4f4',
      accent: '#ffffff',
      text: '#7b7b7b',
      titleText: '#2f2f2f',
      desc: '',
      // background: 'black',
      // surface: 'red',
      // disabled: 'yellow',
      // backdrop: 'black',
      // onSurface : 'blue',
      inputTextBackground: '#ffffff',
      avatarItemBackgroundColor: '#ffffff',
      itemBackgroundColor: '#ffffff',
      checkedColor: '#1E90FF'
    },
    fonts: configureFonts(fontConfig)
  },
  dark: {
    ...DefaultTheme,
    roundness: 2,
    colors: {
      ...DefaultTheme.colors,
      primary: '#ffffff',
      accent: '#1E90FF',
      textColor: '#ffffff'
    },
    fonts: configureFonts(fontConfig)
  }
}