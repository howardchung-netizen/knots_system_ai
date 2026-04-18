import * as React from 'react';
import { Grid, MenuItem, Typography } from '@mui/material';
import { useSnackbar } from 'notistack';
import EditFormModal from '../EditFormModal';
import { useMutation } from '@apollo/client';
import BackdropLoading from '../BackdropLoading';
import language from '../../localization/language';
import { InfoCard } from '../InfoCard';
import { USER_CREATE, USER_UPDATE } from '../../apollo/mutations';
import Input from '../Input';
import { useNavigate } from 'react-router-dom';
import { OptionsContext } from '../../contexts/OptionsContextProvider';
import Select from '../Select';
import { defaultPalette, telCodes, userStatus } from '../../constants/InputOptions';
import TelInput from '../TelInput';
import { MultipleSelectChip } from '../MultiSelect';
import { UserContext } from '../../contexts/UserContext';

export default function ({ open, onCloseClick, onCompleted, ...props }) {
	
  
  const [user] = React.useContext(UserContext);
  const [optionsContext, optionsContextDispatch, {quotationStautsIds, projectSpotlightOptions}] = React.useContext(OptionsContext);
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [formData, setFormData] = React.useState({...props.data});
  const [inputError, setInputError] = React.useState({});
  const [formDataCreateMutate, createStatus] = useMutation(USER_CREATE);
  const [formDataUpdateMutate, updateStatus] = useMutation(USER_UPDATE);
  const mode = props.mode == 'create' ? '新增' : '編輯';
  const rolesList = props?.rolesList??[];
 
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
    let checkList = [];
    if(props.mode == 'create') checkList = ["username", "password", "status"];
    else checkList = ["status"];
    let inputError = {};
    for (let i of checkList) {
      if (formData[i] == null || formData[i] == undefined) inputError[i] = language.inputError.required;
    }
    setInputError(inputError);
    console.log(inputError)
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
        if (res.userCreate.userErrors.length) {
          res.userCreate.userErrors.map(e => {
            enqueueSnackbar(e.message, {
              variant: 'error'
            })
          })
        }
        else if (res.userCreate.user) {
          if(onCompleted)onCompleted();
          enqueueSnackbar(`${mode}成功`, {
            variant: 'success'
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
          nameCht: formData.nameCht,
          nameEn: formData.nameEn,
          tel1: formData.tel1,
          tel2: formData.tel2,
          whatsApp: formData.whatsApp,
          whatsapp2: formData.whatsapp2,
          email: formData.email,
          status: formData.status,
          color: formData.color,
          roles: formData.roles,
         }
      },
      onCompleted: (res) => {
        if (res.userUpdate.userErrors.length) {
          res.userUpdate.userErrors.map(e => {
            enqueueSnackbar(e.message, {
              variant: 'error'
            })
          })
        }
        else if (res.userUpdate.user) {
          if(onCompleted)onCompleted(res);
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

  const StatusSelect = () => {
    return (
      <Select
        loading={false}
        label="*狀態:"
        variant="standard"
        items={userStatus}
        render={(row, i) => <MenuItem key={i} value={row.value}>{row.label}</MenuItem>}
        value={formData.status}
        error={inputError.status}
        helperText={inputError.status}
        onChange={(e) => { onFormDataChange(["status"], [e.target.value]) }}
      />
    )
  }

  const ColorSelect = () => {
    return (
      <Select
        loading={false}
        label="顏色:"
        variant="standard"
        items={projectSpotlightOptions.map(e=> ({label: e.label, value: e.label}))}
        render={(row, i) => <MenuItem key={i} value={row.value} style={{padding: 3}}><div style={{height: '100%', width: '100%', backgroundColor: row.value, height: 45}}></div></MenuItem>}
        value={formData.color}
        error={inputError.color}
        helperText={inputError.color}
        onChange={(e) => { onFormDataChange(["color"], [e.target.value]) }}
      />
    )
  }
  
  React.useEffect(() => {
      setFormData({...props.data})
  }, [props.data, props.mode, open])
  
  return (
    <>
    {
      (createStatus.loading || updateStatus.loading) && <BackdropLoading/>
    }
      <EditFormModal
        open={open}
        title={`${mode}員工`}
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
                 帳號
                </Typography>
                <Grid item xs={12}>
                  <Input
                    disabled={props.mode == 'edit'}
                    label="*帳號:"
                    variant="standard"
                    value={formData.username}
                    error={inputError.username}
                    helperText={inputError.username}
                    onChange={(e) => { onFormDataChange(["username"], [e.target.value]) }}
                  />
                </Grid>
                {props.mode == 'create' && <Grid item xs={12}>
                  <Input
                    label="*密碼:"
                    variant="standard"
                    value={formData.password}
                    error={inputError.password}
                    helperText={inputError.password}
                    onChange={(e) => { onFormDataChange(["password"], [e.target.value]) }}
                  />
                </Grid>}
                <Grid item xs={12}>
                  <StatusSelect/>
                </Grid>
                <Grid item xs={12}>
                  <ColorSelect/>
                </Grid>
                <Typography variant="body2" sx={{ marginBottom: 1, marginTop: 5, fontWeight: 'bold', fontSize: 18 }}>
                 個人資料
                </Typography>
                <Grid item xs={12}>
                  <Input
                    label="中文名稱:"
                    variant="standard"
                    value={formData.nameCht}
                    error={inputError.nameCht}
                    helperText={inputError.nameCht}
                    onChange={(e) => { onFormDataChange(["nameCht"], [e.target.value]) }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Input
                    label="英文名稱:"
                    variant="standard"
                    value={formData.nameEn}
                    error={inputError.nameEn}
                    helperText={inputError.nameEn}
                    onChange={(e) => { onFormDataChange(["nameEn"], [e.target.value]) }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Input
                    label="Email:"
                    variant="standard"
                    value={formData.email}
                    error={inputError.email}
                    helperText={inputError.email}
                    onChange={(e) => { onFormDataChange(["email"], [e.target.value]) }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TelInput
                    label="電話"
                    codes={telCodes}
                    code={formData.tel1}
                    number={formData.tel2}
                    onCodeChange={(code) => { onFormDataChange(["tel1"], [code]) }}
                    onTelChange={(tel) => { onFormDataChange(["tel2"], [tel]) }}
                    error={inputError.tel2}
                    helperText={inputError.tel2}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TelInput
                    label="WhatsApp"
                    codes={telCodes}
                    code={formData.whatsApp}
                    number={formData.whatsapp2}
                    onCodeChange={(code) => { onFormDataChange(["whatsApp"], [code]) }}
                    onTelChange={(whatsapp) => { onFormDataChange(["whatsapp2"], [whatsapp]) }}
                    error={inputError.whatsapp2}
                    helperText={inputError.whatsapp2}
                  />
                </Grid>
                {
                  user?.info?.roles?.filter(e=> e.name == 'admin' || e.name == 'HR').length && <>
                  <Typography variant="body2" sx={{ marginBottom: 1, marginTop: 5, fontWeight: 'bold', fontSize: 18 }}>
                 職位
                </Typography>
                <Grid item xs={12}>
                  <MultipleSelectChip
                    label={'職位'}
                    items={rolesList.map(e=> ({label: e, value: e}))}
                    onRender={(row, selected) => <MenuItem key={row.value} value={row.value}>{row.label}</MenuItem>}
                    value={formData.roles??[]}
                    error={inputError.roles}
                    onChange={(e) => { 
                      onFormDataChange(["roles"], [e])
                     }}
                  >
                  </MultipleSelectChip>
                </Grid>
                </>
                }
              </Grid>
            </InfoCard>
          </Grid>
        </Grid>
      </EditFormModal>
    </>
  );

}