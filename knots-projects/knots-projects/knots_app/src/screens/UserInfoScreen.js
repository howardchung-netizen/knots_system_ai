import React, { useContext, useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity, ScrollView } from 'react-native';
import CenterView from '../components/CenterView';
import Button from '../components/button/Button';
import { logout } from '../helpers/asyncStorage/userAsyncStorage';
import { UserContext } from '../components/appContext/UserContext';
import { ThemeContext } from '../components/appContext/ThemeContext';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { AvatarItem } from '../components/AvatarItem';
import { Text } from '../components/Text';
import { Divider, List } from 'react-native-paper';
import { APPInfoContext } from '../components/appContext/AppContextProvider';

const label = (name) => {
  let label = name.split(' ');
  if (label.length < 2) label = label[0][0];
  else label = label[0][0] + label[1][0];
  label = label.toUpperCase();
  return label
}

const signOut = async () => {
  try {
    await GoogleSignin.revokeAccess();
    await GoogleSignin.signOut();
  } catch (error) {
  }
};
export default function ({ navigation, route }) {
  const [userContext, userContextDispatch] = useContext(UserContext);
  const [appInfoContext] = useContext(APPInfoContext);
  const { user } = userContext;
  const [{ theme }] = useContext(ThemeContext);
  const sectionTitle = { color: theme.colors.titleText, fontWeight:"bold" };
  const itemTitle = { color: theme.colors.Text }
  console.log(userContext)
  const [expanded, setExpanded] = React.useState(true);

  const handlePress = () => setExpanded(!expanded);
  // useEffect(() => {
  //  if (!appContext.isLogedin)
  //  navigation.reset({
  //   index: 0,
  //   routes: [{ name: 'LoginScreen' }],
  //  })
  // })
  const goBack = async () => { 
    navigation.goBack();
  }
  return (
    <>
      <ScrollView>
        <CenterView style={{ flex: 1, padding: 8 }}>
          {/* <AvatarItem size={100} label={label(user.username)} labelColor={"#FE77D7"} color="white" /> */}
          <View style={[styles.infoContainer]}>
            <List.Section title="帳號" style={{ margin: 0 }} titleStyle={[sectionTitle]}>
              <List.Item title={user.username} titleStyle={[itemTitle]}/>
              <List.Item title={user.nameCht} titleStyle={[itemTitle]}/>
              <List.Item title={user.nameEn} titleStyle={[itemTitle]}/>
            </List.Section>
            <Divider />
            <List.Section title="角色" style={{ margin: 0 }} titleStyle={[sectionTitle]}>
              {/* <View style={{ flexDirection: "row", alignSelf: "stretch" }}>
                <Text color={theme.colors.text} style={{ textAlign: "center", width: "30%" }}></Text>
                <Text color={theme.colors.text} style={{ textAlign: "center", width: "70%" }}>權限</Text>
              </View> */}
              {user.roles.map(e => (
                <>
                  <Divider />
                  <View style={{ flexDirection: "row", alignSelf: "stretch", paddingHorizontal:15, paddingVertical:5 }}>
                    <View style={{ width: "30%" }}>
                      <Text color={theme.colors.text}>{e.name}</Text>
                    </View>
                    <View style={{ alignItems: "center", width: "70%", flexDirection: "row", flexWrap: 'wrap' }}>
                     {
                        e.permissions.map(x => (
                          <View style={{ padding: 3, backgroundColor: theme.colors.secondary, borderRadius: 5, marginRight: 5, marginBottom: 5 }}>
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
                </>
              ))}
            </List.Section>
            <Divider />
            <TouchableOpacity style={{ width: "100%", padding: 5, backgroundColor:theme.colors.secondary }} onPress={goBack}>
              <Text
                style={{ fontWeight: "bold", textAlign: "center" }}
                color={theme.colors.primary}
                size={22}>反回
              </Text>
          </TouchableOpacity>
            <Divider />
          </View>
        </CenterView>
      </ScrollView>
    </>
  )
}

const styles = StyleSheet.create({
  infoContainer: {
    marginTop:10,
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
  }
});
