import React, { useState, useEffect, useCallback, useContext, useMemo, useRef } from 'react';
import { ThemeContext } from '../appContext/ThemeContext';
import { APPInfoContext } from '../appContext/AppContextProvider';
import { useNavigation, useRoute } from '@react-navigation/native';
import { RefreshControl, Pressable, Modal, TouchableOpacity, StyleSheet, View, ScrollView, FlatList, Alert, Dimensions, PixelRatio, KeyboardAvoidingView } from 'react-native';
import { LabelShadow } from '../Shadow';
import CenterView from '../CenterView';
import Loading from '../Loading';
import DraggableFlatList, { OpacityDecorator } from 'react-native-draggable-flatlist';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { TaskNameModal } from './TaskNameModal';
import { TaskUseQuery } from './TaskUseQuery'; 
import { TaskCreateUseMutation } from './TaskUseMutation';
import { Divider, List } from 'react-native-paper';
import { taskFragment } from '../../helpers/GQL/fragment';
import { taskQuery } from '../../helpers/GQL/query';
import { Text } from '../Text'
import { TaskItem } from './TaskItem';
import TextInput, { InputWithErrorChecking } from '../TextInput';
import { TaskStatusBtn } from './TaskStatus';
import moment from 'moment';
const window = Dimensions.get('window');
const windowWidth = window.width;
const windowHeight = window.height;
const variables = (key, value) => { 
  let v = { data: {} }
  for (let i in key) v.data[key[i]] = value[i];
  return v
}

export const AddSubTaskBtn = ({ subTasksList, parentTaskId, setTask }) => {
  // console.log("subTasksList", subTasksList)
  const [{ theme }] = useContext(ThemeContext); 
  const setSubTask = (v) => {
    let st = subTasksList.map(e => e);
    st.push(v)
    setTask({ subTasks: st });
  }
  return (
     <TaskCreateUseMutation>
      <TaskNameModal
         title={"新增子任務"}
         parentTaskId={parentTaskId}
        onCompleted={(res) => setSubTask(res.taskCreate.task)}>
         <View style={[styles.iconContainer, { backgroundColor: theme.colors.primary }]}>
          <Text color={theme.colors.accent} size={15}>新增子任務</Text>
          </View>
      </TaskNameModal>
     </TaskCreateUseMutation>

  )
}

export const AddSubTaskInput = ({ parentTaskId, onBlur, onKeyboardDidHide, mutate }) => {
  // console.log("AddSubTaskInput", { parentTaskId, onBlur, mutate })
  const [{ theme }] = useContext(ThemeContext);
  const inputTextStyle = { ...styles.inputTextStyle, backgroundColor: null, paddingTop: 0, margin: 0, fontSize: 14, height: 30, borderRadius: 0, fontSize: 17 };
  const route = useRoute();
  const inputRef = useRef();
  const [loading, setLoading] = useState(false);
  const hasInputError = (text) => { 
    switch (true) { 
      case (text == null || text == ''):
        return "請輸入任務名稱...";
      case (text.replace(/ /g, '').length == 0 || text[0] == ' '):
        return "任務名稱不能以空格開頭..."
      default:
        return false;
    }
  }
  const onFocus = () => {
  }
  const _onBlur = (value) => {
    if (hasInputError(value)) return;
    // setLoading(true);
    //   if (mutate) mutate({
    //     variables: variables(['parentTaskId', 'name'], [parentTaskId, value]),
    //     onCompleted: (res) => {
    //       // console.log(res)
    //       if (onBlur) onBlur(res.taskCreate.task);
    //       setLoading(false);
    //     },
    //     onError: (err) => {
    //       console.log(err)
    //     }
    //   });
    return true
  }
  const onSubmitEditing = (value) => { 
    // console.log("onSubmitEditing")
    if (hasInputError(value)) return;
    setLoading(true);
      if (mutate) mutate({
        variables: variables(['parentTaskId', 'name'], [parentTaskId, value]),
        onCompleted: (res) => {
          // console.log(res)
          if (onBlur) onBlur(res.taskCreate.task);
          // console.log(route.params.scrollToEnd)
          if(route.params.scrollToEnd)route.params.scrollToEnd();
          setLoading(false);
        },
        onError: (err) => {
          console.log(err)
        }
      });
    return true
  } 
  
  return (
  <>{ loading ? <Loading size="small"/> : null }
    <InputWithErrorChecking>
      <TextInput
        // activeUnderlineColor="transparent"
        inpur  
        underlineColor="transparent"
        textAlignVertical="top"
        showSoftInputOnFocus
        placeholder={"新增子任務"}
        textColor={theme.colors.text}
        style={inputTextStyle}
        returnKeyType="next"
        value={null}
        autoCapitalize="none"
        width="100%"
        hasInputError={hasInputError}
        // onChangeText={onChangeText}
        onFocus={onFocus}
        onBlur={_onBlur}
        blurOnSubmit={false}
        onSubmitEditing={onSubmitEditing}
        onKeyboardDidHide={onKeyboardDidHide}
      />
    </InputWithErrorChecking>
  </>
  )
}

export const SubTaskListContainer = (props) => {
  //  const [list, setItemSort] = useState(props.subTasksList); 
  const list = props.subTasksList;
  const route = useRoute();
  const [{ theme }] = useContext(ThemeContext);
  const [{ tasklistColumns }] = useContext(APPInfoContext);
  const backgroundColor = { backgroundColor: theme.colors.accent }
  const [sortBy, setSortBy] = useState("dueDate");//tasksFilterContext.sortBy
  const [orderBy, setOrderBy] = useState("ASC");//tasksFilterContext.orderBy
  const filter = (data) => { 
    let temp = [...data];
    // console.log(temp)
    // console.log(data)
    // temp.unshift({ node: { code: "未指派", id: 0 } });
    // console.log(temp)
    return temp.sort(function (x, y) {
      // console.log(x.node.createdAt, parseInt(moment(x.node.createdAt).format("x")))
      return parseInt(moment(y.createdAt).format("X")) - parseInt(moment(x.createdAt).format("X")) ;
    }).sort(function (x, y) {
      let priority = {
        HIGH:2,
        MEDIUM:1,
        LOW:0
      }
      if(!x.priority && !y.priority) return 0
      else if (x.priority && !y.priority) return -1
      else if (!x.priority && y.priority) return 1
      else return parseInt(priority[y.priority] - priority[x.priority]);
    }).sort(function (x, y) {
      if(!x.dueDate && !y.dueDate) return 0
      else if (x.dueDate && !y.dueDate) return -1
      else if (!x.dueDate && y.dueDate) return 1
      else return parseInt(moment(x.dueDate).format("X")) - parseInt(moment(y.dueDate).format("X"));
    }).sort(function (x, y) {
      if(!x[sortBy] && !y[sortBy]) return 0
      else if (x[sortBy] && !y[sortBy]) return -1
      else if (!x[sortBy] && y[sortBy]) return 1
      else if(sortBy == "name") {
          let nameA = x[sortBy].charAt(0).toUpperCase(), nameB = y[sortBy].charAt(0).toUpperCase();
          if (nameA < nameB) return orderBy == "ASC" ? -1: 1;
          if (nameA > nameB) return orderBy == "ASC" ? 1: -1;
          return 0;
      } else if (sortBy == "dueDate") {
        if(!x.dueDate && !y.dueDate) return 0
        else if (x.dueDate && !y.dueDate) return orderBy == "ASC" ? -1: 1;
        else if (!x.dueDate && y.dueDate) return orderBy != "ASC" ? -1: 1;
        else if(orderBy == "ASC") return parseInt(moment(x.dueDate).format("X")) - parseInt(moment(y.dueDate).format("X"));
        else if (orderBy == "DESC") return parseInt(moment(y.dueDate).format("X")) - parseInt(moment(x.dueDate).format("X"));
      } else if (sortBy == "priority") {
        let priority = {
          HIGH:2,
          MEDIUM:1,
          LOW:0
        }
        if(!x.priority && !y.priority) return 0
        else if (x.priority && !y.priority) return orderBy == "ASC" ? -1: 1;
        else if (!x.priority && y.priority) return orderBy != "ASC" ? -1: 1;
        else return orderBy == "ASC" ? parseInt(priority[x.priority] - priority[y.priority]) :
                    parseInt(priority[y.priority] - priority[x.priority]);
      }
    })

  }
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
  const List = ({ list }) => {
    // console.log("list")
    return (
      <View>
        {props.onItemRender ? list.map((e, i) => props.onItemRender(e, i)) : null}
      </View>
    )
  }
  useEffect(()=>{
    if(route.params.scrollToEnd)route.params.scrollToEnd();
  })
  
  return (
    <View>
      <FlatList
        scrollEnabled={false}
        contentContainerStyle={[backgroundColor, { flexGrow: 1, backgroundColor: "white", paddingHorizontal: 5, width: "100%", paddingTop: 5 }]}
        ListHeaderComponent={list.length> 0? <Columns/>: null}
        data={filter(list)}
        renderItem={props.onItemRender}
        keyExtractor={(item) => item.id}
      //  onDragEnd={({ data }) => { setItemSort(data) }}
      />
      {/* <List list={list} /> */}
    </View>
  )
}

export const SubTaskList = (props) => { 
  return (
      <SubTaskListContainer {...props} />
  )
}

export const SubTaskItem = ({ item, drag, isActive, onStatusChange }) => { 
  // console.log("onStatusChange", onStatusChange)
  const navigation = useNavigation();
  const [{ theme }] = useContext(ThemeContext); 
  const backgroundColor = { backgroundColor: theme.colors.itemBackgroundColor };
  return (
    <>
     {/* <OpacityDecorator > */}
      <List.Item
        theme={theme}
        title={item.name}
        titleStyle={styles.itemTitleStyle}
        style={styles.itemStyle}
        onLongPress={drag}
        disabled={isActive}
        onPress={() => {
          navigation.push('TaskForm', { ...item })
        }}
        left={() => <TaskStatusBtn {...item} size={18} onStatusChange={onStatusChange}/>}
        right={()=><FontAwesome5 style={{alignSelf:"center", marginRight:10}} size={18} name="arrow-alt-circle-right" solid/>}
      />
      <Divider /> 
    {/* </OpacityDecorator>  */}
  </>    
  )
}

export const SubTask = (props) => { 
  const [{ theme }] = useContext(ThemeContext);
  const [expanded, setExpanded] = useState(true);
  const titleColor =  expanded ? theme.colors.primary : theme.colors.text 
  const subTaskContainer = { ...styles.subTaskContainer, borderColor: titleColor,  }
  const handlePress = () => setExpanded(!expanded);
  return (
    <View>
      {/* <Text style={[styles.subTaskTitle, titleColor]}>{props.title}</Text> */}
      <View style={{ width: "100%" }}>
        <List.Accordion
          expanded={expanded}
          onPress={handlePress}
          style={subTaskContainer}
          title="子任務"
          titleStyle={[styles.titleStyle, { color: titleColor }]}
          id="1">
            <SubTaskList
              subTasksList={props.subTasksList}
              onItemRender={(data) =>
                <TaskItem index={data.index} 
                isSubTask={true}
                {...data.item}
                refetchParentTaskFrom={props.refetchParentTaskFrom} 
                onSubTaskUpdate={props.onSubTaskUpdate}
                onSubTaskDelete={props.onSubTaskDelete}/>
                // <SubTaskItem index={data.index} {...data} onStatusChange={props.onStatusChange} />
              }/>
        </List.Accordion>
      </View>
      {/* <AddSubTaskBtn subTasksList={props.subTasksList} parentTaskId={props.parentTaskId} setTask={props.setTask} /> */}
      <View style={{ width: "100%", alignItems: "center", alignContent: "stretch" }}>
        <Divider />
         <TaskCreateUseMutation>
          <AddSubTaskInput parentTaskId={props.parentTaskId} onBlur={props.onBlur} onKeyboardDidHide={props.onKeyboardDidHide} />
         </TaskCreateUseMutation>
        <Divider />
      </View>
      <View style={styles.listContainer}></View>
    </View>
  )
}

const styles = StyleSheet.create({
 titleStyle: {
    fontWeight: "bold",
    padding: 0,
    margin:0
  },
 subTaskContainer: {
   borderBottomWidth: 1,
 },
 listContainer: {},
 subTaskTitle: {
   fontSize: 18,
   margin:10
 },
 iconContainer: {
  //  borderRadius: 25,
   padding:5,
   marginTop: 0,
   alignContent: "center",
   justifyContent: "center",
   alignItems: "center",

 },
 icon: {
  color: "white",
  paddingHorizontal: 5,
  paddingVertical: 3,
 },
 subTaskItemContainer: {
  width:"100%"
 },
 itemTitleStyle: {
   fontSize: 18,
  },
 itemStyle: {
    padding: 3,
  },
  inputTextStyle: {
    fontSize: 50,
    height:50
  },
  columnsContainer: {
    width:"100%",
    paddingTop: 5,
    margin: 0,
    flexDirection: "row",
    alignContent: "center",
    alignItems: "center",
  },
  columnWrap: {
    paddingHorizontal: 7,
    height: "100%",
  },
  sortIcon:{
    position:"absolute",
    justifyContent: 'center',
    alignItems: 'center',
    right: 3,
  }
})
