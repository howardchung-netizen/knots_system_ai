import * as React from 'react';
import { Grid, Typography } from '@mui/material';
import { useSnackbar } from 'notistack';
import EditFormModal from '../EditFormModal';
import { useMutation } from '@apollo/client';
import BackdropLoading from '../BackdropLoading';
import language from '../../localization/language';
import { InfoCard } from '../InfoCard';
import { QUOTATION_UPDATE_TERM } from '../../apollo/mutations';
import Input from '../Input';
import { v4 as uuidv4 } from 'uuid';

export default function ({ open, onCloseClick, onCompleted, ...props }) {

  const { enqueueSnackbar } = useSnackbar();
  const [formData, setFormData] = React.useState({...props.data});
  const [inputError, setInputError] = React.useState({});
  const [formDataUpdateMutate, updateStatus] = useMutation(QUOTATION_UPDATE_TERM);
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
    for (let i of ["name_cht", "name_en"]) {
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
    let newTerm = props.term??[];
    if(props.mode == 'create') newTerm.push({...formData, id: uuidv4()});
    else newTerm = newTerm.map((e, i) => formData.id == e.id ? formData : e);
    formDataUpdateMutate({
      variables: {
        data: { 
          id: props.quotationId,
          term: newTerm,
         }
      },
      onCompleted: (res) => {
        if (res.quotationUpdateTerm.userErrors.length) {
          res.quotationUpdateTerm.userErrors.map(e => {
            enqueueSnackbar(e.message, {
              variant: 'error'
            })
          })
        }
        else if (res.quotationUpdateTerm.quotation) {
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
    if(props.mode == 'edit') {
      setFormData({
        ...props.data
      })
    }
  }, [props.data, props.mode, open])

  return (
    <>
    {
      (updateStatus.loading) && <BackdropLoading/>
    }
      <EditFormModal
        open={open}
        title={`${mode}條款`}
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
                  條款
                </Typography>
                <Grid item xs={12}>
                  <Input
                    label="*名稱(中文):"
                    variant="outlined"
                    minRows={4}
                    multiline
                    value={formData.name_cht}
                    error={inputError.name_cht}
                    helperText={inputError.name_cht}
                    onChange={(e) => { onFormDataChange(["name_cht"], [e.target.value]) }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Input
                    label="*名稱(英文):"
                    variant="outlined"
                    minRows={4}
                    multiline
                    value={formData.name_en}
                    error={inputError.name_en}
                    helperText={inputError.name_en}
                    onChange={(e) => { onFormDataChange(["name_en"], [e.target.value]) }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Input
                    label="描述(中文):"
                    variant="outlined"
                    minRows={4}
                    multiline
                    value={formData.desc_cht}
                    error={inputError.desc_cht}
                    helperText={inputError.desc_cht}
                    onChange={(e) => { onFormDataChange(["desc_cht"], [e.target.value]) }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Input
                    label="描述(英文):"
                    variant="outlined"
                    minRows={4}
                    multiline
                    value={formData.desc_en}
                    error={inputError.desc_en}
                    helperText={inputError.desc_en}
                    onChange={(e) => { onFormDataChange(["desc_en"], [e.target.value]) }}
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