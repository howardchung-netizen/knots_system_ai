import React, { useState, useEffect, useCallback, useContext, useMemo, useRef, createContext } from 'react';
import { ThemeContext } from '../appContext/ThemeContext';
import { APPInfoContext } from '../appContext/AppContextProvider';
import { AppState, RefreshControl, Pressable, TouchableOpacity, StyleSheet, View, ScrollView, FlatList, Dimensions, PixelRatio, Platform } from 'react-native';
import { List as PaperList, Divider } from 'react-native-paper';
import { useFilter } from '../useFilter';
import { TaskUseQuery } from './TaskUseQuery';
import CenterView from '../CenterView';
import { TaskItem } from './TaskItem';
import { Header as HeaderComponent } from '../header/Header';
import { MenuButton } from '../MenuButton';
import { FilterButton } from '../FilterButton';
// import DraggableFlatList, { OpacityDecorator } from 'react-native-draggable-flatlist';
import { OnDragActive } from '../OnDragActive'
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { gql, useQuery, ApolloClient } from '@apollo/client';
import { taskQuery } from '../../helpers/GQL/query';
import { myTaskListFragment } from '../../helpers/GQL/fragment';
import { Searchbar } from '../SearchBar';
import { Text } from '../Text';
import { AddTaskFAB } from './TaskNameModal';
import { CheckBox } from '../CheckBox';
import Loading from '../Loading';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import moment from 'moment';
import { myTaskListFilterSetting } from '../../helpers/asyncStorage/appSettingAsynStorage';
import { UploadStateContext } from '../appContext/UploadStateContext';
import { scaledFontSize } from '../../utils/scalesStyle';

const window = Dimensions.get('window');
const windowWidth = window.width;
const windowHeight = window.height;
import { UserContext } from '../../components/appContext/UserContext';
export const TasksFilterContext = createContext({
  keyword: null,
  status: {
    DONE: true,
    TODO: true,
    APPROVED: true
  },
  init: false
});

export const Header = ({ items }) => {
  const [{ theme }] = useContext(ThemeContext);
  const [filterState, setFilterContext] = useContext(TasksFilterContext);
  const buttonColor = theme.colors.primary;
  const _items = items?.map(e => {
    let _item = JSON.parse(JSON.stringify(e));
    _item.onPress = () => {
      if (e.onPress) e.onPress();
    }
    return _item
  }) ?? []
  const [keyword, setKeyword] = useState(filterState.keyword);
  const [status, setStatus] = useState(filterState.status);
  const onFilterConfirmPress = async () => {
    setFilterContext({ ...filterState, keyword: keyword, status: status });
    await myTaskListFilterSetting({ ...filterState, keyword: null, status: status })
  }
  const onFilterClosePress = () => {
    setKeyword(filterState.keyword);
    setStatus(filterState.status);
  }
  const HeaderMenu = () => {
      let items = [
        {
          title: "新增區段",
          onPress: async () => {
          },
          style: { position: "relative" },
          contentStyle: { position: "relative" },
          titleStyle: { color: theme.colors.titleText, padding: 0, margin: 0, position: "relative" }
        }
      ];
      return <MenuButton
        contentStyle={{ backgroundColor: theme.colors.accent, padding: 0, borderRadius: 0}}
        button={<FontAwesome5 style={{ marginHorizontal: 12, marginLeft: 20 }} size={20} color={theme.colors.primary} name="ellipsis-v" />}
        items={items} />
  }
  return (
    <HeaderComponent
      title="我的任務">
      <FilterButton filterContext={TasksFilterContext}
        onConfirmPress={onFilterConfirmPress}
        onClosePress={onFilterClosePress}
        body={<>
          <View style={{ marginHorizontal: 10}}>
            <Searchbar value={keyword} onChangeText={text => { setKeyword(text) }} placeholder="任務..." style={{ margin: 3 }} />
            <PaperList.Section>
              <PaperList.Subheader style={{ color: theme.colors.text, margin: 0, fontSize: scaledFontSize(15) }}>任務狀態</PaperList.Subheader>
              <PaperList.Item titleStyle={{ color: theme.colors.titleText, fontSize: scaledFontSize(18) }} styles={[styles.item]} title="未完成" right={() =>
                <CheckBox status={status.TODO} onPress={() => { setStatus({ ...status, ...{ TODO: !status.TODO } }) }} />
              } />
              <PaperList.Item titleStyle={{ color: theme.colors.titleText, fontSize: scaledFontSize(18) }} styles={[styles.item]} title="已完成" right={() =>
                <CheckBox status={status.DONE} onPress={() => { setStatus({ ...status, ...{ DONE: !status.DONE } }) }} />
              } />
              <PaperList.Item titleStyle={{ color: theme.colors.titleText, fontSize: scaledFontSize(18) }} styles={[styles.item]} title="已確認" right={() =>
                <CheckBox status={status.APPROVED} onPress={() => { setStatus({ ...status, ...{ APPROVED: !status.APPROVED } }) }} />
              } />
            </PaperList.Section>
          </View>
        </>} />
      {/* <HeaderMenu/> */}
    </HeaderComponent>
  )
}  

export const MyTaskList = () => {
  // console.log("TaskList");
  const [filterContext, setFilterContext] = useFilter(TasksFilterContext);
  const InitLoading = () => {
    const [uploadStateContext, uploadStateContextDispatch] = useContext(UploadStateContext);
    useEffect(() => { 
      if(!uploadStateContext.inited) 
      uploadStateContextDispatch({
        type: "SET_INITED",
        payload: true,
      })
    }, [])
    if (uploadStateContext.inited) return <></>
    else return <Loading style={{ backgroundColor: "white" }} />
  }
  
  useEffect(() => {
    (async () => {
      let setting = await myTaskListFilterSetting();
      setFilterContext({...filterContext, ...setting});
    })()
  }, [])

  if(!filterContext.init) return <></>
  return (
    <TasksFilterContext.Provider value={[filterContext, setFilterContext]}>
      <InitLoading/>
      <Header />
      <Divider />
      <TaskUseQuery query={taskQuery} fragment={myTaskListFragment}>
      <TaskListContainer/>
      </TaskUseQuery>
    </TasksFilterContext.Provider>
  )
}

export const TaskAccordionItem = (props) => {
  // console.log("TaskAccordionItem");
  const [{ theme }] = useContext(ThemeContext);
  const titlestyle = {color: theme.colors.primary, borderBottomWidth: 2, borderColor: theme.colors.primary,};
  const backgroundColor = { backgroundColor: theme.colors.accent }
  const accordionContainer = { ...styles.accordionContainer, width: "100%" };
  const [expanded, setExpanded] = useState(true);
  const onPress = () => setExpanded(!expanded);
  const Icon = () => {
    return <View style={{ flexDirection: "row" }}>
      <FontAwesome5 color={"black"} size={25} name={expanded ? "caret-up" : "caret-down"} />
    </View>
  }

  return (
    <>
      <TouchableOpacity onPress={onPress}>
        <View style={[accordionContainer, backgroundColor]}>
          <View style={[styles.accordionItemtitleStyle, titlestyle]}>
            <Text style={{ fontWeight: "bold", textAlign:"justify" }} color={theme.colors.primary} size={23}>未指派</Text>
            <Icon />
          </View>
          <AddTaskFAB {...props}>
            <FontAwesome5 color={theme.colors.accent} style={[styles.addTaskBtn, { backgroundColor: theme.colors.primary}]} size={20} name="plus" />
          </AddTaskFAB>
        </View>
      </TouchableOpacity>
      { !expanded ? <></> :<>{props.children}</> }
    </>
  )
}

export const TaskListContainer = ({ data, refetch }) => {
  // console.log('TaskListContainer');
  const [{user}] = useContext(UserContext);
  if(!user) return <></>
  const [{ theme }] = useContext(ThemeContext);
  const navigation = useNavigation();
  const isFirstLoad = useRef(true);
  const [tasksFilterContext, setTasksFilterContext] = useContext(TasksFilterContext);
  const [{ tasklistColumns }] = useContext(APPInfoContext);
  const [sortBy, setSortBy] = useState("dueDate");//tasksFilterContext.sortBy
  const [orderBy, setOrderBy] = useState("ASC");//tasksFilterContext.orderBy
  const filter = (data) => { 
    let temp = [...data];
    // console.log(data)
    // temp.unshift({ node: { code: "未指派", id: 0 } });
    // console.log(temp)
    return temp.filter(e => {
      let { keyword, status } = tasksFilterContext;
      return (keyword ? e.node.name.includes(keyword) : true)
             && (((status.TODO && e.node.status == "TODO")
             || (status.DONE && e.node.status == "DONE"))
             || ((status.APPROVED && e.node.status == "APPROVED")))
             && (e.node.createdBy.username == user.username
                || e.node.assignedStaff.find(e=> e.staff.username == user.username)
                || e.node.assignedContact.find(e=> e.contact.contactName == user.username))
             
    }).sort(function (x, y) {
      // console.log(x.node.createdAt, parseInt(moment(x.node.createdAt).format("x")))
      return parseInt(moment(y.node.createdAt).format("X")) - parseInt(moment(x.node.createdAt).format("X")) ;
    }).sort(function (x, y) {
      let priority = {
        HIGH:2,
        MEDIUM:1,
        LOW:0
      }
      if(!x.node.priority && !y.node.priority) return 0
      else if (x.node.priority && !y.node.priority) return -1
      else if (!x.node.priority && y.node.priority) return 1
      else return parseInt(priority[y.node.priority] - priority[x.node.priority]);
    }).sort(function (x, y) {
      if(!x.node.dueDate && !y.node.dueDate) return 0
      else if (x.node.dueDate && !y.node.dueDate) return -1
      else if (!x.node.dueDate && y.node.dueDate) return 1
      else return parseInt(moment(x.node.dueDate).format("X")) - parseInt(moment(y.node.dueDate).format("X"));
    }).sort(function (x, y) {
      if(!x.node[sortBy] && !y.node[sortBy]) return 0
      else if (x.node[sortBy] && !y.node[sortBy]) return -1
      else if (!x.node[sortBy] && y.node[sortBy]) return 1
      else if(sortBy == "name") {
          let nameA = x.node[sortBy].toUpperCase(), nameB = y.node[sortBy].toUpperCase();
          if (nameA < nameB) return orderBy == "ASC" ? -1: 1;
          if (nameA > nameB) return orderBy == "ASC" ? 1: -1;
          return 0;
      } else if (sortBy == "dueDate") {
        if(!x.node.dueDate && !y.node.dueDate) return 0
        else if (x.node.dueDate && !y.node.dueDate) return orderBy == "ASC" ? -1: 1;
        else if (!x.node.dueDate && y.node.dueDate) return orderBy != "ASC" ? -1: 1;
        else if(orderBy == "ASC") return parseInt(moment(x.node.dueDate).format("X")) - parseInt(moment(y.node.dueDate).format("X"));
        else if (orderBy == "DESC") return parseInt(moment(y.node.dueDate).format("X")) - parseInt(moment(x.node.dueDate).format("X"));
      } else if (sortBy == "priority") {
        let priority = {
          HIGH:2,
          MEDIUM:1,
          LOW:0
        }
        if(!x.node.priority && !y.node.priority) return 0
        else if (x.node.priority && !y.node.priority) return orderBy == "ASC" ? -1: 1;
        else if (!x.node.priority && y.node.priority) return orderBy != "ASC" ? -1: 1;
        else return orderBy == "ASC" ? parseInt(priority[x.node.priority] - priority[y.node.priority]) :
                    parseInt(priority[y.node.priority] - priority[x.node.priority]);
      }
    })

  }
  const [refreshing, setRefreshing] = useState(false);
  const backgroundColor = { backgroundColor: theme.colors.accent }
  const Columns = () => {
    const columns = [
      { name: "名稱", style: [styles.columnWrap, { width: tasklistColumns.name.width}], column: "name" },
      { name: "狀態", style: [styles.columnWrap, { width: tasklistColumns.status.width, alignItems: 'center' },], column: "status"},
      { name: "結束", style: [styles.columnWrap, { width: tasklistColumns.dueDate.width, alignItems: 'center' },], column: "dueDate"},
      { name: "優先度", style: [styles.columnWrap, { width: tasklistColumns.priority.width, alignItems: 'center' },], column: "priority"}
    ];
    const onPress = async (name) => {
      if(name == "status") return;
      let _orderBy;
      if(sortBy != name || !orderBy)_orderBy = "ASC";
      else _orderBy = orderBy == "ASC" ? "DESC" : "ASC";
      setOrderBy(_orderBy);
      setSortBy(name);
      // let newSetting = {...tasksFilterContext, ...{sortBy:name, orderBy: _orderBy}};
      // setTasksFilterContext(newSetting);
      // await myTaskListFilterSetting(newSetting);
    }
    return (
      <View style={[styles.columnsContainer, backgroundColor]}>
        {columns.map(({ name, style, column }) =>
          <Pressable style={style} key={name} onPress={()=>{onPress(column)}}>
            <Text size={13} color={theme.colors.text}>{name}</Text>
            {
              sortBy == column ? <FontAwesome5 style={styles.sortIcon} color={"black"} size={15} name={orderBy == "ASC" ? "sort-amount-down-alt" : "sort-amount-up"} /> :null
            }
          </Pressable>
        )}
      </View>
    )
  }
  useEffect(() => { 
    if(refetch) navigation.setParams({refetchTaskList:()=>{}})
    isFirstLoad.current = false;
  },[])
  useFocusEffect(()=>{
     if(!isFirstLoad.current) refetch();
  });
  return (
    <>
      <View style={[backgroundColor, { flex: 1 }]}>
          <FlatList
            refreshControl={
                <RefreshControl
                  refreshing={false}
                  onRefresh={() => {
                    console.log("refetch");
                    refetch()
                    // setRefreshing(!refreshing)
                  }}
                />}
            contentContainerStyle={[backgroundColor, { flexGrow: 1, backgroundColor: "white", paddingHorizontal: 5, width: "100%", paddingTop: 5 }]}
            ListEmptyComponent={<CenterView style={{ width: "100%" }}><Text>沒有資料</Text></CenterView>}
            ListHeaderComponent={<Columns />}
            showsVerticalScrollIndicator={true}
            data={filter(data.tasks.edges)}
            keyExtractor={(item, index) => item.node.id}
            renderItem={(e) => { return <TaskItem {...e.item.node} /> }}
          />
      </View>
    </>
  )
}

const styles = StyleSheet.create({
  screen: {
    marginTop: 24,
    flex: 1,
    backgroundColor: '#212121',
  },
  item: {
    backgroundColor: 'white',
    marginTop: 10,
    padding: 20,
    marginHorizontal: 10,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  columnsContainer: {
    width: "100%",
    padding: 0,
    margin: 0,
    flexDirection: "row",
    alignContent: "center",
    alignItems: "center",
  },
  columnWrap: {
    paddingHorizontal: 7,
    height: "100%",
  },
  accordionItemtitleStyle: {
    fontWeight: "bold",
    padding: 5,
    flexGrow: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    marginRight: 10
  },
  accordionContainer: {
    paddingBottom: 5,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignContent:"center",
    alignItems: "center",
    justifyContent:"space-between"
  },
  addTaskBtn: {
    borderRadius: 5,
    paddingVertical: 5,
    paddingHorizontal: 7,
    overflow:'hidden',
    shadowColor: "#000",
    shadowOffset:{
    width: 0,
    height: 1,
    },
    shadowOpacity: 0.20,
    shadowRadius: 1.41,
    elevation: 2,
  },
  sortIcon:{
    position:"absolute",
    justifyContent: 'center',
    alignItems: 'center',
    right: 3,
  }
});

