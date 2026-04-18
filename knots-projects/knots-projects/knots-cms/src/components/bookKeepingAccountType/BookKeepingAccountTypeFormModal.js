import * as React from 'react';
import { Grid, MenuItem, Typography } from '@mui/material';
import { useSnackbar } from 'notistack';
import EditFormModal from '../EditFormModal';
import { useMutation } from '@apollo/client';
import BackdropLoading from '../BackdropLoading';
import language from '../../localization/language';
import { InfoCard } from '../InfoCard';
import { BOOK_KEEPING_ACCOUNT_TYPES_CREATE, BOOK_KEEPING_ACCOUNT_TYPES_UPDATE } from '../../apollo/mutations';
import Input from '../Input';
import Select from '../Select';

export default function ({ open, onCloseClick, onCompleted, ...props }) {

  const { enqueueSnackbar } = useSnackbar();
  const [formData, setFormData] = React.useState({...props.data});
  const [inputError, setInputError] = React.useState({});
  const [formDataCreateMutate, createStatus] = useMutation(BOOK_KEEPING_ACCOUNT_TYPES_CREATE);
  const [formDataUpdateMutate, updateStatus] = useMutation(BOOK_KEEPING_ACCOUNT_TYPES_UPDATE);
  const mode = props.mode == 'create' ? '新增' : '編輯';
  
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
    for (let i of ["name", "increaseDebit"]) {
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
    if (props.mode == 'create') formDataCreateMutate({
      variables: {
        data: { ...formData}
      },
      onCompleted: (res) => {
        if (res.bookKeepingAccountTypeCreate.userErrors.length) {
          res.bookKeepingAccountTypeCreate.userErrors.map(e => {
            enqueueSnackbar(e.message, {
              variant: 'error'
            })
          })
        }
        else if (res.bookKeepingAccountTypeCreate.bookKeepingAccountType) {
          if(onCompleted)onCompleted();
          enqueueSnackbar(`${mode}成功`, {
            variant: 'success'
          })
          console.log("_onCloseClick")
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
    else formDataUpdateMutate({
      variables: {
        data: { 
          id: formData.id,
          name: formData.name,
          increaseDebit: formData.increaseDebit,
        }
      },
      onCompleted: (res) => {
        if (res.bookKeepingAccountTypeUpdate.userErrors.length) {
          res.bookKeepingAccountTypeUpdate.userErrors.map(e => {
            enqueueSnackbar(e.message, {
              variant: 'error'
            })
          })
        }
        else if (res.bookKeepingAccountTypeUpdate.bookKeepingAccountType) {
          if(onCompleted)onCompleted();
          enqueueSnackbar(`${mode}成功`, {
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

  const IncreaseDebitSelect = () => <Select
      label="*收入/費用:"
      variant="standard"
      items={[{ value: true, label: "收入", key: "1" }, { value: false, label: "費用", key: "0" }]}
      value={formData.increaseDebit}
      error={inputError.increaseDebit}
      helperText={inputError.increaseDebit}
      onChange={(e) => { onFormDataChange(["increaseDebit"], [e.target.value]) }}
      render={(e) => <MenuItem key={e.key} value={e.value}>{e.label}</MenuItem>}
    />

  React.useEffect(() => {
    if(props.mode == 'update') {
      setFormData({
        ...props.data
      })
    }
  }, [props.data, props.mode, open])

  return (
    <>
    {
      (createStatus.loading || updateStatus.loading) && <BackdropLoading/>
    }
      <EditFormModal
        open={open}
        title={`${mode}會計類別`}
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
                 會計類別
                </Typography>
                <Grid item xs={12}>
                  <Input
                    label="*名稱:"
                    variant="standard"
                    value={formData.name}
                    error={inputError.name}
                    helperText={inputError.name}
                    onChange={(e) => { onFormDataChange(["name"], [e.target.value]) }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <IncreaseDebitSelect />
                </Grid>
              </Grid>
            </InfoCard>
          </Grid>
        </Grid>
      </EditFormModal>
    </>
  );

}