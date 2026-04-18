import React, { useContext, useState } from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import { ModalButton } from '../modal/ModalButton';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { ThemeContext } from '../appContext/ThemeContext';
import { TaskFilterContext } from '../../screens/TasksScreen';
import { Searchbar, List } from 'react-native-paper';
import { Text } from '../Text';

export const TaskListFilterButton = (props) => {
  const [{ theme }] = useContext(ThemeContext);
  const [taskFilterContext, setTaskFilterContext] = useContext(TaskFilterContext)
  const [status, setStatus] = useState(taskFilterContext.status);
  const [keyword, setKeyword] = useState(taskFilterContext.keyword);
  const iconContainerStyle = {...styles.iconContainerStyle, backgroundColor: "#f0f0f1"}
  const iconColor = (status) => { return status ? theme.colors.checkedColor : theme.colors.disabled; }
  return (<>
    <ModalButton
      title={"任務搜尋"}
      width="90%"
      body={<View style={{ marginHorizontal: 10 }}>
        <Searchbar value={keyword} onChangeText={text=>setKeyword(text)} placeholder="任務名稱..."/>
        <List.Section>
          <List.Subheader>任務狀態</List.Subheader>
          <List.Item styles={[styles.item]} title="未完成" right={() =>
            <Pressable onPress={() => { setStatus({ ...status, ...{ TODO: !status.TODO } })}}>
              <List.Icon color={iconColor(status.TODO)} icon="checkbox-marked" />
            </Pressable>
          }/>             
          <List.Item styles={[styles.item]} title="已完成" right={() =>
            <Pressable onPress={() => { setStatus({ ...status, ...{ DONE: !status.DONE } }) }}>
              <List.Icon color={iconColor(status.DONE)} icon="checkbox-marked" />
            </Pressable>
          }/>
        </List.Section>
      </View>}
      confirmButton
      onConfirmclose
      onConfirmPress={() => {
        setTaskFilterContext({ ...taskFilterContext, status, ...{ keyword: keyword } });
      }}
      closeButton
      onClosePress={() => {
        setStatus(taskFilterContext.status);
      }}
    >
      <View style={iconContainerStyle}>
         <FontAwesome5 name="search" solid size={20} color={theme.colors.primary} /> 
         <Text style={{paddingLeft: 5}} color={theme.colors.primary}>搜尋</Text>
      </View>
    </ModalButton>
  </>)
}

const styles = StyleSheet.create({
  iconContainerStyle: {
    borderRadius: 15,
    padding: 5,
    flexDirection: "row",
    width: 75,
    height: 60,
    alignSelf:"center"
  },
  item: {
    padding:3
  }
});