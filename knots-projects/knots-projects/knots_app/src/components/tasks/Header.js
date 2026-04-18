import React, { useContext} from 'react';
// import Header from '../header/Header';
// import Action from '../header/Action';
import Content from '../header/Content';
import { TaskListFilterButton } from './TaskListFilterButton';
import { ThemeContext } from '../../components/appContext/ThemeContext';
import { Divider } from 'react-native-paper';
// export default () => {
//  const [{ theme }] = useContext(ThemeContext);
//  return (
//   <>
//   <Header style={{ backgroundColor: theme.colors.accent }}>
//    <Content title="任務" titleStyle={{ color: theme.colors.primary }} />
//    <Action style={{ width: 75, padding: 0 }} icon={() => <TaskListFilterButton />} />
//   </Header>

//  </>
//  )
// }

export default React.forwardRef(({ goBackBtn, title, subTitle, body, Menu }, ref) => {
 console.log("forwardRef", title)
 const [_title, setTitle] = useState(title);
 const [_subTitle, setSubTitle] = useState(subTitle);
 const [_items, setItems] = useState(items);
 const [{ theme }] = useContext(ThemeContext);
 const buttonColor = theme.colors.accent;
 const itemsList = useMemo(() =>
  _items ? _items.map(e => {
   let _item = JSON.parse(JSON.stringify(e));
   _item.onPress = () => {
    if (e.onPress) e.onPress();
   }
   return _item
  }) : []
  , [_items])

 useEffect(() => {
  if (ref) ref({
   setTitle: setTitle,
   setSubTitle: setSubTitle,
   setItems: setItems
  });
 }, [])
 return (
  <Header
   style={{ alignContent: "space-between", width: "100%", justifyContent: "space-between" }} goBackBtn={goBackBtn}>
   <Content title={_title} subtitle={_subTitle} />
   {body()}
   <MenuButton button={<FontAwesome5Icon style={{ marginHorizontal: 12, marginVertical: 10 }} size={20} color={buttonColor} name="ellipsis-v" />} items={itemsList} />
  </Header>
 )
})  