import * as React from 'react';
import { Divider, Grid, MenuItem, Typography } from '@mui/material';
import { useSnackbar } from 'notistack';
import EditFormModal from '../EditFormModal';
import { useMutation, useQuery } from '@apollo/client';
import BackdropLoading from '../BackdropLoading';
import language from '../../localization/language';
import { InfoCard } from '../InfoCard';
import { PROJECT_ORDER_CREATE, PROJECT_ORDER_UPDATE } from '../../apollo/mutations';
import Input from '../Input';
import Select from '../Select';
import ProjectSelect from '../ProjectSelect';
import FilePicker, { File } from '../filePicker/FilePicker';
import { set } from 'date-fns';

export default function ({ open, onCloseClick, onCompleted, ...props }) {
	
  const { enqueueSnackbar } = useSnackbar();
  const [formData, setFormData] = React.useState({...props.data});
  const [uploadFiles, setUploadFiles] = React.useState([]);
  const [deleteFiles, setDeleteFiles] = React.useState([]);
  const [inputError, setInputError] = React.useState({});
  const [formDataCreateMutate, createStatus] = useMutation(PROJECT_ORDER_CREATE);
  const [formDataUpdateMutate, updateStatus] = useMutation(PROJECT_ORDER_UPDATE);
  const disabled = formData.settlement;
  const mode = props.mode == 'create' ? '新增' : '編輯';
  
  const _onCloseClick= () => {
    setFormData({})
    setInputError({});
    setUploadFiles([]);
    setDeleteFiles([]);
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
    for (let i of ["projectId", "supplier", "amount", "delivery", "payment", "cash"]) {
      if (formData[i] == null) inputError[i] = language.inputError.required;
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
    console.log({
      projectId: parseInt(formData.projectId),
      supplier: formData.supplier,
      amount:  parseFloat(formData.amount),
      desc: formData.desc,
      orderedDate:  formData.orderedDate,
      deliveryDate:  formData.deliveryDate,
      delivery:  formData.delivery,
      payment:  formData.payment ? true : false,
      cheque:  formData.cheque,
      cash:  formData.cash ? true : false,
      remark:  formData.remark,
      uploadFiles: uploadFiles
    })
    if (props.mode == 'create') formDataCreateMutate({
      variables: {
        data: {
          projectId: parseInt(formData.projectId),
          supplier: formData.supplier,
          amount:  parseFloat(formData.amount),
          desc: formData.desc,
          orderedDate:  formData.orderedDate,
          deliveryDate:  formData.deliveryDate,
          delivery:  formData.delivery,
          payment:  formData.payment ? true : false,
          cheque:  formData.cheque,
          cash:  formData.cash ? true : false,
          remark:  formData.remark,
          uploadFiles: uploadFiles
        }
      },
      onCompleted: (res) => {
        if (res.projectOrderCreate.userErrors.length) {
          res.projectOrderCreate.userErrors.map(e => {
            enqueueSnackbar(e.message, {
              variant: 'error'
            })
          })
        }
        else if (res.projectOrderCreate.projectOrder) {
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
          projectId: parseInt(formData.projectId),
          supplier: formData.supplier,
          amount:  parseFloat(formData.amount) ,
          desc: formData.desc,
          orderedDate:  formData.orderedDate,
          deliveryDate:  formData.deliveryDate,
          delivery:  formData.delivery,
          payment:  formData.payment ? true : false,
          cheque:  formData.cheque,
          cash:  formData.cash ? true : false,
          remark:  formData.remark,
          uploadFiles: uploadFiles,
          deleteFiles: deleteFiles
        }
      },
      onCompleted: (res) => {
        if (res.projectOrderUpdate.userErrors.length) {
          res.projectOrderUpdate.userErrors.map(e => {
            enqueueSnackbar(e.message, {
              variant: 'error'
            })
          })
        }
        else if (res.projectOrderUpdate.projectOrder) {
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

  const PaymentSelect = () => {
    return (
      <Select
        disabled={disabled}
        sx={{ width: '120px' }}
        variant="standard"
        label={"*已付款:"}
        labelId="payment"
        value={formData.payment}
        error={inputError.payment}
        onChange={(e) => { onFormDataChange(["payment"], [e.target.value]) }}
      >
        {[
          {label: '未付款', value: false},
          {label: '已付款', value: true},
        ].map((item, index) => <MenuItem sx={{ borderBottomWidth: 1, borderColor: 'grey', borderStyle: 'groove' }} key={index} value={item.value}>{item.label}</MenuItem>)}
      </Select>
    )
  }
  
  const CashSelect = () => {
    return (
      <Select
        disabled={disabled}
        sx={{ width: '120px' }}
        variant="standard"
        label={"*現金付款:"}
        labelId="cash"
        value={formData.cash}
        error={inputError.cash}
        onChange={(e) => { onFormDataChange(["cash"], [e.target.value]) }}
      >
        {[
          {label: '否', value: false},
          {label: '是', value: true},
        ].map((item, index) => <MenuItem sx={{ borderBottomWidth: 1, borderColor: 'grey', borderStyle: 'groove' }} key={index} value={item.value}>{item.label}</MenuItem>)}
      </Select>
    )
  }

  const DeliverySelect = () => {
    return (
      <Select
        disabled={disabled}
        sx={{ width: '120px' }}
        variant="standard"
        label={"*已收貨:"}
        labelId="payment"
        value={formData.delivery}
        error={inputError.delivery}
        onChange={(e) => { onFormDataChange(["delivery"], [e.target.value]) }}
      >
        {[
          {label: '未收貨', value: false},
          {label: '已收貨', value: true},
        ].map((item, index) => <MenuItem sx={{ borderBottomWidth: 1, borderColor: 'grey', borderStyle: 'groove' }} key={index} value={item.value}>{item.label}</MenuItem>)}
      </Select>
    )
  }

  React.useEffect(() => {
    setFormData({
      ...props.data
    })
  }, [props.data, props.mode, open])

  return (
    <>
    {
      (createStatus.loading || updateStatus.loading) && <BackdropLoading/>
    }
      <EditFormModal
        open={open}
        title={`${mode}訂單`}
        onConfirmClick={disabled ? null :  _onConfirmClick}
        onCloseClick={_onCloseClick}
      >
        <Grid container spacing={2} padding={1}>
          <Grid item sm={12} padding={0}>
            <InfoCard
              title={""}
            >
              <Grid container spacing={2} padding={1}>
                <Typography variant="body2" sx={{ marginBottom: 1, fontWeight: 'bold', fontSize: 18 }}>
                  訂單
                </Typography>
                <Grid item xs={12}>
                  <ProjectSelect
                    disabled={disabled}
                    label="工程專案*:"
                    variant="standard"
                    selectBy={"projectId"}
                    value={formData.projectId}
                    error={inputError.projectId}
                    helperText={inputError.projectId}
                    onChange={(e, v) => { 
                      onFormDataChange(["projectId"], [e.target.value])
                     }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Input
                    disabled={disabled}
                    label="*供應商 / Supplier"
                    variant="standard"
                    value={formData.supplier}
                    error={inputError.supplier}
                    helperText={inputError.supplier}
                    onChange={(e) => { onFormDataChange(["supplier"], [e.target.value]) }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Input
                    disabled={disabled}
                    label="描述:"
                    variant="standard"
                    value={formData.desc}
                    error={inputError.desc}
                    helperText={inputError.desc}
                    onChange={(e) => { onFormDataChange(["desc"], [e.target.value]) }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Input
                    disabled={disabled}
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
                <Typography variant="body2" sx={{ marginBottom: 1, marginTop: 5, fontWeight: 'bold', fontSize: 18 }}>
                  價錢
                </Typography>
                <Grid item xs={12}>
                  <Input
                    disabled={disabled}
                    type={"number"}
                    label="*價錢:"
                    variant="standard"
                    value={formData.amount}
                    error={inputError.amount}
                    helperText={inputError.amount}
                    onChange={(e) => { onFormDataChange(["amount"], [e.target.value]) }}
                  />
                </Grid>
                <Grid item sx={'auto'}>
                  <Input
                    disabled={disabled}
                    style={{ width: 120 }}
                    type={"date"}
                    label="下單日期:"
                    variant="standard"
                    value={formData.orderedDate}
                    error={inputError.orderedDate}
                    helperText={inputError.orderedDate}
                    onChange={(e) => { onFormDataChange(["orderedDate"], [e.target.value]) }}
                  />
                </Grid>
                <Grid item sx={'auto'}>
                  <PaymentSelect />
                </Grid>
                <Grid item sx={'auto'}>
                  <CashSelect />
                </Grid>
                <Grid item xs={12}>
                  <Input
                    disabled={disabled}
                    label="支票號碼:"
                    variant="standard"
                    value={formData.cheque}
                    error={inputError.cheque}
                    helperText={inputError.cheque}
                    onChange={(e) => { onFormDataChange(["cheque"], [e.target.value]) }}
                  />
                </Grid>
                <Typography variant="body2" sx={{ marginBottom: 0, marginTop: 5, fontWeight: 'bold', fontSize: 18 }}>
                  收貨
                </Typography>
                <Grid item xs={12}></Grid>
                <Grid item sx={'auto'}>
                  <Input
                    disabled={disabled}
                    style={{ width: 120 }}
                    type={"date"}
                    label="收貨日期:"
                    variant="standard"
                    value={formData.deliveryDate}
                    error={inputError.deliveryDate}
                    helperText={inputError.deliveryDate}
                    onChange={(e) => { onFormDataChange(["deliveryDate"], [e.target.value]) }}
                  />
                </Grid>
                <Grid item sx={{ width: 120 }}>
                  <DeliverySelect />
                </Grid>
                <Grid item xs={12}></Grid>
                <Typography variant="body2" sx={{ marginBottom: 1, marginTop: 5, fontWeight: 'bold', fontSize: 18 }}>
                  檔案
                </Typography>
                <Divider/>
                <Grid item xs={12}>
                  <FilePicker
                    disabled={disabled}
                    canDelete={true}
                    file={formData.files ? formData.files : []}
                    maxSize={200000}
                    onSelected={(e) => {
                      let files = formData.files?.map(e => e) ?? [];
                      files = files.concat(e);
                      let _uploadFiles = uploadFiles.map(e => e);
                      _uploadFiles.push(e);
                      setUploadFiles(uploadFiles.concat(e));
                      onFormDataChange(['files'], [files]);
                    }}
                    onRender={(file, index, images) => {
                      return (
                        <File
                          key={file.name}
                          file={file}
                          fileUrl={file.fileUrl}
                          isTempFile={file.fileUrl ? false : true}
                          onItemClick={(e) => {
                            window.open(e.fileUrl ?? e.url, "_blank")
                          }}
                          onRemoveItemClick={disabled ? null : () => {
                            let files = formData.files.filter(e => e !== file)
                            let delList = deleteFiles?.map(e => e) || [];
                            if (file.id) delList.push(file.id);
                            onFormDataChange(['files'], [files]);
                            setDeleteFiles(delList);
                            setUploadFiles(uploadFiles.filter(e => e !== file));
                          }}
                        />
                      )
                    }
                    }
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