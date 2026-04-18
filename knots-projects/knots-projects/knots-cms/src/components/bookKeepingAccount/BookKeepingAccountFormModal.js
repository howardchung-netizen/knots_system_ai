import * as React from 'react';
import { Grid, MenuItem, Typography } from '@mui/material';
import { useSnackbar } from 'notistack';
import EditFormModal from '../EditFormModal';
import { useMutation } from '@apollo/client';
import BackdropLoading from '../BackdropLoading';
import language from '../../localization/language';
import { InfoCard } from '../InfoCard';
import { BOOK_KEEPING_ACCOUNT_UPDATE, BOOK_KEEPING_ACCOUNT_CREATE } from '../../apollo/mutations';
import Input from '../Input';
import Select from '../Select';
import { OptionsContext } from '../../contexts/OptionsContextProvider';

const defaultData = { 
  isClaim: false,
  isPlaceholder: false,
}

export default function ({ open, onCloseClick, onCompleted, ...props }) {

  const [optionsContext, optionsContextDispatch, {bookKeepingCompanyOptions, bookKeepingAccountOptions, bookKeepingAccountTypeOptions}] = React.useContext(OptionsContext);
  const { enqueueSnackbar } = useSnackbar();
  const [formData, setFormData] = React.useState({...defaultData, ...props.data});
  const [inputError, setInputError] = React.useState({});
  const [formDataCreateMutate, createStatus] = useMutation(BOOK_KEEPING_ACCOUNT_CREATE);
  const [formDataUpdateMutate, updateStatus] = useMutation(BOOK_KEEPING_ACCOUNT_UPDATE);
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
    for (let i of ["name", "accountTypeId", "isPlaceholder", "isClaim"]) {
      if (formData[i] === undefined) inputError[i] = language.inputError.required;
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
        if (res.bookKeepingAccountCreate.userErrors.length) {
          res.bookKeepingAccountCreate.userErrors.map(e => {
            enqueueSnackbar(e.message, {
              variant: 'error'
            })
          })
        }
        else if (res.bookKeepingAccountCreate.bookKeepingAccount) {
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
    else formDataUpdateMutate({
      variables: {
        data: { 
          id: formData.id,
          name: formData.name,
          accountTypeId: formData.accountTypeId,
          isPlaceholder: formData.isPlaceholder,
          isClaim: formData.isClaim,
          parentAccountId: formData.parentAccountId
        }
      },
      onCompleted: (res) => {
        if (res.bookKeepingAccountUpdate.userErrors.length) {
          res.bookKeepingAccountUpdate.userErrors.map(e => {
            enqueueSnackbar(e.message, {
              variant: 'error'
            })
          })
        }
        else if (res.bookKeepingAccountUpdate.bookKeepingAccount) {
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

  const CompaniesSelect = () => {
    return (
      <Select
        loading={false}
        label="*記帳公司:"
        variant="standard"
        items={bookKeepingCompanyOptions??[]}
        render={(row, i) => <MenuItem key={i} value={row.value}>{row.label}</MenuItem>}
        value={formData.companyId}
        error={inputError.companyId}
        helperText={inputError.companyId}
        onChange={(e) => { onFormDataChange(["companyId"], [e.target.value]) }}
      />
    )
  }

  const BookKeepingAccountTypeSelect = () => {
    return (
      <Select
        loading={false}
        label="*入帳類別:"
        variant="standard"
        items={bookKeepingAccountTypeOptions??[]}
        render={(row, i) => <MenuItem key={i} value={row.value}>{row.label}</MenuItem>}
        value={formData.accountTypeId}
        error={inputError.accountTypeId}
        helperText={inputError.accountTypeId}
        onChange={(e) => { onFormDataChange(["accountTypeId"], [e.target.value]) }}
      />
    )
  }
  
  const CategoryAccountSelect = () => {
    return (
      <Select
        disabled
        loading={false}
        label="*上層:"
        variant="standard"
        items={bookKeepingAccountOptions??[]}
        render={(row, i) => <MenuItem key={i} value={row.value}>{row.label}</MenuItem>}
        value={formData.parentAccountId}
        error={inputError.parentAccountId}
        helperText={inputError.parentAccountId}
        onChange={(e) => { onFormDataChange(["parentAccountId"], [e.target.value]) }}
      />
    )
  }

  const IsPlaceholderSelect = () => {
    return <Select
      label="*標題:"
      variant="standard"
      items={[{ value: true, label: "是", key: "1" }, { value: false, label: "否", key: "0" }]}
      value={formData.isPlaceholder}
      error={inputError.isPlaceholder}
      helperText={inputError.isPlaceholder}
      onChange={(e) => { onFormDataChange(["isPlaceholder"], [e.target.value]) }}
      render={(e) => <MenuItem key={e.key} value={e.value}>{e.label}</MenuItem>}
    />
  }

  const IsClaimSelect = () => { 
    return <Select
      label="*員工報銷專用:"
      variant="standard"
      items={[{ value: true, label: "是", key: "1" }, { value: false, label: "否", key: "0" }]}
      value={formData.isClaim}
      error={inputError.isClaim}
      helperText={inputError.isClaim}
      onChange={(e) => { onFormDataChange(["isClaim"], [e.target.value]) }}
      render={(e) => <MenuItem key={e.key} value={e.value}>{e.label}</MenuItem>}
    />
  }

  React.useEffect(() => {
      setFormData({
        ...defaultData,
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
        title={`${mode}會計項目`}
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
                 項目資料
                </Typography>
                {
                  formData.parentAccountId && <Grid item xs={12}>
                  <CategoryAccountSelect />
                </Grid>
                }
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
                {/* <Grid item xs={12}>
                  <CompaniesSelect />
                </Grid> */}
                {/* <Grid item xs={12}>
                  <BookKeepingAccountTypeSelect />
                </Grid> */}
                <Grid item xs={12}>
                  <IsPlaceholderSelect />
                </Grid>
                <Grid item xs={12}>
                  <IsClaimSelect />
                </Grid>
              </Grid>
            </InfoCard>
          </Grid>
        </Grid>
      </EditFormModal>
    </>
  );

}