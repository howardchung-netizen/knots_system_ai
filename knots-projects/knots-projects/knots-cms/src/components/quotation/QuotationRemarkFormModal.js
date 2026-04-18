import * as React from 'react';
import { Grid, TextareaAutosize } from '@mui/material';
import { useSnackbar } from 'notistack';
import EditFormModal from '../EditFormModal';
import { useMutation } from '@apollo/client';
import BackdropLoading from '../BackdropLoading';
import language from '../../localization/language';
import { InfoCard } from '../InfoCard';
import { QUOTATION_UPDATE } from '../../apollo/mutations';
import { useNavigate } from 'react-router-dom';
import { OptionsContext } from '../../contexts/OptionsContextProvider';

export default function ({ open, onCloseClick, onCompleted, ...props }) {
	
  const [optionsContext, optionsContextDispatch, {quotationStautsIds}] = React.useContext(OptionsContext);
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [formData, setFormData] = React.useState({...props.data});
  const [inputError, setInputError] = React.useState({});
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
    let checkList = [];
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
    formDataUpdateMutate({
      variables: {
        data: {
          id: formData.id,
          title: formData.title,
          status: formData.status,
          remark: formData.remark,
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
          if (onCompleted) onCompleted();
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
      updateStatus.loading && <BackdropLoading/>
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
                <Grid item xs={12}>
                  <TextareaAutosize
                    style={{ fieldSizing: 'content', width: '192mm', minHeight: 80, resize: 'none', fontSize: '13px' }}
                    label="列印備註:"
                    variant="outlined"
                    value={formData.remark}
                    error={inputError.remark}
                    helperText={inputError.remark}
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