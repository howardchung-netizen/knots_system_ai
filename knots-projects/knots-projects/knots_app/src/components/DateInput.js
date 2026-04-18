import React, { useState, useContext, useRef } from 'react';
import { StyleSheet, View, TouchableOpacity, Platform } from 'react-native';
import { ThemeContext } from './appContext/ThemeContext';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { AlertError } from './AlertError';
import moment from 'moment';
import { TaskUpdateUseMutation } from './tasks/TaskUseMutation';
import { Text } from './Text';

const variables = (id, column, date,) => { 
    let data = {};
    data[column] = date;
    if (id) data.id = id;
    return { data }
}

const dateColor = (date) => {
    // console.log("dateColor", date)
    let before = "red", after = "green", same = "orange"
    if (!date) return "#f4f4f4"
    // "theme.colors.accent"
    switch (true) {
        case moment(date).isBefore(moment().format('YYYY-MM-DD')):
            return before
        case moment(date).isSame(moment().format('YYYY-MM-DD')):
            return same
        case moment(date).isAfter(moment().format('YYYY-MM-DD')):
            return after
    }
}

export const DateInput = (props) => {
    //  console.log("DateInput", props);
    const [{ theme }] = useContext(ThemeContext);
    const [date, setDate] = useState(props.date);
    const currentDate = useRef(props.date??moment().format("YYYY-MM-DD"));
    const [errorMsg, setErrorMsg] = useState(null);
    const [datePickerMode, setDatePickerMode] = useState('date');
    const [isOpen, setOpen] = useState(false);
    const iconSize = props.iconSize ?? 30;
    const textStyle = {
        textAlign: 'left',
        color: theme.colors.text,
        fontSize: props.fontSize ? props.fontSize : 12
    }
    const iconColor = date ? dateColor(date) : textStyle.color;
    const titleStyle = {
        color: props.titleSize ?? theme.colors.text,
        fontSize: props.titleSize ?? 12
    }
    const dateStyle = {
        marginRight: 5,
        color: date ? dateColor(date) : theme.colors.text,
        fontSize: props.dateSize ?? 14,
        fontWeight: 'bold',
    }
    const setDateValue = (date) => {
        console.log(date)
        if (date) {
            let dateTimestamp = moment(date, 'YYYY-MM-DD').valueOf()
            return new Date(dateTimestamp)
        }
        else return new Date();
    }
    const onChange = (selectedDate) => {
        if (selectedDate) {
        currentDate.current = moment(selectedDate).format('YYYY-MM-DD');
        }
    };
    const onConfirm = (date) => {
        setOpen(false);
        if (Platform.OS == "android") {
            currentDate.current = moment(date).format("YYYY-MM-DD")
        }
        setDate(currentDate.current);
        if (props.onConfirm) props.onConfirm(currentDate.current);
    }
    const onCancel = ()=>{
        setDateValue(props.date);
        currentDate.current = props.date;
        setOpen(false);
    }
    const dateValue = () => { 
          return currentDate.current ? new Date(parseInt(moment(currentDate.current, "YYYY-MM-DD").format("x"))) : new Date(parseInt(moment(Date.now()).format("x")));     
    }
    return (
        <>
            <TouchableOpacity onPress={() => setOpen(true)}>
                <View style={[styles.container, props.containerStyle]}>
                    {/* <View style={[styles.iconWrap, { borderColor: textStyle.color }]}>
                        <FontAwesome5 name='calendar-alt' color={date?iconColor:theme.colors.text} size={iconSize} soild />
                    </View> */}
                    <View style={{ alignSelf : 'stretch' }}>
                        {props.title ? <Text style={[textStyle, titleStyle]} size={titleStyle.fontSize} color={titleStyle.color}>{props.title}</Text> : null }
                        {date ? <Text style={[textStyle, dateStyle]} size={dateStyle.fontSize} color={dateStyle.color}>{date}</Text> :<Text style={[textStyle, dateStyle]} size={dateStyle.fontSize} color={dateStyle.color}>{props.placeholder}</Text> }
                    </View>
                </View>
            </TouchableOpacity>
            <DateTimePickerModal
                pickerContainerStyleIOS={{backgroundColor:theme.colors.accent}}
                isDarkModeEnabled={false}
                textColor={theme.colors.titleText}
                isVisible={isOpen}
                // display={"inline"}
                mode="date"
                date={dateValue()}
                onChange={onChange}
                onConfirm={onConfirm}
                onCancel={onCancel}
            />
        </>
    )
}

export const TaskDateInput = ({id, title, column, date, ...props }) => {
    return <DateInput {...props} id={id} title={title} date={date} containerStyle={{marginHorizontal:0}}/>
}
const styles = StyleSheet.create({
 container: {
  alignItems: "center",
//   flexDirection: "row",
  marginTop: 0,
//   marginRight: 5,
 },
 iconWrap: {
  // borderRadius: 25,
  // borderWidth: 1,
  // paddingHorizontal: 9,
  // paddingVertical: 7,
  // borderStyle: "dashed"
//   marginRight:5,
 },
});