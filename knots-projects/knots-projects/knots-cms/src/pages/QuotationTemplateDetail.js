import * as React from 'react';
import { Box, Tab, Tabs, useTheme, Grid, Stack, Divider, Button } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import BackdropLoading from '../components/BackdropLoading';
import { useSnackbar } from 'notistack';
import { UserContext } from '../contexts/UserContext';
import PropTypes from 'prop-types';
import SwipeableViews from 'react-swipeable-views';
import { makeStyles } from '@mui/styles';
import { gql, useLazyQuery, useMutation } from '@apollo/client';
import { QUOTATION_TEMPLATES_QUERY } from '../apollo/queries';
import { quotationTemplateFragment } from '../apollo/fragments';
import { InfoCard, InfoRow } from '../components/InfoCard';
import Input from '../components/Input';
import QuotationTemplateFormModal from '../components/quotation/QuotationTemplateFormModal';
import FilterBlock from '../components/FilterBlock';
import { CreateBtn, RefreshBtn, TableDelBtn, TableEditBtn } from '../components/TableActionBtn';
import ImportProjectItemFormModal from '../components/template/ImportProjectItemFormModal';
import { SortableList } from '../components/SortableList';
import { QuotationItem } from '../components/SortableItem';
import { QUOTATION_TEMPLATE_UPDATE_ITEM } from '../apollo/mutations';
import UpdateProjectItemFormModal from '../components/template/UpdateProjectItemFormModal';
import moment from 'moment';
import { OptionsContext } from '../contexts/OptionsContextProvider';

const useStyles = makeStyles(theme => ({
  tab: { 
       backgroundColor: 'white',
      '& .MuiBox-root': {
        padding: '0px',
        },
      },
  }))

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`full-width-tabpanel-${index}`}
      aria-labelledby={`full-width-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
}

function a11yProps(index) {
  return {
    id: `full-width-tab-${index}`,
    'aria-controls': `full-width-tabpanel-${index}`,
    padding: 0
  };
}

export default function () {

  const theme = useTheme();
  const classes = useStyles();
  const [optionsContext, optionsContextDispatch, {
    measurementOptions
  }] = React.useContext(OptionsContext);
  const [user, userDispatch] = React.useContext(UserContext);
  const navigate = useNavigate();
  const {templateId} = useParams();
  const queryParam = new URLSearchParams(window.location.search);
  const [lang, setLang] = React.useState(localStorage.getItem('lang') == 'en' ?  'en' : 'cht');
  const [tab, setTab] = React.useState(parseInt(queryParam.get('tab'))??0);
  const componentRef = React.useRef();
  const { enqueueSnackbar } = useSnackbar();
  const [form, setForm] = React.useState([]);

  const handleTabChange = (event, newValue) => {
    let url = `/cms/client/${templateId}?tab=${newValue}`
    setTab(newValue);
    navigate( url, { replace: true });
  };

  const handleTabChangeIndex = (index) => {
    let url = `/cms/client/${templateId}?tab=${index}`
    setTab(index);
    navigate( url, { replace: true });
  };

  const [dataUseQuery, queryStatus] = useLazyQuery(gql`${QUOTATION_TEMPLATES_QUERY} ${quotationTemplateFragment}`,
    {
      fetchPolicy: 'network-only',
      variables: {
        id: templateId,
        first: 1,
      }
    });
  const [formDataUpdateItemMutate, updateItemStatus] = useMutation(QUOTATION_TEMPLATE_UPDATE_ITEM);
  const detail = React.useMemo(() => {
    let detail = null;
    if (queryStatus.data?.quotationTemplates.edges.length) {
      detail = {
        ...queryStatus?.data?.quotationTemplates.edges[0].node,
        form: JSON.parse(queryStatus?.data?.quotationTemplates.edges[0].node.form)
      }
      setForm(detail.form)
    }

    return detail
  }, [templateId, queryStatus])

  const [openedModal, setOpenedModal] = React.useState({})

  const onRowClick = (params, event) => {
    let target = event.currentTarget;
    if(!target) return;
    if(target.classList.contains('active')) target.classList.remove("active");
    else target.classList.add("active");
  }
  
  const onCreateCompleted = (data) => { 
    setOpenedModal({ open: '' })
    queryStatus.refetch();
  }

  const _onTemplateEditClick = () => { 
    setOpenedModal({ 
      open: 'createModal',
      mode: 'update',
      data: detail,
      onCompleted: onCreateCompleted
     })
  }

  const _onItemImportClick = () => { 
    setOpenedModal({ 
      open: 'importModal',
      mode: 'create',
      upper: 0,
      templateId: templateId,
      onCompleted: onCreateCompleted
     })
  }
  
  const _onItemUpdateClick = (form, item) => { 

    let { child } = item;
    if(item.isInInvoice || child?.find(e => e.isInInvoice)) {
       alert('此項目/子項目已在發票中，無法編輯!')
       return;
    }

    let unitId = null;
    if(item?.price?.unit) unitId = measurementOptions.find(e => e.realId == item?.price?.unit)?.id
    else unitId = measurementOptions.find(e => e.nameEn == 'N/A')?.id;

    setOpenedModal({ 
      open: 'updateItemModal',
      mode: 'update',
      form: form,
      id: templateId,
      data: {
        ...item,
        unitId: unitId,
        unit: item?.price?.unit,
        quantity: item?.price?.quantity,
        unit_cht: item?.price?.unit_cht,
        unit_en: item?.price?.unit_en,
        value: item?.price?.value,
        amount: item?.price?.amount,
      },
      onCompleted: onCreateCompleted
     })
  }
  
  const _onItemCreateClick = (form, item) => { 
    let { child } = item;
    if(item.isInInvoice || child?.find(e => e.isInInvoice)) {
       alert('此項目/子項目已在發票中，無法編輯!')
       return;
    }
    let id = moment().format('x')
    setOpenedModal({ 
      open: 'updateItemModal',
      mode: 'create',
      form: form,
      id: templateId,
      upperId: item.id,
      data: {
        id: id,
        name_en: null,
        name_cht: null,
        desc_en: null,
        desc_cht: null,
        upper: item.id,
        sort: null,
        ref: null,
        delete: 0,
        budget_max: null,
        budget: null,
        budget_remark: null,
        variant: id,
        isInInvoice: false,
        child: [],
      },
      onCompleted: onCreateCompleted
     })
  }

  const _onSubItemImportClick = (form, item) => {
    let { child, ref } = item;
    if(item.isInInvoice || child?.find(e => e.isInInvoice)) {
       alert('此項目/子項目已在發票中，無法編輯!')
       return;
    }
    if(!ref) {
      alert('此項目為新增項目，無法導入子項目!')
      return;
    }

    setOpenedModal({ 
      open: 'importModal',
      mode: 'import',
      refId: item.ref,
      id: item.id,
      templateId: templateId,
      onCompleted: onCreateCompleted
     })
  }

  const deleteFormItem = (items, deleteId) => {

    let _form = [];

    for (let i in items) {
      let item = items[i];
      if (item.id == deleteId) continue;
      let data = item;
      if (item.child?.length) {
        data.child = deleteFormItem(item.child, deleteId);
      }
      _form.push(data)
    }

    return _form
  }
  
  const reOrderFormItem = (items, reOrderItems, upperId) => {

    let _form = [];

    for (let i in items) {
      let item = items[i]
      if (item.id == upperId) {
        item.child = reOrderItems;
      }
      else if (item.child?.length) {
        item.child = reOrderFormItem(item.child, reOrderItems, upperId);
      }
      _form.push(item)
    }

    return _form
  }

  const onItemRemoveClick = (item) => { 
    let { id, child } = item;
    if(item.isInInvoice || child?.find(e => e.isInInvoice)) {
       alert('此項目/子項目已在發票中，無法編輯!')
       return;
    }

    formDataUpdateItemMutate({
      variables: {
        data: {
          id: detail.id,
          form: deleteFormItem(JSON.parse(JSON.stringify(form)), id),
        }
      },
      onCompleted: (res) => {
        if (res.quotationTemplateUpdateItem.userErrors.length) {
          res.quotationTemplateUpdateItem.userErrors.map(e => {
            enqueueSnackbar(e.message, {
              variant: 'error'
            })
          })
        }
        else if (res.quotationTemplateUpdateItem.quotationTemplate) {
          onCreateCompleted();
          enqueueSnackbar(`刪除成功`, {
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

  const onItemDragEnd = (item) => {
    let _item = item.map((e, i)=> ({...e, sort: i}))

    let uppderId = _item[0].upper;
    let _form = [];
    _form = reOrderFormItem(JSON.parse(JSON.stringify(form)), _item, uppderId);

    formDataUpdateItemMutate({
      variables: {
        data: {
          id: detail.id,
          form: _form,
        }
      },
      onCompleted: (res) => { 
        if (res.quotationTemplateUpdateItem.userErrors.length) {
          res.quotationTemplateUpdateItem.userErrors.map(e => {
            enqueueSnackbar(e.message, {
              variant: 'error'
            })
          })
        }
        else if (res.quotationTemplateUpdateItem.quotationTemplate) {
          onCreateCompleted();
          enqueueSnackbar(`更改成功`, {
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

  const SortableListUseCallback = React.useCallback(() => {
    return (
      <SortableList items={form}
       onDragEnd={onItemDragEnd}
       renderItem={(item, index) => {
        return (<QuotationItem
          key={index}
          index={index}
          id={item.id}
          text={item.name_cht}
          data={item}
          level={0}
          onClick={onRowClick}
          onDragEnd={onItemDragEnd}
          actions={(data) => (
            <div style={{ display: 'flex' }}>
              <TableEditBtn onClick={() => {
                _onItemUpdateClick(form, data)
              }} />
              <TableDelBtn
                onClick={() => { onItemRemoveClick(data) }}
              />
            </div>
          )}
          menuItems={[
            {
              label: '導入子項目', onClick: (data) => {
                _onSubItemImportClick(form, data)
              }
            },
            {
              label: '編輯', onClick: (data) => {
                _onItemUpdateClick(form, data)
              }
            },
            { label: '刪除', onClick: (data) => { onItemRemoveClick(data) } },
          ]}
          childMenuItems={[
            {
              label: '編輯', onClick: (data) => {
                _onItemUpdateClick(form, data)
              }
            },
            { label: '刪除', onClick: (data) => { onItemRemoveClick(data) } },
          ]}
        />)
      }}
      />
    )
  }, [form])

  const changeLang = () => { 
    let l = lang == 'en' ? 'cht' : 'en';
    localStorage.setItem('lang', l);
    setLang(l);
  }

  React.useLayoutEffect(() => {
		dataUseQuery();
  }, [templateId])

  return (
    <div>
      <Grid container spacing={2} padding={3}>
        <QuotationTemplateFormModal
          open={openedModal.open == 'createModal'}
          data={openedModal.data}
          mode={openedModal.mode}
          onCloseClick={() => setOpenedModal({ open: '' })}
          onCompleted={onCreateCompleted}
        />
        {
          openedModal.open == 'importModal' && <ImportProjectItemFormModal
            open={openedModal.open == 'importModal'}
            data={openedModal.data}
            mode={openedModal.mode}
            upper={openedModal.upper}
            refId={openedModal.refId}
            id={openedModal.id}
            templateId={templateId}
            form={form ?? []}
            onCloseClick={() => setOpenedModal({ open: '' })}
            onCompleted={openedModal.onCompleted}
          />
        }
        <UpdateProjectItemFormModal
          open={openedModal.open == 'updateItemModal'}
          data={openedModal.data}
          mode={openedModal.mode}
          templateId={templateId}
          form={form}
          onCloseClick={() => setOpenedModal({ open: '' })}
          onCompleted={openedModal.onCompleted}
        />
        {
          (queryStatus.loading ||
           updateItemStatus.loading) && <BackdropLoading />
        }
        {
          detail?.id && (
            <>
              <Grid item xs={12} sm={12} md={3} lg={2} padding={0}>
                <Grid container spacing={2} padding={0}>
                  <Grid item xs={12} sx={{ position: 'relative' }}>
                    <div className="MuiCardActions-root MuiCardActions-spacing css-1617jao" style={{ position: 'absolute', top: '18px', right: '0px', padding: 0 }}>
                      <button className="css-1e9th7b" style={{ margin: '0px', padding: 5 }} type="button" onClick={() => _onTemplateEditClick()}>編輯<span className="MuiTouchRipple-root css-w0pj6f"></span></button>
                    </div>
                    <InfoCard title={"報價模板"}>
                      {detail?.code && <InfoRow flexDirection='column' label={"編號"} value={detail.code} />}
                      {detail?.name && <InfoRow flexDirection='column' label={"模板名稱"} value={detail.name} />}
                      <InfoRow label={"備註"} />
                      <Input
                        readOnly={true}
                        variant="outlined"
                        value={detail.remark}
                        minRows={4}
                        multiline
                      />
                    </InfoCard>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12} sm={12} md={9} lg={10}>
                <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ marginBottom: 1 }}>
                  <Button style={{ alignSelf: 'center' }} variant="contained" color='success' onClick={changeLang}>{lang == 'en' ? '中文' : 'EN'}</Button>
                </Stack>
                <Tabs
                  value={tab}
                  onChange={handleTabChange}
                  indicatorColor="primary"
                  sx={{
                    "& .MuiTab-root.Mui-selected": {
                      backgroundColor: 'white',
                    },
                    marginBottom: "2px"
                  }}
                >
                  <Tab label="項目" {...a11yProps(0)} />
                </Tabs>
                <SwipeableViews
                  axis={theme.direction === 'rtl' ? 'x-reverse' : 'x'}
                  index={tab}
                  onChangeIndex={() => { }}
                >
                  <div className={classes.tab} role="tabpanel" value={tab} index={0} dir={theme.direction}>
                    <FilterBlock>
                      <Stack direction="row" spacing={2}>
                        <Grid container spacing={2}>
                          <Grid item xs={'auto'} sm={'auto'} sx={{ minHeight: 58 }}>
                            <CreateBtn onClick={_onItemImportClick}>
                              導入項目
                            </CreateBtn>
                          </Grid>
                          <Grid item xs={'auto'} sm={'auto'}>
                            <RefreshBtn onClick={() => dataUseQuery()} />
                          </Grid>
                        </Grid>
                      </Stack>
                    </FilterBlock>
                    <Divider/>
                    <SortableListUseCallback />
                  </div>
                </SwipeableViews>
              </Grid>
            </>
          )
        }
      </Grid>
    </div>
  );

}
