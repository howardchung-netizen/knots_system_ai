import * as React from 'react';
import { Grid, Typography } from '@mui/material';
import { useSnackbar } from 'notistack';
import { useMutation } from '@apollo/client';
import BackdropLoading from '../BackdropLoading';
import language from '../../localization/language';
import { InfoCard } from '../InfoCard';
import { UPDATE_CLOCKIN, UPDATE_CLOCK_IN_CONTACT } from '../../apollo/mutations';
import Input from '../Input';
import { useNavigate } from 'react-router-dom';
import { OptionsContext } from '../../contexts/OptionsContextProvider';
import EditFormModal from '../EditFormModal';

export default function ({ open, onCloseClick, onCompleted, ...props }) {
	
  const [] = React.useContext(OptionsContext);
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [formData, setFormData] = React.useState({...props.data});
  const [inputError, setInputError] = React.useState({});
  const [formDataUpdateMutate, updateStatus] = useMutation(UPDATE_CLOCKIN);
  const mode = '編輯';
  
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
    for (let i of ["id"]) {
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
         ...formData,
         salary: parseFloat(formData.salary??0)
        }
      },
      onCompleted: (res) => {
        if (res.updateClockIn.userErrors.length) {
          res.updateClockIn.userErrors.map(e => {
            enqueueSnackbar(e.message, {
              variant: 'error'
            })
          })
        }
        else if (res.updateClockIn.clockIn) {
          if (onCompleted) onCompleted();
          enqueueSnackbar(`編輯成功`, {
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
        (updateStatus.loading) && <BackdropLoading />
      }
      <EditFormModal
        open={open}
        title={`${mode}人工`}
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
                  <Input
                    type="number"
                    label="人工:"
                    variant="standard"
                    value={formData.salary}
                    error={inputError.salary}
                    helperText={inputError.salary}
                    onChange={(e) => { onFormDataChange(["salary"], [e.target.value]) }}
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