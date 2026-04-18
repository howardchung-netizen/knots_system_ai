import AsyncStorage from '@react-native-async-storage/async-storage';
import promiseAll from '../promiseAll';
export const currentUser = async (user) => {
  if (user) AsyncStorage.setItem('@user', JSON.stringify(user))
  else {
    const currentUser = await AsyncStorage.getItem('@user');
    return currentUser ? JSON.parse(currentUser) : null
  }
}

export const token = async (token) => {
  if (token) AsyncStorage.setItem('@token', token)
  else {
    const _token = await AsyncStorage.getItem('@token');
    return _token ? _token : null
  }
}

export const deleteToken = async () => {
  console.log("deleteToken")
  try {
    await AsyncStorage.removeItem('@token')
    return true
  } catch (err) {
    console.log(err)
    return err
  }
}

export const account = async (account) => {
  try {
    if (account) AsyncStorage.setItem('@account', account)
    else {
      const _account = await AsyncStorage.getItem('@account');
      return _account ? _account : null
    }
  }
  catch (err) {
    console.log(err)
  }
}

export const deleteAccount = async () => {
  console.log("deleteAccount")
  try {
    await AsyncStorage.removeItem('@account')
    return true
  } catch (err) {
    console.log(err)
    return err
  }
}

export const password = async (password) => {
  try {
    if (password) AsyncStorage.setItem('@password', password)
    else {
      const _password = await AsyncStorage.getItem('@password');
      return _password ? _password : null
    }
  }
  catch (err) {
    console.log(err)
  }
}

export const deletePassword = async () => {
  console.log("deletePassword")
  try {
    await AsyncStorage.removeItem('@password')
    return true
  } catch (err) {
    console.log(err)
    return err
  }
}

export const logout = async (cb) => {
  try {
    await promiseAll([
      AsyncStorage.removeItem('@user'),
      AsyncStorage.removeItem('@token'),
      deleteAccount(),
      deletePassword()], (res) => { 
        if(cb)cb(res)
      })
    return true
  } catch(err) {
    return err
  }
}
