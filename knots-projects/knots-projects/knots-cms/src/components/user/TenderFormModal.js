import * as React from 'react';
import { Grid, Typography, InputLabel } from '@mui/material';
import { useSnackbar } from 'notistack';
import EditFormModal from '../EditFormModal';
import { useMutation, } from '@apollo/client';
import BackdropLoading from '../BackdropLoading';
import language from '../../localization/language';
import { InfoCard } from '../InfoCard';
import { TENDER_FORM_CREATE, TENDER_FORM_UPDATE } from '../../apollo/mutations';
import Input from '../Input';
import UserSelect from '../UserSelect';
import ClientSelect from '../ClientSelect';
import { id } from 'date-fns/locale';

export default function ({ open, onCloseClick, onCompleted, ...props }) {

  const { enqueueSnackbar } = useSnackbar();
  const [formData, setFormData] = React.useState({});
  const [inputError, setInputError] = React.useState({});
  const [formDataCreateMutate, createStatus] = useMutation(TENDER_FORM_CREATE);
  const [formDataUpdateMutate, updateStatus] = useMutation(TENDER_FORM_UPDATE);
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
    for (let i of ["personInChargeId", "details", "deadlineTime", "receivedDate", "client", "submitMethod"]) {
      if (formData[i] === undefined) inputError[i] = language.inputError.required;
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
        data: {
          personInChargeId: formData.personInChargeId,
          details: formData.details,
          siteVisitTime: formData.siteVisitTime,
          deadlineTime: formData.deadlineTime,
          receivedDate: formData.receivedDate,
          submitMethod: formData.submitMethod,
          client: formData.client,
          tenderNo: formData.tenderNo,
        }
      },
      onCompleted: (res) => {
        if (res.tenderFormCreate.userErrors.length) {
          res.tenderFormCreate.userErrors.map(e => {
            enqueueSnackbar(e.message, {
              variant: 'error'
            })
          })
        }
        else if (res.tenderFormCreate.tenderForm) {
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
          id: formData.id,
          personInChargeId: formData.personInChargeId,
          details: formData.details,
          siteVisitTime: formData.siteVisitTime,
          deadlineTime: formData.deadlineTime,
          receivedDate: formData.receivedDate,
          submitMethod: formData.submitMethod,
          client: formData.client,
          tenderNo: formData.tenderNo,
        }
      },
      onCompleted: (res) => {
        if (res.tenderFormUpdate.userErrors.length) {
          res.tenderFormUpdate.userErrors.map(e => {
            enqueueSnackbar(e.message, {
              variant: 'error'
            })
          })
        }
        else if (res.tenderFormUpdate.tenderForm) {
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

  React.useEffect(() => {
      setFormData({
        ...props.data,
      })
  }, [props.data, props.mode, open])

  return (
    <>
    {
      (createStatus.loading || updateStatus.loading) && <BackdropLoading/>
    }
      <EditFormModal
        open={open}
        title={`${mode}員工通知`}
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
                  發送設定
                </Typography>
                <Grid item xs={12} sx={{ minWidth: 100, maxWidth: 100 }}>
                  <Input
                    type="text"
                    label="tenderNo:"
                    variant="standard"
                    value={formData.tenderNo}
                    onChange={(e) => {
                      onFormDataChange(["tenderNo"], [e.target.value])
                    }}
                  />
                </Grid>  
                <Grid item xs={12}>
                  <UserSelect
                    label={'*員工'}
                    value={formData.personInChargeId}
                    error={inputError.personInChargeId}
                    helperText={inputError.personInChargeId}
                    onChange={(e) => { onFormDataChange(["personInChargeId"], [e.target.value]) }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <InputLabel sx={{fontSize: 14, marginBottom: 1}}>*內容</InputLabel>
                  <Input
                    type="text"
                    multiline
                    rows={4}
                    value={formData.details}
                    error={inputError.details}
                    helperText={inputError.details}
                    onChange={(e) => { onFormDataChange(["details"], [e.target.value]) }}
                  />
                </Grid>           
                <Grid item xs={'auto'} sx={{ minWidth: 100, maxWidth: 100 }}>
                  <Input
                    type="date"
                    label="開始日期:"
                    variant="standard"
                    value={formData.siteVisitTime}
                    error={inputError.siteVisitTime}
                    helperText={inputError.siteVisitTime}
                    onChange={(e) => { onFormDataChange(["siteVisitTime"], [e.target.value]) }}
                  />
                </Grid>
                <Grid item xs={'auto'} sx={{ minWidth: 100, maxWidth: 100 }}>
                  <Input
                    type="date"
                    label="*結束日期:"
                    variant="standard"
                    value={formData.deadlineTime}
                    error={inputError.deadlineTime}
                    helperText={inputError.deadlineTime}
                    onChange={(e) => { onFormDataChange(["deadlineTime"], [e.target.value]) }}
                  />
                </Grid>
                <Grid item xs={'auto'} sx={{ minWidth: 100, maxWidth: 100 }}>
                  <Input
                    type="date"
                    label="*接收日期:"
                    variant="standard"
                    value={formData.receivedDate}
                    error={inputError.receivedDate}
                    helperText={inputError.receivedDate}
                    onChange={(e) => { onFormDataChange(["receivedDate"], [e.target.value]) }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <ClientSelect
                    label={'客戶清單'}
                    value={null}
                    error={inputError.clientId}
                    helperText={inputError.clientId}
                    onChange={(e, item) => { 
                      let client = item?.companyCht || item?.companyEn || '';
                      onFormDataChange(["clientId", "client"], [e.target.value, client])
                     }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Input
                    label={'*客戶'}
                    variant="standard"
                    value={formData.client}
                    error={inputError.client}
                    helperText={inputError.client}
                    onChange={(e) => { onFormDataChange(["client"], [e.target.value]) }}
                  />
                </Grid>
                <Grid item xs={12} sx={{ minWidth: 100, maxWidth: 100 }}>
                  <Input
                    type="text"
                    label="*接收方式:"
                    variant="standard"
                    value={formData.submitMethod}
                    onChange={(e) => {
                      onFormDataChange(["submitMethod"], [e.target.value]) 
                    }}
                  />
                </Grid>      
              </Grid>
            </InfoCard>
          </Grid>
        </Grid>
      </EditFormModal>
    </>
  );

}