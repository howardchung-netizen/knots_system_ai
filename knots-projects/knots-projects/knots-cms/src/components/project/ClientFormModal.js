import * as React from 'react';
import { Grid, Typography } from '@mui/material';
import { useSnackbar } from 'notistack';
import EditFormModal from '../EditFormModal';
import { useMutation } from '@apollo/client';
import BackdropLoading from '../BackdropLoading';
import language from '../../localization/language';
import { InfoCard } from '../InfoCard';
import { PROJECT_CREATE, PROJECT_UPDATE } from '../../apollo/mutations';
import Input from '../Input';
import TelInput from '../TelInput';
import { telCodes } from '../../constants/InputOptions';
import { ClientForm, MemberForm, ProjectInfoForm } from './ProjectForm';
import { useNavigate } from 'react-router-dom';

export default function ({ open, onCloseClick, onCompleted, ...props }) {
	
  const { enqueueSnackbar } = useSnackbar();
  const [formData, setFormData] = React.useState({});
  const [inputError, setInputError] = React.useState({});
	const [formDataCreateMutate, createStatus] = useMutation(PROJECT_CREATE);
  const [formDataUpdateMutate, updateStatus] = useMutation(PROJECT_UPDATE);
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
    if (props.mode == 'create') formDataCreateMutate({
      variables: {
        data: { ...formData}
      },
      onCompleted: (res) => {
        if (res.projectCreate.userErrors.length) {
          res.projectCreate.userErrors.map(e => {
            enqueueSnackbar(e.message, {
              variant: 'error'
            })
          })
        }
        else if (res.projectCreate.project) {
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
    else formDataUpdateMutate({
      variables: {
        data: { 
          ...formData
         }
      },
      onCompleted: (res) => {
        if (res.projectUpdate.userErrors.length) {
          res.projectUpdate.userErrors.map(e => {
            enqueueSnackbar(e.message, {
              variant: 'error'
            })
          })
        }
        else if (res.projectUpdate.project) {
          // if(onCompleted)onCompleted();
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
        title={`${mode}客戶`}
        onConfirmClick={_onConfirmClick}
        onCloseClick={_onCloseClick}
      >
        <Grid container spacing={2} padding={1}>
          <Grid item sm={12} padding={0}>
            <ClientForm
              {...formData}
              onFormDataChange={onFormDataChange}
              inputError={inputError}
            />
          </Grid>
        </Grid>
      </EditFormModal>
    </>
  );

}