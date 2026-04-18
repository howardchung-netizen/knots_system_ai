import React, { useState, useContext, createRef, useMemo, useCallback, createContext, useReducer } from 'react';
import { StyleSheet, View, ScrollView, Dimensions, TouchableOpacity  } from 'react-native';
import { ModalButton } from './modal/ModalButton';
import { AvatarItem, SmallAvatar } from '../components/AvatarItem';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { LabelShadow } from './Shadow';
import { CheckBox } from './CheckBox';
import { ThemeContext } from './appContext/ThemeContext'
import UserInfoScreen from '../screens/UserInfoScreen';
import Modal from './modal/Modal';
import { useNavigation } from '@react-navigation/native';
import { gql, useMutation, useQuery } from '@apollo/client';
import { taskAssignMutation, taskUnAssignMutation } from '../helpers/GQL/mutation';
import { userFragment, userErrorFragment, taskUpdateFragment } from '../helpers/GQL/fragment'
import { userQuery, contactsQuery } from '../helpers/GQL/query';
import { List } from 'react-native-paper';
import { Searchbar } from './SearchBar';
import { Text } from './Text';
import Loading from './Loading';

const window = Dimensions.get("window");
const screen = Dimensions.get("screen");

const isLoadingContext = createContext(false);
export const loadingReducer = (state, action) => {
  // console.log("loadingReducer")
 switch (action.type) {
   case 'LOADING':
    return true
   case 'FINISH':
     return  false
 }
}

export const Assignee = (props) => {
  const navigation = useNavigation();
  const [{ theme }] = useContext(ThemeContext);
  const memberCount = props.assignedStaff.length + props.assignedContact.length;
  // const [memberCount, setMemberCount] = useState(props.assignedStaff.length + props.assignedContact.length);
  const [isLoading, isLoadingtDispatch] = useReducer(loadingReducer, useContext(isLoadingContext));
  const color =  theme.colors.titleText;
  return (<>
    <isLoadingContext.Provider value={[isLoading, isLoadingtDispatch]}>
    <ModalButton
      loading={isLoading}
      title='指派人名單'
      width="90%"
      closeButton
      body={
        <View style={{ marginHorizontal: 10 }}>
          <AssigneeList {...props}/>
        </View>
      }
    >
      {/* <View style={styles.assigneeButton}>
        <Text style={{fontSize:14, color: color, fontWeight:"bold"}}> 已指派{memberCount}人 </Text>
          <View style={[styles.iconWrap, { borderColor:color }]}>
          <FontAwesome5 size={14} color={color} name="user-plus" soild />
          </View>          
      </View> */}
        {props.hasMember ? <View style={{width:"100%", maxWidth:"100%"}}><SelectedAssignee {...props.task}/></View>:<Text style={{width:"100%", fontWeight:"bold"}} color={theme.colors.text} size={14} >成員...</Text>}
    </ModalButton>
    </isLoadingContext.Provider>
  </>)
}

export const SelectedAssignee = (props) => {
  const [{ theme }] = useContext(ThemeContext);
  const color = { color: theme.colors.text }
  const backgroundColor = { backgroundColor: theme.colors.secondary }
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
      {
        props.assignedStaff.map(({ staff }) => {
          return (
            <LabelShadow key={staff.id} style={[styles.selectedAssignee, backgroundColor, { marginBottom:5}]}>
              <AvatarItem size={30} label={label(staff.nameCht)} labelColor={"#FE77D7"} color="white">
              {/* <View style={{ paddingHorizontal: 8 }}>
                <Text style={[styles.textSize, { fontWeight: "bold" }, color]}>{staff.nameCht}</Text>
                <Text style={[styles.textSize, { fontWeight: "bold" }, color]}>{staff.nameEn}</Text>
              </View> */}
              </AvatarItem>
            </LabelShadow>
          )
        }
        ) 
      }
   
      {props.assignedContact.map(({contact}) => {
        let { contactName, tel, id } = contact;
        return (
          <LabelShadow key={id} style={styles.selectedAssignee}>
            <AvatarItem size={30} label={label(contactName)} labelColor="green">
              <View style={{ paddingHorizontal: 0 }}>
                {/* <Text style={[styles.textSize, { fontWeight: "bold" }, color]}>{contactName}</Text>
                <Text style={[styles.textSize, ]} color={color}>{tel}</Text> */}
              </View>
            </AvatarItem>
          </LabelShadow>
        )
      }
      )}
    </View>
  )
}

const label = (name) => {
    let label = name.split(' ');
    if (label.length < 2) label = label[0][0];
    else label = label[0][0] + label[1][0];
    label = label.toUpperCase();
    return label
}

export const AssigneeList = (props) => { 
  const [keyword, setKeyword] = useState(null);
  const kewordMemo = useMemo(() => { return keyword }, [keyword])
  const navigation = useNavigation();
  const onChangeText = (text) => { 
    setKeyword(text);
  }
  
  return (
    <View>
      <Searchbar value={kewordMemo} onChangeText={onChangeText} placeholder="指派人..." style={{ margin: 3, marginBottom: 5 }} />
      <ScrollView style={{flexGrow: 1, maxHeight: 300}}>
        <UserListUseQuery>
          <UserList
            keyword={kewordMemo}
            onItemRender={({ id, username, nameCht, ...node }) =>
                <AssigneeListItem 
                key={id}
                id={id} 
                labelColor={"#FE77D7"} 
                title={username} 
                desc={nameCht}
                status={props.task.assignedStaff.find(e => e.staff.id == id) ? true : false}
                onCompleted={props.onCompleted}
                assignedStaff={props.task.assignedStaff}
                task={props.task}>
                </AssigneeListItem>
              } />
        </UserListUseQuery>
        <ContactsListUseQuery>
          <ContactsList
            keyword={kewordMemo}
            onItemRender={({ id, contactName, tel, ...node }) =>
              <AssigneeListItem
                key={id}
                labelColor={"green"}
                id={id}
                title={contactName}
                desc={tel}
                status={props.task.assignedContact.find(e => e.contact.id == id) ? true : false}
                assignedContact={props.task.assignedContact}
                onCompleted={props.onCompleted}
                task={props.task}>
              </AssigneeListItem>
            } />  
        </ContactsListUseQuery>
      </ScrollView>
    </View>
  )
}

export const UserListUseQuery = (props) => {
  // console.log("UserListUseQuery")
  const { loading, error, data } = useQuery(gql`${userQuery} ${userFragment}`);
  if (loading) return <></>
  if (error) return <Text>員工名單載入失敗:{error.message}</Text>
  if (data) return React.cloneElement(props.children, { data: data })
}

export const UserList = ({keyword, data,...props }) => {
  // console.log("UserList", data);
  return data.users.edges.filter(({ node }) => keyword ? node.username.includes(keyword) || node.nameCht.includes(keyword) : true).map(({ node }) =>
    props.onItemRender(node)
    // React.cloneElement(props.onItemRender, { item: node })
  )
}

export const ContactsListUseQuery = (props) => {
  // console.log("ContactsListUseQuery")
  const { loading, error, data } = useQuery(gql`${contactsQuery}`);
  if (loading) return <></>
  if (error) return <Text>聯絡人名單載入失敗:{error.message}</Text>
  if (data) return React.cloneElement(props.children, { data: data })
}

export const ContactsList = ({keyword, data, ...props }) => {
  // console.log("ContactsList")
  return (
    data.contacts.edges.filter(({ node }) => keyword ? node.contactName.includes(keyword) || node.tel.includes(keyword) : true).map(({ node }) =>
    props.onItemRender(node)
      //  React.cloneElement(props.onItemRender, { item: node })
    )
  )
}

export const AssigneeListItem = ({id, labelColor, title, desc, assignedContact, assignedStaff, onCompleted, ...props }) => {
  const [{ theme }] = useContext(ThemeContext);
  const textColor = { color: theme.colors.text };
  const variables = {
    data: {
      id: props.task.id,
      assignee: id
    }
  }
  const [taskAssign, { assignTaskData, assignTaskLoading, assignTaskError }] = useMutation(gql`${taskAssignMutation} ${taskUpdateFragment} ${userErrorFragment}`, {variables});
  const [unAssignTask, { unAssignTaskData, unAssignTaskLoading, unAssignTaskError }] = useMutation(gql`${taskUnAssignMutation} ${taskUpdateFragment} ${userErrorFragment}`, {variables});
  const onPress = () => {
    setStatus(!status)
    if (status) {
      unAssignTask().then((res) => {
        if (onCompleted) onCompleted(res.data.taskUnassign.task)
      })
    }
    else {
      taskAssign().then((res) => {
        if (onCompleted) onCompleted(res.data.taskAssign.task)
      })
    }

  }
  const getStatus = () => { 
    let status = assignedStaff ? assignedStaff.find(e => e.staff.id == id) : assignedContact.find(e => e.contact.id == id);
    return status ? true : false;
  }
  const [status, setStatus] = useState(getStatus())
  const color = status ? theme.colors.checkedColor : theme.colors.disabled;
  return (
    <LabelShadow style={{ margin: 5 }}>
      <TouchableOpacity style={[styles.assigneeListItem, { backgroundColor: theme.colors.secondary }]} onPress={onPress}>
        <AvatarItem size={30} label={label(title)} labelColor={labelColor} color={theme.colors.accent}>
          <View style={{ paddingHorizontal: 8 }}>
            <Text style={[{ fontSize: 12 }, { fontWeight: "bold" }, textColor]}>{title}</Text>
            <Text style={[{ fontSize: 12 }, { fontWeight: "bold" }, textColor]}>{desc}</Text>
          </View>
        </AvatarItem>
        <CheckBox
          disabled={true}
          color={color}
          containerStyle={{ margin: 0 }}
          status={status}/>
      </TouchableOpacity>
    </LabelShadow>
  )
}

export const AssigneeStatus = ({status, onPress}) => {
  return (
    <List.Icon
      icon="checkbox-marked"
     />
  )
}

const styles = StyleSheet.create({
  assigneeButton: {
    alignItems: "center",
    flexDirection: "row",
    width: "100%",
    justifyContent:"center"
  },
  iconWrap: {
    borderRadius: 25,
    borderWidth: 1,
    paddingHorizontal: 4,
    paddingVertical: 5,
    // borderStyle: "dashed"
  },
  selectedAssignee: {
    marginRight: 5,
    marginTop: 5,
    borderRadius: 20,
    backgroundColor:"white"
  },
  assigneeListItem: {
    width:"100%",
    flexDirection: "row",
    justifyContent: "space-between",
    padding:5,
  },
  textSize: { fontSize: 9 },
  rowWrap: { flexDirection:"row", marginTop: 5,},
  column1: { width: 50, alignContent:"center", alignItems:"center"}
});