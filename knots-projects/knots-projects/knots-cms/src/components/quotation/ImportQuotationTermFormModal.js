import * as React from 'react';
import { Grid, Typography } from '@mui/material';
import { useSnackbar } from 'notistack';
import EditFormModal from '../EditFormModal';
import { gql, useMutation, useQuery } from '@apollo/client';
import BackdropLoading from '../BackdropLoading';
import language from '../../localization/language';
import { InfoCard } from '../InfoCard';
import { QUOTATION_CREATE, QUOTATION_IMPORT_TERM } from '../../apollo/mutations';
import { termsFragment } from '../../apollo/fragments';
import { TERMSES_QUERY } from '../../apollo/queries';
import { OptionsContext } from '../../contexts/OptionsContextProvider';
import DebouncedInput from '../DebouncedInput';

export default function ({ open, onCloseClick, onCompleted, ...props }) {

  const [optionsContext, optionsContextDispatch, {
    measurementOptions
  }] = React.useContext(OptionsContext);

  const mode = props.mode == 'create' ? '導入' : '編輯';
  const [globalFilter, setGlobalFilter] = React.useState('');
  const queryParameters = new URLSearchParams(window.location.search)
  const lang = localStorage.getItem('lang') == 'en' ? 'En' : 'Cht';
  const { enqueueSnackbar } = useSnackbar();
  const [formData, setFormData] = React.useState(props.data);
  const [inputError, setInputError] = React.useState({});
  const [selectedAll, setSelectedAll] = React.useState(false);
  const { data, loading, error } = useQuery(gql`${TERMSES_QUERY} ${termsFragment}`, {
    fetchPolicy: 'cache-and-network',
    variables: {
      show: true,
      deleted: false,
    }
  })
  const [term, setTerm] = React.useState([]);
  
  const [formDataCreateMutate, createStatus] = useMutation(QUOTATION_CREATE);
  const [formDataUpdateMutate, updateStatus] = useMutation(QUOTATION_IMPORT_TERM);

  const termList = React.useMemo(() => { 
    let termList = [];
    if (data?.termses?.edges.length && open) {
      termList = data.termses.edges.map(({ node }) => ({ ...node }));
      if (props.data) {
        let termIds = props.data ? props.data.map(e => (parseInt(e.id))) : [];
        termList = termList?.filter(e => !termIds.includes(e.realId))
      }
      termList = termList?.map(e => ({ ...e, checked: selectedAll }));
      setTerm(termList);
    }
    return termList;
   }, [data, open, selectedAll])

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
    for (let i of []) {
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
  
  const onCheckChange = (item, value) => {
    setTerm((term) => {
      let _term = term.map(e => {
        if (e.id == item.id) return { ...e, checked: value }
        else return e;
      });
      return _term
    });
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
          termsIds: [...term.filter(e => e.checked).map(e => (e.id))]
        }
      },
      onCompleted: (res) => {
        if (res.quotationImportTerm.userErrors.length) {
          res.quotationImportTerm.userErrors.map(e => {
            enqueueSnackbar(e.message, {
              variant: 'error'
            })
          })
        }
        else if (res.quotationImportTerm.quotation) {
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
    else formDataUpdateMutate({
      variables: {
        data: {
          id: formData.id,
          templatePrices: term.filter(e => e.checked).map(e => ({ itemId: e.id }))
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

  const TermListItemRow = ({ item, index }) => {

    return (
      <tr>
        <td>
        <div>
        <div><strong>{item['name' + lang]}</strong></div>
        <div>{item['desc' + lang]}</div>
        </div>
        </td>
        <td style={{ width: 'auto', textAlign: 'center' }}>
          <input 
          className='pointer' 
          style={{ height: 25, width: 25 }}
          type="checkbox" 
          checked={item.checked}
          onChange={(c) => {
            onCheckChange(item, c.target.checked)
          }}/>
        </td>
      </tr>
    )
  }

  const Data = React.useCallback(() => {
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
  }, [term, formData, globalFilter])

  React.useEffect(() => {
      setFormData({
        ...props.data
      });
      if(!open) setTerm([]);
  }, [props.data, props.mode, open])

  return (
    <>
    {
      (createStatus.loading || updateStatus.loading) && <BackdropLoading/>
    }
      <EditFormModal
        sx={{minWidth: '80%', height: '80%'}}
        open={open}
        title={`${mode}條款`}
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
                 報價條款
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
                <Grid item xs={12} sx={{ overflowX: 'auto' }}>
                  <table className='table'>
                    <thead>
                      <tr>
                        <th style={{ width: '100%' }}>條款</th>
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
                </Grid>
              </Grid>
            </InfoCard>
          </Grid>
        </Grid>
      </EditFormModal>
    </>
  );

}