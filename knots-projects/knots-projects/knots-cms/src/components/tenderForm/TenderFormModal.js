import * as React from 'react';
import { Grid, InputAdornment, MenuItem, Typography } from '@mui/material';
import { useSnackbar } from 'notistack';
import EditFormModal from '../EditFormModal';
import { useMutation, } from '@apollo/client';
import BackdropLoading from '../BackdropLoading';
import language from '../../localization/language';
import { InfoCard } from '../InfoCard';
import { TENDER_FORM_CREATE, TENDER_FORM_UPDATE } from '../../apollo/mutations';
import Input from '../Input';
import Select from '../Select';
import { OptionsContext } from '../../contexts/OptionsContextProvider';
import { bookKeepingPeriodDayOptions, bookKeepingPeriodMonthOptions, bookKeepingPeriodInputOptions, bookKeepingPeriodWeekOptions } from '../../constants/InputOptions';

const _bookKeepingPeriodInputOptions = bookKeepingPeriodInputOptions.map((e)=>{
  return {
    label: language.bookKeepingPeriodInputOptions[e],
    value: e
  }
})

export default function ({ open, onCloseClick, onCompleted, ...props }) {

  const [optionsContext, optionsContextDispatch, {bookKeepingCompanyOptions, bookKeepingAccountOptions}] = React.useContext(OptionsContext);
  const { enqueueSnackbar } = useSnackbar();
  const [formData, setFormData] = React.useState({});
  const [listData, setListData] = React.useState();
  const [inputError, setInputError] = React.useState({});
  const [formDataCreateMutate, createStatus] = useMutation(TENDER_FORM_CREATE);
  const [formDataUpdateMutate, updateStatus] = useMutation(TENDER_FORM_UPDATE);
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
    for (let i of ["companyId", "categoryAccountId", "chargeAccountId", "fromDate", "toDate", "period", "periodDay", "amount", "desc"]) {
      if (formData[i] === undefined) inputError[i] = language.inputError.required;
    }
    if(formData.categoryAccountId && formData.chargeAccountId && formData.categoryAccountId == formData.chargeAccountId) {
      inputError.categoryAccountId = "來源與目標不能相同";
      inputError.chargeAccountId = "來源與目標不能相同";
    }

    if(formData.period == 'Monthly') { 
      if(formData.periodDay == null && formData.periodWeek == null) {
        inputError.periodDay = "請選擇日期或星期";
        inputError.periodWeek = "請選擇日期或星期";
      }
    }

    if(formData.period == 'Weekly') {
      if(formData.periodWeek == null) {
        inputError.periodWeek = "請選擇星期";
      }
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
          // ...formData,
          companyId: formData.companyId,
          categoryAccountId: formData.categoryAccountId,
          chargeAccountId: formData.chargeAccountId,
          fromDate: formData.fromDate,
          toDate: formData.toDate,
          period: formData.period,
          periodDay: formData.periodDay,
          amount: parseFloat(formData.amount),
          desc: formData.desc,
          remark: formData.remark,
          
        }
      },
      onCompleted: (res) => {
        if (res.bookKeepingPeriodExpenseCreate.userErrors.length) {
          res.bookKeepingPeriodExpenseCreate.userErrors.map(e => {
            enqueueSnackbar(e.message, {
              variant: 'error'
            })
          })
        }
        else if (res.bookKeepingPeriodExpenseCreate.bookKeepingPeriodExpense) {
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
          // ...formData,
          id: formData.id,
          companyId: formData.companyId,
          categoryAccountId: formData.categoryAccountId,
          chargeAccountId: formData.chargeAccountId,
          fromDate: formData.fromDate,
          toDate: formData.toDate,
          period: formData.period,
          periodDay: formData.periodDay,
          amount: parseFloat(formData.amount),
          desc: formData.desc,
          remark: formData.remark,
        }
      },
      onCompleted: (res) => {
        if (res.bookKeepingPeriodExpenseUpdate.userErrors.length) {
          res.bookKeepingPeriodExpenseUpdate.userErrors.map(e => {
            enqueueSnackbar(e.message, {
              variant: 'error'
            })
          })
        }
        else if (res.bookKeepingPeriodExpenseUpdate.bookKeepingPeriodExpense) {
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

  const CategoryAccountIdSelect = () => {
    let _bookKeepingAccountOptions = bookKeepingAccountOptions ? bookKeepingAccountOptions.filter(e => e.isPlaceholder == false) : [];
    return (
      <Select
        loading={false}
        label="*轉帳:"
        variant="standard"
        items={_bookKeepingAccountOptions ?? []}
        render={(row, i) => <MenuItem key={i} value={row.value}>{row.label} </MenuItem>}
        value={formData.categoryAccountId}
        error={inputError.categoryAccountId}
        helperText={inputError.categoryAccountId}
        onChange={(e) => {
          onFormDataChange(["categoryAccountId"], [e.target.value])
        }}
      />
    )
  }

  const BookKeepingAccountSelect = () => {
    let _bookKeepingAccountOptions = bookKeepingAccountOptions ? bookKeepingAccountOptions.filter(e=>e.isPlaceholder == false) : [];
    return (
      <Select
        loading={false}
        label="*入帳目標:"
        variant="standard"
        items={_bookKeepingAccountOptions??[]}
        render={(row, i) => <MenuItem key={i} value={row.value}>{row.label} </MenuItem>}
        value={formData.chargeAccountId}
        error={inputError.chargeAccountId}
        helperText={inputError.chargeAccountId}
        onChange={(e) => { 
          onFormDataChange(["chargeAccountId"], [e.target.value]) 
         }}
      />
    )
  }

  const BookKeepingPeriodSelect = () => { 
    return (
      <Select
        loading={false}
        label="*週期:"
        variant="standard"
        items={_bookKeepingPeriodInputOptions ?? []}
        render={(row, i) => <MenuItem key={i} value={row.value}>{row.label} </MenuItem>}
        value={formData.period}
        error={inputError.period}
        helperText={inputError.period}
        onChange={(e) => {
          onFormDataChange(["period", "periodDay", "periodWeek", "periodMonth"], [e.target.value, null, null, null])
        }}
      />
    )
  }
  
  const BookKeepingPeriodWeekSelect = () => { 

    let items = bookKeepingPeriodWeekOptions.map(e=> (
      {
        label: language.bookKeepingPeriodWeekOptions[e],
        value: e
      }
    ));

    return (
      <Select
        loading={false}
        label="*星期:"
        variant="standard"
        items={items}
        render={(row, i) => <MenuItem key={i} value={row.value}>{row.label} </MenuItem>}
        value={formData.periodWeek}
        error={inputError.periodWeek}
        helperText={inputError.periodWeek}
        onChange={(e) => {
          onFormDataChange(["periodWeek", "periodDay"], [e.target.value, null])
        }}
      />
    )
  }

  const BookKeepingPeriodDaySelect = () => { 

    let list = bookKeepingPeriodDayOptions;
    
    const items = list.map((e, i)=>{
      return {
        label: e == "32" ? language.bookKeepingPeriodDayOptions[e] : e,
        value: e
      }
    })

    return (
      <Select
        loading={false}
        label="*日期:"
        variant="standard"
        items={items}
        render={(row, i) => <MenuItem key={i} value={row.value}>{row.label} </MenuItem>}
        value={formData.periodDay}
        error={inputError.periodDay}
        helperText={inputError.periodDay}
        onChange={(e) => {
          onFormDataChange(["periodDay", "periodWeek"], [e.target.value, null])
        }}
      />
    )
  }

  const BookKeepingPeriodMonthSelect = () => { 

    let items = bookKeepingPeriodMonthOptions.map(e=> (
      {
        label: e+language.month,
        value: e
      }
    ));

    return (
      <Select
        loading={false}
        label="*月份:"
        variant="standard"
        items={items}
        render={(row, i) => <MenuItem key={i} value={row.value}>{row.label} </MenuItem>}
        value={formData.periodMonth}
        error={inputError.periodMonth}
        helperText={inputError.periodMonth}
        onChange={(e) => {
          onFormDataChange(["periodMonth"], [e.target.value])
        }}
      />
    )
  }

  React.useEffect(() => {
      setFormData({
        ...props.data,
      })
  }, [props.data, props.mode, open])

  return (
    <>
    {
      (createStatus.loading || updateStatus.loading) && <BackdropLoading/>
    }
      <EditFormModal
        open={open}
        title={`${mode}入帳紀錄`}
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
                 入帳資料
                </Typography>
                <Grid item xs={12}>
                  <CompaniesSelect />
                </Grid>
                <Grid item xs={12}>
                  <CategoryAccountIdSelect />
                </Grid>              
                <Grid item xs={12}>
                  <BookKeepingAccountSelect />
                </Grid>
                <Grid item xs={'auto'} sx={{ minWidth: 100, maxWidth: 100 }}>
                  <Input
                    type="date"
                    label="*開始日期:"
                    variant="standard"
                    value={formData.fromDate}
                    error={inputError.fromDate}
                    helperText={inputError.fromDate}
                    onChange={(e) => { onFormDataChange(["fromDate"], [e.target.value]) }}
                  />
                </Grid>
                <Grid item xs={'auto'} sx={{ minWidth: 100, maxWidth: 100 }}>
                  <Input
                    type="date"
                    label="*結束日期:"
                    variant="standard"
                    value={formData.toDate}
                    error={inputError.toDate}
                    helperText={inputError.toDate}
                    onChange={(e) => { onFormDataChange(["toDate"], [e.target.value]) }}
                  />
                </Grid>
                <Grid item xs={'auto'} sx={{ minWidth: 100, maxWidth: 100 }}>
                  <BookKeepingPeriodSelect />
                </Grid>
                {/* {
                (formData.period == 'Yearly') && <Grid item xs={'auto'} sx={{ minWidth: 100, maxWidth: 100 }}>
                  <BookKeepingPeriodMonthSelect />
                  </Grid>
                } */}
                {/* {
                (formData.period == 'Monthly' || formData.period == 'Weekly' || formData.periodMonth) && <Grid item xs={'auto'} sx={{ minWidth: 100, maxWidth: 100 }}>
                  <BookKeepingPeriodWeekSelect />
                </Grid>
                } */}
                {/* { (formData.period == 'Monthly' || formData.periodMonth) && <Grid item xs={'auto'} sx={{ minWidth: 20, maxWidth: 100, display: 'flex', alignItems: 'center' }}>OR</Grid> } */}
                {
                  (formData.period == 'Monthly' || formData.periodMonth) && <Grid item xs={'auto'} sx={{ minWidth: 100, maxWidth: 100 }}>
                    <BookKeepingPeriodDaySelect />
                  </Grid>
                }
                <Grid item xs={12} sx={{ minWidth: 100, maxWidth: 100 }}>
                  <Input
                    type="number"
                    label="*入帳金額:"
                    variant="standard"
                    value={formData.amount}
                    sx={{
                      "& .MuiInputBase-input.Mui-disabled": {
                        // WebkitTextFillColor: "#000000",
                        fontWeight: 'bold',
                      },
                    }}
                    InputProps={{
                      inputProps: { min: 0 },
                      startAdornment: <InputAdornment position="start">$</InputAdornment>,
                    }}
                    onChange={(e) => {
                      onFormDataChange(["amount"], [e.target.value]) 
                    }}
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