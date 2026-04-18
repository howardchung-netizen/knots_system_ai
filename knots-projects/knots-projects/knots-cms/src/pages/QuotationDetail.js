import * as React from 'react';
import { Box, Tab, Tabs, useTheme, Grid, Stack, Divider, Typography, Button, TextareaAutosize } from '@mui/material';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import BackdropLoading from '../components/BackdropLoading';
import { useSnackbar } from 'notistack';
import { UserContext } from '../contexts/UserContext';
import PropTypes from 'prop-types';
import SwipeableViews from 'react-swipeable-views';
import { makeStyles } from '@mui/styles';
import { gql, useLazyQuery, useMutation } from '@apollo/client';
import { quotationsQuery } from '../apollo/queries';
import { quotationFragment } from '../apollo/fragments';
import { InfoCard, InfoRow } from '../components/InfoCard';
import FilterBlock from '../components/FilterBlock';
import { CreateBtn, CustomActionBtn, RefreshBtn, TableDelBtn, TableEditBtn } from '../components/TableActionBtn';
import update from 'immutability-helper'
import { SortableList } from '../components/SortableList';
import { QuotationItem, QuotationTerm } from '../components/SortableItem';
import { QUOTATION_FILE_DELETE, QUOTATION_MARKUP_UPDATE, QUOTATION_UPDATE_ITEM, QUOTATION_UPDATE_TERM, QUOTATION_UPLOAD_FILE } from '../apollo/mutations';
import ProjectFormModal from '../components/project/ProjectFormModal';
import QuotationFormModal from '../components/quotation/QuotationFormModal';
import ImportQuotationItemFormModal from '../components/quotation/ImportQuotationItemFormModal';
import QuotationPriceForm from '../components/quotation/QuotationPriceForm';
import ImportQuotationTermFormModal from '../components/quotation/ImportQuotationTermFormModal';
import NoItem from '../components/NoItem';
import QuotationClientFormModal from '../components/quotation/QuotationClientFormModal';
import UpdateQuotationItemFormModal from '../components/quotation/UpdateQuotationItemFormModal';
import TermsFormModal from '../components/quotation/TermsFormModal';
import { insertItemToGanttTask } from '../utils';
import { ModalContext } from '../contexts/ModalContextProvider';
import CreateQuotationItemFormModal from '../components/quotation/CreateQuotationItemFormModal';
import AddIcon from '@mui/icons-material/Add';
import { OptionsContext } from '../contexts/OptionsContextProvider';
import moment from 'moment';
import QuotationMarkupPriceForm from '../components/quotation/QuotationMarkupPriceForm';
import ImportQuotationTemplateFormModal from '../components/quotation/ImportQuotationTemplateFormModal';
import FilePicker, { File } from '../components/filePicker/FilePicker';
import QuotationRemarkFormModal from '../components/quotation/QuotationRemarkFormModal';

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

const getTotalAmount = (form) =>{
  let price = 0;
  form.forEach(item => {
    if(!item.price) {}
    else if(item.price.newUnitPrice) price += (item.price.newUnitPrice) *(item.price.quantity??0);
    else if(item.price.value) price += (item.price.value) * (item.price.quantity??0);
    if(item.child?.length) price += getTotalAmount(item.child);
  })
  return price
}

const getMarkupForm = (form, markUp) => {
  let f = [];
  form.forEach(item => {
    let child = [];
    let newItem = {...item};
    if(newItem?.price?.value) {
      let newUnitPrice, newTotalAmount;
      newUnitPrice = Math.ceil((item.price.value * (markUp / 100 + 1)).toFixed(2));
      newTotalAmount = Math.ceil((newUnitPrice * item.price.quantity).toFixed(2));
      if(newUnitPrice && newUnitPrice != newItem.price.value) {
        newItem.price.newUnitPrice = newUnitPrice;
      }
      if(newTotalAmount && newTotalAmount != newItem.price.amount) {
        newItem.price.newTotalAmount = newTotalAmount;
      }
    }
    if(item?.child?.length) child = getMarkupForm(item.child, markUp);
    newItem.child = child;
    f.push(newItem);
  })
  return f
}

const updateMarkupForm = (form) => {
  let f = [];
  form.forEach(item => {
    let child = [];
    let newItem = {...item};
    if(newItem?.price?.newUnitPrice) {
        if(!newItem.price?.base) newItem.price.base = item.price.value;
        newItem.price.value = newItem?.price?.newUnitPrice;
        newItem.price.newUnitPrice = undefined;
    }
    if(newItem?.price?.newTotalAmount) {
        newItem.price.amount = newItem?.price?.newTotalAmount;
        newItem.price.newTotalAmount = undefined;
    }
    if(item?.child?.length) child = updateMarkupForm(item.child);
    newItem.child = child;
    f.push(newItem);
  })
  return f
}

export default function () {

  const theme = useTheme();
  const classes = useStyles();
  const [optionsContext, optionsContextDispatch, {
    measurementOptions
  }] = React.useContext(OptionsContext);
  const [myConfirmModalOpen, handleMyConfirmModalOpen, handleMyConfirmModalClose] = React.useContext(ModalContext);
  const [user, userDispatch] = React.useContext(UserContext);
  const navigate = useNavigate();
  const {quotationId} = useParams();
  const queryParam = new URLSearchParams(window.location.search);
  const [lang, setLang] = React.useState(localStorage.getItem('lang') == 'en' ?  'en' : 'cht');
  const [tab, setTab] = React.useState(parseInt(queryParam.get('tab'))??0);
  const componentRef = React.useRef();
  const { enqueueSnackbar } = useSnackbar();
  const canUpdateDiscount = React.useRef(true);
  const [discount, setDiscount] = React.useState(0);
  const [discountRatio, setDiscountRatio] = React.useState(0);
  const [ratioDiscount, setRatioDiscount] = React.useState(0);
  const [totalAmount, setTotalAmount] = React.useState(0);
  const [grandTotal, setGrandTotal] = React.useState(0);
  const originalFormRef = React.useRef([]);
  const [form, setForm] = React.useState([]);
  const [term, setTerm] = React.useState([]);
  const uploadFileInputRef = React.useRef();
  const uploadFileRef = React.useRef();
  const handleTabChange = (event, newValue) => {
    let url = `/cms/quotation/${quotationId}?tab=${newValue}`
    setTab(newValue);
    navigate( url, { replace: true });
  };

  const handleTabChangeIndex = (index) => {
    let url = `/cms/client/${quotationId}?tab=${index}`
    setTab(index);
    navigate( url, { replace: true });
  };

  const [dataUseQuery, queryStatus] = useLazyQuery(gql`${quotationsQuery} ${quotationFragment}`,
    {
      fetchPolicy: 'network-only',
      variables: {
        id: quotationId,
        first: 1,
      }
    });
  const [formDataUpdateMutate, updateStatus] = useMutation(QUOTATION_MARKUP_UPDATE);
  const [formDataUpdateItemMutate, updateItemStatus] = useMutation(QUOTATION_UPDATE_ITEM);
  const [TermUpdateMutate, updateTermStatus] = useMutation(QUOTATION_UPDATE_TERM);
  const [quotationUploadFile, uploadFileStatus] = useMutation(QUOTATION_UPLOAD_FILE);
  const [qutationDeleteFile, deleteFileStatus] = useMutation(QUOTATION_FILE_DELETE);
  const [markup, setMarkup] = React.useState(0);
  const detail = React.useMemo(() => {
    let detail = null;
    if (queryStatus.data?.quotations.edges.length) {
      detail = {
        ...queryStatus?.data?.quotations.edges[0].node,
        form: JSON.parse(queryStatus?.data?.quotations.edges[0].node.form),
        term: JSON.parse(queryStatus?.data?.quotations.edges[0].node.term)
      }

      setTotalAmount(detail.totalAmount);
      setDiscount(detail.discount);
      setDiscountRatio(detail.discountRatio);
      setRatioDiscount(detail.ratioDiscount);
      setGrandTotal(detail.grandTotal);

      setMarkup(detail.markup??0)
      setForm(detail.form??[])
      originalFormRef.current = JSON.stringify(detail.form??[]);
      setTerm(detail.term)

      if(detail.form)
      for(let item of detail.form) {
        if(item.isInInvoice || item.isAllChildInInvoice){ 
          canUpdateDiscount.current = false;
          break; 
        }
      }

    }

    return detail
  }, [quotationId, queryStatus])

  const [openedModal, setOpenedModal] = React.useState({})

  const createBtnClick = () => { 
    setOpenedModal({ 
      open: 'createModal',
      mode: 'update',
      data: {
        id: detail.id,
        title: detail.title,
        status: detail.status,
        quotationStatusId: detail.progress.id,
        cmsRemark: detail.cmsRemark,
      },
      onCompleted: onCreateCompleted
     })
  }

  const updateRemarkClick = () => { 
    setOpenedModal({ 
      open: 'remarkModal',
      mode: 'update',
      data: {
        id: detail.id,
        remark: detail.remark,
      },
      onCompleted: onCreateCompleted
     })
  }

  const createProjectClick = () => {
    setOpenedModal({ 
      open: 'createProject',
      data: {
        quotationId: detail.id,
        clientId: detail.client?.id,
        contactId: detail.mainContact?.id
      },
      onCompleted: (project)=> navigate(`/cms/project/${project.projectId}?tab=0`)
     })
  }

  const onReviewProjectBtnClick = (projectId, event) => {
    let url = `/cms/project/${projectId}?tab=0`
    navigate(url);
  }

  const onRowClick = (params, event) => {
    // let target = event.currentTarget;
    // if(!target) return;
    // if(target.classList.contains('active')) target.classList.remove("active");
    // else target.classList.add("active");
  }
  
  const onCreateCompleted = (data) => { 
    setOpenedModal({})
    queryStatus.refetch();
  }

  const _onItemImportClick = () => { 
    setOpenedModal({ 
      open: 'importModal',
      mode: 'create',
      upper: 0,
      quotationId: quotationId,
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
      id: quotationId,
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
      id: quotationId,
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
      quotationId: quotationId,
      onCompleted: onCreateCompleted
     })
  }

  const _onTemplateImportClick = () => { 
    setOpenedModal({ 
      open: 'importTemplateModal',
      mode: 'create',
      quotationId: quotationId,
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

    if(upperId == 0) return reOrderItems;

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
        if (res.quotationUpdateItem.userErrors.length) {
          res.quotationUpdateItem.userErrors.map(e => {
            enqueueSnackbar(e.message, {
              variant: 'error'
            })
          })
        }
        else if (res.quotationUpdateItem.quotation) {
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
        if (res.quotationUpdateItem.userErrors.length) {
          res.quotationUpdateItem.userErrors.map(e => {
            enqueueSnackbar(e.message, {
              variant: 'error'
            })
          })
        }
        else if (res.quotationUpdateItem.quotation) {
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

  const onQuotationUploadFileInputChange = (e) => {
    quotationUploadFile(
      {
        variables: {
          data: {
            id: quotationId,
            files: e.target.files[0]
          }   
        },
        onCompleted: (res) => {
          if (res.quotationUploadFile.userErrors.length) {
            res.quotationUploadFile.userErrors.map(e => {
              enqueueSnackbar(e.message, {
                variant: 'error'
              })
            })
          }
          else if (res.quotationUploadFile.quotation) {
            enqueueSnackbar(`上傳成功`, {
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
      }
    )
  }

  const onFileDeleteClick = (id) => {
    handleMyConfirmModalOpen(
      '確認刪除?',
      '',
      'warning',
      () => {
        qutationDeleteFile(
          {
            variables: {
              data: {
                id: id,
              }
            },
            onCompleted: (res) => {
              if (res.quotationFileDelete.userErrors.length) {
                res.quotationFileDelete.userErrors.map(e => {
                  enqueueSnackbar(e.message, {
                    variant: 'error'
                  })
                })
              }
              else if (res.quotationFileDelete.quotationFile) {
                queryStatus.refetch();
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
          }
        )
      }

    )
  }

  const _onTermImportClick = () => {
    setOpenedModal({
      open: 'importTermModal',
      mode: 'create',
      data: term,
      quotationId: quotationId,
      onCompleted: onCreateCompleted
    })
  }

  const _onTermFormBtnClick = (mode, data) => {
    setOpenedModal({
      open: 'termFormModal',
      mode: mode,
      data: data,
      quotationId: quotationId,
      onCompleted: onCreateCompleted
    })
  }

  const onTermUpdateClick = (term, mode) => { 

    TermUpdateMutate({
        variables: {
          data: { 
            id: quotationId,
            term: term,
           }
        },
        onCompleted: (res) => {
          if (res.quotationUpdateTerm.userErrors.length) {
            res.quotationUpdateTerm.userErrors.map(e => {
              enqueueSnackbar(e.message, {
                variant: 'error'
              })
            })
          }
          else if (res.quotationUpdateTerm.quotation) {
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

  const onTermDeleteClick = (id) => { 
    let newTerm = term.filter(e => e.id != id)
    onTermUpdateClick(newTerm, '刪除');
  }

  const onTermsDragEnd = (data) => { 
    let newTerm = data.map((e, index) => ({...e, sort: index}))
    onTermUpdateClick(newTerm, '排序');
  }

  const changeLang = () => { 
    let l = lang == 'en' ? 'cht' : 'en';
    localStorage.setItem('lang', l);
    setLang(l);
  }

  const updateClientClick = () => {
    setOpenedModal({ 
      open: 'updateClient',
      mode: 'update',
      data: {
        id: quotationId,
        clientId: detail.client?.id,
        contactId: detail.mainContact?.id
      },
      // onCompleted: projectQueryStatus.refetch
     })
  }

  const printQuotationClick = () => { 
    let url = `/cms/quotation/${quotationId}/print`
    // let url = 'https://pms.knotsltd.com/cms/quotation/pdf/'+lang+'/minTable=0&breakBeforeTerms=1&companyStamp=1/'+detail.code
    window.open(url, '_blank');
  }

  const insertToGanttClick = () => {
    handleMyConfirmModalOpen(
      '確認導入?',
      '',
      'confirm',
      () => {
        enqueueSnackbar("導入中...", {
          variant: 'info'
        })
        try {
          fetch(process.env.REACT_APP_TODO_HTTP_ENDPOINT + "/gantt-chart/insertTasks", {
            method: 'POST',
            headers:
            {
              'Authorization': `Bearer ${user.token}`,
              'Content-type': 'application/json',
            },
            json: true,
            body: JSON.stringify({
              project: detail.project.realId,
              tasks: [{ "name": detail.code, "subTasks": insertItemToGanttTask(form) }]
            })
          }).then(async (res) => {
            if (await res.json()) enqueueSnackbar('導入成功', {
              variant: 'success'
            })
            else enqueueSnackbar('導入失敗', {
              variant: 'error'
            })
          }
          )
        } catch (error) {
          enqueueSnackbar(error, {
            variant: 'error'
          })
          console.log(error)
        } finally { 
          handleMyConfirmModalClose();
        }
      }

    )
  }

  const onMarkupChange = (value) => { 
    setMarkup(value)
    let oldForm = form;
    let newForm = getMarkupForm(oldForm, value);
    let newTotalAmount = getTotalAmount(newForm);
    setForm(newForm);
    let ratioDiscount = newTotalAmount * discountRatio / 100;
    setRatioDiscount(ratioDiscount);
    setTotalAmount(newTotalAmount);
    setGrandTotal(newTotalAmount - ratioDiscount);
  }

  const onMarkupChangeCancel = () => {
    setMarkup((prev)=>{
     return prev
    })
    let oldForm = JSON.parse(originalFormRef.current);
    let oldTotalAmount = getTotalAmount(oldForm);
    setRatioDiscount(detail.ratioDiscount);
    setForm(oldForm);
    setTotalAmount(oldTotalAmount);
    setGrandTotal(oldTotalAmount - detail.ratioDiscount);
    let ratioDiscountInput = document.getElementById('ratioDiscountInput');
    ratioDiscountInput.disabled = false;
    let discountRatioInput = document.getElementById('discountRatioInput');
    discountRatioInput.disabled = false;
  }

  const onConfirmMarkupChange = () => {
    formDataUpdateMutate({
      variables: {
        data: { 
          id: quotationId,
					form: updateMarkupForm(form),
          markup: parseFloat(markup),
          editAt: detail.editAt,
         }
      },
      onCompleted: (res) => {
        if (res.quotationMarkupUpdate.userErrors.length) {
          res.quotationMarkupUpdate.userErrors.map(e => {
            enqueueSnackbar(e.message, {
              variant: 'error'
            })
          })
        }
        else if (res.quotationMarkupUpdate.quotation) {
          enqueueSnackbar(`編輯成功`, {
            variant: 'success'
          })
          dataUseQuery();
          onCreateCompleted();
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

  const reorder = React.useCallback((dragIndex, hoverIndex) => {
    setForm((prevCards) =>
      update(prevCards, {
        $splice: [
          [dragIndex, 1],
          [hoverIndex, 0, prevCards[dragIndex]],
        ],
      }),
    )
  }, [])

  const SortableListUseCallback = React.useCallback(() => {
    const [isLoaded, setIsLoaded] = React.useState(false);

    React.useEffect(() => {
      if (isLoaded) {
        let position = localStorage.getItem('scrollPosition');
        if (position) {
          let el = document.getElementById('main-container');
          const scrollBarHeight = el.scrollHeight - el.clientHeight;
          el.scrollTop = position;
          setTimeout(() => {
            el.scrollTop = position;
            localStorage.removeItem('scrollPosition');
          }, 100);
        }
      }
    }, [isLoaded]);

    React.useEffect(() => {
      if(!isLoaded)
      setIsLoaded(true);
    }, []);

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
          showProgress={true}
          level={0}
          onClick={onRowClick}
          onDragEnd={onItemDragEnd}
          actions={(data) => (
            <div style={{ display: 'flex' }}>
              <CustomActionBtn onClick={() => {
                _onItemCreateClick(form, data)
              }} >
                <AddIcon />
              </CustomActionBtn>
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
              label: '新增子項目', onClick: (data) => {
                _onItemCreateClick(form, data)
              }
            },
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
  }, [form, markup])

  React.useLayoutEffect(() => {
		dataUseQuery();
  }, [quotationId])

  return (
    <div style={{overflow: 'auto'}}>
      <Grid container spacing={2} padding={3}>
        <QuotationFormModal
          open={openedModal.open == 'createModal'}
          data={openedModal.data}
          mode={openedModal.mode}
          onCloseClick={() => setOpenedModal({ open: '' })}
          onCompleted={onCreateCompleted}
        />
        <QuotationRemarkFormModal
          open={openedModal.open == 'remarkModal'}
          data={openedModal.data}
          mode={openedModal.mode}
          onCloseClick={() => setOpenedModal({ open: '' })}
          onCompleted={onCreateCompleted}
        />
        <ProjectFormModal
          open={openedModal.open == 'createProject'}
          mode={'create'}
          quotationId={quotationId}
          data={openedModal.data}
          onCompleted={openedModal.onCompleted}
          onCloseClick={() => setOpenedModal({ open: '' })}
        />
        {
        openedModal.open == 'importModal' && <ImportQuotationItemFormModal
          open={openedModal.open == 'importModal'}
          data={openedModal.data}
          mode={openedModal.mode}
          upper={openedModal.upper}
          refId={openedModal.refId}
          id={openedModal.id}
          quotationId={quotationId}
          form={form ?? []}
          onCloseClick={() => setOpenedModal({ open: '' })}
          onCompleted={openedModal.onCompleted}
        />
        }
        {
          openedModal.open == 'importTemplateModal' && <ImportQuotationTemplateFormModal
            open={openedModal.open == 'importTemplateModal'}
            data={openedModal.data}
            mode={openedModal.mode}
            upper={openedModal.upper}
            refId={openedModal.refId}
            id={openedModal.id}
            quotationId={quotationId}
            form={form ?? []}
            onCloseClick={() => setOpenedModal({ open: '' })}
            onCompleted={openedModal.onCompleted}
          />
        }
        <CreateQuotationItemFormModal
          open={openedModal.open == 'createItemModal'}
          data={openedModal.data}
          mode={openedModal.mode}
          quotationId={quotationId}
          upperId
          form={form??[]}
          onCloseClick={() => setOpenedModal({ open: '' })}
          onCompleted={openedModal.onCompleted}
        />
        <UpdateQuotationItemFormModal
          open={openedModal.open == 'updateItemModal'}
          data={openedModal.data}
          mode={openedModal.mode}
          quotationId={quotationId}
          form={form}
          onCloseClick={() => setOpenedModal({ open: '' })}
          onCompleted={openedModal.onCompleted}
        />
        <ImportQuotationTermFormModal
          open={openedModal.open == 'importTermModal'}
          data={openedModal.data}
          mode={openedModal.mode}
          quotationId={quotationId}
          onCloseClick={() => setOpenedModal({ open: '' })}
          onCompleted={openedModal.onCompleted}
        />
        <QuotationClientFormModal
          open={openedModal.open == 'updateClient'}
          mode={'update'}
          data={openedModal.data}
          onCompleted={openedModal.onCompleted}
          onCloseClick={() => setOpenedModal({ open: '' })}
        />
        <TermsFormModal
          open={openedModal.open == 'termFormModal'}
          data={openedModal.data}
          mode={openedModal.mode}
          quotationId={quotationId}
          term={term}
          onCloseClick={() => setOpenedModal({ open: '' })}
          onCompleted={openedModal.onCompleted}
        />
        {
          (queryStatus.loading ||
           updateItemStatus.loading ||
           updateTermStatus.loading ||
           updateStatus.loading ||
           uploadFileStatus.loading ||
           deleteFileStatus.loading
           ) && <BackdropLoading />
        }
        {
          detail?.id && (
            <>
              <Grid item xs={12} sm={12} md={3} lg={2} padding={0}>
                <Grid container spacing={2} padding={0}>
                  <Grid item xs={12} sx={{ position: 'relative' }}>
                    <div className="MuiCardActions-root MuiCardActions-spacing css-1617jao" style={{ position: 'absolute', top: '19px', right: '0px', padding: 0 }}>
                      <button className="css-1e9th7b" style={{ margin: '0px', padding: 5 }} type="button" onClick={()=>{createBtnClick()}}>編輯<span className="MuiTouchRipple-root css-w0pj6f"></span></button>
                    </div>
                    <InfoCard title={detail.code}>
                      <Typography variant="body2" sx={{ marginBottom: 1, fontWeight: 'bold', fontSize: 18 }}>
                        報價單
                      </Typography>
                      <InfoRow flexDirection='column' label={"標題"} value={detail.title} />
                      <InfoRow label={"進程"} value={detail.progress.nameCht} />
                      <InfoRow label={"狀態"} value={detail.status ? '有效' : '無效'} />
                      <InfoRow label={"專案編號"} />
                      {
                        detail.project && <Button
                          sx={{ width: '100%', marginBottom: 1 }}
                          variant="contained"
                        onClick={() => { onReviewProjectBtnClick(detail.project.projectId) }}
                        >
                          {detail.project.projectId}
                        </Button>
                      }
                      {
                        !detail.project && <Button
                          sx={{ width: '100%', marginBottom: 1 }}
                          color="warning"
                          variant="contained"
                          onClick={() => {createProjectClick() }}>
                          建立專案
                        </Button>
                      }
                      <InfoRow flexDirection={'column'} label={"內部備註:"} />
                      <TextareaAutosize style={{fieldSizing: 'content', width: '100%', minHeight: 80, resize: 'none'}} readOnly value={detail.cmsRemark??''} />
                    </InfoCard>
                  </Grid>
                  <Grid item xs={12} sx={{ position: 'relative' }}>
                    <div className="MuiCardActions-root MuiCardActions-spacing css-1617jao" style={{ position: 'absolute', top: '18px', right: '0px', padding: 0 }}>
                      <button className="css-1e9th7b" style={{ margin: '0px', padding: 5 }} type="button" onClick={updateClientClick}>編輯<span className="MuiTouchRipple-root css-w0pj6f"></span></button>
                    </div>
                    <InfoCard title={"客戶資料"}>
                      <Typography variant="body2" sx={{ marginBottom: 1, fontWeight: 'bold', fontSize: 18 }}>
                        客戶
                      </Typography>
                      {detail.client?.companyCht && <InfoRow flexDirection='column' label={"公司名稱(中文)"} value={detail.client.companyCht} />}
                      {detail.client?.companyEn && <InfoRow flexDirection='column' label={"公司名稱(英文)"} value={detail.client.companyEn} />}
                      {detail.client?.nameCht && <InfoRow label={"名稱(中文)"} value={detail.client?.nameCht} />}
                      {detail.client?.nameEn && <InfoRow label={"名稱(英文)"} value={detail.client?.nameEn} />}
                      {detail.client?.tel && <InfoRow label={"電話"} value={detail.client.telCode + " " + detail.client.tel} />}
                      {detail.client?.fax && <InfoRow label={"傳真"} value={detail.client.faxCode + " " + detail.client.fax} />}
                      {detail.client?.whatsapp && <InfoRow label={"Whatsapp"} value={detail.client.whatsappCode + " " + detail.client.whatsapp} />}
                      {detail.client?.wechat && <InfoRow label={"Wechat"} value={detail.client.wechatCode + " " + detail.client.wechat} />}
                      {detail.client?.email && <InfoRow flexDirection='column' label={"電郵"} value={detail.client.email} />}
                      {detail.client?.address && <InfoRow flexDirection='column' label={"地址"} value={detail.client.address} />}
                      <Divider sx={{ marginBottom: 1 }} />
                      <Typography variant="body2" sx={{ marginBottom: 1, fontWeight: 'bold', fontSize: 18 }}>
                        聯絡人
                      </Typography>
                      {detail.mainContact?.nameCht && <InfoRow label={"名稱(中文)"} value={detail.mainContact.nameCht} />}
                      {detail.mainContact?.nameEn && <InfoRow label={"名稱(英文)"} value={detail.mainContact.nameEn} />}
                      {detail.mainContact?.tel && <InfoRow label={"電話"} value={detail.mainContact.telCode + ' ' + detail.mainContact.tel} />}
                      {detail.mainContact?.whatsapp && <InfoRow label={"Whatsapp"} value={detail.mainContact.whatsappCode + ' ' + detail.mainContact.whatsapp} />}
                      {detail.mainContact?.wechat && <InfoRow label={"Wechat"} value={detail.mainContact.wechatCode + ' ' + detail.mainContact.wechat} />}
                      {detail.mainContact?.email && <InfoRow flexDirection='column' label={"電郵"} value={detail.mainContact.email} />}
                    </InfoCard>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12} sm={12} md={9} lg={10}>
                <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ marginBottom: 1 }}>
                  <Button variant="contained" onClick={printQuotationClick}>列印報價單</Button>
                  {detail.project && <Button variant="contained" onClick={insertToGanttClick}>導入到工程進度表</Button>}
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
                  <Tab label="報價項目" {...a11yProps(0)} />
                  <Tab label="條款及細則" {...a11yProps(1)} />
                  <Tab label="列印備註" {...a11yProps(3)} />
                </Tabs>
                <SwipeableViews
                  axis={theme.direction === 'rtl' ? 'x-reverse' : 'x'}
                  index={tab}
                  onChangeIndex={() => { }}
                >
                  <div className={classes.tab} style={{overflow: 'auto'}} role="tabpanel" value={tab} index={0} dir={theme.direction}>
                    <div style={{minWidth: 1000}}>
                    <FilterBlock>
                        <Stack direction="row" spacing={2}>
                          <Grid container spacing={2}>
                            <Grid item xs={'auto'} sm={'auto'} sx={{ minHeight: 58 }}>
                              <CreateBtn onClick={_onItemImportClick}>
                                導入報價項目
                              </CreateBtn>
                            </Grid>
                            <Grid item xs={'auto'} sm={'auto'} sx={{ minHeight: 58 }}>
                              <CreateBtn onClick={_onTemplateImportClick}>
                                導入報價模板
                              </CreateBtn>
                            </Grid>
                            <Grid item xs={'auto'} sm={'auto'}>
                              <CreateBtn onClick={()=>uploadFileInputRef?.current?.click()}>
                                上載報價文件
                              </CreateBtn>
                              <input type="file" ref={uploadFileInputRef} style={{ display: 'none' }} onChange={onQuotationUploadFileInputChange} />
                            </Grid>
                            <Grid item xs={'auto'} sm={'auto'}>
                              <RefreshBtn onClick={() => dataUseQuery()} />
                            </Grid>
                          </Grid>
                        </Stack>
                    </FilterBlock>
                    <Divider />
                      {
                        detail?.quotationFiles?.length &&
                        <>
                          <Grid item xs={12}>
                            <FilePicker
                              disabled={true}
                              canDelete={true}
                              file={detail.quotationFiles ?? []}
                              maxSize={200000}
                              onRender={(file, index, images) => {
                                return (
                                  <File
                                    key={index}
                                    file={file}
                                    fileUrl={file.fileUrl}
                                    isTempFile={file.fileUrl ? false : true}
                                    onItemClick={(e) => {
                                      window.open(e.fileUrl ?? e.url, "_blank")
                                    }}
                                    onRemoveItemClick={() => {
                                      onFileDeleteClick(file.id)
                                    }}
                                  />
                                )
                              }
                              }
                            />
                          </Grid>
                        </>
                      }
                      <SortableListUseCallback />
                      <Divider sx={{ background: 'black' }} />
                      {
                        !detail?.quotationFiles?.length && form?.length == 0 && <NoItem />
                      }
                      {
                        (form?.length > 0 || detail?.quotationFiles?.length) &&
                        <>
                          <QuotationPriceForm
                            discount={discount}
                            discountRatio={discountRatio}
                            ratioDiscount={ratioDiscount}
                            totalAmount={totalAmount}
                            grandTotal={grandTotal}
                            canUpdateDiscount={canUpdateDiscount.current}
                          />
                          <Divider sx={{ background: 'black' }} />
                          <QuotationMarkupPriceForm
                            defaultMarkup={detail.markup ?? 1}
                            markup={markup}
                            onMarkupChange={onMarkupChange}
                            onMarkupChangeCancel={onMarkupChangeCancel}
                            onConfirmClick={onConfirmMarkupChange}
                            editAt={detail.editAt}
                            form={form}
                          />
                        </>
                      }
                    </div>
                  </div>
                  <div className={classes.tab} role="tabpanel" value={tab} index={1} dir={theme.direction}>
                    <FilterBlock>
                      <Stack direction="row" spacing={2}>
                        <Grid container spacing={2}>
                          <Grid item xs={'auto'} sm={'auto'} sx={{ minHeight: 58 }}>
                            <CreateBtn onClick={_onTermImportClick}>
                              導入報價條款
                            </CreateBtn>
                          </Grid>
                          <Grid item xs={'auto'} sm={'auto'} sx={{ minHeight: 58 }}>
                            <CreateBtn onClick={()=>_onTermFormBtnClick('create')}>
                              新增報價條款
                            </CreateBtn>
                          </Grid>
                          <Grid item xs={'auto'} sm={'auto'}>
                            <RefreshBtn onClick={() => dataUseQuery()} />
                          </Grid>
                        </Grid>
                      </Stack>
                    </FilterBlock>
                    <Divider />
                    <SortableList 
                    items={term??[]} 
                    renderItem={(item, index) =>
                      <QuotationTerm
                        key={index}
                        index={index}
                        id={item.id}
                        data={item}
                        onClick={onRowClick}
                        actions={(data) => (
                          <div style={{ display: 'flex' }}>
                            <TableEditBtn onClick={() => _onTermFormBtnClick('edit', item)} />
                            <TableDelBtn  onClick={() => onTermDeleteClick(data.id)} />
                          </div>
                        )}
                        menuItems={[
                          { label: '編輯', onClick: (data) => _onTermFormBtnClick('edit', item)},
                          { label: '刪除', onClick: (data) => onTermDeleteClick(data.id), mode: 'warning', title: '確認刪除?' },
                        ]}
                      />}
                    onDragEnd={onTermsDragEnd}
                    />
                    <Divider sx={{ background: 'black' }} />
                    {
                      (term?.length == 0) && <NoItem />
                    }
                  </div>
                  <div style={{ width: '200mm', position: 'relative' }} className={classes.tab} role="tabpanel" value={tab} index={2} dir={theme.direction}>
                    <Grid container spacing={2} padding={0}>
                      <Grid item xs={12} sx={{ position: 'relative' }}>
                        <div className="MuiCardActions-root MuiCardActions-spacing css-1617jao" style={{ position: 'absolute', top: '19px', right: '0px', padding: 0 }}>
                          <button className="css-1e9th7b" style={{ margin: '0px', padding: 5, }} type="button" onClick={() => { updateRemarkClick() }}>編輯<span className="MuiTouchRipple-root css-w0pj6f"></span></button>
                        </div>
                      </Grid>
                    </Grid>
                    <InfoCard title={"列印備註"}>
                      <TextareaAutosize style={{ fieldSizing: 'content', width: '192mm', minHeight: 80, resize: 'none', fontSize: '13px' }} readOnly={true} value={detail.remark??''} />
                    </InfoCard>
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
