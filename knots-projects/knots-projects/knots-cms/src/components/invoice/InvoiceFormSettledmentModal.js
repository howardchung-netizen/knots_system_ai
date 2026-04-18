import * as React from 'react';
import { Divider, Grid, MenuItem, Typography } from '@mui/material';
import { useSnackbar } from 'notistack';
import EditFormModal from '../EditFormModal';
import { useMutation } from '@apollo/client';
import BackdropLoading from '../BackdropLoading';
import language from '../../localization/language';
import { InfoCard, InfoRow as BaseInfoRow } from '../InfoCard';
import { PROJECT_INVOICE_CONFIRM_TRANSFER } from '../../apollo/mutations';
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
  const { enqueueSnackbar } = useSnackbar();
  const [formData, setFormData] = React.useState({...props.data});
  const [inputError, setInputError] = React.useState({});
  const [formDataCreateMutate, createStatus] = useMutation(PROJECT_INVOICE_CONFIRM_TRANSFER);
  const mode = '發票單入帳';
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
    checkList = ["categoryAccountId", "bankAccountId", "financialYear", "transactionDate", "companyId", "paid"];
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
          bankAccountId: formData.bankAccountId,
          transactionDate: formData.transactionDate,
          financialYearStart: parseInt(formData.financialYear.split('-')[0]),
          financialYearEnd: parseInt(formData.financialYear.split('-')[1]),
          companyId: formData.companyId,
          paid: formData.paid,
        }
      },
      onCompleted: (res) => {
        if (res.projectInvoiceConfirmTransfer.userErrors.length) {
          res.projectInvoiceConfirmTransfer.userErrors.map(e => {
            enqueueSnackbar(e.message, {
              variant: 'error'
            })
          })
        }
        else if (res.projectInvoiceConfirmTransfer.projectInvoice) {
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
        label="*收入類別:"
        variant="standard"
        items={bookKeepingAccountOptions.filter(e=>!e.isBank && !e.isClaim && e.accountType.name == '收入' && e.isPlaceholder != true)??[]}
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
        label="*轉帳:"
        variant="standard"
        items={bookKeepingAccountOptions.filter(e=>e.accountType.name == '資產' && !e.isPlaceholder)??[]}
        render={(row, i) => <MenuItem key={i} value={row.value}>{row.accountType.name}:{row.label}</MenuItem>}
        value={formData.bankAccountId}
        error={inputError.bankAccountId}
        helperText={inputError.bankAccountId}
        onChange={(e) => { onFormDataChange(["bankAccountId"], [e.target.value]) }}
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
      setFormData({...props.data})
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
                <Typography variant="body2" sx={{ fontWeight: 'bold', fontSize: 18, width: '100%' }}>
                  發票單
                </Typography>
                <Grid item xs={12}>
                  <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between'}}>
                    <div><InfoRow label={"編號:"} value={formData.invId} flexDirection={'column'}/></div>
                    <div style={{paddingLeft: 50}}><InfoRow label={"發出日期:"} value={formData.date} flexDirection={'column'}/></div>
                  </div>
                  <InfoRow label={"專案:"} value={`${formData.projectId? `${formData.projectId} - ${formData.projectCode}`: ''}`} flexDirection={'column'}/>
                </Grid>
                <div style={{paddingLeft: 16, width: '100%'}}>
                  <table style={{ width: '100%', border: '1px solid black', borderCollapse: 'collapse', fontSize: 14 }}>
                    <thead>
                      <tr>
                        <th style={{ border: '1px solid black', borderCollapse: 'collapse', width: '7%' }}>
                          {language._props['zh-hk'].items}
                        </th>
                        <th style={{ border: '1px solid black', borderCollapse: 'collapse', width: 'auto' }}>
                          {language._props['zh-hk'].description}
                        </th>
                        <th style={{ border: '1px solid black', borderCollapse: 'collapse', width: '12%', textAlign: 'left', paddingLeft: 10 }}>
                          {language._props['zh-hk'].quantity}
                        </th>
                        <th style={{ border: '1px solid black', borderCollapse: 'collapse', width: '10%' }}>
                          {language._props['zh-hk'].unitPrice}
                        </th>
                        <th style={{ border: '1px solid black', borderCollapse: 'collapse', width: '12%' }}>
                          {language._props['zh-hk'].amount}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {
                        formData.invoice?.map((item, i) => <Item
                          key={i}
                          index={i + 1}
                          name={item['name_cht']}
                          desc={item['desc_cht']}
                          price={item.price?.value}
                          qty={item.price?.quantity}
                          unit={item.price?.['unit_cht']}
                          amount={item.price?.amount}
                          upper={item.upper}
                          child={item.child ?? []}
                        />
                        )
                      }
                    </tbody>
                    {
                      <tfoot colSpan={5}>
                        <tr style={{ height: 35, borderTop: '1px solid black' }}>
                          <ItemPageSummeryTd
                            title={`${language._props['zh-hk'].totalAmount}:`}
                            value={toMoney(formData.totalAmount)}
                          />
                        </tr>
                        <tr style={{ height: 35, borderTop: '1px solid black' }}>
                          <ItemPageSummeryTd
                            title={`折扣:`}
                            desc={`${formData.discountRatio}%`}
                            value={toMoney(formData.ratioDiscount)}
                          />
                        </tr>
                        <tr style={{ height: 35, borderTop: '1px solid black', display: 'none' }}>
                          <ItemPageSummeryTd
                            title={'Discount:'}
                            value={toMoney(formData.discount)}
                          />
                        </tr>
                        <tr style={{ fontWeight: 'bold', height: 35, borderTop: '1px solid black' }}>
                          <ItemPageSummeryTd
                            title={`${language._props['zh-hk'].amountCharged}:`}
                            value={toMoney(formData.grandTotal)}
                          />
                        </tr>
                      </tfoot>
                    }
                  </table>
                </div>
                <Typography variant="body2" sx={{ marginTop: 3, fontWeight: 'bold', fontSize: 18, width: '100%' }}>
                  入帳資料
                </Typography>
                <Grid item xs={12}>
                  <CategoryAccountSelect />
                </Grid>
                <Grid item xs={12}>
                  <BankAccountSelect />
                </Grid>
                <Grid item xs={12}>
                  <CompaniesSelect />
                </Grid>
                <Grid item xs={'auto'}>
                  <Input
                    style={{ width: 120 }}
                    type="date"
                    label="*收款日期:"
                    variant="standard"
                    value={formData.paid}
                    error={inputError.paid}
                    helperText={inputError.paid}
                    onChange={(e) => { onFormDataChange(["paid"], [e.target.value]) }}
                  />
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
              </Grid>
            </InfoCard>
          </Grid>
        </Grid>
      </EditFormModal>
    </>
  );

}