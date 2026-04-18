import * as React from 'react';
import { useState, createContext, useContext, useMemo } from "react";
import { Button, Modal, TouchableOpacity, StyleSheet, View, Text, ScrollView, FlatList, Alert } from 'react-native';
// import { createStackNavigator } from '@react-navigation/stack'
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TaskList } from '../components/tasks/TaskList';
import { TaskForm } from '../components/tasks/TaskForm';

export const TaskFilterContext = createContext({
  keyword: null,
  status: {
    TODO: true,
    DONE: true
  }
});

const TaskListScreen = () =>
  <>
    <TaskList />
    {/* <AddTaskFAB /> */}
  </>
const Stack = createNativeStackNavigator();
export default function () {
  return (
      <Stack.Navigator
        screenOptions={{ headerShown: false }}>
      <Stack.Screen name="TaskList" component={TaskListScreen} />
      {/* <Stack.Screen name="TaskForm" component={(props) =><TaskForm id={props.route.params.id} />}/> */}
      </Stack.Navigator>
  )
}

