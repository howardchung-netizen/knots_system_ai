import React, { useState } from 'react';

import { Autocomplete, Grid, MenuItem, TextField } from '@mui/material';
import EditFormModal from '../../components/EditFormModal';
import Input from '../../components/Input';
import { checkPermissionEditInput } from '../../utils/checkInputError';
import { useSnackbar } from 'notistack';
import Select from '../../components/Select';

export default function PermissionCreate({ data, open, onCloseClick, onConfirmClick, ...props }) {

  const { enqueueSnackbar } = useSnackbar();
  const { resourceData, permissionConfig } = props;
  const [formData, setFormData] = React.useState(data ?? {
    name: '',
    resource: '',
    actions: []
  });

  const [inputError, setInputError] = React.useState({});

  const title = !formData.name ? '新增' : '修改';

  const _onCloseClick = () => {
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
    let inputError = checkPermissionEditInput(formData);
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
          name: formData.name,
          actions: formData.actions,
          resource: formData.resource,
        }
      }
    })
  }

  const ResourceInput = () => {
    const [resource, setActions] = useState(formData.resource);
    return (
      <Select
        label={"資源"}
        labelId="resource"
        value={resource}
        error={inputError.resource}
        onChange={(e) => { onFormDataChange(["resource"], [e.target.value]) }}
      >
        {
          resourceData.map(e => <MenuItem key={e} value={e}>{e}</MenuItem>)
        }
      </Select>
    )
  }
  const ActionsInput = () => {
    const [actions, setActions] = useState(permissionConfig?.filter(x => formData?.actions?.find(y => y == x.value)));
    return <Autocomplete
      multiple
      filterSelectedOptions
      id="multiple-limit-tags"
      options={permissionConfig}
      getOptionLabel={(x) => x.value}
      renderInput={(params) => (
        <Input {...params}
          label="權限"
          placeholder="Actions"
          style={{ width: '100%' }}
          error={inputError.actions}
          helperText={inputError.actions}
        />
      )}
      value={actions}
      style={{ width: '100%' }}
      onChange={(e, v) => { 
        onFormDataChange(["actions"], [v.map(e=> e.value)]);
        
       }}
    />
  }
  React.useEffect(() => {
    if (open) setFormData(data ?? {
      name: '',
      resource: '',
      actions: []
    });
  }, [open])

  return (
    <>
      <EditFormModal
        open={open}
        title={title}
        onConfirmClick={_onConfirmClick}
        onCloseClick={_onCloseClick}
      >
        <Grid container spacing={2} padding={2}>
          <Grid item xs={12}>
            <Input
              label="權限名稱"
              variant="outlined"
              value={formData?.name}
              error={inputError.name}
              helperText={inputError.name}
              onChange={(e) => { onFormDataChange(["name"], [e.target.value]) }}
            />
          </Grid>
          <Grid item xs={12}>
            <ResourceInput/>
          </Grid>
          <Grid item xs={12}>
            <ActionsInput/>
          </Grid>
        </Grid>
      </EditFormModal>
    </>
  );
}

