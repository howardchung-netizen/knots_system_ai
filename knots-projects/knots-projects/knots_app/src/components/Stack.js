import React, { useState } from 'react';
import {StyleSheet} from 'react-native';
// import { createStackNavigator } from '@react-navigation/stack';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
const Stack = createNativeStackNavigator();

export default ({ stackList, ...props }) => {
 return (
     <Stack.Navigator {...props}>
       {stackList.map(e => {
        //  console.log({...e})
         let Component = e.Component;
         return (
           <Stack.Screen key={e.name} {...e}>
             {
               props => <Component {...props}/>
             }
           </Stack.Screen>
         )
       }
    )}
    </Stack.Navigator>
 )
}

 
