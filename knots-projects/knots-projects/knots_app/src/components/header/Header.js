import React, { useContext } from 'react';
import { StyleSheet, View, PixelRatio} from 'react-native';
import { ThemeContext } from '../appContext/ThemeContext';
import { Appbar } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import scalesStyle from '../../utils/scalesStyle';
export const Header = React.forwardRef(({ goBackBtn, title, subtitle, style, shadow, children, ...porps }, ref) => {
  // console.log("Header")
  const [{ theme }] = useContext(ThemeContext);
  const navigation = useNavigation();
  const titleColor = theme.colors.primary;
  const subtitleColor = theme.colors.text;
  return (
    <>
      <Appbar.Header theme={theme} style={[styles.headerContainer, shadow ? styles.shadow : styles.noShadow, style,]}>
        {goBackBtn ? <Appbar.BackAction size={20} style={[styles.goBackBtnStyle]} color={theme.colors.text} onPress={() => { navigation.goBack() }} /> : null}
        {title || subtitle ?
        <View style={styles.titleContainerStyle}>
        <Appbar.Content
            style={styles.titleContainerStyle}
            titleStyle={[styles.titleStyle, { color: titleColor }]}
            title={title}
            subtitleStyle={[styles.subtitleStyle, { color: subtitleColor }]}
            subtitle={subtitle}
          />
        </View>
         : null}
        {children ?? null}
      </Appbar.Header>
    </>
  )
});

const styles = StyleSheet.create(scalesStyle({
  headerContainer: {
    zIndex:100000000,
    width: "100%",
    justifyContent: "flex-start",
    backgroundColor: "white",
    alignContent: "center",
    alignItems: "center",
    paddingRight: 10,
  },
  goBackBtnStyle:{
    padding:0,
    margin:4
  },
  titleContainerStyle:{
    alignItems:"flex-start",
    justifyContent:"center",
    alignContent:"center",
    flex:1
  },
  titleStyle: {
    fontWeight: "bold",
    textAlign:"left",
    alignSelf:"flex-start",
    fontSize: 20,
  },
  subtitleStyle: {
    textAlign:"left",
    alignSelf:"flex-start",
    fontSize:13
  },
  shadow: {
    shadowColor: "#000",
    shadowOffset:{
    width: 0,
    height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  noShadow: {
    shadowColor: null,
    shadowOffset:{
    width: 0,
    height: 0,
    },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  }
}
))