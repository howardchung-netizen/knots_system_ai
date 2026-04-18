import React, { useState, useRef, useContext } from 'react';
import { StyleSheet, View } from 'react-native';
import { ModalButton } from '../modal/ModalButton';
import { FAB } from 'react-native-paper';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import TextInput from '../TextInput';
import ErrorMsg from '../ErrorMsg';
import Loading from '../Loading';
import { from, useApolloClient, gql } from '@apollo/client';
import { useNavigation, useRoute } from '@react-navigation/native';
import { TaskCreateUseMutation, TaskUpdateUseMutation} from './TaskUseMutation'
import { taskUnassignProjectMutation, taskAssignProjectMutation } from '../../helpers/GQL/mutation';
import { userErrorFragment, taskListFragment } from '../../helpers/GQL/fragment';
import { ThemeContext } from '../appContext/ThemeContext';
import scalesStyle from '../../utils/scalesStyle';

const getVariables = (id, parentTaskId, name ) => { 
  let v = { data: {} }
  if (id) v.data.id = id;
  if (parentTaskId) v.data.parentTaskId = parentTaskId;
  if (name) v.data.name = name;
  return v
}

export const TaskNameModal = (props) => {
  const mutate = props.mutate;
  const [taskName, setTaskName] = useState(props.name);
  const [errorMsg, setErrorMsg] = useState(null);
  const inputErrorText = useRef(null);
  const [{ theme }] = useContext(ThemeContext);
  const inputTextStyle = { ...styles.inputTextStyle, backgroundColor: theme.colors.secondary }
  const client = useApolloClient();

  const taskAssignProject = async (id, projectId)=>{
    await client.mutate({
      mutation: gql`${taskAssignProjectMutation} ${userErrorFragment} ${taskListFragment}`,
      variables: {
        data: {
          id: id,
          projectId: projectId,
        }
      },
    }).then(res => {
      console.log("taskAssignProject", res);
    }).catch(err => { throw err })
  }
  const hasInputError = (text) => {
    switch (true) {
      case (text == null || text == ''):
        inputErrorText.current = "請輸入任務名稱...";
        break;
      case (text.replace(/ /g, '').length == 0 || text[0] == ' '):
        inputErrorText.current = "任務名稱不能以空格開頭..."
        break;
      default:
        inputErrorText.current = false;
    }
    return inputErrorText.current;
  }
  
  return (<>
    <ModalButton
      loading={null}
      title={props.title}
      width="90%"
      style={props.ModalButtonStyle}
      confirmButton
      // onConfirmclose
      onConfirmPress={async () => {
        // console.log("getVariables", getVariables(props.id, props.parentTaskId, taskName))
        if (hasInputError(taskName)) { setErrorMsg("提交失敗"); return false }
        else {
          mutate({
            variables: getVariables(props.id, props.parentTaskId, taskName),
            onCompleted:async (res) => {
              console.log(res)
              if(res.taskCreate.task && props.projectId) {
                await taskAssignProject(res.taskCreate.task.id, props.projectId);
              }
              if (props.onCompleted) props.onCompleted(res)
              setTaskName(null)
            },
            onError: (err) => {
              console.log(err)
              if (props.onError) props.onError(err)
            }
          });

        }
        return true
      }}
      closeButton
      onClosePress={() => {
        setTaskName(props.name);
        inputErrorText.current = false;
        setErrorMsg(null)
      }}
      body={
        <View style={{ marginHorizontal: 10 }}>
          <ErrorMsg text={errorMsg} />
          <TextInput
            textColor={theme.colors.primary}
            style={inputTextStyle}
            errorText={inputErrorText.current}
            name="taskname"
            title="任務名稱"
            returnKeyType="next"
            value={taskName}
            autoCapitalize="none"
            width="100%"
            autoFocus={true}
            onChangeText={(name, text) => {
              setTaskName(text);
              setErrorMsg(null)
              return hasInputError(text);
            }}
          />
        </View>
      }
    >
      {props.children}
      {/* <FontAwesome5 style={styles.icon} name="plus" /> */}
    </ModalButton>
  </>)
}

export const AddTaskFAB = (props) => {
  const navigation = useNavigation();
  const [{ theme }] = useContext(ThemeContext);
  const route = useRoute();
  const onCompleted = (res) => { 
    if(route.params?.refetchTaskList) route.params?.refetchTaskList();
    navigation.navigate('TaskForm', res.task);
  }
  return (
    <TaskCreateUseMutation >
      <TaskNameModal
        projectId={props.projectId??null}
        ModalButtonStyle={[styles.ModalButton, { backgroundColor: "#323594" }]}
        title={"新增任務"}
        onCompleted={({ taskCreate }) => onCompleted(taskCreate)}
      >
        {props.children}
      </TaskNameModal>
    </TaskCreateUseMutation>  
  )
}

export const EditTaskNameBtn = (props) => {
  const [{ theme }] = useContext(ThemeContext);
  const inputTextStyle = { ...styles.inputTextStyle, backgroundColor: theme.colors.secondary }
  return (
    <TaskUpdateUseMutation>
      <TaskNameModal
        {...props}
        title={"更改任務名稱"}>
        <View pointerEvents="none">
          <TextInput
            underlineColor="transparent" 
            textColor={theme.colors.primary}
            style={inputTextStyle}
            name="taskname"
            title="任務名稱"
            returnKeyType="next"
            value={props.name}
            autoCapitalize="none"
            width="100%"
            autoFocus={true}
            editable={false}
          />
        </View>
      </TaskNameModal>
    </TaskUpdateUseMutation>  
  )
}

export const TaskNameInputModal = (props) => {
  const mutate = props.mutate;
  const [taskName, setTaskName] = useState(props.name);
  const [errorMsg, setErrorMsg] = useState(null);
  const inputErrorText = useRef(null);
  const [{ theme }] = useContext(ThemeContext);
  const inputTextStyle = { ...styles.inputTextStyle, backgroundColor: theme.colors.secondary }
  const hasInputError = (text) => { 
    switch (true) { 
      case (text == null || text == ''):
        inputErrorText.current = "請輸入任務名稱...";
        break;
      case (text.replace(/ /g, '').length == 0 || text[0] == ' '):
        inputErrorText.current = "任務名稱不能以空格開頭..."
        break;
      default:
        inputErrorText.current = false;
    }
    return inputErrorText.current;
 }
 
  return (<>
    <ModalButton
      loading={null}
      title={props.title}
      width="90%"
      style={props.ModalButtonStyle}
      confirmButton
      // onConfirmclose
      onConfirmPress={async () => {
        // console.log("getVariables", getVariables(props.id, props.parentTaskId, taskName))
        if (hasInputError(taskName)) { setErrorMsg("提交失敗"); }
        else {
          if (props.onConfirmPress) props.onConfirmPress(taskName);
          mutate({
          variables: getVariables(props.id, props.parentTaskId, taskName), 
          onCompleted: (res) => {
            console.log(res)
            if (props.onCompleted) props.onCompleted(res)
            if (props.onConfirmPress) props.onConfirmPress(taskName);
          },
          onError: (err) => {
            console.log(err)
            if (props.onError) props.onError(err)
          }
          });
        } 
        return true
      }}
      closeButton
      onClosePress={() => {
        setTaskName(props.name);
        inputErrorText.current = false;
        setErrorMsg(null)
      }}
      header={
        <View style={{ marginHorizontal: 10 }}>
          <ErrorMsg text={errorMsg} />
          <TextInput
            textColor={theme.colors.primary}
            style={inputTextStyle}
            errorText={inputErrorText.current}
            name="taskname"
            title="任務名稱"
            returnKeyType="next"
            value={taskName}
            autoCapitalize="none"
            width="100%"
            autoFocus={true}
            onChangeText={(name, text) => {
              setTaskName(text);
              setErrorMsg(null)
              return hasInputError(text);
            }}
          />
        </View>
      }
    >
      {props.children}
      {/* <FontAwesome5 style={styles.icon} name="plus" /> */}
    </ModalButton>
  </>)
}
export const EditTaskNameInput = (props) => {
  const [{ theme }] = useContext(ThemeContext);
  const inputTextStyle = { ...styles.inputTextStyle, backgroundColor: theme.colors.secondary }
  return (
    <TaskUpdateUseMutation>
      <TaskNameInputModal
        {...props}
        title={"任務名稱"}>
        <View pointerEvents="none">
          <TextInput
            underlineColor="transparent"
            textColor={theme.colors.primary}
            style={inputTextStyle}
            name="taskname"
            returnKeyType="next"
            value={props.name}
            autoCapitalize="none"
            width="100%"
            autoFocus={true}
          />
        </View>
      </TaskNameInputModal>
    </TaskUpdateUseMutation>
  )
}
const styles = StyleSheet.create(scalesStyle({
 ModalButton:
 {
   width: 30,
   height: 30,
   textAlign: "center",
   textAlignVertical: "center",
   alignContent: "center",
    alignItems: "center",
   justifyContent:"center",
   borderRadius: 75,
   borderWidth: 0,
   shadowColor: "#000",
   shadowOffset: {
     width: 0,
     height: 5,
   },
   shadowOpacity: 0.34,
   shadowRadius: 6.27,
   elevation: 10,
 },
 icon: {
  fontSize: 15,
  color: "white",
  textAlign: "center",
   textAlignVertical: "center",
   alignSelf: "center",
   alignContent: "center",
   alignItems:"center",
  },
  inputTextStyle: {
    fontSize:20,
    fontWeight:"bold"
  }
}));