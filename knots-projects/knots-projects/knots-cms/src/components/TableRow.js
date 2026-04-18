import { flexRender } from "@tanstack/react-table"
import { useDrag, useDrop } from "react-dnd";
import ViewHeadlineIcon from '@mui/icons-material/ViewHeadline';
import update from 'immutability-helper'
import { useContext, useState } from "react";
import { Menu, MenuItem } from "@mui/material";
import { ModalContext } from "../contexts/ModalContextProvider";
import _ from "underscore";

const isMobile = () => {
  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
};

export const TableRow = ({ row, data, onClick, onDoubleClick, menuItems }) => {

  const [myConfirmModalOpen, handleMyConfirmModalOpen, handleMyConfirmModalClose] = useContext(ModalContext);
  const className = onDoubleClick || onClick ? 'cursor-pointer' : '';
  
  const [contextMenu, setContextMenu] = useState(null);

  const _onDoubleClick = (e)=>{
    if(onDoubleClick) onDoubleClick(row.original, e);
  }

  const _onClick = (e)=>{
    if(isMobile() && onDoubleClick) onDoubleClick(row.original, e);
    if(onClick) onClick(row.original, e);
  }

  const handleContextMenu = (event) => {
    if(!menuItems) return;
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
      className={className}
      onDoubleClick={_onDoubleClick}
      onClick={_onClick}
      onContextMenu={handleContextMenu}
    >
			{row.getVisibleCells().map((cell, index) => {
				return (<td 
        key={`cell_${cell.id}_${index}`} 
        style={{
          textAlign: cell.column.columnDef.textAlign ?? 'left',
          ...cell.column.columnDef.style
        }}
        >
          {
            index == 0 && contextMenu !== null && <Menu
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
                menuItems.map((item, index) => (
                  <MenuItem key={index} onClick={(e) => {
                    if(item.mode) handleMyConfirmModalOpen(item.title, item.content, item.mode, ()=>{
                      if (item.onClick) item.onClick(data);
                      handleMyConfirmModalClose();
                    })
                    else if (item.onClick) item.onClick(data);
                    handleClose();
                    e.stopPropagation();
                    e.preventDefault();
                  }}>{item.label}</MenuItem>
                ))
              }
            </Menu>
          }
					{flexRender(cell.column.columnDef.cell, cell.getContext())}
				</td>)
			})}
		</tr>
	)
}

export const DraggableTableRow = ({ row, data, reorderRow, onDoubleClick, menuItems }) => {

  const [myConfirmModalOpen, handleMyConfirmModalOpen, handleMyConfirmModalClose] = useContext(ModalContext);
  
  const className = onDoubleClick ? 'cursor-pointer' : '';

  const [contextMenu, setContextMenu] = useState(null);

  const [, dropRef] = useDrop({
    accept: 'row',
    drop: (draggedRow) => reorderRow(draggedRow.index, row.index),
  })

  const [{ isDragging }, dragRef, previewRef] = useDrag({
    collect: monitor => ({
      isDragging: monitor.isDragging(),
    }),
    item: () => row,
    type: 'row',
  })

  const _onDoubleClick = (e)=>{
    if(onDoubleClick) onDoubleClick(row.original, e);
  }

  const handleContextMenu = (event) => {
    if(!menuItems) return;
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
      className={className}
      ref={previewRef} //previewRef could go here
      style={{
         opacity: isDragging ? 0.5 : 1,
       }}
       onDoubleClick={_onDoubleClick}
       onContextMenu={handleContextMenu}
    >
      {row.getVisibleCells().map((cell, index) => {
        if (index === 0) return (
          <td key={`cell_${cell.id}_${index}`}
            ref={dropRef}
            style={{
              wordBreak: 'break-all',
              textAlign: cell.column.columnDef.textAlign ?? 'left',
            }}>
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
                  menuItems.map((item, index) => (
                    <MenuItem key={index} onClick={(e) => {
                      if (item.mode) handleMyConfirmModalOpen(item.title, item.content, item.mode, () => {
                        if (item.onClick) item.onClick(data);
                        handleMyConfirmModalClose();
                      })
                      else if (item.onClick) item.onClick(data);
                      handleClose();
                      e.stopPropagation();
                      e.preventDefault();
                    }}>{item.label}</MenuItem>
                  ))
                }
              </Menu>
            }
            <button ref={dragRef} style={{ backgroundColor: null, borderWidth: 0, cursor: 'all-scroll' }}>
              <ViewHeadlineIcon />
            </button>
          </td>
        )
        return (<td key={`cell_${cell.id}_${index}`}
          style={{
            textAlign: cell.column.columnDef.textAlign ?? 'left',
          }}>
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </td>)
      })}
    </tr>
  )
}

export const DraggableTreeTableRow = ({ row, reorderRow, actions, onClick, onDoubleClick }) => {

  const [myConfirmModalOpen, handleMyConfirmModalOpen, handleMyConfirmModalClose] = useContext(ModalContext);

  const className = onDoubleClick ? 'cursor-pointer' : '';

  const _onDoubleClick = (e)=>{
    if(onDoubleClick) onDoubleClick(row.original, e);
  }

  const _onClick = (e)=>{
    if(onClick) onClick(row.original, e);
  }

  return (
    <tr
      className={className}
      onClick={_onClick}
      onDoubleClick={_onDoubleClick}
    >
      <td 
      style={{
        padding:'0px',
        margin: '0px',
        borderWidth: '0px',
      }}
      key={`cell`}
        colSpan={'100%'}
      >
      {/* <ProjectItemRow row={row} reorderRow={reorderRow} actions={actions} onClick={onClick} onDoubleClick={onDoubleClick}/> */}
      </td>
    </tr>
  )
}

export const reorderRow = (data, draggedRowIndex, targetRowIndex) => {
  const newData = JSON.parse(JSON.stringify(data));
  const [draggedItem] = newData.splice(draggedRowIndex, 1);
  newData.splice(targetRowIndex, 0, draggedItem);
  return newData;
}