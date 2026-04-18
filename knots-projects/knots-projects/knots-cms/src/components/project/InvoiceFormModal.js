import * as React from 'react';
import { Button, Divider, Grid, MenuItem, TextField, Typography } from '@mui/material';
import { useSnackbar } from 'notistack';
import EditFormModal from '../EditFormModal';
import { gql, useMutation, useQuery } from '@apollo/client';
import BackdropLoading from '../BackdropLoading';
import language from '../../localization/language';
import { InfoCard } from '../InfoCard';
import { PROJECT_INVOICE_CREATE, PROJECT_INVOICE_UPDATE } from '../../apollo/mutations';
import { projectItemFragment, termsFragment } from '../../apollo/fragments';
import { PROJECT_ITEMS_QUERY, TERMSES_QUERY } from '../../apollo/queries';
import Select from '../Select';
import { OptionsContext } from '../../contexts/OptionsContextProvider';
import { toMoney } from '../../utils';
import Input from '../Input';
import DebouncedInput from '../DebouncedInput';
import QuotationSelect from '../QuotationSelect';
import NoItem from '../NoItem';
import { QuotationItem } from '../SortableItem';
import { SortableList } from '../SortableList';
import { FinancialYearList } from '../../constants/InputOptions';
import { ClientForm } from './ProjectForm';
import { v4 } from 'uuid';
import moment from 'moment';

function calculateTotalPrice(items) {
  let totalPrice = 0;

  for (const item of items) {
    if(!item.isInInvoice) continue;
    if (item.child?.length > 0) {
      totalPrice += calculateTotalPrice(item.child);
    }

    if (item.price) {
      totalPrice += item.price.value * item.price.quantity;
    }
  }

  return totalPrice;
}

function calculateTotalAmount(items) {
  
  let totalAmount = 0;
  for (const i in items) {
    const item = items[i];
    if(!item.isInInvoice) continue;
    if (item.child !==undefined && item.child?.length > 0) {
      totalAmount += calculateTotalAmount(item.child);
    }

    if (item.price) {
      if(item.price.value && item.price.quantity) {
        let defaultAmount = item.price.value * item.price.quantity;
        let amount = defaultAmount;
        let startProgress = 100 + parseInt(item.progress??0) - parseInt(item.newProgress??item.progress);
        amount -= Math.ceil(amount * (startProgress/ 100));
        totalAmount += amount;
      }
    }
  }

  return totalAmount
}

function calculateRatioDiscount (totalAmount, discountRatio) { 
  return totalAmount - (totalAmount * (1 - (discountRatio / 100)));
}

function calculateGrandTotal(totalAmount, ratioDiscount, discount) { 
  return totalAmount - ratioDiscount - discount;
}

const updateQuotationForm = (quotationFormItem, invoice) => {
    quotationFormItem.forEach(item=>{
      if(invoice[item.id]?.isInInvoice) {
        let progressRecord = item.progressRecord??[];
        item.isInInvoice = invoice[item.id].isInInvoice;
        if(invoice[item.id].newProgress) {
          item.progress = invoice[item.id].newProgress;
          progressRecord.push(item.progress)
          item.progressRecord = progressRecord;
        }
        
      }
      if(item.child?.length) {
        updateQuotationForm(item.child, invoice);
      }
  });
}

const updateIsAllChildInInvoice = (items) => {
  items.forEach(item=>{
    if(item.child?.length) {
      item.isAllChildInInvoice = item.child.every(e=>e.isInInvoice);
      updateIsAllChildInInvoice(item.child);
    }
    else if(item.isInInvoice){
      item.isAllChildInInvoice = true;
    }
  })
}

const getIsInInvoiceItem = (invoice) => {
  let isInInvoiceItem = [];
  invoice.forEach((invoiceItem) => {
    if (invoiceItem.newProgress) {
      invoiceItem.progress = invoiceItem.newProgress;
    }
    if (invoiceItem.isInInvoice) {
      let child = [];
      if (invoiceItem.child?.length) {
        child = getIsInInvoiceItem(invoiceItem.child);
      }
      let item = invoiceItem;
      item.child = child;
      isInInvoiceItem.push(item);
    }
  })
  return isInInvoiceItem;
}

const filterInvoiceItem = (invoice) => {
  let _invoice = [];
  invoice.forEach((invoiceItem) => {
    if (invoiceItem.progress == 100) { }
    else {
      let child = [];
      if (invoiceItem.child?.length) {
        child = filterInvoiceItem(invoiceItem.child);
      }
      let item = invoiceItem;
      item.child = child;
      // if(item.progress) item.unpri
      _invoice.push(item);
    }
  })
  return _invoice;
}

const defaultData = {
  date: moment().format('YYYY-MM-DD'),
  financialYear: `${moment().year()}-${moment().year() + 1}`,
  paid: moment().format('YYYY-MM-DD')
}

export default function ({ open, onCloseClick, onCompleted, ...props }) {

  const [optionsContext, optionsContextDispatch, {
    measurementOptions
  }] = React.useContext(OptionsContext);

  const queryParameters = new URLSearchParams(window.location.search)
  const [globalFilter, setGlobalFilter] = React.useState('');
  const lang = queryParameters.get("lang") || 'Cht';
  const { enqueueSnackbar } = useSnackbar();
  const [tempInvoiceItems, setTempInvoiceItems] = React.useState({});
  const [formData, setFormData] = React.useState({ ...defaultData, ...props.data });
  const [inputError, setInputError] = React.useState({});
  const [selectedAll, setSelectedAll] = React.useState(false);
  const [updateTagrget, setUpdateTagrget] = React.useState(null);
  const { data, loading, error } = useQuery(gql`${PROJECT_ITEMS_QUERY} ${projectItemFragment}`, {
    fetchPolicy: 'cache-and-network',
    variables: {
      level: 1,
      delete: false,
      first: 9999
    }
  })
  const termQueryStatus = useQuery(gql`${TERMSES_QUERY} ${termsFragment}`, {
    fetchPolicy: 'cache-and-network',
    variables: {
      show: true,
      delete: false,
    }
  })
  const [child, setChild] = React.useState([]);
  const [originalForm, setOriginalform] = React.useState([]);
  const [formDataCreateMutate, createStatus] = useMutation(PROJECT_INVOICE_CREATE);
  const [formDataUpdateMutate, updateStatus] = useMutation(PROJECT_INVOICE_UPDATE);
  const mode = props.mode == 'create' ? '新增' : '編輯';
  const [term, setTerm] = React.useState();
  const termList = React.useMemo(() => { 
    let termList = [];
    if (termQueryStatus?.data?.termses?.edges.length) {
      termList = termQueryStatus?.data?.termses.edges.map(({ node }) => ({ ...node }));
      let termIds = [];
      termList = termList?.filter(e => !termIds.includes(e.realId)).map(e => ({ 
        ...e, 
        label: e['nameCht'], 
        value: e.id, 
        name_cht: e.nameCht, 
        name_en: e.nameEn, 
        desc_cht: e.descCht, 
        desc_en: e.descEn,
        searchValue: e.nameCht + e.nameEn + e.descCht + e.descEn,
       }));
    }
    return termList;
   }, [termQueryStatus.data, selectedAll])

  const _onCloseClick= () => {
    setFormData({})
    setInputError({});
    onCloseClick();
    setUpdateTagrget(null);
    setTerm([]);
    setSelectedAll(false);
  }

  const onFormDataChange= (key, value) => {
    let data = {};
    let _inputError = inputError;
    for (let i in key) {
      data[key[i]] = value[i] === '' ? null : value[i];
      _inputError[key[i]] = null;
      setInputError(_inputError);
    }

    setFormData((formData)=>{
      let newData = {...formData, ...data};
      let ratioDiscount = calculateRatioDiscount(newData.totalAmount??0, newData.discountRatio??0);
      return {
        ...newData,
        ratioDiscount: ratioDiscount,
        grandTotal: calculateGrandTotal(newData.totalAmount??0, ratioDiscount??0, newData.discount??0)
      }
    });
  }

  const checkInputError = () => {
    let inputError = {};
    for (let i of ["quotationCode", "date", "financialYear", "clientId", 'contactId']) {
      if (formData[i] == null || formData[i] == "" || formData[i] == '') inputError[i] = language.inputError.required;
    }
    if(formData.invoice?.length) {
      let hasItem = formData.invoice.find(e=>{
        if(e.isInInvoice) return true;
        if(e.child?.length) {
          e.child.find(e=>{
            if(e.isInInvoice) return true;
          })
        }
      })
      if(!hasItem) {
        alert('請選發票單項目!');
        inputError.invoice = language.inputError.required;
      }
    }
    if(updateTagrget) {
      alert('請先完成編輯條款!');
      inputError.updateTagrget = language.inputError.error;
    }
    setInputError(inputError);
    
    let hasError = Object.keys(inputError).length;

    return hasError
  }
  
  const initInvoice = (items) => {
    let _Invoice = [];

    for (let i in items) {
      let item = items[i];
      if(item.isAllChildInInvoice) continue;
      let data = item;
      data.isInInvoice = true;
      data.isAllChildInInvoice = true;
      let progress = data.progress ?? 100;
      if (props.mode == 'create' && data.progress == 0) progress = 100;
      if (!data?.price?.amount) progress = null;
      let newProgress = data.newProgress ?? progress;
      data.newProgress = newProgress;
      if (item.child?.length) {
        data.child = initInvoice(item.child);
      }
      _Invoice.push(data)
    }

    return _Invoice
  }

  const onQuotationSelectChange = (e, item) => {
    let quotationForm = item.form ? JSON.parse(item.form) : []
    let invoice = props.mode == 'create' ? quotationForm : formData.invoice;
    invoice = filterInvoiceItem(invoice);
    setOriginalform(JSON.parse(item.form));
    quotationForm = initInvoice(quotationForm);
    let totalAmount = calculateTotalAmount(quotationForm);
    setTempInvoiceItems(getTempData(invoice, {}));
    onFormDataChange(["quotationCode", "quotationForm", "invoice", "totalAmount", "grandTotal", "discountRatio", "lastUpdateTime"], 
                     [e.target.value, quotationForm, invoice, totalAmount, totalAmount, item.discountRatio, item.editAt]);
  }

  const updateUpperChecked = (item, form, checked) => {
    if(checked) {
      form[item.id].isAllChildInInvoice = form[item.id].child.every(e=> form[e.id].isInInvoice && form[e.id].isAllChildInInvoice);
      if(form[item.id].isAllChildInInvoice) form[item.id].isInInvoice = true;
      else form[item.id].isInInvoice =  true;
    }
    else {
      form[item.id].isAllChildInInvoice = false;
      form[item.id].isInInvoice = form[item.id].child.find(e=> form[e.id].isInInvoice) ? true : false;
    }

    if(item.upper != 0) updateUpperChecked(form[item.upper], form, form[item.id].isInInvoice);
    return form
  }

  const updateLowersChecked = (item, form) => {
    form[item.id].isInInvoice = false;
    form[item.id].isAllChildInInvoice = false;

    let lowerIds = item.child.map(e=> e.id);
    
    for(let i in lowerIds) {
      let id = lowerIds[i];
      let child = form[id];
      child.isAllChildInInvoice = false;
      child.isInInvoice = false;
      updateLowersChecked(child, form);
    }
  }

  const checkIsAllChildInInvoice = (item) => {
    let isAllChildInInvoice = true;
    if(item.child?.length) {
      isAllChildInInvoice = item.child.every(e=>e.isInInvoice);
    }
    return isAllChildInInvoice;
  }

  const updateInvoice = (items, newData) => {

    let _Invoice = [];

    for (let i in items) {
      let item = items[i];
      let data = item;

      if (item.id == newData.id) {
        data = {
          ...data,
          ...newData,
        }
      }

      if (item.child?.length) {
        data.child = updateInvoice(item.child, newData);
      }
      _Invoice.push(data)
    }

    return _Invoice
  }

  const getInvoiceItem = (id, invoice) => { 
    let item = invoice.find(e=>e.id == id);
    if(item) return item;
    for(let i in invoice) {
      let _item = invoice[i];
      if(_item.child?.length) {
        let item = getInvoiceItem(id, _item.child);
        if(item) return item;
      }
    }
  }

  const getTempData = (data, tempData) => {
    for(let i of data) {
      tempData[i.id] = i;
      if(i.child?.length) tempData = {...tempData, ...getTempData(i.child, tempData)}
    }
    return tempData;
  }

  const getFormData = (data, tempData) => {
    let _rowData = [];

    for (let i in data) {
      let _data = tempData[data[i].id];
      if (_data.child?.length) _data.child = getFormData(_data.child, tempData);
      _rowData.push(_data)
    }

    return _rowData
  }

  const onCheckChange = (data, value) => {
    let checked = value;
    let invoice = JSON.parse(JSON.stringify(formData.invoice));
    let temp = getTempData(formData.invoice, {});
    temp[data.id] = {...temp[data.id], isInInvoice: checked, isAllChildInInvoice: data.child.length ? false : checked};

    if(!checked) updateLowersChecked(temp[data.id], temp);
    if(data.upper != 0) updateUpperChecked(temp[data.id], temp, checked);
    invoice = getFormData(invoice, temp);
    let totalAmount = calculateTotalAmount(invoice);
    setTempInvoiceItems(temp);
    onFormDataChange(['invoice', 'totalAmount'], [JSON.parse(JSON.stringify(invoice)), totalAmount]);
  }

  const onProgressClick = (e)=> {
		e.stopPropagation();
		e.preventDefault();
	}

  const onProgressChange = (data, value) => {
    let progress = value;
    let invoice = JSON.parse(JSON.stringify(formData.invoice));
    let temp = getTempData(formData.invoice, {});
    temp[data.id] = {...temp[data.id], newProgress: progress};

    invoice = getFormData(invoice, temp);
    let totalAmount = calculateTotalAmount(invoice);
    setTempInvoiceItems(temp);
    onFormDataChange(['invoice', 'totalAmount'], [JSON.parse(JSON.stringify(invoice)), totalAmount]);
  }

  const onProgressBlur = (data, value) => {
    let progress = value;
    let minProgress = data.progress;
    if(progress >= 100) progress = 100;
    if(progress < minProgress) progress = minProgress;

    let invoice = JSON.parse(JSON.stringify(formData.invoice));
    let temp = getTempData(formData.invoice, {});
    temp[data.id] = {...temp[data.id], newProgress: progress};
    invoice = getFormData(invoice, temp);
    let totalAmount = calculateTotalAmount(invoice);
    setTempInvoiceItems(temp);
    onFormDataChange(['invoice', 'totalAmount'], [JSON.parse(JSON.stringify(invoice)), totalAmount]);

  }
  
  const _onConfirmClick = () => {
    if (checkInputError()) {
      enqueueSnackbar('請檢查輸入', {
        variant: 'error'
      })
      return;
    }
    let invoice = getIsInInvoiceItem(JSON.parse(JSON.stringify(formData.invoice)));
    let quotationForm = originalForm.map(e=>e);

    updateQuotationForm(quotationForm, tempInvoiceItems);
    updateIsAllChildInInvoice(quotationForm);
    // console.log({
    //   lastUpdateTime: formData.lastUpdateTime,
    //   date: formData.date,
    //   projectCode: formData.projectCode,
    //   projectId: formData.projectId,
    //   quotationCode: formData.quotationCode,
    //   quotationForm: quotationForm,
    //   invoice: invoice,
    //   totalAmount: formData.totalAmount,
    //   discountRatio: formData.discountRatio,
    //   ratioDiscount: formData.ratioDiscount,
    //   discount: formData.discount,
    //   grandTotal: formData.grandTotal,
    //   financialYearStart: parseInt(formData.financialYear.split('-')[0]),
    //   financialYearEnd: parseInt(formData.financialYear.split('-')[1]),
    //   clientId: formData.clientId,
    //   contactId: formData.contactId,
    //   remark: formData.remark,
    //   paid: formData.paid,
    //   term: term,
    // })
    // return;
    if (props.mode == 'create') formDataCreateMutate({
      variables: {
        data: {
          lastUpdateTime: formData.lastUpdateTime,
          date: formData.date,
          projectCode: formData.projectCode,
          projectId: formData.projectId,
          quotationCode: formData.quotationCode,
          quotationForm: quotationForm,
          invoice: invoice,
          totalAmount: formData.totalAmount,
          discountRatio: formData.discountRatio,
          ratioDiscount: formData.ratioDiscount,
          discount: formData.discount,
          grandTotal: formData.grandTotal,
          financialYearStart: parseInt(formData.financialYear.split('-')[0]),
          financialYearEnd: parseInt(formData.financialYear.split('-')[1]),
          clientId: formData.clientId,
          contactId: formData.contactId,
          remark: formData.remark,
          paid: formData.paid,
          term: term,
        }
      },
      onCompleted: (res) => {
        if (res.projectInvoiceCreate.userErrors.length) {
          res.projectInvoiceCreate.userErrors.map(e => {
            enqueueSnackbar(e.message, {
              variant: 'error'
            })
          })
        }
        else if (res.projectInvoiceCreate.projectInvoice) {
          if (onCompleted) onCompleted();
          onCloseClick();
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
          date: formData.date,
          projectCode: formData.projectCode,
          projectId: formData.projectId,
          quotationCode: formData.quotationCode,
          totalAmount: formData.totalAmount,
          discountRatio: formData.discountRatio,
          ratioDiscount: formData.ratioDiscount,
          discount: formData.discount,
          grandTotal: formData.grandTotal,
          financialYearStart: parseInt(formData.financialYear.split('-')[0]),
          financialYearEnd: parseInt(formData.financialYear.split('-')[1]),
          clientId: formData.clientId,
          contactId: formData.contactId,
          remark: formData.remark,
          paid: formData.paid,
          term: term
        }
      },
      onCompleted: (res) => {
        if (res.projectInvoiceUpdate.userErrors.length) {
          res.projectInvoiceUpdate.userErrors.map(e => {
            enqueueSnackbar(e.message, {
              variant: 'error'
            })
          })
        }
        else if (res.projectInvoiceUpdate.projectInvoice) {
          if (onCompleted) onCompleted();
          onCloseClick();
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

  const TermListItemRow = ({ item, index }) => {

    return (
      <tr style={{padding: 2}}>
        <td>
        <div>
        <div><strong>{item['name_cht']}</strong></div>
        <div>{item['desc_cht']}</div>
        </div>
        </td>
        <td style={{ textAlign: 'center' }}>
          <Button onClick={(e)=>{
            setUpdateTagrget(item);
          }}> 
              更改
          </Button>
        </td>
        <td style={{ textAlign: 'center' }}>
          <Button color={'error'} onClick={(e)=>{
            deleteTerm(item);
          }}> 
              刪除
          </Button>
        </td>
      </tr>
    )
  }

  const Data = React.useCallback(() => {
    if(term.length == 0) return <NoItem/>
    if(globalFilter)
    return (
      term?.filter(e=> (
        e.nameCht?.includes(globalFilter) ||
        e.descCht?.includes(globalFilter) ||
        e.nameEn ?.includes(globalFilter) ||
        e.descEn ?.includes(globalFilter)
      )).map((item, i) => {
        return (
          <TermListItemRow item={item} index={i} key={i}/>
        )
      })
    )
    else return (
      term?.map((item, i) => {
        return (
          <TermListItemRow key={i} item={item} index={i} />
        )
      })
    )
  }, [term, globalFilter])

  const TermSelect = () => { 
    return (
      <Select 
       searchable={true}
       label={'條款'}
       items={termList}
       render={(row, i) => <MenuItem key={i} value={row.value}>{row.label}</MenuItem>}
       onChange={(e, item) => {
          addTerm(item)
        }}
        value={null}
      />
    )
  }

  const addTerm = (t) => { 
    let _t = term.map(e=>e);
    _t.push({
      name_cht: t.name_cht,
      name_en: t.name_en,
      desc_cht: t.desc_cht,
      desc_en: t.desc_en,
      id: v4(),
    });
    setTerm(_t);
  }

  const deleteTerm = (t) => { 
    let _t = term.map(e=>e);
    _t = _t.filter(e=>e.id != t.id);
    setTerm(_t);  
  }

  const updateTerm = (t) => { 
    let _t = term.map(e=>e);
    _t = _t.map(e=>{
      if(e.id == t.id) return t;
      return e;
    });
    setTerm(_t);  
  }

  const EditTermFrom = React.useCallback(() => {
    const [formData, setFormData] = React.useState(updateTagrget);
    const [inputError, setInputError] = React.useState({});
    if(!updateTagrget) return <></>
    const _onFormDataChange= (key, value) => {
      let data = {};
      let _inputError = inputError;
      for (let i in key) {
        data[key[i]] = value[i] === '' ? null : value[i];
        _inputError[key[i]] = null;
        setInputError(_inputError);
      }
      let newData = {...formData, ...data};
      setFormData({
        ...newData,
      });
    }

    return (
      <InfoCard
        title={""}
      >
        <Grid container spacing={2} padding={1}>
          <Typography variant="body2" sx={{ marginBottom: 1, fontWeight: 'bold', fontSize: 18 }}>
            更改條款
          </Typography>
          <Grid item xs={12}>
            <Input
              label="*名稱(中文):"
              variant="outlined"
              minRows={4}
              multiline
              value={formData.name_cht}
              error={inputError.name_cht}
              helperText={inputError.name_cht}
              onChange={(e) => { _onFormDataChange(["name_cht"], [e.target.value]) }}
            />
          </Grid>
          <Grid item xs={12}>
            <Input
              label="*名稱(英文):"
              variant="outlined"
              minRows={4}
              multiline
              value={formData.name_en}
              error={inputError.name_en}
              helperText={inputError.name_en}
              onChange={(e) => { _onFormDataChange(["name_en"], [e.target.value]) }}
            />
          </Grid>
          <Grid item xs={12}>
            <Input
              label="描述(中文):"
              variant="outlined"
              minRows={4}
              multiline
              value={formData.desc_cht}
              error={inputError.desc_cht}
              helperText={inputError.desc_cht}
              onChange={(e) => { _onFormDataChange(["desc_cht"], [e.target.value]) }}
            />
          </Grid>
          <Grid item xs={12}>
            <Input
              label="描述(英文):"
              variant="outlined"
              minRows={4}
              multiline
              value={formData.desc_en}
              error={inputError.desc_en}
              helperText={inputError.desc_en}
              onChange={(e) => { _onFormDataChange(["desc_en"], [e.target.value]) }}
            />
          </Grid>
        </Grid>
        <div style={{ alignSelf: 'end', minWidth: 50, display: 'flex', flexDirection: 'row' }}>
          <div>
            <button
              style={{ color: 'white', backgroundColor: 'rgb(33, 150, 243)', border: 'none', borderRadius: '5px', padding: '5px 10px', cursor: 'pointer', marginTop: 3, marginBottom: 10 }}
              onClick={() => {
              updateTerm(formData);
              setUpdateTagrget(null)
            }}>確定</button>
          </div>
          <div>
            <button
              style={{ color: 'rgb(33, 150, 243)', backgroundColor: 'white', border: 'none', borderRadius: '5px', padding: '5px 10px', cursor: 'pointer' }}
              onClick={() => setUpdateTagrget(null)}>取消</button>
          </div>
        </div>
      </InfoCard>
    )

  }, [updateTagrget])

  React.useEffect(() => {
      setFormData({
        ...defaultData,
        ...props.data,
      })
      setTerm(props.data?.term??[]);
  }, [props.data, props.mode, open])

  return (
    <>
    {
      (createStatus.loading || updateStatus.loading) && <BackdropLoading/>
    }
      <EditFormModal
        sx={{minWidth: '80%', height: '80%'}}
        open={open}
        title={`${mode}發票`}
        onConfirmClick={_onConfirmClick}
        onCloseClick={_onCloseClick}
      >
        <Grid container spacing={2} padding={1}>
          <Grid item xs={12} sm={12} md={4} lg={3}>
            <InfoCard
              title={""}
            >
              <Grid container spacing={2} padding={1}>
                <Typography variant="body2" sx={{ fontWeight: 'bold', fontSize: 18, width: '100%' }}>
                  發票單資料
                </Typography>
                <Grid item xs={12}>
                  <Input
                    disabled={props.projectId ? true : false}
                    label="專案編號:"
                    variant="standard"
                    value={formData.projectId}
                    error={inputError.projectId}
                    helperText={inputError.projectId}
                    onChange={(e) => { onFormDataChange(["projectId"], [e.target.value]) }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Input
                    disabled={props.projectCode ? true : false}
                    label="專案名稱:"
                    variant="standard"
                    value={formData.projectCode}
                    error={inputError.projectCode}
                    helperText={inputError.projectCode}
                    onChange={(e) => { onFormDataChange(["projectCode"], [e.target.value]) }}
                  />
                </Grid>
                <Grid item xs={12} sm={12} md={6}>
                  <Input
                    type="date"
                    label="*發出日期:"
                    variant="standard"
                    value={formData.date}
                    error={inputError.date}
                    helperText={inputError.date}
                    onChange={(e) => { onFormDataChange(["date"], [e.target.value]) }}
                  />
                </Grid>
                <Grid item xs={12} sm={12} md={6}>
                  <Input
                    type="date"
                    label="收款日期:"
                    variant="standard"
                    value={formData.paid}
                    error={inputError.paid}
                    helperText={inputError.paid}
                    onChange={(e) => { onFormDataChange(["paid"], [e.target.value]) }}
                  />
                </Grid>
                <Grid item xs={12} sm={12} md={12}>
                  <FinancialYearSelect />
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
                <Typography variant="body2" sx={{ marginTop: 3, fontWeight: 'bold', fontSize: 18, width: '100%' }}>
                  客戶資料
                </Typography>
                <Grid item sm={12}>
                  <ClientForm
                    {...formData}
                    onFormDataChange={onFormDataChange}
                    inputError={inputError}
                  />
                </Grid>
              </Grid>
            </InfoCard>
          </Grid>
          <Grid item xs={12} sm={12} md={8} lg={9}>
            <InfoCard
              title={""}
            >
              <Grid container spacing={2} padding={1}>
                <Typography variant="body2" sx={{ fontWeight: 'bold', fontSize: 18, width: '100%' }}>
                  選擇報價單
                </Typography>
                <Grid item xs={12} >
                  <QuotationSelect
                    disabled={props.mode == 'create' ? false : true}
                    selectBy="code"
                    label="*報價單:"
                    projectId={props.projectId}
                    status={true}
                    value={formData.quotationCode}
                    error={inputError.quotationCode}
                    helperText={inputError.quotationCode}
                    onChange={onQuotationSelectChange}
                  />
                </Grid>
                {
                  formData?.quotationCode && <>
                    <Typography variant="body2" sx={{ marginTop: 3, fontWeight: 'bold', fontSize: 18 }}>
                      選擇發票單項目
                    </Typography>
                    <Grid item xs={12}>
                      <div style={{ border: '1px #e1e1e1 solid' }}>
                        <Grid item xs={12} sm={12} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                          <DebouncedInput
                            sx={{
                              '& .MuiInputBase-root': {
                                borderBottom: 'none',
                              },
                            }}
                            value={globalFilter ?? ''}
                            onChange={value => setGlobalFilter(value)}
                            className="p-2 font-lg shadow border border-block"
                            placeholder="Search..."
                          />
                        </Grid>
                        <Divider style={{ width: '100%' }} />
                        <SortableList items={formData.invoice ?? []} renderItem={(item, index) =>
                          <QuotationItem
                            key={item.id+index}
                            index={index}
                            id={item.id}
                            text={item.name_cht}
                            data={item}
                            level={0}
                            // onClick={onRowClick}
                            actions={(data) => {
                              let progress = data.progress ?? 100;
                              if(props.mode == 'create' && data.progress == 0) progress = 100;
                              if(!data?.price?.amount) progress = null;
                              let newProgress = data.newProgress ?? progress;
                              if(props.mode == 'create')
                              return (
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', height: '100%' }} onClick={onProgressClick}>
                                  <Input
                                    variant="standard"
                                    style={{ width: 40 }}
                                    type='number'
                                    value={newProgress}
                                    onChange={(e) => { onProgressChange(data, e.target.value) }}
                                    onBlur={(e) => { onProgressBlur(data, e.target.value) }}
                                    InputProps={{
                                      inputProps: { 
                                        min: progress,
                                        max: 100,
                                       },
                                       endAdornment: <div>%</div>
                                    }} />
                                  <input
                                    className='pointer'
                                    style={{ height: 25, width: 25 }}
                                    type="checkbox"
                                    checked={data.isInInvoice}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      e.preventDefault();
                                    }}
                                    onChange={(e) => {
                                      onCheckChange(data, e.target.checked)
                                    }} />
                                </div>
                              )
                              return (
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', height: '100%' }} onClick={onProgressClick}>
                                  <div>
                                  {progress? progress+'%' : ''}
                                  </div>
                                </div>
                              )
                            }}
                          />} />
                        <Divider sx={{ background: 'black' }} />
                        {
                          formData?.invoice?.length > 0 ?
                            <>
                              <li className="tree-item cursor-default" >
                                <div className="tree-row">
                                  <div className="tree-cell" style={{ fontWeight: 'bold', textAlign: 'center', width: '100%' }}>
                                  </div>
                                  <div className="tree-cell" style={{ minWidth: 160, maxWidth: 160, justifyContent: 'right' }}>
                                    合計:
                                  </div>
                                  <div className="tree-cell" style={{ minWidth: 150, maxWidth: 150, fontWeight: 'bold', textAlign: 'center' }}>
                                  </div>
                                  <div className="tree-cell" style={{ minWidth: 150, maxWidth: 150, justifyContent: 'space-between' }}>
                                    <div>HK$</div>
                                    <div>{toMoney(formData.totalAmount)}</div>
                                  </div>
                                  <div className="tree-cell" style={{ fontWeight: 'bold', textAlign: 'center', minWidth: 40 }}></div>
                                  <div className="tree-cell-action" style={{ minWidth: 150 }}>
                                  </div>
                                </div>
                              </li>
                              <Divider />
                              <li className="tree-item cursor-default" >
                                <div className="tree-row">
                                  <div className="tree-cell" style={{ fontWeight: 'bold', textAlign: 'center', width: '100%' }}>
                                  </div>
                                  <div className="tree-cell" style={{ minWidth: 160, maxWidth: 160, justifyContent: 'right' }}>
                                    折扣:
                                  </div>
                                  <div className="tree-cell" style={{ minWidth: 150, maxWidth: 150, justifyContent: 'center' }}>
                                    {formData.discountRatio??0}%
                                  </div>
                                  <div className="tree-cell" style={{ minWidth: 150, maxWidth: 150, justifyContent: 'space-between' }}>
                                    <div>HK$</div>
                                    <div>{toMoney(formData.ratioDiscount)}</div>
                                  </div>
                                  <div className="tree-cell" style={{ fontWeight: 'bold', textAlign: 'center', minWidth: 40 }}></div>
                                  <div className="tree-cell-action" style={{ minWidth: 150 }}>
                                  </div>
                                </div>
                              </li>
                              <Divider />
                              <li className="tree-item cursor-default" style={{ display: 'none' }}>
                                <div className="tree-row">
                                  <div className="tree-cell" style={{ fontWeight: 'bold', textAlign: 'center', width: '100%' }}>
                                  </div>
                                  <div className="tree-cell" style={{ minWidth: 160, maxWidth: 160, justifyContent: 'right' }}>
                                    Discount:
                                  </div>
                                  <div className="tree-cell" style={{ minWidth: 150, maxWidth: 150, textAlign: 'center' }}>
                                    <Input
                                      style={{ height: '100%', width: '100%', textAlign: 'center' }}
                                      type="number"
                                      variant="standard"
                                      InputProps={{
                                        inputProps: { min: 0 }
                                      }}
                                      value={formData.discount}
                                      error={inputError.discount}
                                      helperText={inputError.discount}
                                      onChange={(e) => {
                                        onFormDataChange(["discount"], [e.target.value ? parseInt(e.target.value) : null]);
                                      }}
                                    />
                                  </div>
                                  <div className="tree-cell" style={{ minWidth: 150, maxWidth: 150, justifyContent: 'space-between' }}>
                                    <div>HK$</div>
                                    <div>{toMoney(formData.discount)}</div>
                                  </div>
                                  <div className="tree-cell" style={{ fontWeight: 'bold', textAlign: 'center', minWidth: 40 }}></div>
                                  <div className="tree-cell-action" style={{ minWidth: 150 }}>
                                  </div>
                                </div>
                              </li>
                              <Divider />
                              <li className="tree-item cursor-default" >
                                <div className="tree-row">
                                  <div className="tree-cell" style={{ fontWeight: 'bold', textAlign: 'center', width: '100%' }}>
                                  </div>
                                  <div className="tree-cell" style={{ minWidth: 160, maxWidth: 160, fontWeight: 'bold', justifyContent: 'right' }}>
                                    <strong>收取金額:</strong>
                                  </div>
                                  <div className="tree-cell" style={{ minWidth: 150, maxWidth: 150, fontWeight: 'bold', textAlign: 'center' }}>
                                  </div>
                                  <div className="tree-cell" style={{ minWidth: 150, maxWidth: 150, fontWeight: 'bold', justifyContent: 'space-between' }}>
                                    <div>HK$</div>
                                    <div>{toMoney(formData.grandTotal)}</div>
                                  </div>
                                  <div className="tree-cell" style={{ fontWeight: 'bold', textAlign: 'center', minWidth: 40 }}></div>
                                  <div className="tree-cell-action" style={{ minWidth: 150 }}>
                                  </div>
                                </div>
                              </li>
                            </>
                            :
                            <NoItem />
                        }
                      </div>
                    </Grid>
                  </>
                }
              </Grid>
            </InfoCard>
            <InfoCard
              title={""}
            >
              <Grid container spacing={2} padding={1}>
                <Typography variant="body2" sx={{ marginBottom: 1, fontWeight: 'bold', fontSize: 18 }}>
                  選擇條款
                </Typography>
                <Grid item xs={12} sx={{ overflowX: 'auto' }}>
                  <TermSelect />
                </Grid>
                <Grid item xs={12} sx={{ overflowX: 'auto' }}>
                  {
                    !updateTagrget && <table className='table' style={{ border: '1px #e1e1e1 solid' }}>
                      <thead>
                        <tr>
                          <th style={{ width: '100%' }}>條款</th>
                          <th style={{ minWidth: 100 }}>
                          </th>
                          <th style={{ minWidth: 100, textAlign: 'center', justifyContent: 'center', display: 'flex' }}>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <Data />
                      </tbody>
                    </table>
                  }
                  {
                    updateTagrget && <EditTermFrom />
                  }
                </Grid>
              </Grid>
            </InfoCard>
          </Grid>
        </Grid>
      </EditFormModal>
    </>
  );

}