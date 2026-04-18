import * as React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
const Tab = createBottomTabNavigator();
export const BottomTabNavigator = ({ tabList, ...props }) => {
 return (
  <Tab.Navigator
  {...props}
   backBehavior="history"
   screenOptions={{
    ...{
     tabBarLabelStyle: {
      fontSize: 14,
     },
     animationEnabled: true
    }, ...props.screenOptions
   }}>
   {tabList.map(e => {
    return (<Tab.Screen
     key={e.name}
     name={e.name}
     component={e.component}
     options={{ ...{ tabBarButton: props => <TouchableOpacity {...props} /> }, ...e.options }}
    />)
   }
   )}
  </Tab.Navigator>
 );
}

