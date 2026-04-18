import { IconButton, ListItem, ListItemButton, ListItemIcon, ListItemText, Tooltip, Typography } from "@mui/material"
import { Link } from "react-router-dom"
import { useState } from "react";
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';

const hoverStyles = {
  // backgroundColor: '#1876d2',
  // color: 'white',
};

export const NavMenuItem = ({  to, icon, text, open, subMenu, isSubMenu, isUpperOpen, selectedPath, onMenuClick }) => {

  const currentPath = window.location.pathname;
  const isCurrentPage = currentPath.includes(to);
  const [hasSubMenu, setHasSubMenu] = useState(subMenu?.length > 0);
  const [isMenuOpen, setIsMenuOpen] = useState(isUpperOpen);
  const [isHovered, setIsHovered] = useState(false);

  const rootStyle = {
    minHeight: 48,
    justifyContent: open ? 'initial' : 'center',
    px: 2.5,
    fontWeight: isCurrentPage ? 'bold' : null,
    // backgroundColor: isCurrentPage ? '#1876d2' : 'white',
    color: isCurrentPage ? 'primary.main' : '#7d7d7d',
    "&:hover": hoverStyles,
  }

  const subMenuStyle = {
    minHeight: 48,
    justifyContent: open ? 'initial' : 'center',
    px: 2.5,
    fontWeight: isCurrentPage ? 'bold' : null,
    color: isMenuOpen || isHovered ? '#7d7d7d' : '#7d7d7d',
  }

  const listItemIconColor = () =>{
    if(isSubMenu) return '#7d7d7d'
    else return isCurrentPage ? 'primary.main' : '#7d7d7d'
  }

  return (
    <>
      <Tooltip key={to} title={text} placement="right">
        <ListItem disablePadding sx={{ display: 'block', color: isMenuOpen ? 'white' : '#7d7d7d' }} onClick={() => {
           if(hasSubMenu) setIsMenuOpen(!isMenuOpen)
          if (onMenuClick) onMenuClick(to)
        }}>
          <Link style={{ textDecoration: 'none' }} to={to}>
            <ListItemButton
              sx={isSubMenu ? subMenuStyle : rootStyle}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              <ListItemIcon
                className="sub-menu-icon"
                sx={{
                  minWidth: 0,
                  mr: open ? 3 : 'auto',
                  justifyContent: 'center',
                  color: listItemIconColor(),
                }}
              >
                {icon}
              </ListItemIcon>
              <ListItemText primary={<Typography sx={{ opacity: open ? 1 : 0, fontWeight: 'bold' }}>{text}</Typography>} />
              {hasSubMenu && open && <IconButton sx={{ transform: isMenuOpen ? 'rotate(270deg)' : 'rotate(0deg)', position: 'absolute', right: 5, color: isMenuOpen || isHovered ? 'white' : '#7d7d7d' }}>
                <ChevronLeftIcon />
              </IconButton>}
            </ListItemButton>
          </Link>
        </ListItem>
      </Tooltip>
      {
        subMenu && isMenuOpen && subMenu.length > 0 ? subMenu.map(e => <NavMenuItem key={e.text} {...e} open={open} selectedPath={selectedPath} onMenuClick={onMenuClick} isSubMenu isUpperOpen={isMenuOpen} />) : null
      }
    </>
  )
}