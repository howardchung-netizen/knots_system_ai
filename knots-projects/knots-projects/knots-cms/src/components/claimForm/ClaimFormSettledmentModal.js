import * as React from 'react';
import { Grid, MenuItem, Typography } from '@mui/material';
import { useSnackbar } from 'notistack';
import EditFormModal from '../EditFormModal';
import { useMutation } from '@apollo/client';
import BackdropLoading from '../BackdropLoading';
import language from '../../localization/language';
import { InfoCard, InfoRow } from '../InfoCard';
import { CLAIM_FORM_CONFIRM_TRANSFER } from '../../apollo/mutations';
import Input from '../Input';
import { useNavigate } from 'react-router-dom';
import { OptionsContext } from '../../contexts/OptionsContextProvider';
import Select from '../Select';
import { toMoney } from '../../utils';

const REACT_APP_DEFAULT_COMPANY_ID = process.env.REACT_APP_DEFAULT_COMPANY_ID;

const defaultData = { 
  companyId: REACT_APP_DEFAULT_COMPANY_ID,
  financialYear: `${new Date().getFullYear()}-${new Date().getFullYear()+1}`,
  transactionDate: new Date().toISOString().split('T')[0],
}

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
export default function ({ open, onCloseClick, onCompleted, staff, ...props }) {
	
  const [optionsContext, optionsContextDispatch, {bookKeepingCompanyOptions, bookKeepingAccountOptions, bookKeepingAccountTypeOptions}] = React.useContext(OptionsContext);
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [formData, setFormData] = React.useState({...defaultData, ...props.data});
  const [inputError, setInputError] = React.useState({});
  const [formDataCreateMutate, createStatus] = useMutation(CLAIM_FORM_CONFIRM_TRANSFER);
  const mode = '員工報銷單入帳';
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
    checkList = ["categoryAccountId", "financialYear", "transactionDate", "companyId"];
    let inputError = {};
    for (let i of checkList) {
      if (formData[i] == null || formData[i] == undefined) inputError[i] = language.inputError.required;
    }
    setInputError(inputError);
    let hasError = Object.keys(inputError).length;

    return hasError
  }
  
  const _onConfirmClick = () => {
    if(formData.settlement == true) {
      alert("已核實的報銷單無法編輯!");
      return
    }
    if (checkInputError()) {
      enqueueSnackbar('請檢查輸入', {
        variant: 'error'
      })
      return;
    }

    formDataCreateMutate({
      variables: {
        data: {
          id: formData.id,
          projectId: formData.projectId,
          categoryAccountId: formData.categoryAccountId,
          bankAccountId: formData.bankAccountId,
          transactionDate: formData.transactionDate,
          financialYearStart: parseInt(formData.financialYear.split('-')[0]),
          financialYearEnd: parseInt(formData.financialYear.split('-')[1]),
          companyId: formData.companyId,
          transactionDesc: formData.desc,
          isOrder: formData.isOrder,
        }
      },
      onCompleted: (res) => {
        if (res.claimFormConfirmTransfer.userErrors.length) {
          res.claimFormConfirmTransfer.userErrors.map(e => {
            enqueueSnackbar(e.message, {
              variant: 'error'
            })
          })
        }
        else if (res.claimFormConfirmTransfer.claimForm) {
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
  }

  const CategoryAccountSelect = () => {
    return (
      <Select
        loading={false}
        label="*報銷類別:"
        variant="standard"
        items={bookKeepingAccountOptions.filter(e=>!e.isBank && e.isClaim)??[]}
        render={(row, i) => <MenuItem key={i} value={row.value}>{row.label}</MenuItem>}
        value={formData.categoryAccountId}
        error={inputError.categoryAccountId}
        helperText={inputError.categoryAccountId}
        onChange={(e) => { onFormDataChange(["categoryAccountId"], [e.target.value]) }}
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

  React.useEffect(() => {
      setFormData({...defaultData, ...props.data})
  }, [props.data, props.mode, open])
  if(!open) return <></>
  return (
    <>
    {
      (createStatus.loading) && <BackdropLoading/>
    }
      <EditFormModal
        open={open}
        title={`${mode}`}
        onConfirmClick={_onConfirmClick}
        onCloseClick={_onCloseClick}
      >
        <Grid container spacing={2} padding={1}>
          <Grid item xs={12} sm={4} md={4} lg={3}>
          <Grid container spacing={2} padding={0}>
            <Grid item xs={12} sm={12} md={12} lg={12}>
              <InfoCard
                title={"報銷內容"}
              >
                <Grid item xs={12}>
                  <InfoRow label={"供應商:"} value={formData.vendor} flexDirection={'column'} />
                  <InfoRow label={"金額:"} value={toMoney(formData.amount)} flexDirection={'column'} />
                  <InfoRow label={"購買日期:"} value={formData.purchasedDate} flexDirection={'column'} />
                </Grid>
              </InfoCard>
            </Grid>
            <Grid item xs={12} sm={12} md={12} lg={12}>
              <InfoCard
                title={"員工"}
              >
                <Grid item xs={12}>
                  <InfoRow label={"名稱(中文):"} value={staff?.nameCht} flexDirection={'column'} />
                  <InfoRow label={"名稱(英文):"} value={staff?.nameEn} flexDirection={'column'} />
                  <InfoRow label={"電話:"} value={staff?.tel2} flexDirection={'column'} />
                  <InfoRow label={"備用金:"} value={toMoney(staff?.pettyCash)} flexDirection={'column'} />
                </Grid>
              </InfoCard>
            </Grid>
            <Grid item xs={12} sm={12} md={12} lg={12}>
              <InfoCard
                title={"收據"}
              >
                <Grid item xs={12}>
                  {
                    formData.fileUrl && <a href={formData.fileUrl} target="_blank"><img src={formData.fileUrl} style={{ width: 100, height: 100, objectFit: 'contain' }} /></a>
                  }
                </Grid>
              </InfoCard>
            </Grid>
          </Grid>
          </Grid>
          <Grid item xs={12} sm={8} md={8} lg={9}>
            <InfoCard
              title={""}
            >
              <Grid container spacing={2} padding={1}>
                <Typography variant="body2" sx={{ marginTop: 1, fontWeight: 'bold', fontSize: 18 }}>
                  入帳資料
                </Typography>
                <Grid item xs={12}>
                  <CategoryAccountSelect />
                </Grid>
                <Grid item xs={12}>
                  <CompaniesSelect />
                </Grid>
                <Grid item xs={'auto'} sx={{ minWidth: 100, maxWidth: 100 }}>
                  <Input
                    type="date"
                    label="*入帳日期:"
                    variant="standard"
                    value={formData.transactionDate}
                    error={inputError.transactionDate}
                    helperText={inputError.transactionDate}
                    onChange={(e) => { onFormDataChange(["transactionDate"], [e.target.value]) }}
                  />
                </Grid>
                <Grid item xs={'auto'} sx={{ minWidth: 100, maxWidth: 100 }}>
                  <FinancialYearSelect />
                </Grid>
                <Grid item xs={'auto'} sx={{ minWidth: 100, maxWidth: 100 }}>
                <Input
                    label="金額:"
                    variant="standard"
                    value={toMoney(formData.amount)}
                    disabled
                    sx={{

                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Select
                    sx={{ width: 100 }}
                    label="是否為訂單:"
                    variant="standard"
                    value={formData.isOrder}
                    items={[{
                      label: '是',
                      value: true
                    }, {
                      label: '否',
                      value: false
                    }]}
                    render={(row, i) => <MenuItem key={i} value={row.value}>{row.label}</MenuItem>}
                    onChange={(e) => { onFormDataChange(["isOrder"], [e.target.value]) }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Input
                    label="*描述:"
                    variant="standard"
                    value={formData.desc}
                    error={inputError.desc}
                    helperText={inputError.desc}
                    onChange={(e) => { 
                      onFormDataChange(["desc"], [e.target.value]) 
                    }}
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