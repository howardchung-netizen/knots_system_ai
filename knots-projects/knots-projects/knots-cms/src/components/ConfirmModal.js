import * as React from 'react';
import ReactDOM from 'react-dom/client';
import { Grid, useTheme } from '@mui/material';
import EditFormModal from './EditFormModal';
import { ThemeProvider } from '@mui/material';
import { _theme } from '../App';

export default function ConfirmModal ({ open, onCloseClick, onConfirmClick, title, content, childeren, ...props }) {

  const theme = useTheme();
  const backgroundColor = props.mode == 'warning' ? 'rgb(211, 47, 47)' : null;
  const _onCloseClick= () => {
    onCloseClick();
  }
  const _onConfirmClick = () => {
    onConfirmClick()
  }
  if(!open) return null;
  return (
    <>
      <EditFormModal
        okBtnText={props.okBtnText}
        cancelBtnText={props.cancelBtnText}
        backgroundColor={backgroundColor}
        open={open}
        title={title}
        onConfirmClick={_onConfirmClick}
        onCloseClick={_onCloseClick}
        sx={{
          [theme.breakpoints.down('md')]: {
            width: '100%',
            height: '100%',
            maxHeight: "100%",
          },
          [theme.breakpoints.up('md')]: {
            maxWidth: '500px !important',
          }
        }}
      >
        {
          childeren ? childeren :
            <Grid container spacing={2} padding={1}>
              <Grid item xs={12} padding={0}>
                {content}
              </Grid>
            </Grid>
        }
      </EditFormModal>
    </>
  );

}

export function confirm({ title, content, onCloseClick, onConfirmClick, ...props }) {

  // 創建一個容器元素
  const container = document.createElement('div');
  document.body.appendChild(container);

  // 創建一個 root
  const root = ReactDOM.createRoot(container);

  // 定義關閉模態框的函數
  const handleClose = () => {
    // 卸載模態框
    root.unmount();
    document.body.removeChild(container);
    // 調用傳入的 onCloseClick 回調
    if (onCloseClick) onCloseClick();
  };

  // 定義確認模態框的函數
  const handleConfirm = () => {
    // 調用傳入的 onConfirmClick 回調
    if (onConfirmClick) onConfirmClick();
    // 關閉模態框
    handleClose();
  };

  // 渲染模態框
  root.render(
    <ThemeProvider theme={_theme}>
    <ConfirmModal
      open={true}
      title={title}
      content={content}
      onCloseClick={handleClose}
      onConfirmClick={handleConfirm}
      {...props}
    />
    </ThemeProvider>
  );
}