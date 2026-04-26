import React, { createContext, useState } from 'react';
import { Snackbar, Alert, AlertTitle } from '@mui/material';

export const SnackbarContext = createContext(null);

export function SnackbarProvider(props) {
  const defaultSnackbarParams = {
    snackbarProps: {
      anchorOrigin: {
        vertical: 'top',
        horizontal: 'center',
      },
      autoHideDuration: 5000,
    },
    alertProps: {
      severity: 'info',
    },
    title: undefined,
    message: undefined,
  };
  const [snackbarParams, setSnackbarParams] = useState(defaultSnackbarParams);
  const [isSnackbarOpen, setIsSnackbarOpen] = useState(false);
  const openSnackbar = params => {
    if (!params) {
      console.error(`No params are passed when opening snackbar.`);
      return false;
    }

    if (params.alertProps && params.alertProps.severity === 'error') defaultSnackbarParams.snackbarProps.autoHideDuration = undefined;

    params = Object.assign({}, defaultSnackbarParams, params);

    if (!params.message) {
      console.error(`Invalid params pass when opening snackbar, params: ${params}`);
      return false;
    }

    setSnackbarParams(params);
    setIsSnackbarOpen(true);
  }
  const closeSnackbar = () => {
    setSnackbarParams(defaultSnackbarParams);
    setIsSnackbarOpen(false);
  }

  return (
    <SnackbarContext.Provider value={{ open: openSnackbar, close: closeSnackbar }}>
      {props.children}
      <Snackbar {...snackbarParams.snackbarProps} open={isSnackbarOpen} onClose={closeSnackbar}>
        <Alert {...snackbarParams.alertProps} onClose={closeSnackbar}>
          {snackbarParams.title && <AlertTitle>{snackbarParams.title}</AlertTitle>}
          {typeof snackbarParams.message === 'object' && snackbarParams.message.length ? (
            <ul>{snackbarParams.message.map((v, k) => <li key={k}>{v}</li>)}</ul>
          ) : snackbarParams.message}
        </Alert>
      </Snackbar>
    </SnackbarContext.Provider>
  );
}
