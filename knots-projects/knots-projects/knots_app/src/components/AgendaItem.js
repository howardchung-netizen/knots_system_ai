import * as React from 'react';
import { StyleSheet, View, Text, ScrollView, PixelRatio } from 'react-native';
import { Divider, Card, Title, Paragraph } from 'react-native-paper';
import { ThemeContext } from './appContext/ThemeContext';
import scalesStyle from '../utils/scalesStyle';
export const AgendaItem = ({ title, items, onItemsRender, theme }) => {
   return (
      <Card style={{ ...styles.card, backgroundColor: theme.colors.accent }}>
         <ScrollView horizontal>
            <Card.Title title={title} style={{ minHeight: 10 }} titleStyle={{ ...styles.cardTitle, color: theme?.colors.titleText ?? null }} />
         </ScrollView>
         <Divider />
         {
            items ? items.map(e => onItemsRender(e)) : null
         }
      </Card>
   )
}

export const TaskItem = ({ taskName, startDate, endDate, day, progress, subTasks, color }) => {
   const [{ theme }] = React.useContext(ThemeContext);
   const spotlight = () => { 
      if (color != '') return color?.replace('background:', '').replace(';', '') ?? "white"
      else return "white";
   }
   return (
      <View style={{ ...styles.cardContent, flex: 1, backgroundColor: theme.colors.secondary }}>
         <View style={{ flexDirection: "row", flex: 1 }} >
            <View style={{ ...styles.colorBlock, backgroundColor: spotlight() }}></View>
            <View style={styles.contentBlock}>
               <Text style={{ ...styles.taskItemTitle, color: theme.colors.text }}>{taskName}</Text>
               <Text style={{ ...styles.dateText, color: theme.colors.text }}>結束:{endDate}</Text>
               {
                  subTasks?.length ? subTasks.map(item =>
                     <TaskItem
                        key={item.id}
                        taskName={item.name}
                        subTasks={item.subTasks}
                        startDate={item.startDate}
                        endDate={item.endDate}
                        color={item.style} />
                  ) : null
               }
            </View>
         </View>
      </View>
   )
}

const styles = StyleSheet.create(scalesStyle({
   card: {
      paddingBottom: 5,
      margin: 5,
      borderRadius: 0
   },
   cardTitle: {
      fontSize: 15,
      padding: 0
   },
   taskItemTitle: {
      minHeight: 0,
      fontWeight: "bold",
      fontSize: 14
   },
   cardContent: {
      padding:0,
      minHeight: 40,
      borderRadius: 0,
      marginTop: 5,
      marginHorizontal: 5,
      shadowColor: "#000",
      shadowOffset: {
         width: 0,
         height: 1,
      },
      shadowOpacity: 0.20,
      shadowRadius: 1.41,
      elevation: 2,
   },
   dateText: {
      fontStyle: "italic",
      fontSize: 11,
      alignSelf: "flex-end",
      justifyContent: "flex-end",
      textAlignVertical: "bottom"
   },
   colorBlock: {
      minHeight: 40,
      minWidth: 40,
   },
   contentBlock: {
      flex: 1,
      justifyContent: "space-between",
      padding: 5
   }
}))

