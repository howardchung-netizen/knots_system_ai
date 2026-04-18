import * as React from 'react';
import { Grid, InputAdornment, MenuItem, Typography } from '@mui/material';
import { useSnackbar } from 'notistack';
import EditFormModal from '../EditFormModal';
import { useMutation } from '@apollo/client';
import BackdropLoading from '../BackdropLoading';
import language from '../../localization/language';
import { InfoCard } from '../InfoCard';
import { PROJECT_ITEM_CREATE, PROJECT_ITEM_UPDATE, QUOTATION_UPDATE_ITEM } from '../../apollo/mutations';
import Input from '../Input';
import ProjectItemSelect from '../project/ProjectItemSelect';
import MeasurementSelect from '../quotation/MeasurementSelect';
import { OptionsContext } from '../../contexts/OptionsContextProvider';
import { toMoney } from '../../utils';
import Select from '../Select';

export default function ({ open, onCloseClick, onCompleted, ...props }) {

  const [optionsContext, optionsContextDispatch, {
    measurementOptions
  }] = React.useContext(OptionsContext);
  const { enqueueSnackbar } = useSnackbar();
  const [formData, setFormData] = React.useState({...props.data });
  const [inputError, setInputError] = React.useState({});
  const [formDataCreateMutate, createStatus] = useMutation(QUOTATION_UPDATE_ITEM);
  const [formDataUpdateMutate, updateStatus] = useMutation(PROJECT_ITEM_UPDATE);
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
    let checkList = ["nameCht", "nameEn"];
    if(props.upperId > 0) checkList.push('unitId');
    for (let i of checkList) {
      if (formData[i] == null || formData[i] == "" || formData[i] == '') inputError[i] = language.inputError.required;
    }
    if(!formData.unitId && formData.prices?.length) inputError.unitId = language.inputError.required;
    if(formData.prices) {
      for(let i of formData.prices) {
        if(i.price === undefined || i.price === null) inputError.price = language.inputError.required;
        // if(!i.desc_cht) inputError.desc_cht = language.inputError.required;
        // if(!i.desc_en) inputError.desc_en = language.inputError.required;
      }
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
          id: formData.id,
          form: formData.form,
        }
      },
      onCompleted: (res) => {
        if (res.projectItemCreate.userErrors.length) {
          res.projectItemCreate.userErrors.map(e => {
            enqueueSnackbar(e.message, {
              variant: 'error'
            })
          })
        }
        else if (res.projectItemCreate.projectItem) {
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
          nameCht:formData.nameCht,
          nameEn: formData.nameEn,
          descCht:formData.descCht,
          descEn: formData.descEn,
          upperId: props.upperId.toString(),
          prices: formData.prices?.map(e=> ({...e, id: parseInt(e.id), price: parseFloat(e.price), delete: e.delete ? 1 : 0})),
          unitId: formData.unitId,
          remark: formData.remark
         }
      },
      onCompleted: (res) => {
        if (res.projectItemUpdate.userErrors.length) {
          res.projectItemUpdate.userErrors.map(e => {
            enqueueSnackbar(e.message, {
              variant: 'error'
            })
          })
        }
        else if (res.projectItemUpdate.projectItem) {
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
  }

  React.useEffect(() => {
      setFormData({
        ...props.data
      })
  }, [props.data, props.mode, open])

  return (
    <>
    {
      (createStatus.loading || updateStatus.loading) && <BackdropLoading/>
    }
      <EditFormModal
        sx={{minWidth: '80%', minHeight: '80%'}}
        open={open}
        title={`${mode}報價項目`}
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
                  報價項目
                </Typography>
                <Grid item xs={12}>
                  <ProjectItemSelect
                    upperId={0}
                    label="*父項目:"
                    variant="standard"
                    readOnly={true}
                    disabledIds={formData.id ? [formData.id] : []}
                    value={props.upperId??0}
                    error={inputError.upperId}
                    helperText={inputError.upperId}
                    onChange={(e) => { onFormDataChange(["upperId"], [e.target.value]) }}
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
                {
                  props.upperId != 0 && props.upperId && <>
                    <Grid item xs={'auto'} sm={'auto'} sx={{ display: 'flex' }}>
                      <Input
                        style={{ height: '100%', width: 120, textAlign: 'center' }}
                        type="number"
                        label="單價"
                        variant="standard"
                        value={formData.value}
                        error={inputError.value}
                        helperText={inputError.value}
                        InputProps={{
                          inputProps: { min: 0 },
                          startAdornment: <InputAdornment position="start">$</InputAdornment>,
                        }}
                        onChange={(e) => {
                          onFormDataChange(["value"], [e.target.value])
                        }}
                      />
                    </Grid>
                    <Grid item xs={'auto'} sm={'auto'} sx={{ display: 'flex' }}>
                      <Input
                        style={{ height: '100%', width: 120 }}
                        type="number"
                        label="數量"
                        variant="standard"
                        value={formData.quantity}
                        error={inputError.quantity}
                        helperText={inputError.quantity}
                        InputProps={{
                          inputProps: { min: 0 },
                          // endAdornment: <InputAdornment position="start">{measurementOptions.find(x => item?.unitId == x.id)?.nameCht}</InputAdornment>,
                        }}
                        onChange={(e) => {
                          onFormDataChange(["quantity"], [e.target.value])
                        }}
                      />
                    </Grid>
                    <Grid item xs={'auto'} sm={'auto'} sx={{ display: 'flex' }}>
                      <Select
                        label={"單位"}
                        variant="standard"
                        items={measurementOptions}
                        render={row =>
                          <MenuItem sx={{ borderWidth: 1, borderStyle: 'groove' }}
                            key={row.id}
                            value={row.id}>
                            {row.nameCht} | {row.nameEn}
                          </MenuItem>
                        }
                        error={inputError.unitId}
                        value={formData.unitId}
                        onChange={(e) => {
                          onFormDataChange(["unitId"], [e.target.value])
                        }}
                      />
                    </Grid>
                    <Grid item xs={'auto'} sm={'auto'} sx={{ display: 'flex' }}>
                      <Input
                        style={{ height: '100%', width: 200, textAlign: 'center', fontWeight: 'bold' }}
                        label="合計"
                        variant="standard"
                        value={toMoney(formData.quantity * formData.value)}
                        InputProps={{
                          inputProps: { min: 0 },
                          readOnly: true,
                          disableUnderline: true
                        }}
                      />
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