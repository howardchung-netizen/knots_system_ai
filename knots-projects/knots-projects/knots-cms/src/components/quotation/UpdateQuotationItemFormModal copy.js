import * as React from 'react';
import { Divider, Grid, InputAdornment, MenuItem, Typography } from '@mui/material';
import { useSnackbar } from 'notistack';
import EditFormModal from '../EditFormModal';
import { gql, useMutation, useQuery } from '@apollo/client';
import BackdropLoading from '../BackdropLoading';
import language from '../../localization/language';
import { InfoCard } from '../InfoCard';
import { QUOTATION_IMPORT_ITEM, QUOTATION_UPDATE_ITEM, QUOTATION_UPDATE_TERM } from '../../apollo/mutations';
import { projectItemFragment } from '../../apollo/fragments';
import { PROJECT_ITEMS_QUERY } from '../../apollo/queries';
import Select from '../Select';
import { OptionsContext } from '../../contexts/OptionsContextProvider';
import { toMoney } from '../../utils';
import Input from '../Input';
import ProjectItemSelect from '../template/ProjectItemSelect';
import { set } from 'date-fns';
import DebouncedInput from '../DebouncedInput';

export default function ({ open, onCloseClick, onCompleted, ...props }) {

  const [optionsContext, optionsContextDispatch, {
    measurementOptions
  }] = React.useContext(OptionsContext);
  const queryParameters = new URLSearchParams(window.location.search)
  const [globalFilter, setGlobalFilter] = React.useState('');
  const  lang = localStorage.getItem('lang') == 'en' ? 'En' : 'Cht';
  const { enqueueSnackbar } = useSnackbar();
  const [formData, setFormData] = React.useState({...props.data });
  const [inputError, setInputError] = React.useState({});
  const [selectedAll, setSelectedAll] = React.useState(null);
  const { data, loading, error } = useQuery(gql`${PROJECT_ITEMS_QUERY} ${projectItemFragment}`, {
    fetchPolicy: 'cache-and-network',
    variables: {
      level: 1,
      delete: false,
      first: 9999
    }
  })
  const [child, setChild] = React.useState([]);
  const [form, setForm] = React.useState([]);
  const [formDataUpdateMutate, updateStatus] = useMutation(QUOTATION_UPDATE_ITEM);
  const isEditing = React.useRef(false);
  const mode = props.mode == 'create' ? '導入' : '編輯';

  const _onCloseClick= () => {
    setFormData({})
    setInputError({});
    onCloseClick();
    setSelectedAll(null);
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
    for (let i of ["id", 'name_cht', 'name_en']) {
      if (formData[i] == null || formData[i] == "" || formData[i] == '') inputError[i] = language.inputError.required;
    }
    if(!formData.unitId && formData.prices?.length) inputError.unitId = language.inputError.required;
    if(formData.prices) {
      for(let i of formData.prices) {
        if(i.price === undefined || i.price === null) inputError.price = language.inputError.required;
        if(!i.desc_cht) inputError.desc_cht = language.inputError.required;
        if(!i.desc_en) inputError.desc_en = language.inputError.required;
      }
    }
    setInputError(inputError);
    
    let hasError = Object.keys(inputError).length;

    return hasError
  }
  
  const onProjectItemSelectChange = (e, item) => {
    setFormData({ ...item, price: item.price ? JSON.parse(item.price) : [] })
  }

  const templatePriceChange = (templatePrice, index) => {
    setForm((form)=>{
      let _form = form.map(e => ({ ...e }));
      _form[index].templatePrice = { ..._form[index].templatePrice, ...templatePrice };
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
  }

  const _onConfirmClick = () => {
    if (checkInputError() || isEditing.current) {
      enqueueSnackbar('請檢查輸入', {
        variant: 'error'
      })
      return;
    }

    // console.log({
    //   id: props.quotationId+'',
    //   templatePrices: [{ 
    //     itemId: formData.id+'',
    //     itemNameCht: formData.name_cht,
    //     itemNameEn: formData.name_en,
    //     itemDescCht: formData.desc_cht,
    //     itemDescEn: formData.desc_en,
    //    }, ...form.filter(e => e.checked).map(e => (e.templatePrice))]
    // })
    // return
    
    formDataUpdateMutate({
      variables: {
        data: {
          id: props.quotationId+'',
          templatePrices: [{ 
            itemId: formData.id+'',
            itemNameCht: formData.name_cht,
            itemNameEn: formData.name_en,
            itemDescCht: formData.desc_cht,
            itemDescEn: formData.desc_en,
           }, ...form.filter(e => e.checked).map(e => (e.templatePrice))]
        }
      },
      onCompleted: (res) => {
        if (res.quotationUpdateItem.userErrors.length) {
          res.quotationUpdateItem.userErrors.map(e => {
            enqueueSnackbar(e.message, {
              variant: 'error'
            })
          })
        }
        else if (res.quotationUpdateItem.quotation) {
          if (onCompleted) onCompleted();
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

  const ChildItemRow = ({ item, index }) => {
    const [editMode, setEditMode] = React.useState(false);
    const formPrice = item?.formPrice;
    const priceOptions = child[index].price
    const [defaultNameCht, setDefaultNameCht] = React.useState(item?.nameCht);
    const [defaultDescCht, setDefaultDescCht] = React.useState(item?.descCht);
    const [templatePrice, setTemplatePrice] = React.useState({
      itemId: item.id, 
      price: formPrice?.value ? parseFloat(formPrice?.value) : undefined, 
      qty: formPrice?.quantity,
      itemNameCht: item?.nameCht,
      itemNameEn: item?.nameEn,
      itemDescCht: item?.descCht,
      itemDescEn: item?.descEn,
    });
    const [selectedPrice, setSelectedPrice] = React.useState(getSelectedPrice());
    const [isSelectedItem, setIsSelectedItem] = React.useState(item.checked);
    const [isCustomePrice, setIsCustomePrice] = React.useState(checkIsCustomePrice());

    function getSelectedPrice() {
      try {
        if (!formPrice) return priceOptions[0]?.id;
        else if (priceOptions) return priceOptions.find(e => e.price == formPrice.value)?.id;
        return 0
       }
      catch (e) { 
        // console.log(e)
      }
    }

    function checkIsCustomePrice() {
      if (!priceOptions?.length || selectedPrice == undefined) return true
      else if (!formPrice) return false;
      else return false;
    }

    const onEditClick = () => { 
      isEditing.current = true;
      setEditMode(true);
    }

    const onEditConfirmClick = () => {  
      if(!templatePrice.itemNameCht || !templatePrice.itemNameEn) return
      isEditing.current = false;
      setDefaultNameCht(templatePrice.itemNameCht);
      setDefaultDescCht(templatePrice.itemDescCht);
      setEditMode(false);
    }

    const onEditCancellClick = () => {  
      isEditing.current = false;
      setTemplatePrice({
        ...templatePrice,
        itemNameCht: item?.nameCht,
        itemNameEn: item?.nameEn,
        itemDescCht: item?.descCht,
        itemDescEn: item?.descEn,
      })
      setEditMode(false);
    }

    React.useEffect(() => {
      templatePriceChange(templatePrice, index)
    }, [templatePrice])
    if (item.id != props.itemId) return null
    return (
      <>
        <Grid item xs={12} sm={12} sx={{ display: 'flex' }}>
          <Input
            style={{ height: '100%', width: '100%', textAlign: 'center', marginTop: 15 }}
            label="*名稱(中文)"
            placeholder=""
            variant="standard"
            value={templatePrice.itemNameCht}
            error={!templatePrice.itemNameCht ? '*必填' : null}
            helperText={!templatePrice.itemNameCht ? '*必填' : null}
            InputProps={{
              inputProps: { min: 0 },
            }}
            onChange={(e) => {
              setTemplatePrice({ ...templatePrice, itemNameCht: e.target.value })
            }}
          />
        </Grid>
        <Grid item xs={12} sm={12} sx={{ display: 'flex' }}>
          <Input
            style={{ height: '100%', width: '100%', textAlign: 'center', marginBottom: 15 }}
            label="*名稱(英文)"
            variant="standard"
            value={templatePrice.itemNameEn}
            error={!templatePrice.itemNameEn ? '*必填' : null}
            helperText={!templatePrice.itemNameEn ? '*必填' : null}
            InputProps={{
              inputProps: { min: 0 },
            }}
            onChange={(e) => {
              setTemplatePrice({ ...templatePrice, itemNameEn: e.target.value })
            }}
          />
        </Grid>
        <Grid item xs={12} sm={12} sx={{ display: 'flex' }}>
          <Input
            style={{ height: '100%', width: '100%', textAlign: 'center', marginTop: 5 }}
            label="描述(中文)"
            placeholder=""
            variant="standard"
            value={templatePrice.itemDescCht}
            InputProps={{
              inputProps: { min: 0 },
            }}
            onChange={(e) => {
              setTemplatePrice({ ...templatePrice, itemDescCht: e.target.value })
            }}
          />
        </Grid>
        <Grid item xs={12} sm={12} sx={{ display: 'flex' }}>
          <Input
            style={{ height: '100%', width: '100%', textAlign: 'center', marginBottom: 15 }}
            label="描述(英文)"
            variant="standard"
            value={templatePrice.itemDescEn}
            InputProps={{
              inputProps: { min: 0 },
            }}
            onChange={(e) => {
              setTemplatePrice({ ...templatePrice, itemDescEn: e.target.value })
            }}
          />
        </Grid>
        {
          item.upper > 0 && <>
            <Grid item xs={'auto'} sm={'auto'} sx={{ display: 'flex' }}>
              <Input
                style={{ height: '100%', width: 120, textAlign: 'center' }}
                type="number"
                label="單價"
                variant="standard"
                value={templatePrice.price}
                error={inputError.price}
                helperText={inputError.price}
                InputProps={{
                  inputProps: { min: 0 },
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
                onChange={(e) => {
                  setTemplatePrice({ ...templatePrice, price: e.target.value ? parseInt(e.target.value) : null })
                }}
              />
            </Grid>
            <Grid item xs={'auto'} sm={'auto'} sx={{ display: 'flex' }}>
              <Input
                style={{ height: '100%', width: 120 }}
                type="number"
                label="數量"
                variant="standard"
                value={templatePrice.qty}
                error={inputError.qty}
                helperText={inputError.qty}
                InputProps={{
                  inputProps: { min: 0 },
                  endAdornment: <InputAdornment position="start">{measurementOptions.find(x => item?.unitId == x.id)?.nameCht}</InputAdornment>,
                }}
                onChange={(e) => {
                  setTemplatePrice({ ...templatePrice, qty: e.target.value ? parseInt(e.target.value) : null })
                }}
              />
            </Grid>
            <Grid item xs={'auto'} sm={'auto'} sx={{ display: 'flex' }}>
              <Input
                style={{ height: '100%', width: 200, textAlign: 'center', fontWeight: 'bold' }}
                label="合計"
                variant="standard"
                value={toMoney(templatePrice.price * templatePrice.qty)}
                InputProps={{
                  inputProps: { min: 0 },
                  readOnly: true,
                  disableUnderline: true
                }}
              />
            </Grid>
          </>
        }
        {/* <tr>
          <td style={{ width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div style={{ width: '100%', paddingRight: 10 }}>
                <div style={{ fontWeight: 'bold' }}>
                  {defaultNameCht}
                  {
                    editMode && <Input
                      style={{ height: '100%', width: '100%', textAlign: 'center', marginTop: 15 }}
                      label="*名稱(中文)"
                      placeholder=""
                      variant="standard"
                      value={templatePrice.itemNameCht}
                      error={!templatePrice.itemNameCht ? '*必填' : null}
                      helperText={!templatePrice.itemNameCht ? '*必填' : null}
                      InputProps={{
                        inputProps: { min: 0 },
                      }}
                      onChange={(e) => {
                        setTemplatePrice({ ...templatePrice, itemNameCht: e.target.value })
                      }}
                    />
                  }
                  {
                    editMode && <Input
                      style={{ height: '100%', width: '100%', textAlign: 'center', marginBottom: 15 }}
                      label="*名稱(英文)"
                      variant="standard"
                      value={templatePrice.itemNameEn}
                      error={!templatePrice.itemNameEn ? '*必填' : null}
                      helperText={!templatePrice.itemNameEn ? '*必填' : null}
                      InputProps={{
                        inputProps: { min: 0 },
                      }}
                      onChange={(e) => {
                        setTemplatePrice({ ...templatePrice, itemNameEn: e.target.value })
                      }}
                    />
                  }
                </div>
                <div style={{ fontSize: 14 }}>
                  {defaultDescCht}
                  {
                    editMode && <Input
                      style={{ height: '100%', width: '100%', textAlign: 'center', marginTop: 5 }}
                      label="描述(中文)"
                      placeholder=""
                      variant="standard"
                      value={templatePrice.itemDescCht}
                      InputProps={{
                        inputProps: { min: 0 },
                      }}
                      onChange={(e) => {
                        setTemplatePrice({ ...templatePrice, itemDescCht: e.target.value })
                      }}
                    />
                  }
                  {
                    editMode && <Input
                      style={{ height: '100%', width: '100%', textAlign: 'center', marginBottom: 15 }}
                      label="描述(英文)"
                      variant="standard"
                      value={templatePrice.itemDescEn}
                      InputProps={{
                        inputProps: { min: 0 },
                      }}
                      onChange={(e) => {
                        setTemplatePrice({ ...templatePrice, itemDescEn: e.target.value })
                      }}
                    />
                  }
                </div>
              </div>
              {
                editMode ?
                  <div style={{ alignSelf: 'end', minWidth: 50 }}>
                    <div>
                      <div>
                        <button
                          style={{ color: 'rgb(33, 150, 243)', backgroundColor: 'white', border: 'none', borderRadius: '5px', padding: '5px 10px', cursor: 'pointer' }}
                          onClick={onEditCancellClick}>取消</button>
                      </div>
                      <div>
                        <button
                          style={{ color: 'white', backgroundColor: 'rgb(33, 150, 243)', border: 'none', borderRadius: '5px', padding: '5px 10px', cursor: 'pointer', marginTop: 3, marginBottom: 10 }}
                          onClick={onEditConfirmClick}>確定</button>
                      </div>
                    </div>
                  </div>
                  :
                  <div style={{ alignSelf: 'center', minWidth: 50 }}>
                    <button onClick={onEditClick}>自定</button>
                  </div>
              }
            </div>
          </td>
          <td style={{ minWidth: 150, textAlign: 'center' }}>
            <Input
              style={{ height: '100%', width: '100%', textAlign: 'center' }}
              type="number"
              placeholder="數量"
              variant="standard"
              value={templatePrice.qty}
              error={inputError.qty}
              helperText={inputError.qty}
              InputProps={{
                inputProps: { min: 0 },
              }}
              onChange={(e) => {
                setTemplatePrice({ ...templatePrice, qty: e.target.value ? parseInt(e.target.value) : null })
              }}
            />
          </td>
          <td style={{ minWidth: 100, textAlign: 'center' }}>
            <input
              className='pointer'
              style={{ height: 25, width: 25 }}
              type="checkbox"
              checked={isCustomePrice}
              onChange={(c) => {
                setIsCustomePrice(c.target.checked)
              }} />
          </td>
          <td style={{ minWidth: 150, textAlign: 'center' }}>
            {!isCustomePrice ? <Select
              variant="standard"
              loading={loading}
              searchable={true}
              items={priceOptions}
              render={row =>
                <MenuItem sx={{ borderWidth: 1, borderStyle: 'groove', width: '100%', margin: 0 }}
                  key={row.id}
                  value={row.id}>
                  {row.desc_cht} - {toMoney(row.price)} {row.deleted ? '(已刪除)' : ''}
                </MenuItem>
              }
              inputError={inputError.id}
              value={selectedPrice}
              onChange={(x) => {
                setTemplatePrice({ ...templatePrice, price: parseFloat(priceOptions.find(e => e.id == x.target.value)?.price || 0) })
                setSelectedPrice(x.target.value)
              }}
            /> :
              <Input
                style={{ height: '100%', width: '100%', textAlign: 'center' }}
                type="number"
                placeholder="價錢"
                variant="standard"
                value={templatePrice.price}
                error={inputError.price}
                helperText={inputError.price}
                InputProps={{
                  inputProps: { min: 0 },
                }}
                onChange={(e) => {
                  setTemplatePrice({ ...templatePrice, price: e.target.value ? parseInt(e.target.value) : null })
                }}
              />
            }
          </td>
          <td style={{ width: 'auto', textAlign: 'center' }}>{measurementOptions.find(x => item?.unitId == x.id)?.nameCht}</td>
          <td style={{ width: 50, textAlign: 'center' }}>
            <input
              className='pointer'
              style={{ height: 25, width: 25 }}
              type="checkbox"
              checked={isSelectedItem}
              onChange={(c) => {
                setIsSelectedItem(c.target.checked)
                onCheckChange(templatePrice, c.target.checked)
              }} />
          </td>
        </tr> */}
      </>
    )
  }

  const Data = React.useCallback(() => {
    // if(globalFilter)
    // return (
    //   child?.filter(e=> e.realId == props.itemId).map((item, i) => {
    //     return (
    //       <ChildItemRow item={item} index={i} key={i}/>
    //     )
    //   })
    // )
    return (
      form?.map((item, i) => {
        return (
          <ChildItemRow item={item} index={i} key={i}/>
        )
      })
    )
  }, [child, formData, globalFilter])
  console.log("form", form)
  React.useEffect(() => {
      setFormData({
        ...props.data
      })
  }, [props.data, props.mode, open])

  React.useEffect(() => {

    if(formData.id && open) {

      let form = data?.projectItems?.edges?.filter(e=> e.node.upper == formData.id).map(({node}) => ({...node, price: node.price ? JSON.parse(node.price) : null}))
      setChild(form);
      let checkedList = formData.child?.map(x=> x.id)??[];
      if(selectedAll === false) checkedList = []; 
      setForm(form.map(e=>{

        let checked = selectedAll || checkedList.includes(e.realId);
        let child = formData.child.find(x=> x.id == e.realId);
        if(checked && child) {
          e.nameCht = child?.name_cht;
          e.nameEn = child?.name_en;
          e.descCht = child?.desc_cht;
          e.descEn = child?.desc_en;
        }

        return {
          ...e, 
          id: e.realId, 
          checked: checked,
          formPrice: child?.price
        }
      }));
    }
    else {
      setChild([])
      setForm([])
    }

   },[formData.id, selectedAll])

  return (
    <>
    {
      (updateStatus.loading) && <BackdropLoading/>
    }
      <EditFormModal
        sx={{minWidth: '80%', minHeight: '80%'}}
        open={open}
        title={`${mode}報價項目`}
        onConfirmClick={_onConfirmClick}
        onCloseClick={_onCloseClick}
      >
        <Grid container spacing={2} padding={1}>
          <Grid item xs={12} padding={0}>
            <InfoCard
              title={""}
            >
              <Grid container spacing={2} padding={1}>
                <Typography variant="body2" sx={{ marginBottom: 1, fontWeight: 'bold', fontSize: 18, display: 'none' }}>
                  父項目
                </Typography>
                <Grid item xs={12} style={{display: 'none'}}>
                  <ProjectItemSelect
                    disabled={true}
                    readOnly={true}
                    selectBy={'realId'}
                    // disabledIds={props.form?.map(e=> e.id)??[]}
                    label="*父項目:"
                    value={formData.id}
                    error={inputError.id}
                    helperText={inputError.id}
                    onChange={onProjectItemSelectChange}
                  />
                </Grid>
                <Typography variant="body2" sx={{ marginBottom: 0, fontWeight: 'bold', fontSize: 18 }}>
                  項目
                </Typography>
                {
                !props.itemId && <>
                  <Grid item xs={12}>
                    <Input
                      label="*名稱(中文):"
                      variant="standard"
                      value={formData.name_cht}
                      error={inputError.name_tht}
                      helperText={inputError.name_cht}
                      onChange={(e) => { onFormDataChange(["name_cht"], [e.target.value]) }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Input
                      label="*名稱(英文):"
                      variant="standard"
                      value={formData.name_en}
                      error={inputError.name_en}
                      helperText={inputError.name_en}
                      onChange={(e) => { onFormDataChange(["name_en"], [e.target.value]) }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Input
                      label="描述(中文):"
                      variant="standard"
                      value={formData.desc_cht}
                      error={inputError.desc_cht}
                      helperText={inputError.desc_cht}
                      onChange={(e) => { onFormDataChange(["desc_cht"], [e.target.value]) }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Input
                      label="描述(英文):"
                      variant="standard"
                      value={formData.desc_en}
                      error={inputError.desc_en}
                      helperText={inputError.desc_en}
                      onChange={(e) => { onFormDataChange(["desc_en"], [e.target.value]) }}
                    />
                  </Grid>
                </>
                }
                <Data />
                {/* <Grid item xs={12} sm={12} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
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
                </Grid> */}
                {/* <Grid item xs={12} sx={{ overflowX: 'auto' }}>
                  <table className='table'>
                    <thead>
                      <tr>
                        <th style={{ width: '100%' }}>子項目</th>
                        <th style={{ minWidth: 150, textAlign: 'center' }}>數量</th>
                        <th style={{ minWidth: 100, textAlign: 'center' }}>自定價錢</th>
                        <th style={{ minWidth: 150, textAlign: 'center' }}>價錢</th>
                        <th style={{ minWidth: 100, width: 'auto', textAlign: 'center' }}>單位</th>
                        <th style={{ minWidth: 100, textAlign: 'center', justifyContent: 'center', display: 'flex' }}>
                          導入<input
                            className='pointer'
                            style={{ height: 25, width: 25, alignSelf: 'center', justifySelf: 'center' }}
                            type="checkbox"
                            checked={selectedAll}
                            onChange={(c) => {
                              setSelectedAll(c.target.checked)
                            }} />
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <Data />
                    </tbody>
                  </table>
                </Grid> */}
              </Grid>
            </InfoCard>
          </Grid>
        </Grid>
      </EditFormModal>
    </>
  );

}