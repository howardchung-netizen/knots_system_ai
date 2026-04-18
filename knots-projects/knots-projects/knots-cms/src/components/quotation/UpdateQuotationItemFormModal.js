import * as React from 'react';
import { Checkbox, FormControlLabel, Grid, InputAdornment, MenuItem, Typography } from '@mui/material';
import { useSnackbar } from 'notistack';
import EditFormModal from '../EditFormModal';
import { gql, useMutation, useQuery } from '@apollo/client';
import BackdropLoading from '../BackdropLoading';
import language from '../../localization/language';
import { InfoCard } from '../InfoCard';
import { QUOTATION_UPDATE_ITEM } from '../../apollo/mutations';
import { projectItemFragment } from '../../apollo/fragments';
import { PROJECT_ITEMS_QUERY } from '../../apollo/queries';
import { OptionsContext } from '../../contexts/OptionsContextProvider';
import { toMoney } from '../../utils';
import Input from '../Input';
import Select from '../Select';
import PriceOptionSelect from '../PriceOptionSelect';

export default function ({ open, onCloseClick, onCompleted, ...props }) {

  const [optionsContext, optionsContextDispatch, {
    measurementOptions
  }] = React.useContext(OptionsContext);
  const queryParameters = new URLSearchParams(window.location.search)
  const [globalFilter, setGlobalFilter] = React.useState('');
  const  lang = localStorage.getItem('lang') == 'en' ? 'En' : 'Cht';
  const { enqueueSnackbar } = useSnackbar();
  const [item, setItem] = React.useState({...props.data });
  const [formData, setFormData] = React.useState({...props.data, 
    value: props.data?.price?.value, 
    quantity: props.data?.price?.quantity, 
    amount: props.data?.price?.value * props.data?.price?.quantity
   });

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
  const mode = props.mode == 'create' ? '新增' : '編輯';

  const _onCloseClick= () => {
    setFormData({})
    setInputError({});
    onCloseClick();
    setItem({});
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
    setInputError(inputError);
    
    let hasError = Object.keys(inputError).length;

    return hasError
  }
  
  const getForm = (items) => {

    let _form = [];

    for (let i in items) {
      let item = items[i];
      let data = {...item};

      if (props.mode == 'create' && item.id == formData.upper ) { 
        data.isAllChildInInvoice = false;
        data.child.push({
          ...formData,
          name_cht: formData.name_cht,
          name_en: formData.name_en,
          desc_cht: formData.desc_cht,
          desc_en: formData.desc_en,
          isHideNo: formData.isHideNo,
          price: {
            ...data.price,
            unit: formData.unit,
            unit_cht: formData.unit_cht,
            unit_en: formData.unit_en,
            value: formData.value,
            quantity: formData.quantity,
            amount: formData.value * formData.quantity,
          }
        })
      }
      else if (item.id == formData.id) {
        data.name_cht = formData.name_cht;
        data.name_en = formData.name_en;
        data.desc_cht = formData.desc_cht;
        data.desc_en = formData.desc_en;
        data.isHideNo = formData.isHideNo;
        data.price = {
          ...data.price,
          unit: formData.unit,
          unit_cht: formData.unit_cht,
          unit_en: formData.unit_en,
          value: formData.value,
          quantity: formData.quantity,
          amount: formData.value * formData.quantity,
        }
      }

      if (item.child?.length) {
        data.child = getForm(item.child);
      }
      _form.push(data)
    }

    return _form
  }

  const _onConfirmClick = () => {
    if (checkInputError() || isEditing.current) {
      enqueueSnackbar('請檢查輸入', {
        variant: 'error'
      })
      return;
    }

    const element = document.getElementById('main-container');
    const position = element.scrollTop;
    localStorage.setItem('scrollPosition', position);

    formDataUpdateMutate({
      variables: {
        data: {
          id: props.quotationId+'',
          form: getForm(JSON.parse(JSON.stringify(props.form)))
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

  const UnitSelect = () => {
    return (
      <Select
        label={"單位"}
        variant="standard"
        items={measurementOptions}
        render={row =>
          <MenuItem sx={{ borderWidth: 1, borderStyle: 'groove' }}
            key={row.id}
            value={row.id}>
            {row.nameCht} | {row.nameEn}
          </MenuItem>
        }
        error={inputError.unitId}
        value={formData?.unitId}
        onChange={(e, item) => {
          let unitId = item.id;
          let unit = item.realId;
          let unit_cht = item.nameCht;
          let unit_en = item.nameEn;
          if (unit_en == 'N/A') {
            unit_cht = '';
            unit_en = '';
          }
          onFormDataChange(["unit", "unit_cht", "unit_en", "unitId"], [unit, unit_cht, unit_en, unitId])
        }}
      />
    )
  }

  const IsHideNoCheckBox = () => {
    return (
      <FormControlLabel
        sx={{ marginLeft: 0 }}
        control={<Checkbox
          checked={formData.isHideNo}
          onChange={(e) => {
            onFormDataChange(["isHideNo"], [e.target.checked])
          }}
        />}
        label="隱藏項目編號:"
        labelPlacement="start"
      />
    )
  }

  React.useEffect(() => {
    setFormData({
      ...props.data,
      value: props.data?.price?.value,
      quantity: props.data?.price?.quantity,
      amount: props.data?.price?.value * props.data?.price?.quantity
    })
  }, [props.data, props.mode, open])

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
                <Typography variant="body2" sx={{ marginBottom: 0, fontWeight: 'bold', fontSize: 18 }}>
                  項目
                </Typography>
                {
                  form && <>
                    <Grid item xs={12}>
                      <Input
                        label="*名稱(中文):"
                        variant="standard"
                        value={formData.name_cht}
                        error={inputError.name_cht}
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
                <Grid item xs={'auto'} sm={'auto'} sx={{ display: 'flex', minWidth: 120 }}>
                  <PriceOptionSelect
                    style={{ height: '100%', width: 120 }}
                    label="預設價錢"
                    variant="standard"
                    id={formData.ref}
                    value={formData.value}
                    error={inputError.value}
                    helperText={inputError.value}
                    InputProps={{
                      inputProps: { min: 0 },
                      startAdornment: <InputAdornment position="start">$</InputAdornment>,
                    }}
                    onChange={(e) => {
                      onFormDataChange(["value"], [e.target.value])
                    }}
                  />
                </Grid>
                <Grid item xs={'auto'} sm={'auto'} sx={{ display: 'flex' }}>
                  <Input
                    style={{ height: '100%', width: 120, textAlign: 'center' }}
                    type="number"
                    label="單價"
                    variant="standard"
                    value={formData.value}
                    error={inputError.value}
                    helperText={inputError.value}
                    InputProps={{
                      inputProps: { min: 0 },
                      startAdornment: <InputAdornment position="start">$</InputAdornment>,
                    }}
                    onChange={(e) => {
                      onFormDataChange(["value"], [e.target.value])
                    }}
                  />
                </Grid>
                <Grid item xs={'auto'} sm={'auto'} sx={{ display: 'flex' }}>
                  <Input
                    style={{ height: '100%', width: 120 }}
                    type="number"
                    label="數量"
                    variant="standard"
                    value={formData.quantity}
                    error={inputError.quantity}
                    helperText={inputError.quantity}
                    InputProps={{
                      inputProps: { min: 0 },
                    }}
                    onChange={(e) => {
                      onFormDataChange(["quantity"], [e.target.value])
                    }}
                  />
                </Grid>
                <Grid item xs={'auto'} sm={'auto'} sx={{ display: 'flex' }}>
                  <UnitSelect />
                </Grid>
                <Grid item xs={'auto'} sm={'auto'} sx={{ display: 'flex' }}>
                  <Input
                    style={{ height: '100%', width: 200, textAlign: 'center', fontWeight: 'bold' }}
                    label="合計"
                    variant="standard"
                    value={toMoney(formData.quantity * formData.value)}
                    InputProps={{
                      inputProps: { min: 0 },
                      readOnly: true,
                      disableUnderline: true
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <IsHideNoCheckBox />
                </Grid>
              </Grid>
            </InfoCard>
          </Grid>
        </Grid>
      </EditFormModal>
    </>
  );

}