import * as React from 'react';
import { Button, Divider, Grid, IconButton, MenuItem, TextField, Typography } from '@mui/material';
import { useSnackbar } from 'notistack';
import { useLazyQuery, useMutation } from '@apollo/client';
import BackdropLoading from '../BackdropLoading';
import language from '../../localization/language';
import { InfoCard } from '../InfoCard';
import { CREATE_CLOCKIN, UPDATE_CLOCKIN } from '../../apollo/mutations';
import Input from '../Input';
import { useNavigate } from 'react-router-dom';
import { OptionsContext } from '../../contexts/OptionsContextProvider';
import ClearIcon from '@mui/icons-material/Clear';
import ProjectSelect from '../ProjectSelect';
import UserSelect from '../UserSelect';
import { MobileDateTimePicker } from '@mui/x-date-pickers';
import EditFormModal from '../EditFormModal';
import { CLOCK_IN_LOCATION_QUERY } from '../../apollo/queries';

export default function ({ open, onCloseClick, onCompleted, ...props }) {
	
  const [optionsContext, optionsContextDispatch, {quotationStautsIds}] = React.useContext(OptionsContext);
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [formData, setFormData] = React.useState({...props.data});
  const [importCode, setImportCode] = React.useState('');
  const [inputError, setInputError] = React.useState({});
  const [formDataCreateMutate, createStatus] = useMutation(CREATE_CLOCKIN);
  const [formDataUpdateMutate, updateStatus] = useMutation(UPDATE_CLOCKIN);
  const [queryClockInLocation, queryClockInLocationStatus] = useLazyQuery(CLOCK_IN_LOCATION_QUERY);
  const mode = props.mode == 'create' ? '新增' : '編輯';
  
  const _onCloseClick= () => {
    setFormData({})
    setInputError({});
    setImportCode(null);
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
    for (let i of ["tel", "clockedInAt", "qrCodeCreatedAt", "clockedInAt", "staffId", "projectId"]) {
      if (formData[i] == null || formData[i] == undefined) inputError[i] = language.inputError.required;
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
          ...formData,
          tel: "852"+formData.tel,
        }
      },
      onCompleted: (res) => {
        if (res.createClockIn.result) {
          if(onCompleted)onCompleted();
          enqueueSnackbar(`${mode}成功`, {
            variant: 'success'
          })
        }
        else if (res.createClockIn.userErrors.length) {
          res.createClockIn.userErrors.map(e => {
            enqueueSnackbar(e.message, {
              variant: 'error'
            })
          })
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
          title:formData.title,
          status: formData.status,
          quotationStatusId: formData.quotationStatusId
         }
      },
      onCompleted: (res) => {
        if (res.quotationUpdate.userErrors.length) {
          res.quotationUpdate.userErrors.map(e => {
            enqueueSnackbar(e.message, {
              variant: 'error'
            })
          })
        }
        else if (res.quotationUpdate.quotation) {
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

  const onImportClick = (importCode) => {
    if(!importCode) return;
    queryClockInLocation({
      variables: { 
         nonce: importCode,
      },
      onCompleted: (res) => { 
        console.log(res)
        if (res.clockInLocations.edges.length) {
          let location = res.clockInLocations.edges[0].node;
          let projectId = location.Project ? location.Project.id : null;
          let address = location.address;
          let staffId = location.user ? location.user.id : null;
          let qrCodeCreatedAt = location.createdAt;
          console.log(location)
          onFormDataChange(['projectId', 'address', 'staffId', 'qrCodeCreatedAt'], [projectId, address, staffId, qrCodeCreatedAt])
        }
        else alert('導入失敗，請檢查導入編碼!')
      },
      onError: (error) => {
        alert('導入失敗，請檢查導入編碼!')
      }
    })
  }

  React.useEffect(() => {
      setFormData({
        ...props.data
      })
  }, [props.data, props.mode, open])
  
  return (
    <>
      {
        (createStatus.loading || updateStatus.loading || queryClockInLocationStatus.loading) && <BackdropLoading />
      }
      <EditFormModal
        open={open}
        title={`${mode}打卡紀錄`}
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
                  {mode}打卡紀錄
                </Typography>
                <Grid item xs={12}>
                  <Input
                    label="導入編碼:"
                    type="text"
                    InputProps={{
                      endAdornment: importCode ? <IconButton style={{ backgroundColor: 'white', height: 30, width: 30 }} onClick={() => setImportCode(null)}><ClearIcon /></IconButton> : null,
                    }}
                    value={importCode}
                    onChange={(e) => {
                      setImportCode(e.target.value);
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button style={{ width: '100%' }} variant='contained' onClick={()=>onImportClick(importCode)}>導入</Button>
                </Grid>
                <Grid item xs={12}>
                  <Divider sx={{ width: '100%' }} />
                </Grid>
                <Grid item xs={12}>
                  <ProjectSelect
                    label="工程專案*:"
                    variant="standard"
                    value={formData.projectId}
                    error={inputError.projectId}
                    helperText={inputError.projectId}
                    onChange={(e) => { onFormDataChange(["projectId"], [e.target.value]) }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Input
                    label="地址:"
                    variant="standard"
                    value={formData.address}
                    error={inputError.address}
                    helperText={inputError.address}
                    onChange={(e) => { onFormDataChange(["address"], [e.target.value]) }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <UserSelect
                    label="發起人*:"
                    variant="standard"
                    value={formData.staffId}
                    error={inputError.staffId}
                    helperText={inputError.staffId}
                    onChange={(e) => { 
                      onFormDataChange(["staffId"], [e.target.value])
                     }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <MobileDateTimePicker
                    renderInput={(props) => <TextField variant="standard"
                      {...props}
                      sx={{ width: '100%' }}
                      error={inputError.qrCodeCreatedAt}
                      helperText={inputError.qrCodeCreatedAt}
                    />
                    }
                    label="建立*:"
                    value={formData.qrCodeCreatedAt || null}
                    onChange={(newValue) => {
                      onFormDataChange(["qrCodeCreatedAt"], [newValue])
                    }}
                    dayOfWeekFormatter={(day) => `${day.replace('週', '')}`}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Input
                    label="打卡人電話*:"
                    variant="standard"
                    value={formData.tel}
                    error={inputError.tel}
                    helperText={inputError.tel}
                    onChange={(e) => { onFormDataChange(["tel"], [e.target.value]) }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <MobileDateTimePicker
                    renderInput={(props) => <TextField variant="standard"
                      {...props}
                      sx={{ width: '100%' }}
                      error={inputError.qrCodeCreatedAt}
                      helperText={inputError.qrCodeCreatedAt}
                    />
                    }
                    label="打卡時間*:"
                    value={formData.clockedInAt || null}
                    error={inputError.clockedInAt}
                    helperText={inputError.clockedInAt}
                    onChange={(newValue) => {
                      onFormDataChange(["clockedInAt"], [newValue])
                    }}
                    dayOfWeekFormatter={(day) => `${day.replace('週', '')}`}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Input
                    label="備註:"
                    variant="outlined"
                    value={formData.remark}
                    error={inputError.remark}
                    helperText={inputError.remark}
                    maxRows={4}
                    minRows={4}
                    multiline
                    onChange={(e) => { onFormDataChange(["remark"], [e.target.value]) }}
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