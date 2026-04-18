import React, { useState, useEffect, useCallback, useContext, useMemo, useRef, createContext } from 'react';
import { ThemeContext } from '../appContext/ThemeContext';
import { APPInfoContext } from '../appContext/AppContextProvider';
import { RefreshControl, Pressable, Modal, TouchableOpacity, StyleSheet, View, ScrollView, FlatList, Alert, SafeAreaView, Dimensions, PixelRatio, Platform } from 'react-native';
import { List as PaperList, Divider } from 'react-native-paper';
import { useFilter } from '../useFilter';
import CenterView from '../CenterView';
import Content from '../header/Content';
import { TaskItem } from './TaskItem';
import { Header as HeaderComponent} from '../header/Header';
import { FilterButton } from '../FilterButton';
// import DraggableFlatList, { OpacityDecorator } from 'react-native-draggable-flatlist';
import { OnDragActive } from '../OnDragActive'
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { gql, useQuery, ApolloClient, useApolloClient } from '@apollo/client';
import { taskQuery, projectQuery } from '../../helpers/GQL/query';
import { taskListFragment } from '../../helpers/GQL/fragment';
import { Searchbar } from '../SearchBar';
import { Text } from '../Text';
import { AddTaskFAB } from './TaskNameModal';
import { CheckBox } from '../CheckBox';
import Loading from '../Loading';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import moment from 'moment';
import { taskListFilterSetting } from '../../helpers/asyncStorage/appSettingAsynStorage';
import scalesStyle, { scaledFontSize } from '../../utils/scalesStyle';

const window = Dimensions.get('window');
const windowWidth = window.width;
const windowHeight = window.height;

export const ProjectsUseQuery = (props) => { 
  console.log("ProjectsUseQuery")
 const { loading, error, data, refetch } = useQuery(gql`${projectQuery}`, {
  fetchPolicy: "no-cache",   // Used for first execution
  nextFetchPolicy: "no-cache", // Used for subsequent executions
 })
 if (loading) return <Loading/>
 if (error) return <CenterView><Text>載入失敗:{error.message}</Text></CenterView>
  if (data) return React.cloneElement(props.children, { data: data, refetch: () => { console.log("ProjectsUseQuery refetch"); refetch(); }  })
}

export const TaskUseQuery = (props) => { 
  //  console.log("TaskUseQuery", props)
   const { loading, error, data , refetch} = useQuery(gql`${props.query} ${props.fragment}`, {
    fetchPolicy: "no-cache",   // Used for first execution
    nextFetchPolicy: "no-cache", // Used for subsequent executions
    variables: { 
      id: props.id,
      projectId: props.projectId
    }
   })
   if (loading) return <Loading/>
   if (error) return <CenterView><Text>載入失敗:{error.message}</Text></CenterView>
    if (data) return React.cloneElement(props.children, { data: data, refetch: () => { console.log("refetch"); refetch()}})
}
export const TasksFilterContext = createContext({
  keyword: null,
  status: {
    DONE: true,
    TODO: true,
    APPROVED: true
  },
  init: false
});

export const Header = ({ items, setAllExpanded, allExpanded }) => {
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
    await taskListFilterSetting({ ...filterState, keyword: null, status: status })
  }
  const onFilterClosePress = () => {
    setKeyword(filterState.keyword);
    setStatus(filterState.status);
  }
  const AllExpandBtn = ()=>{
    return (
      <>
      <TouchableOpacity
      onPress={()=>setAllExpanded(true)}
      style={[styles.allExpandedBtn, {backgroundColor:theme.colors.secondary, marginRight:10}]}
      activeOpacity={0.8}>
      <FontAwesome5 style={{marginRight:5}} name={"plus"} color={theme.colors.primary} size={20}></FontAwesome5>
      <Text color={theme.colors.primary}>{"展開"}</Text>
      </TouchableOpacity>
      <TouchableOpacity
      onPress={()=>setAllExpanded(false)}
      style={[styles.allExpandedBtn, {backgroundColor:theme.colors.secondary, marginRight:10}]}
      activeOpacity={0.8}>
      <FontAwesome5 style={{marginRight:5}} name={"minus"} color={theme.colors.primary} size={20}></FontAwesome5>
      <Text color={theme.colors.primary}>{"收起"}</Text>
      </TouchableOpacity>
      </>
    )
  }

  return (
    <HeaderComponent
      title="任務">
      <AllExpandBtn/>
      <FilterButton filterContext={TasksFilterContext}
        onConfirmPress={onFilterConfirmPress}
        onClosePress={onFilterClosePress}
        body={<>
          <View style={{ marginHorizontal: 10 }}>
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
    </HeaderComponent>
  )
}  

export const TaskList = () => {
  // console.log("TaskList");
  const [filterContext, setFilterContext] = useFilter(TasksFilterContext);
  const projectRefArr = useRef([]);
  const [allExpanded, setAllExpanded] = useState(true)
  const _setAllExpanded = () => {
    let isAllExpended = projectRefArr.current.find(e => e.expanded == false) ? false : true;
    if(isAllExpended) projectRefArr.current.map(e => e.setExpanded(true));
    setAllExpanded(!isAllExpended);
  }
  const onExpandPress = (allExpanded) => {
    projectRefArr.current.map(e => e.setExpanded(allExpanded))
    setAllExpanded(allExpanded)
  }
  useEffect(() => {
    (async () => {
      let setting = await taskListFilterSetting();
      setFilterContext({...filterContext, ...setting});
    })()
  }, [])
  if(!filterContext.init) return <></>
  return (
    <TasksFilterContext.Provider value={[filterContext, setFilterContext]}>
      <Header setAllExpanded={onExpandPress} allExpanded={allExpanded}/>
      <Divider />
      <ProjectsUseQuery query={projectQuery}>
        <TaskListContainer projectRefArr={projectRefArr} setAllExpanded={_setAllExpanded} />
      </ProjectsUseQuery>
    </TasksFilterContext.Provider>
  )
}

export const ProjectAccordionItem = ({code, id, data, refetch, refetchProjects, projectRefArr, setAllExpanded, ...props}) => {
  console.log("ProjectAccordionItem");
  const isFirstRender = useRef(true);
  const navigation = useNavigation();
  const [{ theme }] = useContext(ThemeContext);
  const [expanded, setExpanded] = useState(true);
  const isFirstLoad = useRef(true);
  // const [taskData, setTaskData] = useState([]);
  const [tasksFilterContext, setTasksFilterContext] = useContext(TasksFilterContext);
  const textColor = expanded ? theme.colors.primary : theme.colors.titleText;
  const titlestyle = {color: theme.colors.primary, borderBottomWidth: 2, borderColor: textColor,};
  const backgroundColor = { backgroundColor: theme.colors.accent }
  const accordionContainer = { ...styles.accordionContainer, width: "100%" };
  const [{ tasklistColumns }] = useContext(APPInfoContext);
  // const client = useApolloClient();
  const [sortBy, setSortBy] = useState("dueDate");//tasksFilterContext.sortBy
  const [orderBy, setOrderBy] = useState("ASC");//tasksFilterContext.orderBy
  const filter = (data) => { 
    let temp = [...data];
    // console.log(data)
    // temp.unshift({ node: { code: "未指派", id: 0 } });
    // console.log(temp)
    if(!id) temp = temp.filter(e=> e.node.assignedProjects.length == 0 )
    return temp.filter(e => {
      let { keyword, status, isChildren } = tasksFilterContext;
      return (keyword ? e.node.name.includes(keyword) : true)
             && (((status.TODO && e.node.status == "TODO")
             || (status.DONE && e.node.status == "DONE"))
             || ((status.APPROVED && e.node.status == "APPROVED")))
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
  const taskData = filter(data.tasks.edges)
  // const refetch = async ()=>{
  //   client.query(
  //         {
  //           query: gql`${taskQuery} ${taskListFragment}`,
  //           fetchPolicy:"no-cache",
  //           variables:{
  //             projectId: id,
  //           }
  //         }
  //       ).then(res => {
  //         console.log(res)
  //         setTaskData(res.data.tasks.edges)
  //       }).catch(err => {console.log(err)})
  // }
  // const taskData = filter(data.tasks.edges);
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
      // await taskListFilterSetting(newSetting);
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
  const onPress = () => {
    if(projectRefArr) addProjectRef();
    setExpanded(!expanded)
  };
  const Icon = () => {
    return <View>
      <FontAwesome5 color={textColor} size={25} name={expanded ? "caret-up" : "caret-down"} />
    </View>
  }
  const addProjectRef = () => {
    let p = [...projectRefArr.current].filter(e=>e.id != id);
    p.push({
      id: id,
      expanded: expanded,
      setExpanded: setExpanded,
    });
    projectRefArr.current = p;
    // console.log(projectRefArr)
  }
  if(projectRefArr) addProjectRef();
  useEffect(()=>{
    // refetch();
    if(isFirstRender.current) isFirstRender.current = false
    if(refetchProjects) navigation.setParams({refetchTaskList:()=>{}});
  }, [])

  useEffect(()=>{
    // if(isFirstRender.current) isFirstRender.current = false
    // else setAllExpanded();
  }, [expanded])
  useFocusEffect(()=>{
    if(!isFirstRender.current) refetch();
 });
  return (
    <>
      <TouchableOpacity onPress={onPress} activeOpacity={0.85}>
        <View style={[accordionContainer, backgroundColor]}>
          <View style={[styles.accordionItemtitleStyle, titlestyle]}>
            <Text numberOfLines={1} style={{ fontWeight: "bold", flex: 1 }} color={textColor} size={17}>{code}</Text>
            <Icon/>
          </View> 
          <AddTaskFAB projectId={id}>
            <View style={[styles.addTaskBtn, { backgroundColor: theme.colors.primary }]}>
              <FontAwesome5 color={theme.colors.accent} size={20} name="plus" />
            </View>  
          </AddTaskFAB>
        </View>
      </TouchableOpacity>
      {!expanded ? <></> : <>
        <FlatList
          contentContainerStyle={[backgroundColor, { backgroundColor: "white", paddingHorizontal: 5, width: "100%" }]}
          ListHeaderComponent={taskData.length ? <Columns /> : null}
          showsVerticalScrollIndicator={true}
          data={filter(taskData)}
          keyExtractor={(item, index) => item.node.id}
          renderItem={(e) => {
            return <TaskItem refetchProjects={refetchProjects} {...e.item.node} />
          }}
        />
      </>}
    </>
  )
}

export const TaskListContainer = ({ data, refetch, projectRefArr, setAllExpanded }) => {
  // console.log('TaskListContainer');
  const [reload, setReload] = useState(false);
  const setProjects = () => {
    let projects = [...data.projects.edges];
    projects.push({ node: { code: "無專案", id: null } });
    return projects;
  }
  const projects = setProjects();
  const [{ theme }] = useContext(ThemeContext);
  const backgroundColor = { backgroundColor: theme.colors.accent }
  const reloadPage = () =>{
    refetch();
    setReload(!reload)
  }

  return (
    <>
      <View style={[backgroundColor, { flex: 1 }]}>
        <FlatList
          refreshControl={
            <RefreshControl
              refreshing={false}
              onRefresh={reloadPage}
            />}
          contentContainerStyle={[backgroundColor, { backgroundColor: "white", paddingHorizontal: 5, width: "100%", flexDirection: "column-reverse" }]}
          ListEmptyComponent={<CenterView style={{ width: "100%" }}><Text>沒有資料</Text></CenterView>}
          showsVerticalScrollIndicator={true}
          data={projects}
          keyExtractor={(item, index) => item.node.id}
          renderItem={(e) =>
            <TaskUseQuery query={taskQuery} fragment={taskListFragment} projectId={e.item.node.id}>
              <ProjectAccordionItem
              refetchProjects={reloadPage} 
              setAllExpanded={setAllExpanded}  
              projectRefArr={projectRefArr}
              code={e.item.node.code} id={e.item.node.id}>
              </ProjectAccordionItem>
            </TaskUseQuery>
          }>
        </FlatList>
      </View>
    </>
  )
}

const styles = StyleSheet.create(scalesStyle({
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
    justifyContent: 'space-between'
  },
  columnsContainer: {
    width: "100%",//windowWidth > 390 ? windowWidth - 10 : 380,//500 * PixelRatio.scaledFontSize(),
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
  accordionContainer: {
    height: 40,
    paddingHorizontal: 2,
    flexDirection: "row",
    width: "100%",
    marginVertical: 2
  },
  accordionItemtitleStyle: {
    flex: 1,
    fontWeight: "bold",
    padding: 5,
    flexDirection: "row",
    marginRight: 10,
  },
  addTaskBtn: {
    height: "100%",
    width:40,
    flexBasis: 40,
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
    justifyContent: "center",
    alignContent: "center",
    alignSelf: "center",
    alignContent: "center",
    alignItems:"center"
  },
  sortIcon:{
    position:"absolute",
    justifyContent: 'center',
    alignItems: 'center',
    right: 3,
  },
  allExpandedBtn: {
    height: "100%",
    borderRadius: 15,
    flexDirection: "row",
    height: 30,
    alignSelf: "center",
    alignContent: "center",
    alignItems: "center",
    paddingHorizontal: 5
  },
}));

