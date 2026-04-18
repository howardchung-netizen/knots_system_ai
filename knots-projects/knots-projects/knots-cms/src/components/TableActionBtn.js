import { Box, Button, Card, IconButton, styled, Tooltip } from "@mui/material"
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import BeenhereIcon from '@mui/icons-material/Beenhere';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import React from "react";
import ConfirmModal from "./ConfirmModal";
import { AiFillDollarCircle } from 'react-icons/ai';
import { FaTimesCircle } from "react-icons/fa";
import { keyframes } from '@mui/system';
import { GridToolbarContainer, GridToolbarExport, GridToolbarQuickFilter, GridFilterModel } from "@mui/x-data-grid";
import CachedIcon from '@mui/icons-material/Cached';
import DebouncedInput from './DebouncedInput';
import exportDataToXLSX from "./ExportDataToXLSX";
import PrintIcon from '@mui/icons-material/Print';
import AddIcon from '@mui/icons-material/Add';

const spin = keyframes`
  0% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(255, 82, 82, 0.7);
  }

  70% {
      transform: scale(1);
      box-shadow: 0 0 0 10px rgba(255, 82, 82, 0);
  }

  100% {
      transform: scale(0.95);
      box-shadow: 0 0 0 0 rgba(255, 82, 82, 0);
  }
`

export const WithSignal = (props)=>{
    const RotatedBox = styled(props.icon)((color) => {
        return {
            borderRadius: '50%',
            boxShadow: '0 0 0 0 rgba(255, 82, 82, 1)',
            transform: 'scale(1)',
            animation: `${spin} 2s infinite`,
            color: 'red',
            fontSize: '13px'
        }
    })

    return <RotatedBox/>
} 


export const TableEditBtn = ({ title, onClick }) => {
    return (
        <Tooltip title={title ?? '編輯'}>
            <IconButton onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                if (onClick) onClick()
            }}>
                <EditIcon />
            </IconButton>
        </Tooltip>
    )
}

export const TableDelBtn = ({ onClick }) => {

  const [myConfirmModalOpen, setMyConfirmModalOpen] = React.useState({
    open: false,
    title: null,
    content: null,
    onConfirm: ()=>{},
  });
  
  const handleMyConfirmModalOpen = (title, content, onConfirm) => setMyConfirmModalOpen({
    open: true,
    title: title,
    content: content,
    onConfirm: onConfirm,
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
    <>
      <ConfirmModal
        mode={'warning'}
        open={myConfirmModalOpen.open}
        title={myConfirmModalOpen.title}
        content={myConfirmModalOpen.content}
        onCloseClick={myConfirmModalOpen.onClose}
        onConfirmClick={myConfirmModalOpen.onConfirm}
      />
      <Tooltip title={'刪除'} >
        <IconButton
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            handleMyConfirmModalOpen('確定刪除?', '', ()=>{
                if (onClick) onClick();
                handleMyConfirmModalClose();
            })
          }}
        >
          <DeleteIcon />
        </IconButton>
      </Tooltip>
    </>
  )
} 

export const RemoveBtn = ({title, onClick, ...props }) => {
    return (
        <Tooltip title={title} >
            <IconButton
                sx={{fontSize: 20}}
                onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    if (onClick) onClick()
                }}
            >
                <FaTimesCircle />{props.children}
            </IconButton>
        </Tooltip>
    )
} 

export const AddBtn = ({title, onClick, ...props }) => {
    return (
        <Tooltip title={title??'新增'} >
            <IconButton
                sx={{fontSize: 20}}
                onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    if (onClick) onClick()
                }}
            >
                <AddIcon />{props.children}
            </IconButton>
        </Tooltip>
    )
} 

export const CutOffBtn = ({ onClick }) => {
    return (
        <Tooltip title={'結單'} >
            <IconButton
                onClick={(e) => {
                    if (onClick) onClick()
                }}
            >
                <BeenhereIcon />
            </IconButton>
        </Tooltip>
    )
}

export const TableViewBtn = ({title, onClick, ...props }) => {
    return (
        <Tooltip title={title??'查看'} >
            <IconButton
                sx={{fontSize: 15}}
                onClick={(e) => {
                    if (onClick) onClick()
                }}
            >
                <VisibilityIcon />{props.children}
            </IconButton>
        </Tooltip>
    )
} 

export const TableDoneBtn = ({title, onClick, ...props }) => {
    return (
        <Tooltip title={title} >
            <IconButton
                sx={{fontSize: 15}}
                onClick={(e) => {
                    if (onClick) onClick()
                }}
            >
                <CheckCircleIcon />{props.children}
            </IconButton>
        </Tooltip>
    )
} 

export const KeyboardArrowIcon = ({ open, onClick }) => {
    const title = open ? '收起' : '展開';
    return (
        <Tooltip title={title} >
            <IconButton
                sx={{ fontSize: 15 }}
                onClick={(e) => {
                    if (onClick) onClick()
                }}
            >
                {
                    open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />
                }
            </IconButton>
        </Tooltip>
    )
}

export const AiFillDollarCircleBtn = ({title, onClick, ...props }) => {
    return (
        <Tooltip title={title} >
            <IconButton
                sx={{fontSize: 24}}
                onClick={(e) => {
                    if (onClick) onClick()
                }}
            >
                <AiFillDollarCircle />{props.children}
            </IconButton>
        </Tooltip>
    )
} 

export const PrintBtn = ({title, onClick, ...props }) => {
    return (
        <Tooltip title={title} >
            <IconButton
                sx={{fontSize: 20}}
                onClick={(e) => {
                    if (onClick) onClick()
                }}
            >
                <PrintIcon />{props.children}
            </IconButton>
        </Tooltip>
    )
} 

export const CustomActionBtn = ({title, onClick, ...props }) => {
    return (
        <Tooltip title={title} componentsProps={props.componentsProps}>
            <IconButton
                sx={{}}
                onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    if (onClick) onClick()
                }}
            >
                {props.children}
            </IconButton>
        </Tooltip>
    )
} 

export const CustomToolBtn = ({title, onClick, ...props }) => {
    return (
        <Tooltip title={title} >
            <IconButton
                sx={{ 
                    height: '100%', 
                    height: '52px', 
                    fontWeight: 'bold', 
                    border: '1px solid rgb(235, 235, 235)', 
                    borderRadius: '0px', 
                    fontSize: 14,
                    color: '#1976d2',
                    "&:hover": {
                        backgroundColor: 'rgba(33, 150, 243, 0.3)',
                        borderColor: 'rgb(235, 235, 235)', 
                    }
                 }}
                onClick={(e) => {
                    if (onClick) onClick()
                }}
            >
                {props.children}
            </IconButton>
        </Tooltip>
    )
} 

export const TableToolBar = function ({ onReloadClick, data, columns, tableName, filterModal }) {

    const documentTitle = tableName || document.title;

    return (
        <div>
            <GridToolbarContainer>
                <Button
                    startIcon={<CachedIcon />}
                    onClick={() => { if (onReloadClick) onReloadClick(); }}
                >
                    重新整理
                </Button>
                <Button onClick={()=>{
                    exportDataToXLSX(columns, data, documentTitle)
                }}>導出xlsx</Button>
                <GridToolbarExport 
                  csvOptions={{
                        fieldSeparator: ',',
                        quoteStrings: false,
                        decimalSeparator: '.',
                        showLabels: true,
                        showTitle: false,
                        useTextFile: false,
                        useBom: true,
                        useKeysAsHeaders: true,
                        encoding: 'UTF-8',
                        utf8WithBom: true,
                        shouldAutoWidth: true,
                  }}
                />

                <GridToolbarQuickFilter sx={{alignSelf: 'flex-end'}}/>
            </GridToolbarContainer>
        </div>
    );
}

export const CreateBtn = ({onClick, ...props }) => {
   return <Button
    sx={{ 
        height: '100%', 
        height: '52px', 
        fontWeight: 'bold', 
        border: '1px solid rgb(235, 235, 235)', 
        borderRadius: '0px', 
        fontSize: 14,
        "&:hover": {
            backgroundColor: 'rgba(33, 150, 243, 0.3)',
            borderColor: 'rgb(235, 235, 235)', 
        }
     }}
    variant="outlined"
    startIcon={<AddIcon style={{fontSize: 23, color: '#1976d2'}} size="large"/>}
    onClick={onClick}
  >
    {props.children}
  </Button>
}

export const RefreshBtn = ({onClick, ...props }) => {
    return <Box sx={{
        display: 'flex', 
        justifyContent: 'center', 
        height: '100%', 
        width: '52px',
        alignItems: 'center',
        cursor: 'pointer',
         "&:hover": {
            backgroundColor: 'rgba(33, 150, 243, 0.3)',
            borderColor: 'rgb(235, 235, 235)', 
        }
    }}
    onClick={onClick}
    >
    <CachedIcon sx={{ height: '100%', color: '#1976d2', fontSize: 20}}/>
    </Box>
 }