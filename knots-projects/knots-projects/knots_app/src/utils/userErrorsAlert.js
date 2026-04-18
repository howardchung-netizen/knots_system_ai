import { Alert } from "react-native"
export default (userErrors, cb) => {
  if (!userErrors.length) return;
  let msg = userErrors.map(e => {
    return e.message
  })
  Alert.alert(
    '操作失敗',
    msg.join('\n'),
    [
      { text: "關閉" }
    ]
  )
  if(cb)cb()
}