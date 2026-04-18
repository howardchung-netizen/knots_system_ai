import AsyncStorage from '@react-native-async-storage/async-storage';
import promiseAll from '../promiseAll';
export const taskListFilterSetting = async (setting) => {
  if (setting) AsyncStorage.setItem('@taskListFilterSetting', JSON.stringify(setting))
  else {
    const _setting = await AsyncStorage.getItem('@taskListFilterSetting');
    return _setting ? JSON.parse(_setting) :
      {
        keyword: null,
        status: {
          DONE: true,
          TODO: true,
          APPROVED: true
        },
        sortBy:"dueDate",
        orderBY:"ASC",
        init: true
      }
  }
}

export const myTaskListFilterSetting = async (setting) => {
  if (setting) AsyncStorage.setItem('@myTaskListFilterSetting', JSON.stringify(setting))
  else {
    const _setting = await AsyncStorage.getItem('@myTaskListFilterSetting');
    return _setting ? JSON.parse(_setting) :
      {
        keyword: null,
        status: {
          DONE: true,
          TODO: true,
          APPROVED: true
        },
        sortBy:"dueDate",
        orderBY:"ASC",
        init: true
      }
  }
}

export const imageGallerySetting = async (setting) => {
  if (setting) AsyncStorage.setItem('@imageGallerySetting', JSON.stringify(setting))
  else {
    const _setting = await AsyncStorage.getItem('@imageGallerySetting');
    return _setting ? JSON.parse(_setting) :
      {
        useGPS: false,
        autoUpload: false,
        autoUploadWithWifi: false,
        inited: true
      }
  }
}

