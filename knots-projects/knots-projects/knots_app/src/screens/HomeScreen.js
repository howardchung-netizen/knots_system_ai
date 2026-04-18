import React, { useContext } from 'react';
import { Image} from 'react-native';
import { BottomTabNavigator } from '../components/BottomTabNavigator';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import AccountScreen from './AccountScreen';
import { ProjectGalleryList } from '../components/ProjectGalleryList';
import { ThemeContext } from '../components/appContext/ThemeContext';
import { TaskList } from '../components/tasks/TaskList';
import { MyTaskList } from '../components/tasks/MyTaskList';
import { Header } from '../components/header/Header';
import GanttChartAgendaScreen from './GanttChartAgendaScreen';
import { scaledFontSize } from '../utils/scalesStyle';
const tabList = [
  {
    key:"GanttChartAgendaScreen",
    name: "GanttChartAgendaScreen",
    component: GanttChartAgendaScreen,
    options: {
      headerShown: false ,
      title: "待辦",
      tabBarHideOnKeyboard: true,
      tabBarLabel: "待辦",
      tabBarIcon: ({ size, color }) =>
        //  <Image source={require('../assets/knots-images/menu_button/tasks-icon.png')} style={ {height:25, width:25, tintColor:color}}/>,
        <FontAwesome5 style={{ fontSize: size, color: color }} name="clipboard-list" solid />,
    }
  },
  {
    name: "MyTasks",
    component: MyTaskList,
    options: {
      headerShown: false,
      title:"我的任務",
      tabBarHideOnKeyboard: true,
      tabBarLabel: "我的任務",
      tabBarIcon: ({ size, color }) =>
      <FontAwesome5 style={{ fontSize: 20, color: color }} name="user-check" />,
    }
  },
  {
    name: "Tasks",
    component: TaskList,
    options: {
      headerShown: false,
      title:"任務",
      tabBarHideOnKeyboard: true,
      tabBarLabel: "任務",
      tabBarIcon: ({ size, color }) =>
        <Image source={require('../assets/knots-images/menu_button/tasks-icon.png')} style={{ height: 30 , width: 30, tintColor: color }} />,
      // <FontAwesome5 style={{ fontSize: size, color: color }} name="tasks" />,
    }
  },
  {
    key:"ProjectGalleryList",
    name: "ProjectGalleryList",
    component: ProjectGalleryList,
    options: {
      headerShown: false ,
      title: "圖片庫",
      tabBarHideOnKeyboard: true,
      tabBarLabel: "圖片庫",
      tabBarIcon: ({ size, color }) =>
        //  <Image source={require('../assets/knots-images/menu_button/tasks-icon.png')} style={ {height:25, width:25, tintColor:color}}/>,
        <FontAwesome5 style={{ fontSize: size, color: color }} name="image" solid />,
    }
  },
  {
    name: "account",
    component: AccountScreen,
    options: {
      headerShown: false,
      tabBarLabel: "帳戶",
      tabBarIcon: ({ size, color }) =>
        <Image source={require('../assets/knots-images/menu_button/account-icon.png')} style={{ height: 30, width: 30, tintColor: color }} />,
      // <FontAwesome5 style={{ fontSize: size, color: color }} name="user" solid />,
    }
  }
]

export default function (props) {
 const [{ theme }] = useContext(ThemeContext);
 return (
  <BottomTabNavigator
   tabList={tabList}
   initialRouteName={tabList[3].name}
     screenOptions={{
       header: (props) => { 
        //  console.log("header", props)
         return <Header {...props.options}>{props.options.headerChildren}</Header>
       },
     headerShown: true,
    // tabBarShowLabel: false,
    tabBarActiveTintColor:theme.colors.accent,
    tabBarStyle: {backgroundColor: theme.colors.primary },
    tabBarLabelStyle: { fontSize: scaledFontSize(13)}
  }}
  >
   {props.children}
  </BottomTabNavigator>
 )
}
