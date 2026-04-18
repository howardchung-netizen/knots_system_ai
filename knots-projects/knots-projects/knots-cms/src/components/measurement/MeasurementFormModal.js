import * as React from 'react';
import { Grid, Typography } from '@mui/material';
import { useSnackbar } from 'notistack';
import EditFormModal from '../EditFormModal';
import { useMutation } from '@apollo/client';
import BackdropLoading from '../BackdropLoading';
import language from '../../localization/language';
import { InfoCard } from '../InfoCard';
import { MEASUREMENT_CREATE, MEASUREMENT_UPDATE } from '../../apollo/mutations';
import Input from '../Input';
import MeasurementTypeSelect from './MeasurementTypeSelect';

export default function ({ open, onCloseClick, onCompleted, ...props }) {

  const { enqueueSnackbar } = useSnackbar();
  const [formData, setFormData] = React.useState({...props.data});
  const [inputError, setInputError] = React.useState({});
  const [formDataCreateMutate, createStatus] = useMutation(MEASUREMENT_CREATE);
  const [formDataUpdateMutate, updateStatus] = useMutation(MEASUREMENT_UPDATE);
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
    for (let i of ["nameCht", "nameEn", "typeId"]) {
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
        if (res.measurementCreate.userErrors.length) {
          res.measurementCreate.userErrors.map(e => {
            enqueueSnackbar(e.message, {
              variant: 'error'
            })
          })
        }
        else if (res.measurementCreate.measurement) {
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
          nameCht:formData.nameCht,
          nameEn: formData.nameEn,
          descCht:formData.descCht,
          descEn: formData.descEn,
          typeId: formData.typeId
         }
      },
      onCompleted: (res) => {
        if (res.measurementUpdate.userErrors.length) {
          res.measurementUpdate.userErrors.map(e => {
            enqueueSnackbar(e.message, {
              variant: 'error'
            })
          })
        }
        else if (res.measurementUpdate.measurement) {
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
        title={`${mode}度量/單位`}
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
                  度量/單位
                </Typography>
                <Grid item xs={12}>
                  <MeasurementTypeSelect
                    label="*類型:"
                    variant="standard"
                    value={formData.typeId}
                    error={inputError.typeId}
                    helperText={inputError.typeId}
                    onChange={(e) => { onFormDataChange(["typeId"], [e.target.value]) }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Input
                    label="*名稱(中文):"
                    variant="standard"
                    value={formData.nameCht}
                    error={inputError.nameCht}
                    helperText={inputError.nameCht}
                    onChange={(e) => { onFormDataChange(["nameCht"], [e.target.value]) }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Input
                    label="*名稱(英文):"
                    variant="standard"
                    value={formData.nameEn}
                    error={inputError.nameEn}
                    helperText={inputError.nameEn}
                    onChange={(e) => { onFormDataChange(["nameEn"], [e.target.value]) }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Input
                    label="描述(中文):"
                    variant="standard"
                    value={formData.descCht}
                    error={inputError.descCht}
                    helperText={inputError.descCht}
                    onChange={(e) => { onFormDataChange(["descCht"], [e.target.value]) }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Input
                    label="描述(英文):"
                    variant="standard"
                    value={formData.descEn}
                    error={inputError.descEn}
                    helperText={inputError.descEn}
                    onChange={(e) => { onFormDataChange(["descEn"], [e.target.value]) }}
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