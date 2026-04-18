import * as React from 'react';
import { Grid, MenuItem, Typography } from '@mui/material';
import { useSnackbar } from 'notistack';
import EditFormModal from '../EditFormModal';
import { gql, useApolloClient, useMutation } from '@apollo/client';
import BackdropLoading from '../BackdropLoading';
import language from '../../localization/language';
import { InfoCard, InfoRow as BaseInfoRow } from '../InfoCard';
import { CHEQUE_BOOK_CONFIRM_TRANSFER } from '../../apollo/mutations';
import Input from '../Input';
import { useNavigate } from 'react-router-dom';
import { OptionsContext } from '../../contexts/OptionsContextProvider';
import Select from '../Select';
import { toMoney } from '../../utils';

const upperNameFontSize = 16;
const lowerNameFontSize = 14;
const upperDescFontSize = 15;
const lowerDescFontSize = 13;
const baseTdStyle = { borderRight: '1px solid black', borderLeft: '1px solid black', borderCollapse: 'collapse', textAlign: 'center' }
const lableStyle = {fontWeight: 'bold', fontSize: 16, textAlign: 'right'};
const valueStyle = {flex: 1, fontWeight: 'bold', fontSize: 16};

const REACT_APP_DEFAULT_COMPANY_ID = process.env.REACT_APP_DEFAULT_COMPANY_ID;
const defaultData = { 
  companyId: REACT_APP_DEFAULT_COMPANY_ID,
  financialYear: `${new Date().getFullYear()}-${new Date().getFullYear()+1}`,
}

const InfoRow = ({label, value, flexDirection}) =>{
  return (
    <BaseInfoRow label={label} value={value} flexDirection={'row'} lableStyle={lableStyle} valueStyle={valueStyle}/>
  )
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

export default function ({ open, onCloseClick, onCompleted, ...props }) {

  const [optionsContext, optionsContextDispatch, {bookKeepingCompanyOptions, bookKeepingAccountOptions, bookKeepingAccountTypeOptions}] = React.useContext(OptionsContext);
  const navigate = useNavigate();
  const client = useApolloClient();
  const { enqueueSnackbar } = useSnackbar();
  const [formData, setFormData] = React.useState({...defaultData, ...props.data});
  const [inputError, setInputError] = React.useState({});
  const [formDataCreateMutate, createStatus] = useMutation(CHEQUE_BOOK_CONFIRM_TRANSFER);
  const mode = '員工備用金入帳';
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
    checkList = ["chargeAccountId", "financialYear", "transactionDate", "companyId"];
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
          categoryAccountId: formData.categoryAccountId,
          chargeAccountId: formData.chargeAccountId,
          transactionDate: formData.transactionDate,
          financialYearStart: parseInt(formData.financialYear.split('-')[0]),
          financialYearEnd: parseInt(formData.financialYear.split('-')[1]),
          companyId: formData.companyId,
          paid: formData.paid,
          transactionDesc: formData.desc,
        }
      },
      onCompleted: (res) => {
        if (res.chequeBookConfirmTransfer.userErrors.length) {
          res.chequeBookConfirmTransfer.userErrors.map(e => {
            enqueueSnackbar(e.message, {
              variant: 'error'
            })
          })
        }
        else if (res.chequeBookConfirmTransfer.chequeBook) {
          if(onCompleted)onCompleted();
          updateStaffCache(res.chequeBookConfirmTransfer.chequeBook);
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

  const updateStaffCache = (chequeBook) => {

    const staff = chequeBook?.forPettyCashStaff;
    client.writeFragment({
      id: `User:${staff.id}`,
      fragment: gql`
        fragment UpdatedPettyCash on User {
          pettyCash
        }
      `,
      data: {
        pettyCash: staff.pettyCash,
      },
    });
  };

  const CategoryAccountSelect = () => {
    return (
      <Select
        loading={false}
        label="*入帳類別:"
        variant="standard"
        items={bookKeepingAccountOptions.filter(e=>!e.isBank && !e.isClaim)??[]}
        render={(row, i) => <MenuItem key={i} value={row.value}>{row.label}</MenuItem>}
        value={formData.categoryAccountId}
        error={inputError.categoryAccountId}
        helperText={inputError.categoryAccountId}
        onChange={(e) => { onFormDataChange(["categoryAccountId"], [e.target.value]) }}
      />
    )
  }

  const BankAccountSelect = () => {
    return (
      <Select
        loading={false}
        label="*從以下戶口轉帳:"
        variant="standard"
        items={bookKeepingAccountOptions.filter(e=>e.accountType.name == '資產' && !e.isPlaceholder)??[]}
        render={(row, i) => <MenuItem key={i} value={row.value}><div style={{display: 'flex', justifyContent: 'flex-start', width: '100%'}}><div style={{width: '50%'}}>{`${row.accountType.name}:${row.label}`}</div><div>{toMoney(row.balance)}</div></div></MenuItem>}
        value={formData.chargeAccountId}
        error={inputError.chargeAccountId}
        helperText={inputError.chargeAccountId}
        onChange={(e) => { onFormDataChange(["chargeAccountId"], [e.target.value]) }}
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

  const Item = ({ index, name, desc, price, qty, unit, amount, upper, child }) => {
    let isUpper = upper == 0;
    return (
      <>
      <tr style={{fontWeight: 'bold', fontSize: isUpper ? upperNameFontSize : lowerNameFontSize, backgroundColor: isUpper ? '#f5f7f9' : 'white', height: 35}}>
        <td style={baseTdStyle}>{index}</td>
        <td style={{ borderRight: '1px solid black', borderCollapse: 'collapse', paddingLeft: 5 }}>
          <div>{!isUpper ? ' - ' : ''}{name}</div>
          <div style={{ fontSize: isUpper ? upperDescFontSize : lowerDescFontSize, fontWeight: 300, paddingBottom: 5}}>{desc}</div>
        </td>
        <td style={{ borderRight: '1px solid black', borderCollapse: 'collapse', textAlign: 'center' }}>
          <div style={{display: 'flex', justifyContent: 'space-around', alignItems: 'center'}}>
            <div style={{width: '40%'}}>{qty}</div>
            <div style={{width: '60%'}}>{unit}</div>
          </div>
        </td>
         <td style={{ borderRight: '1px solid black', borderCollapse: 'collapse', textAlign: 'center' }}>{price ? toMoney(price) : ''}</td>
        <td style={{ borderRight: '1px solid black', borderCollapse: 'collapse', textAlign: 'center'}}>{amount ? toMoney(amount) : ''}</td>
      </tr>
      {
        child.map((item, i)=> <Item 
        key={i}
        index={`${index}.${i+1}`}
        name={item['name_cht']}
        desc={item['desc_cht']}
        price={item.price?.value}
        qty={item.price?.quantity}
        unit={item.price?.['unit_cht']}
        amount={item.price?.amount}
        upper={item.upper}
        child={item.child??[]}
        />)
      }
      </>
    )
  }

  const ItemPageSummeryTd = ({title, desc, value}) => {
    return (
      <>
        <td colSpan={3} style={{ ...baseTdStyle, textAlign: 'right' }}>{title}</td>
        <td style={baseTdStyle}>{desc}</td>
        <td style={baseTdStyle}>{value}</td>
      </>
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
          <Grid item sm={12} padding={0}>
            <InfoCard
              title={""}
            >
              <Grid container spacing={2} padding={1}>
                <Typography variant="body2" sx={{ marginTop: 0, fontWeight: 'bold', fontSize: 18, width: '100%' }}>
                  入帳資料
                </Typography>
                <Grid item xs={12}>
                  <BankAccountSelect />
                </Grid>
                <Grid item xs={12}>
                  <CompaniesSelect />
                </Grid>
                <Grid item xs={'auto'} sx={{minWidth: 100, maxWidth:100}}>
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
                <Grid item xs={'auto'} sx={{minWidth: 100, maxWidth:100}}>
                  <FinancialYearSelect />
                </Grid>
                <Grid item xs={'auto'} sx={{minWidth: 100, maxWidth:100}}>
                <Input
                    label="*入帳金額:"
                    variant="standard"
                    value={toMoney(formData.amount)}
                    inputProps={{
                      readOnly: true,
                    }}
                    sx={{
                      "& .MuiInputBase-input.Mui-disabled": {
                        // WebkitTextFillColor: "#000000",
                        fontWeight: 'bold',
                      },
                    }}
                    disabled={true}
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