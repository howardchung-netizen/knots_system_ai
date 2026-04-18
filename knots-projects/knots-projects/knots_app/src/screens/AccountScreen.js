import React, { useContext, useEffect, useRef } from 'react';
import { StyleSheet, View, TouchableOpacity, PixelRatio, Platform, Alert} from 'react-native';
import CenterView from '../components/CenterView';
import Button from '../components/button/Button';
import { logout } from '../helpers/asyncStorage/userAsyncStorage';
import { UserContext } from '../components/appContext/UserContext';
import { ThemeContext } from '../components/appContext/ThemeContext';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { AvatarItem } from '../components/AvatarItem';
import { Text } from '../components/Text';
import { Divider, List } from 'react-native-paper';
import { ScrollView } from 'react-native-gesture-handler';
import { APPInfoContext } from '../components/appContext/AppContextProvider';
import { appleAuth } from '@invertase/react-native-apple-authentication';
import { ModalButton } from '../components/modal/ModalButton';
import Icon from 'react-native-vector-icons/FontAwesome';
import { theme } from '../core/theme';
import scalesStyle, { scaledFontSize } from '../utils/scalesStyle';
import { PERMISSIONS, request } from'react-native-permissions';
import { NoPermissionsAlert } from '../components/NoPermissions';
import { deleteAccountMutation } from '../helpers/GQL/mutation';
import { gql, useApolloClient } from '@apollo/client';
import { AlertError } from '../components/AlertError';

async function requestPermission(service) {
  // console.log("requestPermission")
  const permission = PERMISSIONS[Platform.OS.toUpperCase()][service];
  let status = await request(permission);
  console.log(service, status)
  return status === 'granted' || status === 'limited';
}

const label = (name) => {
  let label = name.split(' ');
  if (label.length < 2) label = label[0][0];
  else label = label[0][0] + label[1][0];
  label = label.toUpperCase();
  return label
}

const signOut = async () => {
  try {
    await GoogleSignin.signOut();
    await GoogleSignin.revokeAccess();
  } catch (error) {
    console.log(error)
  }
  try {
    if(Platform.OS == 'ios') await appleAuth.revokeAccess();
  } catch (error) {
    
  }
};
export default function ({ navigation }) {
  // console.log("Account")
  const [userContext, userContextDispatch] = useContext(UserContext);
  const [appInfoContext] = useContext(APPInfoContext);
  const { user } = userContext;
  const [{ theme }] = useContext(ThemeContext);
  const sectionTitle = { color: theme.colors.titleText, fontWeight:"bold", fontSize: scaledFontSize(19) };
  const itemTitle = { color: theme.colors.text, fontSize: scaledFontSize(18)};
  const modalButtonRef = useRef();
  const client = useApolloClient();
  // console.log(userContext)
  const [expanded, setExpanded] = React.useState(true);

  const handlePress = () => setExpanded(!expanded);
  // useEffect(() => {
  //  if (!appContext.isLogedin)
  //  navigation.reset({
  //   index: 0,
  //   routes: [{ name: 'LoginScreen' }],
  //  })
  // })
  const onLogoutPress =  () => { 
     logout(async () => {
      await signOut();
      userContextDispatch({ type: "LOGOUT" })
      navigation.reset({
        index: 0,
        routes: [{ name: 'LoginScreen' }],
      })
    })
  }
  const onClockInPress = async (mode) => {
    let location = {
      ios:"LOCATION_WHEN_IN_USE",
      android:"ACCESS_FINE_LOCATION"
    };
    if (await requestPermission(location[Platform.OS]) === false) {
      NoPermissionsAlert('存取位置權限不足', "請到設定更改存取位置權限")
      return
    }
    else navigation.navigate('ClokInScreen')
  }
  const onDeleteAccountClick = () =>{
    Alert.alert("刪除帳戶", "刪除帳戶後，將無法復原。", [
      {
        text: "取消"
      },
      {
        text: "刪除",
        onPress: async () => {
          await client.mutate({
            mutation: gql`${deleteAccountMutation}`,
          }).then(res => {
            console.log(res)
            if(res.data.deleteAccount) onLogoutPress();
            else AlertError("刪除失敗", "請重新再試一次")
          }).catch(err => AlertError(err));
        }
      },
    ])
  }
  if(user)
  return (
    <View style={{justifyContent:"space-between", padding: 7,flex:1}}>
      <ScrollView style={{height:200}}>
        <CenterView>
          {/* <AvatarItem size={100} label={label(user.username)} labelColor={"#FE77D7"} color="white" /> */}
          <View style={[styles.infoContainer]}>
            <List.Section title="帳號" style={{ margin: 0 }} titleStyle={[sectionTitle]}>
              <List.Item title={user?.username} titleStyle={[itemTitle]}/>
              <List.Item title={user?.nameCht} titleStyle={[itemTitle]}/>
              <List.Item title={user?.nameEn} titleStyle={[itemTitle]} />
              {user.email ? <List.Item title={user?.email} titleStyle={[itemTitle]} /> : null}
            </List.Section>
            <Divider />
            {
              user.roles?.length > 0 ? <List.Section title="角色" style={{ margin: 0 }} titleStyle={[sectionTitle]}>
              {/* <View style={{ flexDirection: "row", alignSelf: "stretch" }}>
                <Text color={theme.colors.text} style={{ textAlign: "center", width: "30%" }}></Text>
                <Text color={theme.colors.text} style={{ textAlign: "center", width: "70%" }}>權限</Text>
              </View> */}
              {user.roles.map((e, i) => (
                <View style={{width:"100%"}} key={i}>
                  <Divider />
                  <View style={{ flexDirection: "row", alignSelf: "stretch", paddingHorizontal:15, paddingVertical:5 }}>
                    <View style={{ width: "30%" }}>
                      <Text color={theme.colors.text}>{e.name}</Text>
                    </View>
                    <View style={{ alignItems: "center", width: "70%", flexDirection: "row", flexWrap: 'wrap' }}>
                     {
                        e.permissions.map((x, i)=> (
                          <View key={i} style={{ padding: 3, backgroundColor: theme.colors.secondary, borderRadius: 5, marginRight: 5, marginBottom: 5 }}>
                            <Text style={{ fontWeight: "bold" }} size={13} color={theme.colors.text}>{x.name}</Text>
                          </View>
                        ))
                      }
                      {/* {
                        e.permissions.map(x => x.actions.map(z => (
                          <View style={{ padding: 3, backgroundColor: theme.colors.secondary, borderRadius: 5, marginRight: 5, marginBottom: 5 }}>
                            <Text style={{ fontWeight: "bold" }} size={13} color={theme.colors.text}>{z}</Text>
                          </View>
                        )
                        ))
                      } */}
                    </View>
                  </View>
                </View>
              ))}
            </List.Section> : null
            }
            <Divider />
            <List.Section title="系統版本" style={{ margin: 0 }} titleStyle={[sectionTitle]}>
              <List.Item title={`${appInfoContext.version}`} titleStyle={[itemTitle]}/>
            </List.Section>
            <Divider />
          </View>
        </CenterView>
      </ScrollView>
      <TouchableOpacity style={{ width: "100%", padding: 5, height: 40, backgroundColor: theme.colors.accent, marginTop: 10 }} onPress={onClockInPress}>
          <Text
            style={{ fontWeight: "bold", textAlign: "center" }}
            color={theme.colors.primary}
            size={20}>打卡
          </Text>
      </TouchableOpacity>
      {
        appleAuth.isSupported && Platform.OS == 'ios' && appInfoContext.isReviewing ?
          <TouchableOpacity style={{ width: "100%", padding: 5, height: 40, backgroundColor: theme.colors.accent, marginTop: 10 }} onPress={onDeleteAccountClick}>
            <Text
              style={{ fontWeight: "bold", textAlign: "center" }}
              color={"red"}
              size={20}>刪除帳戶
            </Text>
          </TouchableOpacity>
          : null
      }
      <TouchableOpacity style={{ width: "100%", padding: 5, height: 40, backgroundColor:theme.colors.accent, marginTop:10 }} onPress={onLogoutPress}>
              <Text
                style={{ fontWeight: "bold", textAlign: "center" }}
                color={theme.colors.primary}
                size={20}>登出
              </Text>
        </TouchableOpacity>
    </View>
    )
  return <></>
}

const styles = StyleSheet.create({
  infoContainer: {
    backgroundColor:"white",
    width:"100%",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.18,
    shadowRadius: 1.00,
    elevation: 1,
  },
   clockInOption: {
    flexDirection: 'row',
    alignItems: 'center',
    alignContent: 'center',
    justifyContent: 'center',
    backgroundColor: theme.default.colors.secondary,
    marginVertical: 5,
    padding: 12
  }
});
