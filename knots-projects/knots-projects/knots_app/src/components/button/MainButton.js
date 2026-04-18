import React, { useContext } from 'react';
import Button from './Button';
import { StyleSheet } from 'react-native';
import { theme } from '../../core/theme';
import { ThemeContext } from '../appContext/ThemeContext';

export default (props) => {
 return (
   <Button {...props} {...style}>
     {props.children}
   </Button>
 )
}
