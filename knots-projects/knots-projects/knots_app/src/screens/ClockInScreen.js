import * as React from 'react';
import { AppState } from "react-native";
import { useState, useContext, useEffect, useCallback, useRef, useMemo, useReducer, createContext, createRef } from 'react'; 
import { ThemeContext } from '../components/appContext/ThemeContext';
import { UserContext } from '../components/appContext/UserContext';
import { TouchableOpacity, StyleSheet, View, Dimensions, Alert, RefreshControl, FlatList, ActivityIndicator, Platform, Pressable } from 'react-native';
import { Header as HeaderComponent } from '../components/header/Header';
import { FilterButton } from '../components/FilterButton';
import Button from '../components/button/Button';
import Loading from '../components/Loading'
import CenterView from '../components/CenterView';
import { Divider } from 'react-native-paper';
import { Text } from '../components/Text';
import { ListColumn } from '../components/ListColumns';
import { useFilter } from '../components/useFilter';
import { gql, useQuery, useApolloClient } from '@apollo/client';
import { GET_APP_SETTINGS, projectQuery } from '../helpers/GQL/query';
import { Searchbar } from '../components/SearchBar';
import { ModalButton } from '../components/modal/ModalButton';
import { theme } from '../core/theme';
import QRCode from 'react-native-qrcode-svg';
import base64 from 'react-native-base64';
import moment from 'moment';
import scalesStyle from '../utils/scalesStyle';
import Geolocation from 'react-native-geolocation-service';
import { createClockInLocationMutation } from '../helpers/GQL/mutation';
import proj4 from '../helpers/proj4/proj4';
import { AlertError } from '../components/AlertError';
import { appSettingFragment, pageInfoFragment } from '../helpers/GQL/fragment';
import { APPInfoContext } from '../components/appContext/AppContextProvider';

proj4.defs("EPSG:2326","+proj=tmerc +lat_0=22.31213333333334 +lon_0=114.1785555555556 +k=1 +x_0=836694.05 +y_0=819069.8 +ellps=intl +towgs84=-162.619,-276.959,-161.764,0.067753,-2.24365,-1.15883,-1.09425 +units=m +no_defs");
proj4.defs("EPSG:4326", "+proj=longlat +datum=WGS84 +no_defs");

const window = Dimensions.get('window');
const windowWidth = window.width;
const windowHeight = window.height;

function nonce(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

const getAddressformLocation = async (longitude , latitude) => {
  console.log("getAddressformLocation", longitude, latitude)
  const [easting, northing] = proj4('EPSG:4326', 'EPSG:2326', [longitude, latitude]);
  // console.log(easting, northing)
  return await fetch(
    `https://www.map.gov.hk/gih-ws2/identify/${easting}/${northing}/1/WEB`
  ).then(async (response) => {
    let r = await response.json();
    console.log(`${r[0].addressInfo[0].caddress??''}${r[0].addressInfo[0].cname??''}`)
    return `${r[0].addressInfo[0].caddress??''}${r[0].addressInfo[0].cname??''}`;
  }).catch((err) => {console.log(err); return'';})
}

function init(album) {
  return album;
}

export const ProjectsUseQuery = React.memo((props) => { 
//  console.log("ProjectsUseQuery")
 const { loading, error, data, refetch } = useQuery(gql`${projectQuery}`, {
  // fetchPolicy: "no-cache",   // Used for first execution
  // nextFetchPolicy: "no-cache", // Used for subsequent executions
 })
 if (loading) return <Loading/>
 if (error) return <CenterView><Text>載入失敗:{error.message}</Text></CenterView>
 if (data) return React.cloneElement(props.children, { data: data, refetch: () => { console.log("ProjectsUseQuery refetch"); refetch(); }  })
})

export const Header = ({ items }) => {
  const [{ theme }] = useContext(ThemeContext);
  const [filterState, setState] = useContext(ProjectFilterContext);
  const buttonColor = theme.colors.primary;
  const _items = items?.map(e => {
    let _item = JSON.parse(JSON.stringify(e));
    _item.onPress = () => {
      if (e.onPress) e.onPress();
    }
    return _item
  })??[]
  const [keyword, setKeyword] = useState(filterState.keyword);
  const onFilterConfirmPress = async () => {
    setState({ ...filterState, keyword: keyword });
  }

  return (
    <HeaderComponent title="打卡" goBackBtn>
      <FilterButton filterContext={ProjectFilterContext}
        onConfirmPress={onFilterConfirmPress}
        onClosePress={() => setKeyword(filterState.keyword)}
        body={<>
        <View style={{ marginHorizontal: 10 }}>
          <Searchbar value={keyword} onChangeText={text => { setKeyword(text)}} placeholder="專案..." style={{ margin: 3 }}/>
          {/* <PaperList.Section>
            <PaperList.Subheader>任務狀態</PaperList.Subheader>
            <PaperList.Item styles={[styles.item]} title="未完成" right={() =>
              <Pressable onPress={() => { setStatus({ ...status, ...{ TODO: !status.TODO } }) }}>
                <PaperList.Icon color={iconColor(status.TODO)} icon="checkbox-marked" />
              </Pressable>
            } />
            <PaperList.Item styles={[styles.item]} title="已完成" right={() =>
              <Pressable onPress={() => { setStatus({ ...status, ...{ DONE: !status.DONE } }) }}>
                <PaperList.Icon color={iconColor(status.DONE)} icon="checkbox-marked" />
              </Pressable>
            } />
          </PaperList.Section> */}
        </View>
      </>} />
    </HeaderComponent>
  )
}  

export const Columns = (backgroundColor) => {
  const columns = [
    { name: "專案", style: [styles.column1]}
  ]
  return (
    <>
      <ListColumn
        columns={columns}
        backgroundColor={backgroundColor}
      />
    </>
  )
}

export const List =async ({ list, renderItem, loadMore, hasNext, children }) => {
  const [loading, setLoading] = useState(false);
  const [scrollEnabled, setScrollEnabled] = useState(true);
  const _loadMore = () => { };
  const _renderItem = useCallback((p, index) => { return (renderItem(p, index)) }, []);
  const _keyExtractor = useCallback((p, index) => index);
  const _getItemLayout = useCallback((data, index) => ({ length: styles.ImageContainerStyle.height, offset: styles.ImageContainerStyle.height * index, index }), []);
  return (
    <>
      {loading?<Loading/>:null}
      <FlatList
        ListEmptyComponent={() => <ActivityIndicator color={"blue"}/>}
        windowSize={50}
        getItemLayout={_getItemLayout}
        contentContainerStyle={{ alignSelf: 'flex-start' }}
        numColumns={2}
        onEndReached={_loadMore}
        scrollEnabled={scrollEnabled}
        data={list}
        renderItem={_renderItem}
        keyExtractor={_keyExtractor}
        ListFooterComponent={hasNext ? <Button onPress={loadMore}>更多</Button> : null}
      >
      </FlatList>
    </>
  )
}

export const ProjectFilterContext = createContext({
  keyword: null,
  status: {
    synced: true,
    synchronizing: true,
    unsynced: true
  },
});

export default (props) => {
  // console.log("ProjectGalleryList")
  const value = useFilter(ProjectFilterContext);
  return (
    <>
      <ProjectFilterContext.Provider value={value}>
        <ProjectsUseQuery >
          <ProjectGalleryListContainer />
        </ProjectsUseQuery>
      </ProjectFilterContext.Provider>
    </>
  )
}

export const ProjectGalleryListContainer = ({ data, refetch }) => {
    const [projectFilterContext] = useContext(ProjectFilterContext);
    const [{user}] = useContext(UserContext);
    const [{ theme }] = useContext(ThemeContext);
    const [appInfoContext, appInfoContextDispatch] = useContext(APPInfoContext);
    const [smsNumber, setSmsNumber] = useState(appInfoContext.smsNumber)
    const client = useApolloClient()
    const [refreshing, setRefreshing] = useState(false);
    const [sortBy, setSortBy] = useState("dueDate");
    const [orderBy, setOrderBy] = useState("ASC");
    const filter = (data) => {
        // console.log(data);
        let { keyword, status } = projectFilterContext;
        return data.filter(e => {
            return (keyword ? e.node.code.includes(keyword) : true)
        }).sort((x, y) => {
            let nameA = x.node.code.toUpperCase(), nameB = y.node.code.toUpperCase();
            if (nameA < nameB) return -1;
            if (nameA > nameB) return 1;
            return 0;
        })
    }
    const [mode, setMode] = useState('whatsapp');
    const [codeData, setCodeData] = useState(null)
    const [location, setLocation] = useState();
    const [locationCreatedAt, setLocationCreatedAt] = useState(Date.now())

    const updateCodeData = async (location) => {
      console.log({
        qrCodeCreatedAt: moment(new Date()).format(),
        nonce: nonce(5),
        locationId: location
      })
      setCodeData(
        {
          qrCodeCreatedAt: moment(new Date()).format(),
          nonce: nonce(5),
          locationId: location
        }
      )
    }

    const createLoation = (projectId) => {
      console.log(projectId)
      setRefreshing(true);
      Geolocation.getCurrentPosition(
        async (position) => {
          await client.mutate({
            mutation: gql`${createClockInLocationMutation}`,
            variables: {
              data: {
                projectId: projectId,
                staffId: user.id,
                lat: position.coords.latitude,
                lon: position.coords.longitude,
                address: await getAddressformLocation(position.coords.longitude, position.coords.latitude)
              }
            },
          }).then(res => {
            console.log(res)
            setLocation(res.data.createClockInLocation.clockInLocation.id)
            updateCodeData(res.data.createClockInLocation.clockInLocation.id)
            setRefreshing(false);
          }).catch(err => {
             AlertError('操作失敗','請重新再試一次')
             setRefreshing(false);
             })
        },
        (error) => {
          // See error code charts below.
          // console.log("Geolocation error", error.code, error.message);
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 10000 }
      );
    }

    const genQRString = () => {
        let code = base64.encode(JSON.stringify(codeData));
        if(mode == "sms") return `SMSTO:${smsNumber}:員工打卡Clock in:`+code;
        else return encodeURI("https://wa.me/85264433800?text=員工打卡Clock in:"+code);
    }

    const QRCodeContainer = useCallback(({location})=>{
      if(refreshing) return <Loading/>    
      return (
            <CenterView style={{padding: 20, flex: null}}>
            <QRCode logoMargin={windowWidth} size={250} value={genQRString()}/>
            <Button onPress={()=>updateCodeData(location)}>更新</Button>
            <Text>{moment(codeData?.qrCodeCreactedAt).format('YYYY-MM-DD hh:mm:ss')}</Text>
            </CenterView>
            )
        
    }, [codeData, mode, refreshing, smsNumber])

    useEffect(() => {

      (async ()=>{
       await client.query(
          {
            query: gql`${GET_APP_SETTINGS} ${pageInfoFragment} ${appSettingFragment}`,
            fetchPolicy:"no-cache",
            variables: {
              query: `key:'clockInSmsPhone'`,
            }
          }
        ).then(res => {
          const currencyCodes = res.data?.appSettings ? res.data?.appSettings?.edges?.[0]?.node?.value : appInfoContext.smsNumer;
          setSmsNumber(currencyCodes)
        }).catch(err => AlertError(err))
  
      })()
      const subscription = AppState.addEventListener("change", nextAppState => {
       let now = Date.now();
       console.log(now - locationCreatedAt)
       if(nextAppState == 'active' && now - locationCreatedAt > 3600000) {

        setLocationCreatedAt(now);
        if(location) createLoation();
       }
      });
  
      return () => {
        subscription.remove();
      };
    }, []);
    
    const projects = useMemo(() => data.projects.edges, [data.projects.edges]);
    if (projects.length > 0)
        return (
            <>
                { refreshing ? <Loading/> : null }
                <Header />
                <Divider />
                <View style={[styles.imageGalleryContainerStyle, { backgroundColor: theme.colors.accent }]}>
                    <Columns backgroundColor={theme.colors.accent} />
                    <FlatList
                        refreshControl={
                            <RefreshControl
                                onRefresh={async () => {
                                    setRefreshing(true);
                                    refetch();
                                    setRefreshing(false);
                                }}
                            />}
                        numColumns={1}
                        data={filter(data.projects.edges)}
                        contentContainerStyle={{ flexGrow: 1, alignItems: "center" }}
                        ListEmptyComponent={<View style={{ flex: 1 }}><CenterView><Text>沒有資料</Text></CenterView></View>}
                        renderItem={({ item, index }) => {
                            return (
                                <ModalButton
                                    // modalButtonRef={(ref) => modalButtonRef.current = ref}
                                    onModalOpen={ ()=>{ createLoation(item.node.id)}}
                                    closeButton
                                    header={
                                        <View style={styles.modalHeader}>
                                            <TouchableOpacity style={[styles.clockInOption, mode == 'whatsapp' ? { backgroundColor: theme.colors.accent } : null]}
                                             onPress={() => {
                                                setMode('whatsapp')
                                                updateCodeData(location)
                                                }}>
                                                <Text
                                                    style={{ fontWeight: mode == 'whatsapp' ? 'bold' : null}}
                                                    size={15}
                                                    color={mode == 'whatsapp' ? theme.colors.primary : theme.colors.accent }
                                                >What'sApp</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity style={[styles.clockInOption, mode == 'sms' ? { backgroundColor: theme.colors.accent } : null]}
                                             onPress={() => {
                                                setMode('sms')
                                                updateCodeData(location)
                                                }}>
                                                <Text 
                                                style={{ fontWeight: mode == 'sms' ? 'bold' : null }}
                                                size={15} 
                                                color={mode == 'sms' ? theme.colors.primary : theme.colors.accent }
                                                >SMS</Text>
                                            </TouchableOpacity>
                                        </View>
                                    }
                                    body={<>
                                        <QRCodeContainer location={location}/>
                                    </>}
                                >
                                    <View style={styles.itemContainer} >
                                        <View style={[styles.column1]}><Text numberOfLines={1} style={{ fontWeight: "bold" }} color={theme.colors.titleText}>{item.node.code}</Text></View>
                                    </View>
                                </ModalButton>
                            )
                        }}
                        keyExtractor={(item, index) => item.node.id}>
                    </FlatList>
                </View>
            </>
        )
    return <></>
}

const styles = StyleSheet.create(scalesStyle({
  imageGalleryContainerStyle: {
    flex: 1,
    zIndex: 100,
    backgroundColor:"white",
    paddingTop:5,
    paddingHorizontal: 5 
  },
  itemContainer: {
    width:"100%",
    padding: 0,
    margin: 0,
    flexDirection: "row",
    justifyContent: "center",
    alignContent: "center",
    alignItems: "center",
    marginBottom: 5,
    height: 40,
    paddingHorizontal:12,
    backgroundColor: theme.default.colors.secondary
  },
  columnContainer: {
    width:"100%",
    paddingHorizontal: 10,
    flexDirection: "row",
    justifyContent: "center",
    alignContent: "center",
    alignItems: "center",
    height: 20
  },
  column1: {
    width: "100%",
    paddingHorizontal: 5,
    margin: 2,
    height: "100%",
    justifyContent: "center",
  },
  sortIcon:{
    position:"absolute",
    justifyContent: 'center',
    alignItems: 'center',
    right: 3,
  },
  snycButton: {
    borderRadius: 20,
    padding: 5,
    paddingHorizontal:8
  },
  imageViewFooterWrap: {
    position:"absolute",
    bottom: 0,
    height: windowHeight,
    width: windowWidth,
    zIndex: 100,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalHeader:{
    flexDirection: 'row',
  },
  clockInOption: {
    width: '50%',
    alignItems: 'center',
    justifyContent: 'center',
    alignContent: 'center',
    padding: 15,
    backgroundColor: theme.default.colors.primary
  }
}))