import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Modal from '@mui/material/Modal';
import { AppBar } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { styled } from '@mui/styles';
import { darkenColor } from '../utils';
import language from '../localization/language';

const Root = styled(Box)(({ theme }) => ({
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 'Auto',
    bgcolor: 'background.paper',
    boxShadow: 24,
    // minHeight: "50%",
    maxHeight: "90%",
    [theme.breakpoints.down('md')]: {
        width: '100%',
        height: '100%',
        maxHeight: "100%",
    },
    [theme.breakpoints.up('md')]: {
        width: '70%'
    },
    [theme.breakpoints.up('lg')]: {
        width: '50%',
        maxWidth: '800px'
    },
}));

export default function ({ title, open, onCloseClick, onConfirmClick, closeModlaBtnClick, ...props }) {

    const bodyRef = React.useRef();
    const _closeModlaBtnClick = ()=>{ 
        bodyRef.current.scroll({
            top: 0,
            behavior: "smooth"
        });
       if(onCloseClick) onCloseClick();
       if(closeModlaBtnClick)closeModlaBtnClick();
    }
    const _onCloseClick = () => {
        bodyRef.current.scroll({
            top: 0,
            behavior: "smooth"
          });
       if(onCloseClick) onCloseClick();
    }
    
    const _onConfirmClick = (e) => {
        e.stopPropagation();
        bodyRef.current.scroll({
            top: 0,
            behavior: "smooth"
        });
        if (onConfirmClick) onConfirmClick();
    }
    const okBtnText = props.okBtnText || language.confirm;
    const cancelBtnText = props.cancelBtnText || language.cancel;

    return (
        <div>
            <Modal
                open={open}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Root className='edit-modal' sx={props.sx}>
                    <AppBar className='edit-modal-header' position="static" sx={{ display: 'flex', flexDirection: 'row', fontWeight: 'bold', backgroundColor: props.backgroundColor }}>
                        <div>{title}</div>
                        <Button sx={{
                            borderRadius: 100, minWidth: 40, height: 40, padding: "3px",
                            backgroundColor: props.backgroundColor,
                            '&:hover': {
                                backgroundColor: darkenColor(props.backgroundColor, 30)
                            }
                        }}
                            variant="contained" onClick={_closeModlaBtnClick}><CloseIcon /></Button>
                    </AppBar>
                    <div className='edit-modal-body' ref={bodyRef} style={{ overflow: 'auto' }}>
                        {props.children}
                    </div>
                    <div className='edit-modal-foot' style={{ display: 'flex', justifyContent: 'flex-end', width: '100%', paddingTop: 10, paddingBottom: 10 }}>
                        {onCloseClick && <Button variant="outlined" sx={{ m: 1 }} onClick={_onCloseClick}>{cancelBtnText}</Button>}
                        {onConfirmClick && <Button variant="contained" 
                        sx={{ m: 1, 
                              backgroundColor: props.backgroundColor,
                              '&:hover': {
                                backgroundColor: darkenColor(props.backgroundColor, 30)
                              }
                         }} 
                         onClick={(_onConfirmClick)}>{okBtnText}</Button>}
                    </div>
                </Root>
            </Modal>
        </div>
    );
}