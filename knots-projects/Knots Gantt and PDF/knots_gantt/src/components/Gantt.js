/**
 * Gantt Component
 */
import { Popup, MessageDialog, Toast } from '@bryntum/gantt';

// React libraries
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/react-hooks';
import { GET_CALENDARS, GET_COLMUN_CONFIG, GET_SHARE_LINK } from "../apollo/queries";
import { GENERATE_SHARE, DISABLE_SHARE, UPDATE_CALENDAR, UPDATE_COLUMN_CONFIG } from "../apollo/mutations";
import moment from 'moment';

// Bryntum libraries
import { BryntumGantt } from '@bryntum/gantt-react';

// Application imports
import '../lib/StatusColumn';
import '../lib/LogsColumn';
import '../lib/StyleColumn';
import '../lib/NameEngColumn';
import '../lib/GanttToolbar';
import '../lib/MoveDayColumn';

const Gantt = props => {

  const rp1 = useQuery(GET_SHARE_LINK, { variables: { projectId: props.projectId }});
  const [genShare] = useMutation(GENERATE_SHARE);
  const [disShare] = useMutation(DISABLE_SHARE);
  const [updateCalendar] = useMutation(UPDATE_CALENDAR);
  const [btn, setBtn] = useState(true);
  const [btn2, setBtn2] = useState(true);
  const rp2 = useQuery(GET_CALENDARS, { variables: { projectId: props.projectId }});
  const [configData, setConfigData] = useState({
    "Task": true, "Task_Eng": true, "Start": true, "Due": true, "Days": true, "Progress": true, "Assigned": true, "Color": true, "Constrain": true, "Constrain_Date": true
  });
  const setupColumn = (config) => {
    if (props.readOnly) {
      if (!config['Task']) props.ganttRef.current.instance.columns.allRecords[0].hide();
      if (!config['Start']) props.ganttRef.current.instance.columns.allRecords[1].hide();
      if (!config['Due']) props.ganttRef.current.instance.columns.allRecords[2].hide();
      if (!config['Days']) props.ganttRef.current.instance.columns.allRecords[3].hide();
      if (!config['Progress']) props.ganttRef.current.instance.columns.allRecords[4].hide();
      if (!config['Constrain']) props.ganttRef.current.instance.columns.allRecords[5].hide();
      if (!config['Constrain_Date']) props.ganttRef.current.instance.columns.allRecords[6].hide();
    } else {
      if (!config['Task']) props.ganttRef.current.instance.columns.allRecords[0].hide();
      if (!config['Task_Eng']) props.ganttRef.current.instance.columns.allRecords[1].hide();
      if (!config['Start']) props.ganttRef.current.instance.columns.allRecords[2].hide();
      if (!config['Due']) props.ganttRef.current.instance.columns.allRecords[3].hide();
      if (!config['Days']) props.ganttRef.current.instance.columns.allRecords[4].hide();
      if (!config['Progress']) props.ganttRef.current.instance.columns.allRecords[5].hide();
      if (!config['Assigned']) props.ganttRef.current.instance.columns.allRecords[6].hide();
      if (!config['Color']) props.ganttRef.current.instance.columns.allRecords[7].hide();
      if (!config['Constrain']) props.ganttRef.current.instance.columns.allRecords[8].hide();
      if (!config['Constrain_Date']) props.ganttRef.current.instance.columns.allRecords[9].hide();
    }
  }
  const rp3 = useQuery(GET_COLMUN_CONFIG, {
    onCompleted: data => {
      if (data?.ganttColumnConfig?.ganttColumnConfig?.config) {
        setConfigData(data?.ganttColumnConfig?.ganttColumnConfig?.config);
        setupColumn(data?.ganttColumnConfig?.ganttColumnConfig?.config);
      }
    }
  });
  const [updateColumnConfig] = useMutation(UPDATE_COLUMN_CONFIG);

  const onToolbarAction = async (source) => {
    if (source === 'share') {
      sharePopup();
    } else if (source === 'calendar') {
      updateCalendarPopup();
    } else if (source === 'columnConfig') {
      updateColumnConfigPopup();
    }
  }

  const sharePopup = async () => {
    const generateShare = async () => {
      if (popup.widgetMap.expiredField.value === '' || popup.widgetMap.remarkField.value === '' && Number.isInteger(parseInt(popup.widgetMap.expiredField.value))) {
        return;
      }
      const genRP = await genShare({ variables: { data: {
        projectId: props.projectId,
        expiredDay: parseInt(popup.widgetMap.expiredField.value),
        remark: popup.widgetMap.remarkField.value
      } } });
      if (genRP?.data?.ganttShareGenerate?.ganttShare){
        copyLink(genRP?.data?.ganttShareGenerate?.ganttShare?.code);
      }
      await rp1.refetch();
      Toast.show(`Generate link was successful.`);
      popup.hide();
    }

    const disableShare = async (code) => {
      const disRP = await disShare({ variables: { data: { code: code } } });
      Toast.show(`The share link disabled already.`);
    }

    const copyLink = (code) => {
      navigator.clipboard.writeText(`${props.REACT_APP_KQS_SHARE_LINK}/${code}/${props.projectId}`);
      Toast.show(`The share link copy already.`);
    }

    const copyLinkEng = (code) => {
      navigator.clipboard.writeText(`${props.REACT_APP_KQS_SHARE_LINK+'_en'}/${code}/${props.projectId}`);
      Toast.show(`The share link copy already.`);
    }

    const renderShares = () => {
      const shares = rp1?.data?.ganttShares?.edges?.map(x => x.node);
      let items = [];
      items.push({
        type: 'container',
        style: {
          display: 'flex',
          flexDirection: 'row'
        },
        items: [
          {
            type: 'display',
            label: '',
            value: 'No.',
            style: {flex: 0.1},
          },
          {
            type: 'display',
            label: '',
            value: 'Expired Time',
            style: {flex: 0.35},
          },
          {
            type: 'display',
            label: '',
            value: 'Remark',
            style: {flex: 0.25},
          },
          {
            type: 'display',
            label: '',
            value: 'Link',
            style: {flex: 0.2},
          },
          {
            type: 'display',
            label: '',
            value: 'Disable',
            style: {flex: 0.1},
          }
        ]
      });
      shares.map((e, i) => (
        items.push(
        {
          type: 'container',
          style: {display: 'flex',flexDirection: 'row'},
          items: [
            {
              type: 'display',
              label: '',
              value: i+1,
              style: {flex: 0.1},
            },
            {
              type: 'display',
              label: '',
              value: moment(e.expiredTime).format('YYYY-MM-DD HH:MM'),
              style: {flex: 0.35},
            },
            {
              type: 'display',
              label: '',
              value: e.remark,
              style: {flex: 0.25},
            },
            {
              type: 'container',
              style: {flex: 0.2},
              items: [
                {
                  type: 'button',
                  cls: 'b-raised b-rounded',
                  //icon: 'b-fa-copy',
                  text: '中',
                  style: {
                    fontSize: 10,
                    marginRight: 5
                  },
                  onAction: () => {
                    copyLink(e.code);
                  }
                },
                {
                  type: 'button',
                  cls: 'b-raised b-rounded',
                  //icon: 'b-fa-copy',
                  text: '英',
                  style: {
                    fontSize: 10
                  },
                  onAction: () => {
                    copyLinkEng(e.code);
                  }
                }
              ]
            },
            {
              type: 'container',
              style: {flex: 0.1},
              items: [
                {
                  type: 'button',
                  cls: 'b-raised b-rounded',
                  icon: 'b-fa-trash-can',
                  color: 'b-red',
                  style: {
                    fontSize: 10
                  },
                  onClick: async () => {
                    const result = await MessageDialog.confirm({
                      title: 'Confirm',
                      message: 'Confirm to disable this share link?',
                      okButton: 'Yes',
                      cancelButton: 'No'
                    });

                    if (result === MessageDialog.okButton) {
                      await disableShare(e.code);
                      await rp1.refetch();
                    }
                    popup.hide();
                  },
                }
              ]
            }
          ]
        })
      ));

      items.push({
        type: 'container',
        style: {
          display: 'flex',
          flexDirection: 'row'
        },
        items: [
          {
            type: 'display',
            label: 'Generate:',
            value: '',
            style: { flex: 0.2 }
          },
          {
            ref: 'expiredField',
            type: 'text',
            label: 'Expired in Days',
            placeholder : 'Expired in Days',
            style: { marginRight : '.5em',flex: 0.3 },
            onChange: () =>{
              if (!Number.isInteger(parseInt(popup.widgetMap.expiredField.value))) {
                popup.widgetMap.expiredField.value = '';
                popup.widgetMap.genBtn.disabled = true;
                return;
              }
              if (popup.widgetMap.expiredField.value !== '' && popup.widgetMap.remarkField.value !== '') {
                popup.widgetMap.genBtn.disabled = false;
              } else {
                popup.widgetMap.genBtn.disabled = true;
              }
            }
          },
          {
            ref: 'remarkField',
            type: 'text',
            label: 'Remark',
            placeholder : 'Remark',
            value: '',
            style: {marginLeft: 15, flex: 0.5},
            onChange: () =>{
              if (popup.widgetMap.expiredField.value !== '' && popup.widgetMap.remarkField.value !== '') {
                popup.widgetMap.genBtn.disabled = false;
              } else {
                popup.widgetMap.genBtn.disabled = true;
              }
            }
          },
        ]
      });

      return items;
    }

    const renderItems = () => {
      return renderShares();
    }

    const popup = new Popup({
      header: 'Share',
      autoShow: false,
      centered: true,
      closeAction: 'destroy',
      closable: true,
      width: '40em',
      bbar: [
        {
          ref: 'genBtn',
          text: 'Generate',
          minWidth: 100,
          cls: 'b-raised b-blue',
          disabled: btn,
          onAction: async () => {
            await generateShare();
          }
        }
      ],
      items: renderItems()
    });
    popup.show();
  }

  const updateCalendarPopup = async (source) => {
    const callUpdateCalendar = async () => {
      if (popup.widgetMap.calendarField.value === '') {
        return;
      }
      const genRP = await updateCalendar({ variables: { data: {
        projectId: props.projectId,
        calendarId: popup.widgetMap.calendarField.value,
      } } });
      if (!genRP?.data?.ganttUpdateCalendar?.userErrors.length){
        Toast.show(`Update Calendar was successful.`);
        popup.hide();
        window.location.reload();
      } else {
        Toast.show(`Update Calendar fail:`,genRP?.data?.ganttUpdateCalendar?.userErrors[0].message);
        await rp2.refetch();
        popup.hide();
      }
    }

    const renderCalendar = () => {
      const calendars = rp2.data?.ganttCalendars?.edges?.map(x => x.node);
      let items = [];
      let choice = [];
      calendars.map((e, i) => (
        choice.push({value: e.id,text: e.name})
      ));

      items.push({
        type: 'combo',
        items: choice,
        ref: 'calendarField',
        label: 'Calendar Select:',
        placeholder : 'Please select',
        onChange: () =>{
          popup.widgetMap.genBtn.disabled = popup.widgetMap.calendarField.value === '';
        }
      });

      return items;
    }

    const renderItems = () => {
      return renderCalendar();
    }

    const popup = new Popup({
      header: 'Calendar Day Setup',
      autoShow: false,
      centered: true,
      closeAction: 'destroy',
      closable: true,
      width: '20em',
      bbar: [
        {
          ref: 'genBtn',
          text: 'Update',
          minWidth: 100,
          cls: 'b-raised b-blue',
          disabled: btn2,
          onAction: async () => {
            await callUpdateCalendar();
          }
        }
      ],
      items: renderItems()
    });
    popup.show();
  }

  const updateColumnConfigPopup = async (source) => {
    const callUpdateColumnConfig = async () => {
      if (!Object.keys(configData).find(key => configData[key] === true)) {
        Toast.show(`請選擇最少一項。`);
        return;
      }
      const genRP = await updateColumnConfig({ variables: { data: {
        config: configData,
      } } });
      if (!genRP?.data?.ganttColumnConfigSave?.userErrors.length){
        Toast.show(`Update Column Config was successful.`);
        await rp3.refetch();
        popup.hide();
      } else {
        Toast.show(`Update Column Config fail:`,genRP?.data?.ganttColumnConfigSave?.userErrors[0].message);
        await rp3.refetch();
        popup.hide();
      }
    }

    const renderColumnConfig = () => {
      let items = [];
      if (Object.keys(configData).length) {
        items.push({
          type: 'checkbox',
          ref: `configField_${configData['Task']}`,
          label: `Task`,
          checked: configData['Task'],
          onChange: () =>{
            const column = props.ganttRef.current.instance.columns.allRecords[0];
            configData['Task'] ? column.hide() : column.show();
            configData['Task'] = !configData['Task'];
            setConfigData({ ...configData})
          }
        });
        items.push({
          type: 'checkbox',
          ref: `configField_${configData['Task_Eng']}`,
          label: `Task Eng`,
          checked: configData['Task_Eng'],
          onChange: () =>{
            const column = props.ganttRef.current.instance.columns.allRecords[1];
            configData['Task_Eng'] ? column.hide() : column.show();
            configData['Task_Eng'] = !configData['Task_Eng'];
            setConfigData({ ...configData})
          }
        });
        items.push({
          type: 'checkbox',
          ref: `configField_${configData['Start']}`,
          label: `Start`,
          checked: configData['Start'],
          onChange: () =>{
            const column = props.ganttRef.current.instance.columns.allRecords[2];
            configData['Start'] ? column.hide() : column.show();
            configData['Start'] = !configData['Start'];
            setConfigData({ ...configData})
          }
        });
        items.push({
          type: 'checkbox',
          ref: `configField_${configData['Due']}`,
          label: `Due`,
          checked: configData['Due'],
          onChange: () =>{
            const column = props.ganttRef.current.instance.columns.allRecords[3];
            configData['Due'] ? column.hide() : column.show();
            configData['Due'] = !configData['Due'];
            setConfigData({ ...configData})
          }
        });
        items.push({
          type: 'checkbox',
          ref: `configField_${configData['Days']}`,
          label: `Days`,
          checked: configData['Days'],
          onChange: () =>{
            const column = props.ganttRef.current.instance.columns.allRecords[4];
            configData['Days'] ? column.hide() : column.show();
            configData['Days'] = !configData['Days'];
            setConfigData({ ...configData})
          }
        });
        items.push({
          type: 'checkbox',
          ref: `configField_${configData['Progress']}`,
          label: `Progress`,
          checked: configData['Progress'],
          onChange: () =>{
            const column = props.ganttRef.current.instance.columns.allRecords[5];
            configData['Progress'] ? column.hide() : column.show();
            configData['Progress'] = !configData['Progress'];
            setConfigData({ ...configData})
          }
        });
        items.push({
          type: 'checkbox',
          ref: `configField_${configData['Assigned']}`,
          label: `Assigned`,
          checked: configData['Assigned'],
          onChange: () =>{
            const column = props.ganttRef.current.instance.columns.allRecords[6];
            configData['Assigned'] ? column.hide() : column.show();
            configData['Assigned'] = !configData['Assigned'];
            setConfigData({ ...configData})
          }
        });
        items.push({
          type: 'checkbox',
          ref: `configField_${configData['Color']}`,
          label: `Color`,
          checked: configData['Color'],
          onChange: () =>{
            const column = props.ganttRef.current.instance.columns.allRecords[7];
            configData['Color'] ? column.hide() : column.show();
            configData['Color'] = !configData['Color'];
            setConfigData({ ...configData})
          }
        });
        items.push({
          type: 'checkbox',
          ref: `configField_${configData['Constrain']}`,
          label: `Constrain`,
          checked: configData['Constrain'],
          onChange: () =>{
            const column = props.ganttRef.current.instance.columns.allRecords[8];
            configData['Constrain'] ? column.hide() : column.show();
            configData['Constrain'] = !configData['Constrain'];
            setConfigData({ ...configData})
          }
        });
        items.push({
          type: 'checkbox',
          ref: `configField_${configData['Constrain_Date']}`,
          label: `Constrain_Date`,
          checked: configData['Constrain_Date'],
          onChange: () =>{
            const column = props.ganttRef.current.instance.columns.allRecords[9];
            configData['Constrain_Date'] ? column.hide() : column.show();
            configData['Constrain_Date'] = !configData['Constrain_Date'];
            setConfigData({ ...configData})
          }
        });
      }
      return items;
    }

    const renderItems = () => {
      return renderColumnConfig();
    }

    const popup = new Popup({
      header: 'Column Config',
      autoShow: false,
      centered: true,
      closeAction: 'destroy',
      closable: true,
      width: '20em',
      bbar: [
        {
          ref: 'genBtn',
          text: 'Save',
          minWidth: 100,
          cls: 'b-raised b-blue',
          onAction: async () => {
            await callUpdateColumnConfig();
          }
        }
      ],
      items: renderItems()
    });
    popup.show();
  }

  return (
    <BryntumGantt  {...props} ref={props.ganttRef} extraData={onToolbarAction} />);
};

export default Gantt;
