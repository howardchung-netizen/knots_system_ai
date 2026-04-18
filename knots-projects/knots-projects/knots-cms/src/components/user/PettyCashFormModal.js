import * as React from 'react';
import { Grid, MenuItem, Typography } from '@mui/material';
import { useSnackbar } from 'notistack';
import EditFormModal from '../EditFormModal';
import { from, useMutation } from '@apollo/client';
import BackdropLoading from '../BackdropLoading';
import language from '../../localization/language';
import { InfoCard } from '../InfoCard';
import { CHEQUE_BOOK_CREATE, CHEQUE_BOOK_UPDATE } from '../../apollo/mutations';
import Input from '../Input';
import { useNavigate } from 'react-router-dom';
import { OptionsContext } from '../../contexts/OptionsContextProvider';
import Select from '../Select';
import { userStatus } from '../../constants/InputOptions';

const FinancialYearList = ()=>{
  let startYear = new Date().getFullYear() - 5;
  let list = [];
  for(let i = 0; i < 10; i++){
    list.push({
      label: `${startYear+i}-${startYear+i+1}`,
      value: `${startYear+i}-${startYear+i+1}`
    })
  }
  return list;
}

export default function ({ open, onCloseClick, onCompleted, ...props }) {
	
  const [optionsContext, optionsContextDispatch, {bookKeepingCompanyOptions, bookKeepingAccountOptions, bookKeepingAccountTypeOptions}] = React.useContext(OptionsContext);
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [formData, setFormData] = React.useState({...props.data, receiver: props.data?.username });
  const [inputError, setInputError] = React.useState({});
  const [formDataCreateMutate, createStatus] = useMutation(CHEQUE_BOOK_CREATE);
  const [formDataUpdateMutate, updateStatus] = useMutation(CHEQUE_BOOK_UPDATE);
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
    let checkList = [];
    if(props.mode == 'create') checkList = ["chequeNo", "date", "amount", "receiver"];
    else checkList = ["status"];
    let inputError = {};
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
        data: {
          chequeNo: formData.chequeNo,
          date: formData.date,
          receiver: formData.receiver,
          confirmTransfer: formData.confirmTransfer,
          desc: formData.desc,
          remark: formData.remark,
          isCredit: true,
          forPettyCash: true,
          forPettyCashStaffId: formData.id,
          allocate: {
            amount: parseFloat(formData.amount),
          }
        }
      },
      onCompleted: (res) => {
        if (res.chequeBookCreate.userErrors.length) {
          res.chequeBookCreate.userErrors.map(e => {
            enqueueSnackbar(e.message, {
              variant: 'error'
            })
          })
        }
        else if (res.chequeBookCreate.chequeBook) {
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
          chequeNo: formData.chequeNo,
          date: formData.date,
          receiver: formData.receiver,
          confirmTransfer: formData.confirmTransfer,
          desc: formData.desc,
          remark: formData.remark,
          isCredit: true,
          forPettyCash: true,
          forPettyCashStaffId: formData.forPettyCashStaff.id,
          allocate: {
            amount: parseFloat(formData.amount),
          }
        }
      },
      onCompleted: (res) => {
        if (res.chequeBookUpdate.userErrors.length) {
          res.chequeBookUpdate.userErrors.map(e => {
            enqueueSnackbar(e.message, {
              variant: 'error'
            })
          })
        }
        else if (res.chequeBookUpdate.chequeBook) {
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
        disabled={true}
        loading={false}
        label="*狀態:"
        variant="standard"
        items={userStatus}
        render={(row, i) => <MenuItem key={i} value={row.value}>{row.label}</MenuItem>}
        value={formData.status}
        error={inputError.status}
        helperText={inputError.status}
        onChange={(e) => { onFormDataChange(["status"], [e.target.value]) }}
      />
    )
  }

  const CategoryAccountSelect = () => {
    return (
      <Select
        loading={false}
        label="*類別:"
        variant="standard"
        items={bookKeepingAccountOptions??[]}
        render={(row, i) => <MenuItem key={i} value={row.value}>{row.label}</MenuItem>}
        value={formData.categoryAccountId}
        error={inputError.categoryAccountId}
        helperText={inputError.categoryAccountId}
        onChange={(e) => { onFormDataChange(["categoryAccountId"], [e.target.value]) }}
      />
    )
  }

  const CompaniesSelect = () => {
    return (
      <Select
        loading={false}
        label="*公司:"
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

  const ConfirmTransferSelect = () => {
    return (
      <Select
        loading={false}
        label="*已過數:"
        variant="standard"
        items={[{
          label: "是",
          value: true
        }, {
          label: "否",
          value: false
        }]}
        render={(row, i) => <MenuItem key={i} value={row.value}>{row.label}</MenuItem>}
        value={formData.confirmTransfer}
        error={inputError.confirmTransfer}
        helperText={inputError.confirmTransfer}
        onChange={(e) => { onFormDataChange(["confirmTransfer"], [e.target.value]) }}
      />
    )
  }

  const IsCreditSelect = () => {
    return (
      <Select
        loading={false}
        label="已過數:"
        variant="standard"
        items={[{
          label: "是",
          value: true
        }, {
          label: "否",
          value: false
        }]}
        render={(row, i) => <MenuItem key={i} value={row.value}>{row.label}</MenuItem>}
        value={formData.isCredit}
        error={inputError.isCredit}
        helperText={inputError.isCredit}
        onChange={(e) => { onFormDataChange(["isCredit"], [e.target.value]) }}
      />
    )
  }

   const FinancialYearSelect = () => { 
    return (
      <Select
        loading={false}
        label="*財政年度:"
        variant="standard"
        items={FinancialYearList()}
        render={(row, i) => <MenuItem key={i} value={row.value}>{row.label}</MenuItem>}
        value={formData.financialYear}
        error={inputError.financialYear}
        helperText={inputError.financialYear}
        onChange={(e) => { onFormDataChange(["financialYear"], [e.target.value]) }}
      />
    )
  }

  React.useEffect(() => {
      setFormData({...props.data, receiver: props.data?.username})
  }, [props.data, props.mode, open])
  
  return (
    <>
    {
      (createStatus.loading || updateStatus.loading) && <BackdropLoading/>
    }
      <EditFormModal
        open={open}
        title={`${mode}備用金額`}
        onConfirmClick={_onConfirmClick}
        onCloseClick={_onCloseClick}
      >
        <Grid container spacing={2} padding={1}>
          <Grid item sm={12} padding={0}>
            <InfoCard
              title={""}
            >
              <Grid container spacing={2} padding={1}>
                {/* <Typography variant="body2" sx={{ marginBottom: 1, fontWeight: 'bold', fontSize: 18 }}>
                 員工
                </Typography>
                <Grid item xs={12}>
                  <Input
                    disabled={true}
                    label="帳號:"
                    variant="standard"
                    value={formData.username}
                    error={inputError.username}
                    helperText={inputError.username}
                    onChange={(e) => { onFormDataChange(["username"], [e.target.value]) }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <StatusSelect/>
                </Grid>
                <Grid item xs={12}>
                  <Input
                    disabled={true}
                    label="中文名稱:"
                    variant="standard"
                    value={formData.nameCht}
                    error={inputError.nameCht}
                    helperText={inputError.nameCht}
                    onChange={(e) => { onFormDataChange(["nameCht"], [e.target.value]) }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Input
                    disabled={true}
                    label="英文名稱:"
                    variant="standard"
                    value={formData.nameEn}
                    error={inputError.nameEn}
                    helperText={inputError.nameEn}
                    onChange={(e) => { onFormDataChange(["nameEn"], [e.target.value]) }}
                  />
                </Grid> */}
                <Typography variant="body2" sx={{ marginBottom: 1, marginTop: 0, fontWeight: 'bold', fontSize: 18 }}>
                  增值資料
                </Typography>
                <Grid item xs={12}>
                  <Input
                    label="*Cheque No:"
                    variant="standard"
                    value={formData.chequeNo}
                    error={inputError.chequeNo}
                    helperText={inputError.chequeNo}
                    onChange={(e) => { onFormDataChange(["chequeNo"], [e.target.value]) }}
                  />
                </Grid>
                <Grid item xs={'auto'} sx={{minWidth: 120, maxWidth:120}}>
                  <Input
                    disabled={props.mode == 'edit'}
                    type="number"
                    label="*金額:"
                    variant="standard"
                    value={formData.amount}
                    error={inputError.amount}
                    helperText={inputError.amount}
                    onChange={(e) => { onFormDataChange(["amount"], [e.target.value]) }}
                  />
                </Grid>
                <Grid item xs={'auto'} sx={{minWidth: 100, maxWidth:100}}>
                 <Input
                    type="date"
                    label="*增值日期:"
                    variant="standard"
                    value={formData.date}
                    error={inputError.date}
                    helperText={inputError.date}
                    onChange={(e) => { onFormDataChange(["date"], [e.target.value]) }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Input
                    label="*收款方:"
                    variant="standard"
                    value={formData.receiver ?? formData.username}
                    error={inputError.receiver}
                    helperText={inputError.receiver}
                    onChange={(e) => { onFormDataChange(["receiver"], [e.target.value]) }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Input
                    label="描述:"
                    variant="standard"
                    value={formData.desc}
                    error={inputError.desc}
                    helperText={inputError.desc}
                    onChange={(e) => { onFormDataChange(["desc"], [e.target.value]) }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Input
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