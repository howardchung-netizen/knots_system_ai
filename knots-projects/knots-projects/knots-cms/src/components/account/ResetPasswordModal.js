import * as React from 'react';
import { useSnackbar } from 'notistack';
import EditFormModal from '../EditFormModal';
import { checkUserResetPasswordInput } from '../../utils/checkInputError';
import Input from '../Input';
import { Grid } from '@mui/material';

export default function ({ open, onCloseClick, onConfirmClick }) {

  const { enqueueSnackbar } = useSnackbar();
  const [formData, setFormData] = React.useState({});
  const [inputError, setInputError] = React.useState({});

  const _onCloseClick= () => {
    setFormData({})
    setInputError({});
    onCloseClick();
  }

  const onFormDataChange = (key, value) => {
    let data = {};
    let _inputError = inputError;
    for (let i in key) {
      data[key[i]] = value[i] == '' || !value[i] ? null : value[i];
      _inputError[key[i]] = null;
      setInputError(_inputError);
    }
    setFormData({ ...formData, ...data });
  }

  const checkInputError = () => {
    let inputError = checkUserResetPasswordInput(formData);
    setInputError(inputError);
    let hasError = Object.keys(inputError).length;
    return hasError
  }
  
  const _onConfirmClick = () => {
    if (checkInputError()) {
      enqueueSnackbar('請檢查輸入', {
        variant: 'error'
      })
      return;
    }
    if(onConfirmClick) onConfirmClick(formData)
  }

  return (
    <>
      <EditFormModal
        sx={{ maxWidth: 500 }}
        open={open}
        title={'更改密碼'}
        onCloseClick={_onCloseClick}
        onConfirmClick={_onConfirmClick}
      >
        <Grid container spacing={2} padding={5}>
          <Grid item xs={12} md={12} lg={12}>
            <Input
              type={"password"}
              label="密碼"
              variant="outlined"
              value={formData.currentPassword}
              error={inputError.currentPassword}
              helperText={inputError.currentPassword}
              InputLabelProps={{
                style: {
                  fontSize: 20
                },
                shrink: true
              }}
              onChange={(e) => { onFormDataChange(["currentPassword"], [e.target.value]) }}
        />
          </Grid>
          <Grid item xs={12} md={12} lg={12}>
            <Input
              type={"password"}
              label="新密碼"
              variant="outlined"
              value={formData.newPassword}
              error={inputError.newPassword}
              helperText={inputError.newPassword}
              InputLabelProps={{
                style: {
                  fontSize: 20
                },
                shrink: true
              }}
              onChange={(e) => { onFormDataChange(["newPassword"], [e.target.value]) }}
        />
          </Grid>
          <Grid item xs={12} md={12} lg={12}>
            <Input
              type={"password"}
              label="確認密碼"
              variant="outlined"
              value={formData.confirmPassword}
              error={inputError.confirmPassword}
              helperText={inputError.confirmPassword}
              InputLabelProps={{
                style: {
                  fontSize: 20
                },
                shrink: true
              }}
              onChange={(e) => { onFormDataChange(["confirmPassword"], [e.target.value]) }}
        />
          </Grid>
        </Grid>
      </EditFormModal>
    </>
  );
}