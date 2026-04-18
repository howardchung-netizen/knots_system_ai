import * as React from 'react';
import { Grid, Typography } from '@mui/material';
import { useSnackbar } from 'notistack';
import EditFormModal from '../EditFormModal';
import { useMutation } from '@apollo/client';
import BackdropLoading from '../BackdropLoading';
import language from '../../localization/language';
import { InfoCard } from '../InfoCard';
import { PROJECT_ITEM_CREATE, PROJECT_ITEM_UPDATE } from '../../apollo/mutations';
import Input from '../Input';
import ProjectItemSelect from './ProjectItemSelect';
import MeasurementSelect from './MeasurementSelect';

export default function ({ open, onCloseClick, onCompleted, ...props }) {

  const { enqueueSnackbar } = useSnackbar();
  const [formData, setFormData] = React.useState({...props.data });
  const [inputError, setInputError] = React.useState({});
  const [formDataCreateMutate, createStatus] = useMutation(PROJECT_ITEM_CREATE);
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
    if(formData.upperId != 0) checkList.push('unitId');
    for (let i of checkList) {
      if (formData[i] == null || formData[i] == "" || formData[i] == '') inputError[i] = language.inputError.required;
    }
    // if(isNaN(formData.unitId)) inputError.unitId = language.inputError.required;
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
        data: { ...formData}
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
          upperId: formData.upperId.toString(),
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
        md={{ width: '80%' }}
        open={open}
        title={`${mode}項目`}
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
                  項目
                </Typography>
                <Grid item xs={12}>
                  <ProjectItemSelect
                    label="*父項目:"
                    variant="standard"
                    disabled={props.mode != 'create'}
                    disabledIds={formData.id ? [formData.id] : []}
                    value={formData.upperId}
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
                <Grid item xs={12}>
                  <Input
                    label="內部備註:"
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
                {
                  formData.upperId != 0 && formData.upperId && <>
                    <Typography variant="body2" sx={{ marginBottom: 1, marginTop: 3, fontWeight: 'bold', fontSize: 18 }}>
                      項目價錢
                    </Typography>
                    <Grid item xs={12}>
                      <MeasurementSelect
                        label="單位:"
                        variant="standard"
                        value={formData.unitId}
                        prices={formData.prices}
                        error={inputError.unitId}
                        helperText={inputError.unitId}
                        onUnitChange={(e) => {
                          if(e.target.value == '0') onFormDataChange(["unitId", "prices"], [e.target.value, null]);
                          else onFormDataChange(["unitId"], [e.target.value]);
                        }}
                        onChange={(v, i) => {
                          let _prices = formData.prices?.map((e, index) => {
                            if (i == index) return { ...e, ...v }
                            return e;
                          }) ?? [];
                          onFormDataChange(["prices"], [_prices])
                        }}
                        onAddClick={(e, i) => {

                          let _prices = formData.prices?.map(e => e) ?? [];
                          _prices.push({id: _prices.length, unitId: formData.unitId});
                          onFormDataChange(["prices"], [_prices])
                        }}
                        onDeleteClick={(e, i) => {
                          let _prices = formData.prices.filter((e, index) => index != i)
                          onFormDataChange(["prices"], [_prices])
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