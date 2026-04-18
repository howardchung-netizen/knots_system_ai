import * as React from 'react';
import { Grid, MenuItem } from '@mui/material';
import { useSnackbar } from 'notistack';
import { checkAppsettingsInput } from '../utils/checkInputError';
import Select from './Select';
import Input from './Input';
import EditFormModal from './EditFormModal';

export default function ({ data, open, onCloseClick, onConfirmClick }) {

  const { enqueueSnackbar } = useSnackbar();
  const [formData, setFormData] = React.useState(data??{});
  const [inputError, setInputError] = React.useState({});
  const title = !formData.id ? '新增App 設定' : '修改App 設定';

  const _onCloseClick= () => {
    setFormData({})
    setInputError({});
    onCloseClick();
  }

  const onFormDataChange = (key, value) => {
 
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
    let inputError = checkAppsettingsInput(formData);
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
    onConfirmClick({
      variables: {
        data: {
          ...(!formData.id ? {} : { id: formData.id }),
          key: formData.key,
          public: formData.public,
          description: formData.description,
          value: formData.value
        }
      }
    })
  }

  React.useEffect(()=>{
   if(open) setFormData(data??{});
  }, [open])
  
  return (
    <>
      <EditFormModal
        open={open}
        title={title}
        onConfirmClick={_onConfirmClick}
        onCloseClick={_onCloseClick}
      >
        <Grid container spacing={2} padding={1}>
          <Grid item xs={12} padding={0}>
            <Input
              label="Key"
              variant="outlined"
              value={formData?.key}
              error={inputError.key}
              helperText={inputError.key}
              onChange={(e) => { onFormDataChange(["key"], [e.target.value]) }}
            />
          </Grid>
          <Grid item xs={12}>
            <Select
              label={"Public"}
              labelId="public"
              value={formData?.public ? true : false}
              error={inputError.public}
              onChange={(e) => { onFormDataChange(["public"], [e.target.value]) }}
            >
              <MenuItem value={true}>是</MenuItem>
              <MenuItem value={false}>否</MenuItem>
            </Select>
          </Grid>
          <Grid item xs={12}>
            <Input
              label="Description"
              variant="outlined"
              value={formData?.description}
              error={inputError.description}
              helperText={inputError.description}
              onChange={(e) => { onFormDataChange(["description"], [e.target.value]) }}
            />
          </Grid>

          <Grid item xs={12}>
            <Input
              label="Value"
              variant="outlined"
              value={formData?.value}
              error={inputError.value}
              helperText={inputError.value}
              onChange={(e) => { onFormDataChange(["value"], [e.target.value]) }}
            />
          </Grid>
        </Grid>
      </EditFormModal>
    </>
  );

}