import * as React from 'react';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ConfirmModal from './ConfirmModal';

export default function ContextMenu(props) {

  const [contextMenu, setContextMenu] = React.useState(null);

  const handleContextMenu = (event) => {
    if(!props.items || myConfirmModalOpen.open) return;
    event.preventDefault();
    setContextMenu(
      contextMenu === null
        ? {
            mouseX: event.clientX + 2,
            mouseY: event.clientY - 6,
          }
        : // repeated contextmenu when it is already open closes it with Chrome 84 on Ubuntu
          // Other native context menus might behave different.
          // With this behavior we prevent contextmenu from the backdrop to re-locale existing context menus.
          null,
    );
  };

  const handleClose = () => {
    setContextMenu(null);
  };

  const [myConfirmModalOpen, setMyConfirmModalOpen] = React.useState({
    open: false,
    title: null,
    content: null,
    onConfirm: ()=>{},
  });
  
  const handleMyConfirmModalOpen = (title, content, onConfirm, mode) => setMyConfirmModalOpen({
    open: true,
    title: title,
    content: content,
    onConfirm: onConfirm,
    mode: mode,
    onClose: handleMyConfirmModalClose
  });

  const handleMyConfirmModalClose = () => setMyConfirmModalOpen({
    open: false,
    title: null,
    content: null,
    onConfirm: ()=>{},
    onClose: handleMyConfirmModalClose
  });

  return (
    <div onContextMenu={handleContextMenu} style={{ width: '100%' }}>
      <ConfirmModal
        mode={myConfirmModalOpen.mode}
        open={myConfirmModalOpen.open}
        title={myConfirmModalOpen.title}
        content={myConfirmModalOpen.content}
        onCloseClick={myConfirmModalOpen.onClose}
        onConfirmClick={()=>{
          if(myConfirmModalOpen.onConfirm) myConfirmModalOpen.onConfirm();
          handleMyConfirmModalClose();
        }}
      />
      {props.children}
      {
      contextMenu !== null && <Menu
        open={contextMenu !== null}
        onClose={handleClose}
        anchorReference="anchorPosition"
        anchorPosition={
          contextMenu !== null
            ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
            : undefined
        }
      >
        {
          props.items.map((item, index) => (
            <MenuItem key={index} onClick={(e)=>{
              if (item.mode) handleMyConfirmModalOpen(item.title, item.content, () => {
                item.onClick(props.data)
              }, item.mode);
              else if(item.onClick) item.onClick(props.data);
              handleClose();
              e.stopPropagation();
              e.preventDefault();
            }}>{item.label}</MenuItem>
          ))
        }
      </Menu>
      }
    </div>
  );
}

export const ContextMenuTr = function ContextMenu({items, ...props}) {

  const [contextMenu, setContextMenu] = React.useState(null);

  const handleContextMenu = (event) => {
    if (!props.items) return;
    event.preventDefault();
    setContextMenu(
      contextMenu === null
        ? {
          mouseX: event.clientX + 2,
          mouseY: event.clientY - 6,
        }
        : // repeated contextmenu when it is already open closes it with Chrome 84 on Ubuntu
        // Other native context menus might behave different.
        // With this behavior we prevent contextmenu from the backdrop to re-locale existing context menus.
        null,
    );
  };

  const handleClose = () => {
    setContextMenu(null);
  };

  return (
    <tr
      onContextMenu={handleContextMenu}
      style={{ width: '100%' }}
      {...props}
    >
      {props.children}
      {
        contextMenu !== null && <Menu
          open={contextMenu !== null}
          onClose={handleClose}
          anchorReference="anchorPosition"
          anchorPosition={
            contextMenu !== null
              ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
              : undefined
          }
        >
          {
            items.map((item, index) => (
              <MenuItem key={index} onClick={(e) => {
                if (item.onClick) item.onClick(props.data);
                handleClose();
                e.stopPropagation();
                e.preventDefault();
              }}>{item.label}</MenuItem>
            ))
          }
        </Menu>
      }
    </tr>
  );
}
