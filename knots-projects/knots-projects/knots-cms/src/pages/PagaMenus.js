import { filter } from "underscore"
import {NavMenuItem} from "../components/NavMenuItem"

export default ({ menu, open, selectedPath, onMenuClick }) => {
 
  const accessibleMenu = menu.filter((item) => {
    return true
  })

  return (
    <>
      {
        accessibleMenu.map((item, index) => {
          return <NavMenuItem key={"NavMenuItem_"+item.text+index} {...item} open={open} selectedPath={selectedPath} onMenuClick={onMenuClick}/>
        })
      }
    </>
  )
}