import * as React from 'react';
import { Grid, InputAdornment, MenuItem, Typography } from '@mui/material';
import { useSnackbar } from 'notistack';
import EditFormModal from '../EditFormModal';
import { gql, useLazyQuery, useMutation, useQuery } from '@apollo/client';
import BackdropLoading from '../BackdropLoading';
import language from '../../localization/language';
import { InfoCard } from '../InfoCard';
import { BOOK_KEEPING_TRANSACTIONS_CREATE, BOOK_KEEPING_TRANSACTIONS_UPDATE } from '../../apollo/mutations';
import Input from '../Input';
import Select from '../Select';
import { OptionsContext } from '../../contexts/OptionsContextProvider';
import { BOOK_KEEPING_ACCOUNTS_QUERY, BOOK_KEEPING_TRANSACTIONS_QUERY } from '../../apollo/queries';
import { bookKeepingAccountFragment, bookKeepingTransactionFragment } from '../../apollo/fragments';
import { FinancialYearList } from '../../constants/InputOptions';
import { useParams } from 'react-router-dom';
import moment from 'moment';

const REACT_APP_DEFAULT_COMPANY_ID = process.env.REACT_APP_DEFAULT_COMPANY_ID;

const defaultData = { 
  companyId: REACT_APP_DEFAULT_COMPANY_ID,
}

export default function ({ open, onCloseClick, onCompleted, accountTypeId, ...props }) {

  const [optionsContext, optionsContextDispatch, {bookKeepingCompanyOptions}] = React.useContext(OptionsContext);
  const { enqueueSnackbar } = useSnackbar();
  const currentYear = moment().format('YYYY') + '-' + (parseInt(moment().format('YYYY')) + 1);
  const [accountType, setAccountType] = React.useState();
  const [formData, setFormData] = React.useState({
    ...defaultData,
    financialYear: currentYear,
    items: [{},{}]
  });

  const [listData, setListData] = React.useState();
  const [inputError, setInputError] = React.useState({});
  const {accountId} = useParams();
  const [dataUseQuery, queryStatus] = useLazyQuery(gql`${BOOK_KEEPING_ACCOUNTS_QUERY} ${bookKeepingAccountFragment}`, {
    fetchPolicy: 'network-only',
    variables: { 
      deleted: false
    },
  });
  const query = useQuery(gql`${BOOK_KEEPING_TRANSACTIONS_QUERY} ${bookKeepingTransactionFragment}`, 
  {
    fetchPolicy: 'network-only',
    variables: { 
      accountId: props.accountId
    },
    onCompleted: (res) => {
      if (res.bookKeepingTransactions?.edges?.length) {
        setListData({
          ...res.bookKeepingTransactions.edges.map(e=> (e.node))
        })
      }
      else setListData([])
    }
  })
  const [formDataCreateMutate, createStatus] = useMutation(BOOK_KEEPING_TRANSACTIONS_CREATE);
  const [formDataUpdateMutate, updateStatus] = useMutation(BOOK_KEEPING_TRANSACTIONS_UPDATE);
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
    for (let i of ["companyId", "transactionDate", "financialYear"]) {
      if (formData[i] === undefined) inputError[i] = language.inputError.required;
    }
    if(formData.items?.[1]?.amount == undefined) inputError["amount"] = language.inputError.required;
    if(formData.items?.[1]?.accountId == undefined) inputError["accountTypeId"] = language.inputError.required;

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

    let _items = [...formData.items];
    
    let currentAccountTypeName = queryStatus?.data?.bookKeepingAccounts?.edges.find((e)=> e.node.id == formData.items?.[1]?.accountId)?.node?.accountType.name;
    let targetAccountTypeName = queryStatus?.data?.bookKeepingAccounts?.edges.find((e)=> e.node.id == formData.items?.[0]?.accountId)?.node?.accountType.name;

    switch (currentAccountTypeName) {
      case targetAccountTypeName: 
        _items[1].amount = -_items[1].amount;
        break;
      case "負債":
        if (targetAccountTypeName === "股東權益" || targetAccountTypeName === "收入") {
          _items[0].amount = -_items[0].amount; 
          _items[1].amount = _items[1].amount; // 增加負債，貸方
        }
        else {
          _items[1].amount = -_items[1].amount;
        }
        break;
      case "資產":
        if (targetAccountTypeName === "費用") {
          _items[0].amount = -_items[0].amount;
          _items[1].amount = _items[1].amount; // 增加費用，貸方
        }
      case "費用":
        if (targetAccountTypeName === "資產") {
          _items[0].amount = -_items[0].amount;
          _items[1].amount = _items[1].amount; // 增加費用，借方
        }
        break; 
      case "股東權益":
        if (targetAccountTypeName === "收入" || targetAccountTypeName === "負債" || targetAccountTypeName === "費用") {
          _items[0].amount = -_items[0].amount;
          _items[1].amount = _items[1].amount; // 股東權益，貸方
        }
      case "收入":
        if (targetAccountTypeName === "資產") {
          _items[0].amount = -_items[0].amount; //
          _items[1].amount = _items[1].amount; // 增加收入，借方
        }
        break;
    }
    
    if (props.mode == 'create') formDataCreateMutate({
      variables: {
        data: {
          transactionDate: formData.transactionDate,
          financialYearStart: parseInt(formData.financialYear.split('-')[0]),
          financialYearEnd: parseInt(formData.financialYear.split('-')[1]),
          companyId: formData.companyId,
          items: _items
        }
      },
      onCompleted: (res) => {
        if (res.bookKeepingTransactionCreate.userErrors.length) {
          res.bookKeepingTransactionCreate.userErrors.map(e => {
            enqueueSnackbar(e.message, {
              variant: 'error'
            })
          })
        }
        else if (res.bookKeepingTransactionCreate.bookKeepingTransaction) {
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
          companyId: formData.companyId,
          isPlaceholder: formData.isPlaceholder,
          isClaim: formData.isClaim,
          parentAccountId: formData.parentAccountId
        }
      },
      onCompleted: (res) => {
        if (res.bookKeepingTransactionUpdate.userErrors.length) {
          res.bookKeepingTransactionUpdate.userErrors.map(e => {
            enqueueSnackbar(e.message, {
              variant: 'error'
            })
          })
        }
        else if (res.bookKeepingTransactionUpdate.bookKeepingTransaction) {
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
    let _bookKeepingAccountOptions = queryStatus?.data?.bookKeepingAccounts?.edges.length ? queryStatus?.data?.bookKeepingAccounts?.edges.filter(e=>e.node.parentAccount == null).map(e=> {
      return {
        searchValue: e.node.name+e.node.accountType?.name,
        value: e.node.accountType.id,
        label: e.node.name,
        data: e.node
      }
    }) : [];

    return (
      <Select
        loading={false}
        label="類別:"
        variant="standard"
        items={_bookKeepingAccountOptions??[]}
        render={(row, i) => <MenuItem key={i} value={row.value}>{row.label} </MenuItem>}
        value={accountType}
        error={inputError.accountType}
        helperText={inputError.accountType}
        onChange={(e) => {
          setAccountType(e.target.value);
         }}
      />
    )
  }

  const BookKeepingAccountSelect = () => {
    let _bookKeepingAccountOptions = queryStatus?.data?.bookKeepingAccounts?.edges.length ? queryStatus?.data?.bookKeepingAccounts?.edges.filter(e=>e.node.isPlaceholder == false && e.node.id !== accountId).map(e=> {
      return {
        searchValue: e.node.name+e.node.accountType?.name,
        value: e.node.id,
        label: e.node.name,
        data: e.node
      }
    }).sort((a,b)=>{
      if(a.data.accountType?.name > b.data.accountType?.name) return 1;
      if(a.data.accountType?.name < b.data.accountType?.name) return -1;
      return 0;
    }) : [];

    if(accountType) _bookKeepingAccountOptions = _bookKeepingAccountOptions.filter(e=>e.data.accountType?.id == accountType);

    return (
      <Select
        loading={false}
        label="*轉帳:"
        variant="standard"
        searchable={true}
        items={_bookKeepingAccountOptions??[]}
        render={(row, i) => <MenuItem key={i} value={row.value}>{row.data.accountType?.name}:{row.label} </MenuItem>}
        value={formData.items?.[0]?.accountId}
        error={inputError.accountTypeId}
        helperText={inputError.accountTypeId}
        onChange={(e) => { 
          let items = formData.items
          items[0].accountId = e.target.value;
          onFormDataChange(["items"], [items]) 
         }}
      />
    )
  }
  
  const FinancialYearSelect = () => { 
    return (
      <Select
        loading={false}
        label="*財政年度:"
        variant="standard"
        items={FinancialYearList}
        render={(row, i) => <MenuItem key={i} value={row.value}>{row.label}</MenuItem>}
        value={formData.financialYear}
        error={inputError.financialYear}
        helperText={inputError.financialYear}
        onChange={(e) => { onFormDataChange(["financialYear"], [e.target.value]) }}
      />
    )
  }

  React.useEffect(() => {
      dataUseQuery();
      setFormData({
        ...defaultData,
        financialYear: currentYear,
        ...props.data,
        items: props.data?.items?.map(e=>({...e}))??[{}, {
          accountId: accountId,
          amount: null
        }],
      })
  }, [props.data, props.mode, open])
  if (query.loading || !listData) return <BackdropLoading/>
  return (
    <>
    {
      (createStatus.loading || updateStatus.loading || query.loading || !listData) && <BackdropLoading/>
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
                  <BookKeepingAccountTypeSelect />
                </Grid>
                <Grid item xs={12}>
                  <BookKeepingAccountSelect />
                </Grid>
                <Grid item xs={'auto'} sx={{ minWidth: 100, maxWidth: 100 }}>
                  <FinancialYearSelect />
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
                  <Input
                    type="number"
                    label="*入帳金額:"
                    variant="standard"
                    value={formData.items?.[1]?.amount}
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
                      let items = formData.items??[{},{
                        accountId: accountId,
                        amount: 0
                      }, {}];
                      items[0].amount = parseFloat(e.target.value??0);
                      items[1].amount = parseFloat(e.target.value??0);
                      onFormDataChange(["items"], [items]) 
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Input
                    label="描述:"
                    variant="standard"
                    value={formData.items?.[1]?.desc}
                    error={inputError.desc}
                    helperText={inputError.desc}
                    onChange={(e) => { 
                      let items = formData.items??[{},{
                        accountId: accountId,
                        amount: 0
                      }, {}];
                      items[0].desc = e.target.value
                      items[1].desc = e.target.value
                      onFormDataChange(["items"], [items]) 
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