import * as React from 'react';
import { Grid, MenuItem, Typography } from '@mui/material';
import { useSnackbar } from 'notistack';
import EditFormModal from '../EditFormModal';
import { useMutation } from '@apollo/client';
import BackdropLoading from '../BackdropLoading';
import language from '../../localization/language';
import { InfoCard } from '../InfoCard';
import { QUOTATION_CREATE, QUOTATION_UPDATE } from '../../apollo/mutations';
import Input from '../Input';
import { useNavigate } from 'react-router-dom';
import { OptionsContext } from '../../contexts/OptionsContextProvider';
import QuotationsStatusSelect from './QuotationsStatusSelect';
import Select from '../Select';
import { ClientForm } from '../project/ProjectForm';

export default function ({ open, onCloseClick, onCompleted, ...props }) {
	
  const [optionsContext, optionsContextDispatch, {quotationStautsIds}] = React.useContext(OptionsContext);
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [formData, setFormData] = React.useState({...props.data});
  const [inputError, setInputError] = React.useState({});
  const [formDataCreateMutate, createStatus] = useMutation(QUOTATION_CREATE);
  const [formDataUpdateMutate, updateStatus] = useMutation(QUOTATION_UPDATE);
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
    let checkList = ["title", "status", "quotationStatusId"];
    if(props.mode == 'create') checkList.push("clientId");
    for (let i of checkList) {
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
        data: { ...formData}
      },
      onCompleted: (res) => {
        if (res.quotationCreate.userErrors.length) {
          res.quotationCreate.userErrors.map(e => {
            enqueueSnackbar(e.message, {
              variant: 'error'
            })
          })
        }
        else if (res.quotationCreate.quotation) {
          if(onCompleted)onCompleted();
          enqueueSnackbar(`${mode}成功`, {
            variant: 'success'
          })
          navigate(`/cms/quotation/${res.quotationCreate.quotation.id}?tab=0`)
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
          cmsRemark: formData.cmsRemark,
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

  const StatusSelect = () => {
    return (
      <Select
        loading={false}
        label="*狀態:"
        variant="standard"
        // defaultValue={1}
        items={[
          { label: '無效', value: false },
          { label: '有效', value: true },
        ]}
        render={(row, i) => <MenuItem key={i} value={row.value}>{row.label}</MenuItem>}
        value={formData.status}
        error={inputError.status}
        helperText={inputError.status}
        onChange={(e) => { onFormDataChange(["status"], [e.target.value]) }}
      />
    )
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
        title={`${mode}報價單`}
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
                 報價單
                </Typography>
                <Grid item xs={12}>
                  <Input
                    label="*標題:"
                    variant="standard"
                    value={formData.title}
                    error={inputError.title}
                    helperText={inputError.title}
                    onChange={(e) => { onFormDataChange(["title"], [e.target.value]) }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <QuotationsStatusSelect
                    loading={false}
                    label="*進程:"
                    variant="standard"
                    value={formData.quotationStatusId}
                    error={inputError.quotationStatusId}
                    helperText={inputError.quotationStatusId}
                    onChange={(e) => { 
                      onFormDataChange(["quotationStatusId"], [e.target.value])
                     }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <StatusSelect/>
                </Grid>
                {
                props.mode == 'create' && <>
                <Grid item xs={12}>
                  <ClientForm
                    {...formData}
                    onFormDataChange={onFormDataChange}
                    inputError={inputError}
                  />
                </Grid>
                </>
                }
                <Grid item xs={12}>
                  <Input
                    // readOnly={true}
                    label="內部備註:"
                    variant="outlined"
                    value={formData.cmsRemark}
                    error={inputError.cmsRemark}
                    helperText={inputError.cmsRemark}
                    maxRows={4}
                    minRows={4}
                    multiline
                    onChange={(e) => { onFormDataChange(["cmsRemark"], [e.target.value]) }}
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