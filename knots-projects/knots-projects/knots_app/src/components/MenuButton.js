import * as React from 'react';
import { View, StyleSheet, TouchableOpacity, Keyboard } from 'react-native';
import {Menu, Provider, Button } from 'react-native-paper';
import CenterView from './CenterView';

export const MenuButton = ({ button, onOpenMenu, items, ...props }) => {
  const [visible, setVisible] = React.useState(false);
  const openMenu = () => {
    if(onOpenMenu)onOpenMenu()
    setVisible(true);
  }
  const closeMenu = () => setVisible(false);
  return (
    <View
      style={styles.menuContainer}>
      <Menu
        {...props}
        visible={visible}
        onDismiss={closeMenu}
        anchor={
          <TouchableOpacity
            style={props.buttonContainerStyle}
            activeOpacity={0.85}
            onPress={openMenu}>
            {button}
          </TouchableOpacity>
        }
      >
        {items.map((e,i) => (
          <Menu.Item
            key={i}
            {...e}
            onPress={
            () => {
              closeMenu();
              if (e.onPress) e.onPress(e)
            }
          } title={e.title} />
        ))}
      </Menu>
    </View>
  )
}

const styles = StyleSheet.create({
  menuContainer: {

  }
})