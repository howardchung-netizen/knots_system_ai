import * as React from 'react';
import { Grid, Typography } from '@mui/material';
import { useSnackbar } from 'notistack';
import EditFormModal from '../EditFormModal';
import { useMutation } from '@apollo/client';
import BackdropLoading from '../BackdropLoading';
import language from '../../localization/language';
import { InfoCard } from '../InfoCard';
import { QUOTATION_TEMPLATE_CREATE, QUOTATION_TEMPLATE_UPDATE } from '../../apollo/mutations';
import Input from '../Input';
import { useNavigate } from 'react-router-dom';

export default function ({ open, onCloseClick, onCompleted, ...props }) {
	
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [formData, setFormData] = React.useState({});
  const [inputError, setInputError] = React.useState({});
  const [formDataCreateMutate, createStatus] = useMutation(QUOTATION_TEMPLATE_CREATE);
  const [formDataUpdateMutate, updateStatus] = useMutation(QUOTATION_TEMPLATE_UPDATE);
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
    for (let i of ["name", "code"]) {
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
        if (res.quotationTemplateCreate.userErrors.length) {
          res.quotationTemplateCreate.userErrors.map(e => {
            enqueueSnackbar(e.message, {
              variant: 'error'
            })
          })
        }
        else if (res.quotationTemplateCreate.quotationTemplate) {
          if(onCompleted)onCompleted();
          enqueueSnackbar(`${mode}成功`, {
            variant: 'success'
          })
          navigate(`/cms/template/${res.quotationTemplateCreate.quotationTemplate.id}?tab=0`)
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
          code:formData.code
         }
      },
      onCompleted: (res) => {
        if (res.quotationTemplateUpdate.userErrors.length) {
          res.quotationTemplateUpdate.userErrors.map(e => {
            enqueueSnackbar(e.message, {
              variant: 'error'
            })
          })
        }
        else if (res.quotationTemplateUpdate.quotationTemplate) {
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
        ...props.data
      })
  }, [props.data, props.mode, open])
  
  return (
    <>
    {
      (createStatus.loading || updateStatus.loading) && <BackdropLoading/>
    }
      <EditFormModal
        open={open}
        title={`${mode}模板`}
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
                  模板
                </Typography>
                <Grid item xs={12}>
                  <Input
                    label="*編號:"
                    variant="standard"
                    value={formData.code}
                    error={inputError.code}
                    helperText={inputError.code}
                    onChange={(e) => { onFormDataChange(["code"], [e.target.value]) }}
                  />
                </Grid>
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
                  <Input
                    readOnly={true}
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