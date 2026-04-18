import * as React from 'react';
import { Grid, Typography } from '@mui/material';
import { useSnackbar } from 'notistack';
import EditFormModal from '../EditFormModal';
import { gql, useMutation, useQuery } from '@apollo/client';
import BackdropLoading from '../BackdropLoading';
import language from '../../localization/language';
import { InfoCard } from '../InfoCard';
import { QUOTATION_CREATE, QUOTATION_IMPORT_ITEM } from '../../apollo/mutations';
import { quotationTemplateFragment } from '../../apollo/fragments';
import { QUOTATION_TEMPLATES_QUERY } from '../../apollo/queries';
import { OptionsContext } from '../../contexts/OptionsContextProvider';
import { createColumnHelper, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, useReactTable } from '@tanstack/react-table';
import { rankItem } from '@tanstack/match-sorter-utils';
import ReactTreeTable from '../ReactTreeTable';
import { ImportQuotationTemplate } from '../SortableItem';
import { useParams } from 'react-router-dom';
import _ from 'underscore';
import QuotionTemplateSelect from '../template/QuotionTemplateSelect';

const findChildKeyword = (row, keyword) => {
  let hasChild = false;
  let hasKeyword = false;

  if(row.child?.length) hasChild = row.child.find(e=> findChildKeyword(e, keyword))
  if(row.keyword) hasKeyword = row.keyword.includes(keyword)
  
  return hasChild || hasKeyword;
}

const getTempData = (data, tempData) => {
  for(let i of data) {
    tempData[i.id] = i;
    let item = tempData[i.id];
    item.nameCht = i.name_cht;
    item.nameEn = i.name_en;
    item.templatePrice = {};
    item.templatePrice.itemId = item.ref;
    item.templatePrice.qty = item.price?.quantity;
    item.templatePrice.price = item.price?.value;
    item.templatePrice.priceId = item.price?.unit;
    item.unitId = item.price?.unit;
    item.unitCht = item.price?.unit_cht;
    item.unitEn = item.price?.unit_en;
    if(i.child?.length) getTempData(i.child, tempData)
  }
}

function tempDataToRowData(tempData) { 
  let _rowData = [];
  for(let i in tempData) {
    let item = tempData[i];
    if(item.upper == 0) _rowData.push(item);
  }
  return _rowData
}

const columnHelper = createColumnHelper();

const fuzzyFilter = (row, columnId, value, addMeta) => {
  // Rank the item
  const itemRank = rankItem(row.getValue(columnId), value)
  // Store the itemRank info
  addMeta({
    itemRank,
  })
  // Return if the item should be filtered in/out
  return itemRank.passed
}

export default function ({ open, onCloseClick, onCompleted, ...props }) {

  const [optionsContext, optionsContextDispatch, {
    measurementOptions
  }] = React.useContext(OptionsContext);

  const [isShowAll, setIsShowAll] = React.useState(true);
  const {quotationId} = useParams();
  const queryParam = new URLSearchParams(window.location.search);
  const [globalFilter, setGlobalFilter] = React.useState('');
  const lang = localStorage.getItem("lang") == 'en' ? 'En' : 'Cht';
  const { enqueueSnackbar } = useSnackbar();
  const [formData, setFormData] = React.useState({id: quotationId});
  const [selectedParent, setSelectedParent] = React.useState(props.refId);
  const [inputError, setInputError] = React.useState({});
  const [selectedAll, setSelectedAll] = React.useState(false);

  const { data, loading, error } = useQuery(gql`${QUOTATION_TEMPLATES_QUERY} ${quotationTemplateFragment}`, {
    fetchPolicy: 'cache-and-network',
    variables: {
      delete: false,
      first: 9999
    }
  })
  const [{ pageIndex, pageSize }, setPagination] = React.useState({
    pageIndex: queryParam.get("pageIndex") ? parseInt(queryParam.get("pageIndex")): 1,
    pageSize: queryParam.get("pageSize") ? parseInt(queryParam.get("pageSize")): 9999,
  });
  const [rowData, setData] = React.useState([]);
  const [totalCount, setTotalCount] = React.useState(0);
  const [child, setChild] = React.useState([]);
  const [form, setForm] = React.useState([]);
  const [formDataCreateMutate, createStatus] = useMutation(QUOTATION_CREATE);
  const [formDataUpdateMutate, updateStatus] = useMutation(QUOTATION_IMPORT_ITEM);
  const mode = props.mode == 'create' ? '導入' : '導入';

  const rows = React.useMemo(() => {
    let rows = [];
    if (data?.quotationTemplates.edges && selectedParent) {
      
      let parents = []
      if(props.mode == 'create') parents = data?.quotationTemplates.edges.find((e, i) => {
        return e.node.id == selectedParent
      }).node;

      if (selectedParent) {
        parents = parents.form ? JSON.parse(parents.form) : [];
        let tempData = {}
        if (props.mode == 'create') {
          getTempData(parents, tempData);
          setForm(tempData);
          setTotalCount(data?.quotationTemplates.totalCount);
          setData(tempDataToRowData(tempData));
        }
        else {
          parents = parents[0].child;
          if(!parents) parents = [];
          getTempData(JSON.parse(JSON.stringify(parents)), tempData);
          setForm(tempData);
          setTotalCount(data?.quotationTemplates.totalCount);
          setData(tempDataToRowData(tempData));
        }
      }
    }
    return rows
  }, [data, pageIndex, pageSize, selectedParent]);

  let filterData = rowData;
  if(globalFilter.length) filterData = rowData.filter(x=> { return findChildKeyword(x, globalFilter) });

  const columns = React.useMemo(() => {
    let columns = [
      columnHelper.accessor('sorting', {
        id: 'sorting',
      }),
      columnHelper.accessor('nameCht', {
        id: 'nameCht',
        width: 450,
        header: (header) => '單位',
        cell: info => {
          return (
							<div>{info.row.original.nameCht} | {info.row.original.nameEn}</div>
          )
        }
      }),
      columnHelper.accessor('action', {
        id: 'action',
        header: () => '操作',
        cell: info => {
          return (
            <div style={{display: 'flex'}}>
            </div>
          )
        }
      })
    ]
    return columns
  })
  
  const table = useReactTable({
		initialState: {
			pagination: {
					pageSize: pageSize,
			},
	  },
    data: filterData,
    columns,
    state: {
    },
    filterFns: {
      fuzzy: fuzzyFilter,
    },
    getCoreRowModel: getCoreRowModel(),
    globalFilterFn: fuzzyFilter,
    onGlobalFilterChange: setData,
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  const updateRowData = (data)=>{
    let _rowData = [];
    let _data = {...form[data.id]};
    if(data.child?.length) {
      let _child = [];
      for(let i of data.child) {
        _child.push(updateRowData(i)[0]);
      }
      _data.child = _child;
    }
    _rowData.push(_data)
    return _rowData
  }

  const Checkbox = (props) => {
		return <input
			className='pointer importCheckbox'
			style={{ height: 25, width: 25 }}
			type="checkbox"
			checked={selectedAll}
			onChange={onSelectAllClick} />
	}

  const onSelectAllClick = (e) => { 
    let checked = e.target.checked;
    let _form = {...form}
    for(let i in form) {
      _form[i].templatePrice = {...form[i].templatePrice, itemId: form[i].id, checked: checked};
      form[i].templatePrice.setIsSelected(checked);
    }
    setForm(_form);
    setSelectedAll(checked)
  }

  const Table = React.useCallback(() => {
    return (
      <ReactTreeTable
        table={table}
        pageIndex={pageIndex}
        count={Math.ceil(totalCount / pageSize)}
        setData={setData}
        renderRow={(row, index) => {
          return <ImportQuotationTemplate
            key={row.id}
            id={row.id}
            data={row}
            keyword={globalFilter}
            onItemChange={onItemChange}
          />
        }}
      />
    )
  }, [rowData, lang])

  const _onCloseClick= () => {
    setFormData({})
    setInputError({});
    onCloseClick();
    setSelectedParent(null);
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
    setFormData({ ...formData, ...data });
  }

  const checkInputError = () => {
    let inputError = {};
    if(!selectedParent) inputError.selectedParent = language.inputError.required;

    let _form = Object.values(form);
    if(_form.find(e=> e.templatePrice?.checked) === undefined){
      alert('請選擇子項目');
      inputError.child = language.inputError.required;
    }
    setInputError(inputError);
    
    let hasError = Object.keys(inputError).length;

    return hasError
  }
  
  const onProjectItemSelectChange = (e, item) => {
    setSelectedParent(item?.id);
  }

  const updateUpperChecked = (item, form, checked) => {
    if(!item) return;
    let hasChildChecked = checked;
    if(item.child?.length) {
      hasChildChecked = item.child.find(e=> e.templatePrice?.checked) ? true : false;
    }
    item.templatePrice = {...item.templatePrice, checked: hasChildChecked};
    item.templatePrice.setIsSelected(hasChildChecked);
    if(item.upper) updateUpperChecked(form[item.upper], form);
  }

  const updateULowersChecked = (lowerIds, form) => {
    for(let i in lowerIds) {
      let item = form[lowerIds[i]];
      if(!item?.templatePrice?.setIsSelected) continue;
      item.templatePrice = {...item.templatePrice, checked: false};
      item.templatePrice.setIsSelected(false);
      if(item.child?.length) updateULowersChecked(item.child.map(e=>(e.id)), form);
    }
  }

  const onItemChange = (templatePrice, source) => {
    if(form) setForm(()=>{
      let _form = form
      if (_form[source.id]) {
        _form[source.id].templatePrice = templatePrice;
        
        if (source.upper && templatePrice.checked) updateUpperChecked(_form[source.upper], _form, templatePrice.checked);
        if (source.child?.length && templatePrice.checked === false) updateULowersChecked(source.child.map(e=>(e.id)), _form);

      }
      return _form
    });
  }

  const onCheckChange = (item, value) => {
    setForm((form) => {
      let _form = form.map(e => {
        if (e.id == item.itemId) return { ...e, checked: value }
        else return e;
      });
      return _form
    });
    if(!value) setSelectedAll(false);
  }

  const getFormData = (data)=>{
    let _rowData = [];
    let {price, qty, unitId} = data.templatePrice
    let _data = {
      itemId: data.ref,
      itemNameCht: data.nameCht,
      itemNameEn: data.nameEn,
      itemDescCht: data.descCht,
      itemDescEn: data.descEn,
      price: price,
      qty: qty,
      unitId: unitId === 0 ? '0' : unitId,
      amount: price * qty,
      child: []
    };

    if(data.child?.length) {
      let _child = [];
      for(let i of data.child) {
        if(i.templatePrice?.checked) _child.push(getFormData(i)[0]);
      }
      _data.child = _child;
    }
    _rowData.push(_data)
    return _rowData
  }

  const importFormData = (data)=>{
    let _rowData = [];
    for(let item in data) {
      let i = data[item]
      if(!i.templatePrice?.checked) continue;
      let {price, qty, unitId} = i.templatePrice
      let _price = price?parseFloat(price):0;
      let _qty = qty?parseInt(qty):0;
      let _value = _price * _qty;

      let _data = {
        itemId: i.ref,
        itemNameCht: i.nameCht,
        itemNameEn: i.nameEn,
        itemDescCht: i.descCht,
        itemDescEn: i.descEn,
        price: _price,
        qty: _qty,
        unitId: unitId === 0 ? '0' : unitId,
        amount: _value,
        child: []
      };
      if(i.child?.length) {
        let _child = importFormData(i.child);
        _data.child = _child;
      }
      _rowData.push(_data)
    }
    return _rowData
  }

  const _onConfirmClick = () => {
    if (checkInputError()) {
      enqueueSnackbar('請檢查輸入', {
        variant: 'error'
      })
      return;
    }
    let data = {};
    let _form = Object.values(form).filter(e=> e.templatePrice?.checked && e.upper == 0);
    if (props.mode == 'create') data = {
      id: quotationId,
      form: importFormData(_form)
    }
    else data = {
      id: quotationId,
      importId: props.id,
      form: importFormData(_form)
    }

    formDataUpdateMutate({
      variables: {
        data: data
      },
      onCompleted: (res) => {
        if (res.quotationImportItem.userErrors.length) {
          res.quotationImportItem.userErrors.map(e => {
            enqueueSnackbar(e.message, {
              variant: 'error'
            })
          })
        }
        else if (res.quotationImportItem.quotation) {
          if (onCompleted) onCompleted();
          _onCloseClick();
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

  const showAllClick = () => {
    setIsShowAll(true);
    // let items = document.getElementsByClassName('import-quotation-item');
    // for (let i = 0; i < items.length; i++) {
    //   items[i].classList.add('active');
    // }
  }

  const disableAllClick = () => {
    setIsShowAll(false);
    // let items = document.getElementsByClassName('import-quotation-item');
    // for (let i = 0; i < items.length; i++) {
    //   items[i].classList.remove('active');
    // }
  }

  React.useEffect(() => {
      setFormData({
        ...props.data
      })
  }, [props.data, props.mode, open])

  React.useEffect(() => {
    // (async () => {
    //   await new Promise(resolve => setTimeout(resolve, 500));
    //   let items = document.getElementsByClassName('import-quotation-item');
    //   for (let i = 0; i < items.length; i++) {
    //     if (isShowAll) items[i].classList.add('active');
    //     else items[i].classList.remove('active');
    //   }
    // })()
  }, [isShowAll, selectedAll])

  return (
    <>
    {
      (createStatus.loading || updateStatus.loading) && <BackdropLoading/>
    }
      <EditFormModal
        sx={{minWidth: '80%', height: '80%'}}
        open={open}
        title={`${mode}報價單模板`}
        onConfirmClick={_onConfirmClick}
        onCloseClick={_onCloseClick}
      >
        <Grid container spacing={2} padding={1}>
          <Grid item xs={12} padding={0}>
            <InfoCard
              title={""}
            >
              <Grid container spacing={2} padding={1}>
                <Typography variant="body2" sx={{ marginBottom: 1, fontWeight: 'bold', fontSize: 18 }}>
                  選擇模板
                </Typography>
                <Grid item xs={12}>
                  <QuotionTemplateSelect
                    upper={props.upper}
                    id={props.refId}
                    disabledIds={props.form?.map(e=> e.id)??[]}
                    label="*模板:"
                    value={selectedParent}
                    error={inputError.selectedParent}
                    helperText={inputError.selectedParent}
                    onChange={onProjectItemSelectChange}
                  />
                </Grid>
                {
                  selectedParent && <>
                    <Typography variant="body2" sx={{ marginTop: 3, fontWeight: 'bold', fontSize: 18 }}>
                      選擇子項目
                    </Typography>
                    <Grid item xs={12} sx={{ overflowX: 'auto' }}>
                      {loading && <BackdropLoading />}
                      <div style={{ width: '100%', border: '1px #e2e2e2 solid' }}>
                        <li className="import-quotation-item tree-item hover-shadow pointer caret active">
                          <div className="tree-row">
                            <div className="tree-cell" style={{ minWidth: 50 }}>
                            </div>
                            <div className="tree-cell" style={{ minWidth: 40, justifyContent: 'center', color: '#3c8dbc' }}></div>
                            <div className="tree-cell" style={{ width: '100%', minWidth: 250, borderRight: '1px solid' }}>
                              項目名稱
                            </div>
                            <div className="tree-cell" style={{ minWidth: 100, maxWidth: 100, justifyContent: 'right', borderRight: '1px dotted' }}>
                              數量
                            </div>
                            <div className="tree-cell" style={{ minWidth: 100, maxWidth: 100, justifyContent: 'left', borderRight: '1px solid' }}>
                              單位
                            </div>
                            <div className="tree-cell" style={{ minWidth: 150, maxWidth: 150, justifyContent: 'space-between', borderRight: '1px solid' }}>
                              單價
                            </div>
                            <div className="tree-cell" style={{ minWidth: 50, maxWidth: 150, justifyContent: 'space-between', borderRight: '1px solid' }}>
                              <Checkbox />
                            </div>
                            <div className="tree-cell-action" style={{ width: 'auto' }}>

                            </div>
                          </div>
                        </li>
                        <Table />
                      </div>
                    </Grid>
                  </>
                }
              </Grid>
            </InfoCard>
          </Grid>
        </Grid>
      </EditFormModal>
    </>
  );

}