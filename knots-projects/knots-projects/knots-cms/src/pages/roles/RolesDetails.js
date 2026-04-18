import React, { useState } from 'react';

import { Autocomplete, Grid } from '@mui/material';
import EditFormModal from '../../components/EditFormModal';
import Input from '../../components/Input';
import { checkRolesEditInput } from '../../utils/checkInputError';
import { useSnackbar } from 'notistack';
import { GET_PERMISSION } from '../../apollo/queries';
import { from, useQuery } from '@apollo/client';

const initData = (data) => {
  return  {
    name: data?.name??'',
    permissions: data?.permissions?.map(e=> e.name)??[],
    roles: data?.roles?.map(e=> e.name)??[]
  };
}
export default function PermissionCreate({ data, open, onCloseClick, onConfirmClick, ...props }) {

  const { enqueueSnackbar } = useSnackbar();
  const { rolesList } = props;
  const [formData, setFormData] = React.useState(initData(data));

  const [inputError, setInputError] = React.useState({});

  const title = !formData.name ? '新增' : '修改';

  const _onCloseClick = () => {
    setFormData({})
    setInputError({});
    onCloseClick();
  }
  const { data: permissionList } = useQuery(GET_PERMISSION, {
    fetchPolicy: 'network-only',
    variables: {}
  });

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
    let inputError = checkRolesEditInput(formData);
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
        data: formData
      }
    })
  }

  const PermissionsInput = () => {
    const [value, setValue] = useState(formData.permissions);
    return <Autocomplete
      multiple
      id="multiple-limit-tags1"
      filterSelectedOptions
      options={permissionList?.permissions?.map(p => p.name) || []}
      getOptionLabel={x => x}
      renderInput={(params) => (
        <Input {...params}
          label="權限"
          style={{ width: '100%' }}
          error={inputError.permissions}
          helperText={inputError.permissions}
        />
      )}
      value={value}
      style={{ width: '100%' }}
      onChange={(e, v) => {
        console.log(v)
        onFormDataChange(["permissions"], [v]);
        setValue(v)

      }}
    />
  }

  const RolesInput = () => {
    const [value, setValue] = useState(formData?.roles?.map(p => p.name??p) || []);
    return <Autocomplete
      multiple
      id="multiple-limit-tags"
      filterSelectedOptions
      options={rolesList?.map(p => p.name) || []}
      getOptionLabel={x => x}
      renderInput={(params) => (
        <Input {...params}
          label="上級員工角色"
          placeholder=""
          style={{ width: '100%' }}
          error={inputError.roles}
          helperText={inputError.roles}
        />
      )}
      value={value}
      style={{ width: '100%' }}
      onChange={(e, v) => {
        onFormDataChange(["roles"], [v]);
        setValue(v)
      }}
    />
  }

  React.useEffect(() => {
    if (open) setFormData(initData(data));
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
              label="角色名稱"
              variant="outlined"
              value={formData?.name}
              error={inputError.name}
              helperText={inputError.name}
              onChange={(e) => { onFormDataChange(["name"], [e.target.value]) }}
            />
          </Grid>
          <Grid item xs={12}>
            <PermissionsInput />
          </Grid>
          <Grid item xs={12}>
            <RolesInput/>
          </Grid>
        </Grid>
      </EditFormModal>
    </>
  );
}

