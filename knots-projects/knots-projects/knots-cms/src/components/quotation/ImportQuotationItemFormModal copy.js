import * as React from 'react';
import { Grid, MenuItem, TextField, Typography } from '@mui/material';
import { useSnackbar } from 'notistack';
import EditFormModal from '../EditFormModal';
import { gql, useMutation, useQuery } from '@apollo/client';
import BackdropLoading from '../BackdropLoading';
import language from '../../localization/language';
import { InfoCard } from '../InfoCard';
import { QUOTATION_CREATE, QUOTATION_IMPORT_ITEM } from '../../apollo/mutations';
import { projectItemFragment } from '../../apollo/fragments';
import { PROJECT_ITEMS_QUERY } from '../../apollo/queries';
import Select from '../Select';
import { OptionsContext } from '../../contexts/OptionsContextProvider';
import { toMoney } from '../../utils';
import ProjectItemSelect from '../template/ProjectItemSelect';
import Input from '../Input';
import DebouncedInput from '../DebouncedInput';
import { set } from 'date-fns';

export default function ({ open, onCloseClick, onCompleted, ...props }) {

  const [optionsContext, optionsContextDispatch, {
    measurementOptions
  }] = React.useContext(OptionsContext);

  const queryParameters = new URLSearchParams(window.location.search)
  const [globalFilter, setGlobalFilter] = React.useState('');
  const lang = queryParameters.get("lang") || 'Cht';
  const { enqueueSnackbar } = useSnackbar();
  const [formData, setFormData] = React.useState({...props.data });
  const [inputError, setInputError] = React.useState({});
  const [selectedAll, setSelectedAll] = React.useState(false);
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
  const [formDataCreateMutate, createStatus] = useMutation(QUOTATION_CREATE);
  const [formDataUpdateMutate, updateStatus] = useMutation(QUOTATION_IMPORT_ITEM);
  const mode = props.mode == 'create' ? '導入' : '編輯';

  const _onCloseClick= () => {
    setFormData({})
    setInputError({});
    onCloseClick();
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
    for (let i of ["id"]) {
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
    if(!value) setSelectedAll(false);
  }

  const onSelectAllClick = (e) => { 
    let checked = e.target.checked;
    const importCheckboxElements = document.querySelectorAll('.importCheckbox');
    importCheckboxElements.forEach((element) => {
      element.click();
      element.checked = checked;
    });
    setForm((form)=>{
      let _form = form.map(e => ({ ...e, checked: checked }));
      return _form
    });
    setSelectedAll(checked)
  }

  const _onConfirmClick = () => {
    if (checkInputError()) {
      enqueueSnackbar('請檢查輸入', {
        variant: 'error'
      })
      return;
    }

    if (props.mode == 'create') formDataUpdateMutate({
      variables: {
        data: {
          id: props.quotationId,
          templatePrices: [{ itemId: formData.id }, ...form.filter(e => e.checked).map(e => (e.templatePrice))]
        }
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
    else formDataUpdateMutate({
      variables: {
        data: {
          id: formData.id,
          templatePrices: form.filter(e => e.checked).map(e => ({ itemId: e.id }))
        }
      },
      onCompleted: (res) => {
        if (res.quotationUpdate.userErrors.length) {
          res.quotationUpdate.userErrors.map(e => {
            enqueueSnackbar(e.message, {
              variant: 'error'
            })
          })
        }
        else if (res.quotationUpdate.projectItem) {
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
    
    const priceOptions = child[index].price
    const [templatePrice, setTemplatePrice] = React.useState({itemId: item.id, price: parseFloat(item.price?.[0]?.price??0), qty: null});
    const [selectedPrice, setSelectedPrice] = React.useState(item.price?.[0]?.id);
    const [isCustomePrice, setIsCustomePrice] = React.useState(priceOptions?.length ? false : true);

    React.useEffect(() => {
      templatePriceChange(templatePrice, index)
    }, [templatePrice])

    return (
      <tr>
        <td style={{ width: '100%' }}><div>{item['name' + lang]}</div></td>
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
              setTemplatePrice({...templatePrice, qty: e.target.value ? parseInt(e.target.value) : null})
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
          }}/>
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
              setTemplatePrice({...templatePrice, price: parseFloat(priceOptions.find(e=> e.id == x.target.value)?.price || 0)})
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
              console.log("price: ",e.target.value)
              setTemplatePrice({...templatePrice, price: e.target.value ? parseInt(e.target.value) : null})
            }}
          />
        }
        </td>
        <td style={{ width: 'auto', textAlign: 'center' }}>{measurementOptions.find(x => item?.unitId == x.id)?.nameCht}</td>
        <td style={{ minWidth: 50, textAlign: 'center' }}>
          <input 
          className='pointer importCheckbox' 
          style={{ height: 25, width: 25 }}
          type="checkbox" 
          checked={item.checked}
          onChange={(c) => {
            onCheckChange(templatePrice, c.target.checked)
          }}/>
        </td>
      </tr>
    )
  }

  const Data = React.useCallback(() => {
    if(globalFilter)
    return (
      child?.filter(e=> (
        e.nameCht?.includes(globalFilter) ||
        e.descCht?.includes(globalFilter) ||
        e.nameEn ?.includes(globalFilter) ||
        e.descEn ?.includes(globalFilter)
      )).map((item, i) => {
        return (
          <ChildItemRow item={item} index={i} key={i}/>
        )
      })
    )
    return (
      child?.map((item, i) => {
        return (
          <ChildItemRow item={item} index={i} key={i}/>
        )
      })
    )
  }, [child, formData, globalFilter])

  React.useEffect(() => {
      setFormData({
        ...props.data
      })
  }, [props.data, props.mode, open])

  React.useEffect(() => {

    if(formData) {
      let form = data?.projectItems?.edges?.filter(e=> e.node.upperId == formData.id).map(({node}) => ({...node, price: node.price ? JSON.parse(node.price) : null}))
      setChild(form);
      setForm(form);
    }
    else setChild([])

   },[formData.id])

  return (
    <>
    {
      (createStatus.loading || updateStatus.loading) && <BackdropLoading/>
    }
      <EditFormModal
        sx={{minWidth: '80%', height: '80%'}}
        open={open}
        title={`${mode}報價單項目`}
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
                  選擇父項目
                </Typography>
                <Grid item xs={12}>
                  <ProjectItemSelect
                    selectBy="realId"
                    disabledIds={props.form?.map(e=> e.id)??[]}
                    label="*父項目:"
                    value={formData.realId}
                    error={inputError.id}
                    helperText={inputError.id}
                    onChange={onProjectItemSelectChange}
                  />
                </Grid>
                {
                  formData?.id && <>
                    <Typography variant="body2" sx={{ marginTop: 3, fontWeight: 'bold', fontSize: 18 }}>
                      選擇子項目
                    </Typography>
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
                    <Grid item xs={12} sx={{overflowX: 'auto'}}>
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
                                onChange={onSelectAllClick} />
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          <Data/>
                        </tbody>
                      </table>
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