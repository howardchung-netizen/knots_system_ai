import React, { useState, createContext, useContext, useReducer, useRef, createRef, useEffect, useMemo, useCallback } from 'react'
import {
 ScrollView,
 StyleSheet,
  View,
  TouchableOpacity,
  Alert,
  Keyboard,
  Pressable,
  Dimensions,
  PixelRatio,
  Platform,
} from 'react-native';
import { Assignee, SelectedAssignee } from '../Assignee';
import { TaskUseQuery } from './TaskUseQuery';
import { taskFragment } from '../../helpers/GQL/fragment';
import { taskQuery, projectQuery } from '../../helpers/GQL/query';
import { SubTask } from './SubTask';
import { TaskStatusBtn } from './TaskStatus';
// import messaging from '@react-native-firebase/messaging';
import { TaskDateInput } from '../DateInput';
import { Header } from '../header/Header';
import { Appbar } from 'react-native-paper';
import moment from 'moment';
import { getAlbum, setAlbum, deleteAlbum, addImageToAlbumAsynStorage, removeImageFormAlbumAsynStorage, node } from '../../helpers/asyncStorage/albumAsynStorage';
import { ActionLog, TaskLogItem } from '../ActionLog';
import { Files } from '../Files';
import { MenuButton } from '../MenuButton';
import { Divider } from 'react-native-paper';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { ColorPickerModal } from '../ColorPicker';
import { ThemeContext } from '../appContext/ThemeContext';
import { Text } from '../Text';
import TextInput, { InputWithErrorChecking } from '../TextInput';
import { TaskUpdateUseMutation, TaskSetStatusUseMutation } from './TaskUseMutation';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { UserContext } from '../appContext/UserContext';
import { userErrorFragment,  } from '../../helpers/GQL/fragment';
import { taskSetStatusMutation, taskDeleteMutation, taskUnassignProjectMutation, taskAssignProjectMutation } from '../../helpers/GQL/mutation';
import { gql, useApolloClient, useMutation } from '@apollo/client';
import { AlertError } from '../AlertError';
import { ModalButton } from '../modal/ModalButton';
import { ProjectsUseQuery } from '../ProjectGalleryList';
import { FlatList } from 'react-native-gesture-handler';
import { Searchbar } from '../SearchBar';
import { LabelShadow } from '../Shadow';
import { CheckBox } from '../CheckBox';
import { getFontScale } from '../../helpers/getScale';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import mutationVariables from '../../utils/mutationVariables';
import userErrorsAlert from '../../utils/userErrorsAlert';
import scalesStyle from '../../utils/scalesStyle';

const window = Dimensions.get('window');
const windowWidth = window.width;
const windowHeight = window.height;

export const TaskFormContainer = ({ data, mutate, refetch, ...props }) => {
  // console.log("TaskFormContainer")
  // console.log("TaskFormContainer", data);
  // const task = data.tasks.edges[0].node;
  const isFirstRender = useRef(true);
  const client = useApolloClient();
  const navigation = useNavigation();
  const route = useRoute();
  const isSubTask = route.params.isSubTask;
  const [{ theme }] = useContext(ThemeContext);
  const [{ user }] = useContext(UserContext);
  const [task, setTask] = useState(data.tasks.edges[0].node);
  const hasMember = task.assignedContact.length > 0 || task.assignedStaff.length > 0 ? true : false;
  const scrollViewRef = useRef(null);
  const currentHeader = useRef(null);
  const [pointerEvents, setPointerEvents] = useState();
  const cancelBtnFontSize = 20;
  const isAfterAddSubTaks = useRef(false);
  const _setTask = (v) => { 
    // console.log("_setTask", { ...task, ...v }) 
    setTask({ ...task, ...v })
    if (route.params.onSubTaskUpdate) route.params.onSubTaskUpdate({ ...task, ...v });
  }
  const _mutate = (column, current) => { 
    let previous = task[column];
    _setTask({ [column]: current });
    mutate({
      variables: mutationVariables(['id', column], [task.id, current]),
      onCompleted: (res) => {
        // console.log(res)
      },
      onError: (err) => {
        AlertError("操作失敗", err.message);
        _setTask({ [column]: previous });
      }
    });
  }
  const HeaderMenu = () => {
    if ((user.username == task.createdBy?.username 
       || user.roles?.find(e => e.name == 'admin'
       || e.permissions.filter(x => x.name == "TASK").find(x => x.actions.find(z => z == 'ALL'))))) {
       const _mutate = (column, current) => {
          let previous = task[column];
          _setTask({ [column]: current });
          client.mutate(
            {
              mutation: gql`${taskSetStatusMutation} ${userErrorFragment}`,
              variables: mutationVariables(['id', column], [task.id, current]),
            }
          ).then(res => {
            if (res.data.taskSetStatus.userErrors.length > 0) {
              _setTask({ [column]: previous });
              Alert.alert(
                `操作失敗`,
                res.data.taskSetStatus.userErrors[0].message,
                [{ text: "關閉", onPress: () => { } }])
            } else {
              if (route.params.refetchTaskList) route.params.refetchTaskList();
              // if (route.params.onSubTaskUpdate) route.params.onSubTaskUpdate({ [column]: current });
            };
          }).catch((err) => {
            console.log("setTaskStatus", err)
          });
       }
      let items = [
        {
          title: "刪除任務",
          onPress: async () => {
            Alert.alert(
              `刪除任務${task.name}`,
              "刪除任務後，此任務將無法復原",
              [
                {
                  text: "取消"
                },
                {
                  text: "確認", onPress: async () => {
                    client.mutate(
                      {
                        mutation: gql`${taskDeleteMutation} ${userErrorFragment}`,
                        variables:
                         {
                           data: {
                             id: task.id
                           }
                         },
                      }
                    ).then(res => {
                      if (res.data.taskDelete.userErrors.length > 0) {
                        AlertError(`操作失敗`, res.data.taskDelete.userErrors[0].message);
                      } else {
                        if (route.params.refetchTaskList) route.params.refetchTaskList();
                        if (route.params.onSubTaskDelete) route.params.onSubTaskDelete(task.id);
                        navigation.goBack();
                       }
                    }).catch(err=>console.log(err))
                  }
                }
              ])
          },
          style: { position: "relative" },
          contentStyle: { position: "relative" },
          titleStyle: { color: theme.colors.titleText, padding: 0, margin: 0, position: "relative" }
        }
      ];
      return <MenuButton
        contentStyle={{ backgroundColor: theme.colors.accent, padding: 0, borderRadius: 0 }}
        button={<FontAwesome5 style={{ marginHorizontal: 12, marginVertical: 10 }} size={20} color={theme.colors.primary} name="ellipsis-v" />}
        items={items} />
    }
    else return <></>
  }
  const initHeader = () => { 
    currentHeader.current = "taskInfo"; 
    // console.log("initHeader", currentHeader.current)
    navigation.setOptions(
      {
        headerShown: true,
        header: (props) => { 
          return (
            <> 
              <Header
                goBackBtn
                title={"任務資訊"}
                subtitle={task.status == "APPROVED" ? "此任務已確認完成" : null}>
                <HeaderMenu />
                {/* <TaskSetStatusUseMutation>
                  <ApprovedBtn />
                </TaskSetStatusUseMutation> */}
              </Header>
            </>
          )
        }
      }
    )
  }
  const addSubTask = (newTask) => { 
    // console.log("addSubTask", task.subTasks)
    isAfterAddSubTaks.current = true;
    let value = [...task.subTasks]
    value.push(newTask);
    return value
  }
  const deleteSubTask = (id) => {
    _setTask({ "subTasks": [...task.subTasks].filter(e=>e.id!=id) });
    // _mutate("subTasks", [...task.subTasks].filter(e=>e.id!=id))
  }
  const onSubTaskUpdate = (newTask) => { 
    console.log("onSubTaskUpdate", newTask);
    let value = task.subTasks.map(e => { 
      if(e.id == newTask.id) return newTask
      else return e
    })
    return value
  }
  const taskNameInputOnFocus = () => {
    currentHeader.current = "setName"; 
    console.log("taskNameInputOnFocus", currentHeader.current)
    navigation.setOptions(
      {
        header: (props) => {
          return (
            <>
              <Header style={{ paddingHorizontal: 20 }}>
                <Pressable style={[styles.timesBtn]} onPress={() => props.options.cancel()}>
                <FontAwesome5 name='times' size={cancelBtnFontSize} color={theme.colors.titleText} soild/>
                </Pressable>
                <Appbar.Content titleStyle={[styles.customHeaderTitleStyle, { color: theme.colors.primary }]} title="任務名稱" /> 
                <FontAwesome5 name='check' size={cancelBtnFontSize} color={"green"} soild style={{ marginRight: 5 }}
                  onPress={() => {
                    if (props.options.hasInputError) return;
                    setTask({ ...task, name: props.options.inputValue });
                    _mutate("name", props.options.inputValue);
                    props.options.inputRef.current.blur();
                  }}
                />
              </Header>
              <Divider />
            </>
          )
        }
      }
    )
  }
  const taskNameOnSubmitEditing = (value) => { 
    setTask({ ...task, name: value });
    _mutate("name", value);
  }
  const taskNameInputOnBlur = (value) => { 
    console.log("taskNameInputOnBlur", currentHeader.current)
    _mutate("name", value);
    if(currentHeader.current == "setName") initHeader();
  }
  const taskNameHasInputError = (text) => { 
    // console.log(text,text.replace(/ /g, '').length,  text.replace(/ /g, '').length == 0)
    switch (true) { 
      case (text == null || text == ''):
        return "請輸入任務名稱...";
      case (text.replace(/ /g, '').length == 0 || text[0] == ' '):
        return "任務名稱不能以空格開頭..."
      default:
        return false;
    }
  }
  const taskDescriptionOnSubmitEditing = (value) => { 
    _mutate("description", value);
  }
  const taskDescriptionsInputOnFocus = () => { 
    currentHeader.current = "setDescriptions";
    // console.log("taskDescriptionsInputOnFocus", currentHeader.current);
    navigation.setOptions(
      {
        header: (props) => {
          return (
            <>
              <Header style={{paddingHorizontal: 20}}>
                <Pressable width={10} style={[styles.timesBtn]} onPress={() => props.options.cancel()}>
                <FontAwesome5 name='times' size={cancelBtnFontSize} color={theme.colors.titleText} soild/>
                </Pressable>
                <Appbar.Content titleStyle={[styles.customHeaderTitleStyle, { color: theme.colors.primary }]} title="描述" />                
                <FontAwesome5 name='check' size={cancelBtnFontSize} color={"green"} soild style={{ marginRight: 5 }}
                  onPress={() => {                   
                    if (props.options.hasInputError) return;
                    setTask({ ...task, description: props.options.inputValue });
                    _mutate("description", props.options.inputValue);
                    props.options.inputRef.current.blur();
                  }}
                />
              </Header>
              <Divider/>
            </>
          )
        }
      }
    )
  }
  const taskDescriptionsInputOnBlur = (value) => { 
    _mutate("description", value);
    console.log("taskDescriptionsInputOnBlur", currentHeader.current)
    if(currentHeader.current != "serDescriptions") initHeader();
  }
  const onColorChange = (color) => { 
    Keyboard.dismiss();
    _mutate("spotlight", color);
    return false;
  }
  const onDueDateConfirm = (value) => {
    _mutate("dueDate", value);
  }
  useEffect(() => {
    initHeader();
  },[task.status])
  useEffect(() => {
    isFirstRender.current = false;
    navigation.setParams({
      scrollToEnd: () => {setTimeout(function () {
        if(isAfterAddSubTaks.current) {
        scrollViewRef.current.scrollToEnd({ animated: true })
        isAfterAddSubTaks.current = false;
        }
      }, 0)}
    })
  }, [])
  useFocusEffect(() => { 
    if(isFirstRender.current == false) refetch();
  })
  const TaskStatusMenu = useCallback(({ mutate }) => {
    const _mutate = (column, current) => {
      let previous = task[column];
      _setTask({ [column]: current });
      mutate({
        variables: mutationVariables(['id', column], [task.id, current]),
        onCompleted: (res) => {
          userErrorsAlert(res.taskSetStatus.userErrors, ()=> _setTask({ [column]: previous }));
        },
        onError: (err) => {
          AlertError("更改失敗", err.message);
          _setTask({ [column]: previous });
        }
      });
    }
    let items = [
      {
        backgroundColor: theme.colors.text,
        title: "未完成",
        value: "TODO",
        onPress: ({ value }) => { _mutate("status", value) }
      },
      {
        backgroundColor: "#1db8cd",
        title: "已完成",
        value: "DONE",
        onPress: ({ value }) => { _mutate("status", value) }
      },
    ]
    if (user.roles?.find(e => e.name == 'admin' ||
        e.permissions?.find(x => x.actions.find(a => a == 'ALL')) ||
        e.permissions?.find(x => x.actions.find(a => a == 'TASK_SET_STATUS_APPREVED')))
    ) items.push({
      backgroundColor: theme.colors.primary,
      title: "已確認",
      value: "APPROVED",
      onPress: ({ value }) => { _mutate("status", value) }
    })
    items = items.filter(e => e.value != task.status);
    const Button = () => {
      let statusOptions = {
        TODO: {
          backgroundColor: theme.colors.text,
          title: "未完成"
        },
        DONE: {
          backgroundColor: "#1db8cd",
          title: "已完成"
        },
        APPROVED: {
          backgroundColor: theme.colors.primary,
          title: "已確認"
        }
      }
      return (
        <View style={[styles.acctionItem, { backgroundColor: theme.colors.secondary }]}>
          <Text style={{ backgroundColor: statusOptions[task.status].backgroundColor, padding: 3, marginRight: 5, borderRadius: 5 }} color={theme.colors.accent}>{statusOptions[task.status].title}</Text>
          <Text color={theme.colors.titleText} style={{ fontWeight: "bold" }} size={17}>狀態</Text>
        </View>
      )
    }
    return <MenuButton
      button={<Button />}
      items={items} />
  }, [task])
  const TaskPriorityMenu = () => { 
    // console.log(task.priority)
    let items = [
      {
        title: "無",
        value: null,
        onPress: ({value}) => { _mutate("priority", value) }
      },
      {
        title: "高",
        value: "HIGH",
        onPress: ({value}) => { _mutate("priority", value) }
      },
      {
        title: "中",
        value: "MEDIUM",
        onPress: ({value}) => { _mutate("priority", value) }
      },
      {
        title: "低",
        value: "LOW",
        onPress: ({value}) => { _mutate("priority", value) }
      },
    ]
    const Button = () => { 
      let priorityOptions = {
        "-": {
          backgroundColor: theme.colors.text,
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
        <View style={{ width: "100%", flexDirection:"row", alignItems: "center"}}>
          <Text size={13} style={{backgroundColor:priorityOptions[task.priority??"-"].backgroundColor, ...styles.priorityContentStyle, textAlignVertical:"center", textAlign:"center"}} color={theme.colors.accent}>{priorityOptions[task.priority??"-"].title}</Text>
          <Text color={theme.colors.titleText} style={{ fontWeight: "bold" }} size={17}>優先度</Text>
        </View>
    )
    }
    return <MenuButton
      buttonContainerStyle={[styles.acctionItem, { backgroundColor: theme.colors.secondary, width: windowWidth * 0.45 }]}
      button={<Button />}
      items={items} />
  }
  const SetTaskStatusBtn = ({mutate}) => { 
    const _mutate = (column, current) => { 
      Keyboard.dismiss();
      let previous = task[column];
      _setTask({ [column]: current });
      console.log(task.status)
      initHeader();
      mutate({
        variables: mutationVariables(['id', column], [task.id, current]),
        onCompleted: (res) => {
        },
        onError: (err) => {
          console.log(res)
          AlertError("更改失敗", err.message);
          _setTask({ [column]: previous });
        }
      });
    }
    const onPress = () => _mutate("status", task.status == "APPROVED" || task.status == "DONE" ? "TODO" : "DONE");
    return (
      <TouchableOpacity onPress={onPress}  style={[styles.acctionItem, { backgroundColor: theme.colors.secondary, borderColor: theme.colors.text, width: windowWidth * 0.45 }]} activeOpacity={0.85}>
      <FontAwesome5 solid name='check-circle' size={26} color={task.status == "TODO" ? theme.colors.text: "#16b0c8" } style={{ backgroundColor: null, borderRadius: 50, borderWidth: -1, justifyContent: "center", marginTop:-2 ,marginLeft: -1, marginRight:5 }} />
      <Text color={theme.colors.titleText} style={{fontWeight:"bold"}} size={17}>狀態</Text>
    </TouchableOpacity>
    )
  }
  const onAssignedProjects = (res) => { 
    if (res) _setTask(res)
  }
  return (
    <>
      <Divider />
        <KeyboardAwareScrollView innerRef={(ref=>scrollViewRef.current = ref)} behavior="height" style={{flex:1, backgroundColor:theme.colors.accent}} enabled>
        <ScrollView style={{ backgroundColor: theme.colors.accent, height: "100%" }} contentInsetAdjustmentBehavior="always">
          <Pressable onPress={Keyboard.dismiss}
            pointerEvents={task.status == "APPROVED" ? "auto" : "auto"}>
            <InputWithErrorChecking>
              <TextInput
                style={styles.inputTextStyle}
                value={task.name}
                hasInputError={taskNameHasInputError}
                onFocus={taskNameInputOnFocus}
                onBlur={taskNameInputOnBlur}
                onSubmitEditing={taskNameOnSubmitEditing}
                blurOnSubmit={false}
                showSoftInputOnFocus
                placeholder="任務名稱..."
                name="name"
                returnKeyType="next"
                autoCapitalize="none"
                width="100%"
              />
            </InputWithErrorChecking>
            <View style={{ flexDirection: "row", marginTop: 5, flexWrap: 'wrap', justifyContent: "space-around", paddingHorizontal: 0, width: "100%" }}>
              <ColorPickerModal
                id={task.id}
                title="顏色"
                color={task.spotlight ?? theme.colors.text}
                onModalOpen={Keyboard.dismiss}
                onColorChange={onColorChange}
                modalButtonStyle={[styles.acctionItem, { backgroundColor: theme.colors.secondary, width: windowWidth * 0.45 }]}
              >
                <View style={[styles.spotlightStyle, { backgroundColor: task.spotlight ?? theme.colors.text, marginRight: 5 }]}></View>
                <Text color={theme.colors.titleText} style={{ fontWeight: "bold" }} size={17}>顏色</Text>
              </ColorPickerModal>
              <TaskSetStatusUseMutation>
                <TaskStatusMenu />
                {/* <SetTaskStatusBtn /> */}
              </TaskSetStatusUseMutation>
              <TaskPriorityMenu />
              <View style={[styles.acctionItem, { backgroundColor: theme.colors.accent, borderColor: theme.colors.text }, styles.noShadow]}></View>
            </View>
            {
              isSubTask ? null :
              <View style={[styles.rowWrap, { backgroundColor: theme.colors.secondary, marginTop: 5 }]}>
              <View style={[styles.column1, { alignSelf: "flex-start" }]}><Text style={{fontWeight:"bold"}} color={theme.colors.titleText} size={14} >專案</Text></View>
              <View style={[styles.column2]}>
                <ProjectsUseQuery query={projectQuery}>
                  <ProjectList taskId={task.id} assignedProjects={task.assignedProjects} onCompleted={onAssignedProjects} />
                </ProjectsUseQuery>
              </View>
            </View>
            }
            <View style={[styles.rowWrap, { backgroundColor: theme.colors.secondary, marginTop: 5 }]}>
              <View style={[styles.column1, { marginTop: 10, alignSelf: "flex-start" }]}><FontAwesome5 name='align-left' color={theme.colors.titleText} size={15} soild /></View>
              <View style={[styles.column2]}>
                <InputWithErrorChecking>
                  <TextInput
                    underlineColor="transparent"
                    multiline={true}
                    showSoftInputOnFocus
                    placeholder="描述..."
                    style={{ ...styles.inputTextStyle, ...styles.descriptionInputStyle, backgroundColor: null }}
                    returnKeyType="next"
                    value={task.description}
                    autoCapitalize="none"
                    width="85%"
                    onSubmitEditing={taskDescriptionOnSubmitEditing}
                    onFocus={taskDescriptionsInputOnFocus}
                    onBlur={taskDescriptionsInputOnBlur}
                    hasInputError={() => { false }}
                  />
                </InputWithErrorChecking>
              </View>
            </View>
            <Divider />
            <View style={[styles.rowWrap, { backgroundColor: theme.colors.secondary }]}>
              <View style={[styles.column1]}><FontAwesome5 name='user-alt' color={theme.colors.titleText} size={15} soild /></View>
              <View style={[styles.column2]}><Assignee hasMember={hasMember} task={task} onCompleted={(res) => { _setTask(res) }} {...task} /></View>
            </View>
            <Divider />
            <View style={[styles.rowWrap, { backgroundColor: theme.colors.secondary }]}>
              <View style={[styles.column1]}><FontAwesome5 name='calendar-alt' color={theme.colors.titleText} size={15} soild /></View>
              <View style={[styles.column2]}>
                <TaskDateInput
                  placeholder="結束日期..."
                  {...task}
                  date={task.dueDate}
                  iconSize={38}
                  iconColor={theme.colors.primary}
                  onConfirm={onDueDateConfirm}
                /></View>
            </View>
          </Pressable>
          <Divider />
          <View style={[{ backgroundColor: theme.colors.secondary, marginTop: 5 }]}>
            <SubTask title="子任務"
              parentTaskId={task.id}
              parentTaskStatus={task.status}
              subTasksList={task.subTasks}
              onSubTaskUpdate={(res) => {_setTask({ subTasks: onSubTaskUpdate(res) }); }}
              onSubTaskDelete={deleteSubTask}
              onBlur={(res) => { _setTask({ subTasks: addSubTask(res) }); }}
              onStatusChange={(id, status) => { console.log("onStatusChange", id, status) }}
              refetchParentTaskFrom={refetch}
            />
          </View>
          {/* <Divider /> */}
          {/* <ActionLog data={task.taskLog.slice(0, 4).sort(function (a, b) {
          return (parseInt(moment(a.createdAt).format("x")) - parseInt(moment(b.createdAt).format("x")))
        })} ActionLogContainerStyle={{ flexDirection: "column-reverse" }}>
          <TaskLogItem />
        </ActionLog> */}

        </ScrollView>
        </KeyboardAwareScrollView>
    </>
  )
}

export const TaskForm = ({ id, ...props }) => {
  // console.log("TaskForm", props)
  let _id = id ?? props.route?.params.id ?? null;
  
  return (
    <TaskUseQuery query={taskQuery} fragment={taskFragment} id={_id}>
      <TaskUpdateUseMutation>
      <TaskFormContainer/>
      </TaskUpdateUseMutation>
    </TaskUseQuery>
  )
}

export const ProjectList = ({ taskId, assignedProjects, data, onCompleted }) => {
  const [keyword, setKeyword] = useState(null);
  const kewordMemo = useMemo(() => { return keyword }, [keyword])
  const navigation = useNavigation();
  const [{ theme }] = useContext(ThemeContext);
  const onChangeText = (text) => {
    setKeyword(text);
  }

  return (
    <ModalButton
      title='專案'
      width="90%"
      closeButton
      body={
        <View style={{ marginHorizontal: 10 }}>
          <Searchbar value={kewordMemo} onChangeText={onChangeText} placeholder="專案..." style={{ margin: 3, marginBottom: 5 }} />
          <FlatList
            contentContainerStyle={[{ backgroundColor: "white", paddingHorizontal: 5 }]}
            showsVerticalScrollIndicator={true}
            data={data.projects.edges}
            keyExtractor={(item, index) => index}
            renderItem={(e) => {
              return <ProjectListItem assignedProjects={assignedProjects} taskId={taskId} {...e.item.node} onCompleted={onCompleted} />
            }}
          />
        </View>
      }
    >
      <View style={[{ width: "100%", minHeight:getFontScale(20)}]}>{
        assignedProjects.map((e,i) => {
          return (
            <View
            key={i}
            style={{ marginBottom: 5, fontWeight: "bold", backgroundColor: theme.colors.accent, paddingHorizontal:5, paddingVertical:3, borderRadius:10, width:"auto", alignSelf: 'flex-start' }}
             >
            <Text
              style={{ fontWeight: "bold", width:"auto", alignSelf: 'flex-start' }}
              color={theme.colors.text
              } size={14}>
              {e.project.code}
            </Text>
            </View>
          )
        })
      }
      </View>
    </ModalButton>
  )
}

export const ProjectListItem = ({ taskId, id, code, assignedProjects, onCompleted }) => {
  const [{ theme }] = useContext(ThemeContext);
  const textColor = { color: theme.colors.text };
  const variables = {
    data: {
      id: taskId,
      projectId: id
    }
  }
  const [taskAssignProject, { taskAssignProjectData, taskAssignProjectLoading, taskAssignProjectError }] = useMutation(gql`${taskAssignProjectMutation} ${taskFragment} ${userErrorFragment}`, {variables});
  const [taskUnassignProject, { taskUnassignProjectData, taskUnassignProjectLoading, taskUnassignProjectError }] = useMutation(gql`${taskUnassignProjectMutation} ${taskFragment} ${userErrorFragment}`, {variables});
  const onPress = () => {
    setStatus(!status)
    if (status) {
      taskUnassignProject().then((res) => {
        console.log(res)
        if(res.data.taskUnassignProject.userErrors.length) setStatus(true)
        if (onCompleted) onCompleted(res.data.taskUnassignProject.task)
      })
    }
    else {
      taskAssignProject().then((res) => {
        console.log(res)
        if(res.data.taskAssignProject.userErrors.length) setStatus(false)
        if (onCompleted) onCompleted(res.data.taskAssignProject.task)
      })
    }

  }
  const getStatus = () => { 
    let status = assignedProjects.find(e => e.project.id == id) ? true : false
    return status ? true : false;
  }
  const [status, setStatus] = useState(getStatus())
  const color = status ? theme.colors.checkedColor : theme.colors.disabled;
  return (
    <LabelShadow style={{ marginBottom: 8, width: "100%" }}>
      <TouchableOpacity style={[styles.projectListItem, { backgroundColor: theme.colors.secondary}]} onPress={onPress}>
        <View style={{ paddingHorizontal: 8, justifyContent:"center", flex: 1 }}>
            <Text numberOfLines={1} size={17} style={[ { fontWeight: "bold" }, textColor]}>{code}</Text>
        </View>
        <CheckBox
          disabled={true}
          color={color}
          containerStyle={{ margin: 0 }}
          status={status}/>
      </TouchableOpacity>
    </LabelShadow>
  )
}

export const TaskAttachment = ({id}) => {
  const navigation = useNavigation();
  return (
    <Files
      title="附件"
      iconSize={30}
      items={
        [{
          title: "拍照", onPress: () => {
            console.log("拍照")
          }
        }, {
          title: "圖片", onPress: () => {
            console.log("圖片")
            navigation.push('ImageGalleryScreen', { id: id })
            // CameraRoll.getPhotos({
            //   first: 20,
            //   assetType: 'Photos',
            // })
            //   .then(r => {
            //     setFiles({ photos: r.edges });
            //     console.log(r)
            //   })
            //   .catch((err) => {
            //     //Error Loading Images
            //   });
          }
        }]
      }
    />
  )
}

const styles = StyleSheet.create(scalesStyle({
   inputTextStyle: {
     fontSize:20,
     fontWeight:"bold",
  },
  descriptionInputStyle: {
    paddingTop: 0,
    margin: 0,
    fontSize: 13,
    // textAlignVertical:'top',
    top: Platform.OS == "ios" ? -12 : 1,
    left: -10, 
  },
  rowWrap: { padding: 5, flexDirection:"row", marginTop: 5,  alignItems: "center", minHeight:40},
  column1: { width: "15%", alignContent: "center", alignItems: "center"},
  column2: { width: "85%", alignContent: "flex-start", alignItems: "stretch", alignSelf: "center", justifyContent:"center", textAlignVertical:"center" },
  approvedBtnStyle: {
    borderRadius: 15,
    padding: 5,
    flexDirection: "row",
    width: 38,
    height: 60,
    alignSelf: "center",
    alignContent: "center",
    alignItems: "center",
    justifyContent: "center",
  },
  acctionItem: {
    alignContent: "center",
    alignItems: "center",
    width: "50%",
    flexDirection: "row",
    paddingHorizontal: 5,
    paddingVertical:5,
    justifyContent: "flex-start",
    // borderWidth: 1,
    borderRadius:5,
    width: windowWidth * 0.45 ,
    height: 35,
    marginVertical: 5,
    shadowColor: "#000",
    shadowOffset:{
    width: 0,
    height: 1,
    },
    shadowOpacity: 0.20,
    shadowRadius: 1.41,
    elevation: 2,
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
  noShadow: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: 'grey',
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
  },
  taskStatusMenuBtnStyle: {
    flexDirection:"row"
  },
  approvedBtnStyle: {
    borderRadius: 15,
    padding: 5,
    flexDirection: "row",
    width: 38,
    height: 60,
    alignSelf: "center",
    alignContent: "center",
    alignItems: "center",
    justifyContent: "center"
  },
  priorityContentStyle: {
    fontWeight: "bold",
    padding: 3,
    marginRight: 5,
    borderRadius: 5,
    minWidth: 25,
    textAlign: "center",
    overflow: "hidden",
    height: 25 ,
  },
  customHeaderTitleStyle: {
    fontWeight: "bold",
    textAlign:"left",
    alignSelf:"flex-start",
    fontSize:20,
    marginLeft: 14
  },
  projectListItem: {
    width:"100%",
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 5,
    height:48
  },
  timesBtn: {
    zIndex: 100,
    position:"absolute",
    justifyContent:"center",
    alignContent:"center",
    alignItems:"center",
    height: "100%",
    width: 40,
    left: 0,
  }
}));