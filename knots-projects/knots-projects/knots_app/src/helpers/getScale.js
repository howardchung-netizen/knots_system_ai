import { PixelRatio} from 'react-native';

export const getFontScale = (size) => size * PixelRatio.getFontScale()
