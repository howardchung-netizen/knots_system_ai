import * as React from 'react';
import { Grid, Typography } from '@mui/material';
import { useSnackbar } from 'notistack';
import EditFormModal from '../EditFormModal';
import { useMutation } from '@apollo/client';
import BackdropLoading from '../BackdropLoading';
import language from '../../localization/language';
import { ClientBaseInput, ClientContactInput, ClientCreateForm, MainContactCheckList } from './ClientForm';
import { InfoCard } from '../InfoCard';
import { CLIENT_CREATE } from '../../apollo/mutations';

export default function ({ open, onCloseClick, onCompleted }) {
	
  const { enqueueSnackbar } = useSnackbar();
  const [formData, setFormData] = React.useState({});
  const [inputError, setInputError] = React.useState({});
  const [formDataCreateMutate, {loading, data, error}] = useMutation(CLIENT_CREATE)

  const _onCloseClick= () => {
    setFormData({})
    setInputError({});
    onCloseClick();
  }

  const onFormDataChange= (key, value) => {
    let data = {};
    let _inputError = inputError;
    for (let i in key) {
      data[key[i]] = value[i] === '' ? null : value[i];
      _inputError[key[i]] = null;
      setInputError(_inputError);
    }
    setFormData({ ...formData, ...data });
  }

  const checkInputError = () => {
    let inputError = {};
    for (let i of []) {
      if (formData[i] == null || formData[i] == "" || formData[i] == '') inputError[i] = language.inputError.required;
    }
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
    formDataCreateMutate({
      variables: {
        data: {...formData, contacts: formData.contacts?.map(e => ({id: e.id, isMainContact: e.isMainContact}))}
      },
      onCompleted: (res) => {
        if (res.clientCreate.userErrors.length) {
          res.clientCreate.userErrors.map(e => {
            enqueueSnackbar(e.message, {
              variant: 'error'
            })
          })
        }
        else if (res.clientCreate.client) {
          onCompleted();
          enqueueSnackbar("新增成功", {
            variant: 'success'
          })
          _onCloseClick();
        }
      },
      onError: (error) => {
        enqueueSnackbar(error.message, {
          variant: 'error'
        })
        return;
      }
    })
  }

  return (
    <>
    {
      loading && <BackdropLoading/>
    }
      <EditFormModal
        open={open}
        title={'新增客戶'}
        onConfirmClick={_onConfirmClick}
        onCloseClick={_onCloseClick}
      >
        <Grid container spacing={2} padding={1}>
          <Grid item sm={12} padding={0}>
            <InfoCard
              title={""}
            >
              <Grid container spacing={2} padding={1}>
                <Typography variant="body2" sx={{ marginBottom: 1, fontWeight: 'bold', fontSize: 18 }}>
                  客戶資料
                </Typography>
                <ClientBaseInput
                  {...formData}
                  onFormDataChange={onFormDataChange}
                  inputError={inputError} />
                <Typography variant="body2" sx={{ marginTop: 3, marginBottom: 1, fontWeight: 'bold', fontSize: 18 }}>
                  聯絡人
                </Typography>
                <ClientContactInput 
                  {...formData}
                  onFormDataChange={onFormDataChange}
                  inputError={inputError} 
                />
                <MainContactCheckList 
                  {...formData}
                  onFormDataChange={onFormDataChange}
                  inputError={inputError} 
                />
              </Grid>
            </InfoCard>
          </Grid>
        </Grid>
      </EditFormModal>
    </>
  );

}