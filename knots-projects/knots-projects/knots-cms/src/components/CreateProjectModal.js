import * as React from 'react';
import { Grid } from '@mui/material';
import { useSnackbar } from 'notistack';
import EditFormModal from './EditFormModal';
import { useMutation } from '@apollo/client';
import BackdropLoading from './BackdropLoading';
import regex from '../utils/regex';
import language from '../localization/language';
import { ProjectInfoForm } from './project/ProjectForm';

export default function ({ open, onCloseClick, onCompleted }) {
	
  const { enqueueSnackbar } = useSnackbar();
  const [formData, setFormData] = React.useState({});
  const [inputError, setInputError] = React.useState({});
  // const [formDataCreateMutate, {loading, data, error}] = useMutation(preMemberCreate)

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
    for (let i of ['nameEng', 'hkid', 'gender', 'tel', 'dateOfBirth']) {
      if (formData[i] == null || formData[i] == "" || formData[i] == '') inputError[i] = language.inputError.required;
    }
    if(!regex.IsHKmobile(formData.tel)) inputError.tel = '請輸入正確手提電話號碼';
    if(!regex.IsHKID(formData.hkid)) inputError.hkid = '請輸入正確身分證格式';
    // if(!regex.IsEmail(formData.email)) inputError.email = '請輸入正確Email格式';
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
    // formDataCreateMutate({
    //   variables: {
    //     data: {...formData, tel: "+852"+formData.tel}
    //   },
    //   onCompleted: (res) => {
    //     if (res.preMemberCreate.userErrors.length) {
    //       res.preMemberCreate.userErrors.map(e => {
    //         enqueueSnackbar(e.message, {
    //           variant: 'error'
    //         })
    //       })
    //     }
    //     else if (res.preMemberCreate.preMember) {
    //       onCompleted();
    //       enqueueSnackbar("新增成功", {
    //         variant: 'success'
    //       })
    //       _onCloseClick();
    //     }
    //   },
    //   onError: (error) => {
    //     enqueueSnackbar(error.message, {
    //       variant: 'error'
    //     })
    //     return;
    //   }
    // })
  }

  return (
    <>
    {
      // loading && <BackdropLoading/>
    }
    <EditFormModal
      open={open}
      title={'新增工程專案'}
      onConfirmClick={_onConfirmClick}
      onCloseClick={_onCloseClick}
      >
        <Grid container spacing={2} padding={1}>
          <Grid item sm={12} padding={0}>
           <ProjectInfoForm 
					 {...formData} 
					 onFormDataChange={onFormDataChange} 
					 inputError={inputError}/>
          </Grid>
        </Grid>
    </EditFormModal>
    </>
  );

}