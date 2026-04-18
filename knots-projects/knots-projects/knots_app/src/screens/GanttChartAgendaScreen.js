import * as React from 'react';
import { useState } from "react";
import { StyleSheet, View, ScrollView, Alert, PixelRatio, RefreshControl } from 'react-native';
import { ThemeContext } from '../components/appContext/ThemeContext';
import { UploadStateContext } from '../components/appContext/UploadStateContext';
import { Header } from '../components/header/Header';
import { Chip, Divider } from 'react-native-paper';
import { Agenda } from 'react-native-calendars';
import { initCalendarsLang } from '../locales/CalendarLocaleConfig';
import moment from 'moment';
import CenterView from '../components/CenterView';
import { AgendaItem, TaskItem } from '../components/AgendaItem';
import { useQuery } from '@apollo/client/react';
import { userFragment } from '../helpers/GQL/fragment';
import { ganntQuery } from '../helpers/GQL/query';
import { gql } from '@apollo/client/core';
import Loading from '../components/Loading';
import { UserContext } from '../components/appContext/UserContext';
import { Text } from '../components/Text';
import scalesStyle from '../utils/scalesStyle';
import { theme } from '../core/theme';

export default function (props) {
  const { loading, error, data, refetch } = useQuery(gql`${ganntQuery} ${userFragment}`);
  const [{ theme }] = React.useContext(ThemeContext);
  const [{ user }] = React.useContext(UserContext);
  const [isCalenderOpen, setIsCalenderOpen] = useState(true);
  const [selectedDate, setSelectedDate] = useState(moment(Date.now()).format('YYYY-MM-DD'));
  const CalendarHeader = React.useCallback(({ title, subtitle }) => {
    const onChipPress= () => { 
      setIsCalenderOpen(!isCalenderOpen);
    }
    return (
      <>
      <Header
        style={{ alignContent: "space-between", width: "100%", justifyContent: "space-between" }}
        goBackBtn title={title}
        subtitle={subtitle}>
        <View style={styles.dateChip}><Text style={styles.dateText}>{selectedDate}</Text></View>
      </Header>
    </>
    )
  }, [selectedDate, isCalenderOpen])

  const GanntAgenda = React.useCallback(() => {
    initCalendarsLang();
    const [uploadStateContext, uploadStateContextDispatch] = React.useContext(UploadStateContext);
    const dateFormat = 'YYYY-MM-DD';
    const onDatePress = ({ dateString }) => {
      setSelectedDate(dateString);
      refetch();
    };
    const renderEmptyData = () => {
      return (
        <ScrollView
          contentContainerStyle={styles.renderEmptyDataContainer}
          refreshControl={
            <RefreshControl
              refreshing={false}
              onRefresh={refetch}
            />
          }>
          <CenterView><Text>沒有資料</Text></CenterView>
        </ScrollView>
      )
    };
    const renderEmptyDate = (e) => <View/>
    const renderItem = (item, firstItemInDay) => {
      // console.log(item, firstItemInDay)
      return <AgendaItem
        theme={theme}
        title={item.name}
        items={item.tasks}
        onItemsRender={(item) =>
          <TaskItem
            theme={theme}
            key={item.id}
            taskName={item.name}
            subTasks={item.subTasks}
            startDate={item.startDate}
            endDate={item.endDate}
            color={item.style}/>
        }
      />;
    }
    const renderDay = (day, item) => <View />;
    const items = React.useMemo(() => {
      if (data) {
        let items = {};
        let projects = data.gantt?.edges.filter(e => e.node.ganttTasks.length);
        projects = projects.map(e => {
          let newE = JSON.parse(JSON.stringify({ ...e }));
          newE.node.ganttTasks = newE.node.ganttTasks.filter(e => e.isDeleted == false && e.percentDone < 100 && e.assignments.find(x => x.staff.id == user.id)).map(x => {
            x.projectId = newE.node.project.id;
            x.projectCode = newE.node.project.code;
            let diff = moment(x.endDate, dateFormat).diff(moment(x.startDate, dateFormat), 'days');
            for (let i = 0; i <= diff; i++) {
              let d = moment(x.startDate, dateFormat).add(i, 'days').format(dateFormat);
              if (items[d]) {
                let p = items[d].find(e => e.id == x.projectId);
                if (p) p.tasks.push(x);
                else {
                  items[d].push({ id: x.projectId, name: x.projectCode, tasks: [x] });
                }
              }
              else {
                items[d] = [{ id: x.projectId, name: x.projectCode, tasks: [x] }]
              }
            }
            return x;
          })
          return newE
        });
        projects = projects.filter(e => e.node.ganttTasks.length);
        for (let i in items) {
          items[i] = items[i].filter((x, y, z) => z.projectId == y.projectId);
        }
        return items
      }
      else return {}
    }, [data])

    React.useEffect(() => { 
      if(!uploadStateContext.inited) 
      uploadStateContextDispatch({
        type: "SET_INITED",
        payload: true,
      })
    }, []) 
    return (
      <>
        <Agenda
          onDayPress={onDatePress}
          selected={selectedDate}
          showClosingKnob={true}
          showOnlySelectedDayItems={true}
          items={items}
          renderEmptyDate={renderEmptyDate}
          renderEmptyData={renderEmptyData}
          renderItem={renderItem}
          renderDay={renderDay}
          onRefresh={refetch}
          refreshing={loading}
          theme={{
            agendaKnobColor: theme.colors.primary,
            backgroundColor: "red",
            'stylesheet.agenda.main': {
              reservations: {
                flex: 1,
                backgroundColor: theme.colors.accent,
                marginTop: 104,
              }
            }
          }}
          style={{}}
        />
      </>
    )
  }, [data])

  if (error) {
    Alert.alert(
      "Error",
      error.toString(),
      [
        { text: "關閉", onPress: () => { }}
      ]
    );
  }
  return (
    <>
       {
          loading ? <Loading></Loading> : null
       }
      <CalendarHeader title="待辦事項" selectedDate={'2022-08-18'} />
      <Divider/>
      <GanntAgenda/>
    </>
  )
}
const styles = StyleSheet.create(scalesStyle({
  dateChip: {
    height: 40,
    shadowColor: "#000",
    alignItems: 'center',
    justifyContent: 'center',
    alignContent: 'center',
    borderRadius: 25,
    backgroundColor: theme.default.colors.secondary,
    paddingHorizontal: 10
  },
  dateText: {
    fontWeight: 'bold',
    fontSize: 15,
    textAlign: 'center',
  },
  renderEmptyDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: "100%",
    position: "relative",
    backgroundColor: null
  }
}))