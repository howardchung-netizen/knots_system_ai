import React, { useState, useContext, useMemo, useEffect } from 'react';
import { ThemeContext } from '../appContext/ThemeContext';
import { UserContext } from '../appContext/UserContext';
import { APPInfoContext } from '../appContext/AppContextProvider';
import { Modal, TouchableOpacity, StyleSheet, View, Alert, PixelRatio, Dimensions } from 'react-native';
import { List } from 'react-native-paper';
import { Text } from '../Text';
import Loading from '../Loading';
// import DraggableFlatList, { OpacityDecorator } from 'react-native-draggable-flatlist';
import { OnDragActive } from '../OnDragActive'
import { useNavigation, useRoute } from '@react-navigation/native';
import { userErrorFragment } from '../../helpers/GQL/fragment';
import { taskSetStatusMutation } from '../../helpers/GQL/mutation';
import { gql, useMutation } from '@apollo/client';
import moment from 'moment';
import scalesStyle, { scaledFontSize } from '../../utils/scalesStyle';
const window = Dimensions.get('window');
const windowWidth = window.width;
const windowHeight = window.height;

export const TaskItem = (props) => {
  // console.log("TaskItem", props);
  const navigation = useNavigation();
  const route = useRoute();
  const [{ theme }] = useContext(ThemeContext);
  const [{ user }] = useContext(UserContext);
  const [{ tasklistColumns }] = useContext(APPInfoContext);
  const [taskStatus, setTaskStatus] = useState(props.status);
  // const [{ tasklistColumns }] = useContext(APPInfoContext);
  // const taskStatus = props.status == "DONE" ? true : false;
  const iconColor = taskStatus == "DONE" || taskStatus == "APPROVED" ? "#16b0c8" : theme.colors.disabled;
  const onStatusPress = () => { 
    console.log(taskStatus)
    setTaskStatus(taskStatus == "DONE" ? "TODO" : "DONE")
    if (taskStatus == "APPROVED") return;
    updateTask(['status'], [taskStatus == "DONE" ? "TODO" : "DONE"], (res) => {
      console.log("res",res)
      if(props.refetchProjects) props.refetchProjects();
      setTaskStatus(taskStatus == "DONE" ? "TODO" : "DONE")
      // props.onSubTaskUpdate()
      // setTaskStatus(!taskStatus)
    });
  }
  const columnWrap = { ...styles.columnWrap };
  const spotlightStyle = { ...styles.spotlightStyle, backgroundColor: props.spotlight ? props.spotlight : theme.colors.accent };
  const backgroundColor = { backgroundColor: theme.colors.accent }
  const dueDateColor = () => { 
    let before = "red", after = "green", same = "orange"
    if (!props.dueDate) return "#f4f4f4"
    // "theme.colors.accent"
    switch (true) { 
      case moment(props.dueDate).isBefore(moment().format('YYYY-MM-DD')):
        return before
      case moment(props.dueDate).isSame(moment().format('YYYY-MM-DD')):
        return same
      case moment(props.dueDate).isAfter(moment().format('YYYY-MM-DD')):
        return after
    }
  }
  const Status = () => { 
    let statusOptions = {
      TODO: {
        backgroundColor: theme.colors.secondary,
        color:theme.colors.text,
        title:"未完成"
      },
      DONE: {
        backgroundColor: "#1db8cd",
        color:theme.colors.accent,
        title:"已完成"
      },
      APPROVED: {
        backgroundColor: theme.colors.primary,
        color:theme.colors.accent,
        title:"已確認"
      }
    }
    return (
      <View style={[styles.column, { backgroundColor: statusOptions[taskStatus].backgroundColor, justifyContent:"center" }]}>
          <Text style={{fontWeight: "bold"}} size={13} color={statusOptions[taskStatus].color}>{statusOptions[taskStatus].title}</Text>
      </View>
   )
  }
  const Priority = () => { 
    let priorityOptions = {
      "-": {
        backgroundColor: theme.colors.secondary,
        title:"-"
       },
       HIGH: {
        backgroundColor: "#d53465",
        title:"高"
      },
      MEDIUM: {
        backgroundColor: "orange",
        title:"中"
      },
      LOW: {
        backgroundColor: "#279d00",
        title:"低"
      }
    }
    return (
      <View style={[styles.column, { backgroundColor: theme.colors.secondary, justifyContent: "center", alignContent:"center",alignItems:"center" }]}>
        <Text size={13} style={{ backgroundColor: priorityOptions[props.priority ?? "-"].backgroundColor, ...styles.priorityContentStyle }} color={theme.colors.accent}>{priorityOptions[props.priority ?? "-"].title}</Text>
      </View>
    )
  }
  const [taskSetStatusUseMutation, { data, loading, error }] = useMutation(gql`${taskSetStatusMutation} ${userErrorFragment}`, {
    onCompleted: (res) => {
      // console.log(res)
       setTaskStatus(res.taskSetStatus.task.status);
    },
    onError: (err) => {
      setTaskStatus(taskStatus == "DONE" ? "TODO" : "DONE")
      // console.log(data)
      // console.log(err.message)
    }
  });
  function updateTask(key, value, cb) {
    let data = { id: props.id };
    for (let i in key) data[key[i]] = value[i];
    taskSetStatusUseMutation({
      variables:
      {
        data
      }
    }).then(res => { if (cb) cb(res); }).catch((err) => {
    })
  }
  useEffect(() => { 
    if (props.status !== taskStatus) setTaskStatus(props.status);
  }, [props.status])
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => {
        // if (taskStatus == "APPROVED") return;
        navigation.push('TaskForm', {
          isSubTask:props.isSubTask,
          id: props.id, project: props.project,
          refetchTaskList: route.params.refetchTaskList,
          refetchParentTaskFrom: props.refetchParentTaskFrom,
          onSubTaskUpdate: props.onSubTaskUpdate,
          onSubTaskDelete: props.onSubTaskDelete
        })
      }}
      onLongPress={() => {
        if (props.onLongPress) props.onLongPress();
        return 
        if ((user.username == props.createdBy?.username || user.roles?.find(e => e.name == 'admin' || e.permissions.filter(x=>x.name == "TASK").find(x => x.actions.find(z=> z == 'ALL') || x.actions.find(z=> z == 'APRROVED')))) && taskStatus == "DONE")
          Alert.alert(
            `確認任務${props.name}完成`,
            "",
            [
              {
                text: "取消", onPress: () => {
                }
              },
              {
                text: "確認", onPress: () => {
                  updateTask(['status'], ["APPROVED"]);
                }
              }
            ])
      }}
    >
      <View style={[styles.itemContainer]}>
        <View style={[columnWrap, { width: tasklistColumns.name.width }]}>
          <View style={[styles.column, { backgroundColor: theme.colors.secondary }]}>
          {props.spotlight ? <View style={[spotlightStyle]}></View> : null}
          <View style={{ width: "85%", marginLeft: 3 }}>
            <Text numberOfLines={1} style={styles.taskNameStyle} color={theme.colors.titleText}>{props.name}</Text>
          </View>
         </View>
        </View>
        <View style={[columnWrap, styles.centerStyle, { width: tasklistColumns.status.width }]}>
        <TouchableOpacity
            style={{width:"100%"}}
            onPress={(onStatusPress)}>      
            <Status/>
          </TouchableOpacity>
        </View>
        <View style={[columnWrap, styles.centerStyle, { width: tasklistColumns.dueDate.width }]}>
          <View style={[styles.column, { backgroundColor: theme.colors.secondary, justifyContent:"center" }]}>
            {/* <Text style={{color:e.color}}>{props.startdate ? `開始日期:${props.startdate}` : null}</Text> */}
            <Text color={ dueDateColor()} size={12}>{props.dueDate ? moment(props.dueDate).format("YY-MM-DD"): null}</Text>
          </View>
        </View>
        <View style={[columnWrap, styles.centerStyle, { width: tasklistColumns.priority.width }]}>
         <Priority/>
        </View>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create(scalesStyle({
  itemContainer: {
    width: "100%",//windowWidth > 390 ? windowWidth-10 : 380,
    padding: 0,
    margin: 0,
    flexDirection: "row",
    alignContent: "center",
    alignItems: "center",
    marginTop: 5,
    marginBottom: 5,
  },
  columnWrap: {
    paddingHorizontal: 2,
  },
  column: {
    paddingHorizontal: 5,
    flexDirection: "row",
    height: 40,
    width: "100%",
    alignItems:"center"
  },
  centerStyle: {
    justifyContent: "center",
    alignContent: "center",
    alignItems: "center",
  },
  taskNameStyle: {
    fontWeight:"bold"
  },
  spotlightStyle: {
    marginRight: 3,
    borderRadius: 5,
    width: 25,
    height: 25,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.20,
    shadowRadius: 1.41,
    elevation: 2,
  },
  listColumnContainer: {
    padding: 3,
    flexDirection: "row",
    justifyContent: "center",
    alignContent: "center",
    alignItems: "center",
  },
  priorityContentStyle:{
    fontWeight: "bold",
    padding: 5,
    borderRadius: 13,
    minWidth: 25, 
    textAlign: "center",
    paddingHorizontal: 8,
    overflow:"hidden",
  }
}));