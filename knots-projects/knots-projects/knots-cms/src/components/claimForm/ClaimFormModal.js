import * as React from 'react';
import { Grid, MenuItem, Typography } from '@mui/material';
import { useSnackbar } from 'notistack';
import EditFormModal from '../EditFormModal';
import { useMutation } from '@apollo/client';
import BackdropLoading from '../BackdropLoading';
import language from '../../localization/language';
import { InfoCard } from '../InfoCard';
import { CLAIM_FORM_CREATE, CLAIM_FORM_UPDATE } from '../../apollo/mutations';
import Input from '../Input';
import { useNavigate } from 'react-router-dom';
import { OptionsContext } from '../../contexts/OptionsContextProvider';
import Select from '../Select';
import UserSelect from '../UserSelect';
import FilePicker, {File} from '../filePicker/FilePicker';
import ProjectSelect from '../ProjectSelect';

export default function ({ open, onCloseClick, onCompleted, ...props }) {
	
  const [optionsContext, optionsContextDispatch, { claimBookKeepingAccountOptions, bookKeepingAccountOptions }] = React.useContext(OptionsContext);
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [formData, setFormData] = React.useState({...props.data});
  const [uploadFiles, setUploadFiles] = React.useState([]);
  const [deleteFiles, setDeleteFiles] = React.useState([]);
  const [inputError, setInputError] = React.useState({});
  const [formDataCreateMutate, createStatus] = useMutation(CLAIM_FORM_CREATE);
  const [formDataUpdateMutate, updateStatus] = useMutation(CLAIM_FORM_UPDATE);

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
    let checkList = [];
    checkList = ["staffId", "vendor", "amount", "purchasedDate"];
    let inputError = {};
    for (let i of checkList) {
      if (formData[i] == null || formData[i] == undefined) inputError[i] = language.inputError.required;
    }
    setInputError(inputError);
    let hasError = Object.keys(inputError).length;

    return hasError
  }
  
  const _onConfirmClick = () => {
    if(formData.settlement == true) {
      alert("已入帳的報銷單無法編輯!");
      return
    }
    if (checkInputError()) {
      enqueueSnackbar('請檢查輸入', {
        variant: 'error'
      })
      return;
    }

    if (props.mode == 'create') formDataCreateMutate({
      variables: {
        data: {
          staffId: formData.staffId,
          vendor: formData.vendor,
          categoryAccountId: formData.categoryAccountId,
          bankAccountId: formData.bankAccountId,
          settlement: formData.settlement,
          purchasedDate: formData.purchasedDate,
          amount: parseFloat(formData.amount),
          uploadFiles: uploadFiles,
          projectId: formData.projectId
        }
      },
      onCompleted: (res) => {
        if (res.claimFormCreate.userErrors.length) {
          res.claimFormCreate.userErrors.map(e => {
            enqueueSnackbar(e.message, {
              variant: 'error'
            })
          })
        }
        else if (res.claimFormCreate.claimForm) {
          if(onCompleted)onCompleted();
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
          staffId: formData.staffId,
          vendor: formData.vendor,
          categoryAccountId: formData.categoryAccountId,
          bankAccountId: formData.bankAccountId,
          purchasedDate: formData.purchasedDate,
          amount: parseFloat(formData.amount),
          uploadFiles: uploadFiles,
          deleteFiles: deleteFiles,
          projectId: formData.projectId
        }
      },
      onCompleted: (res) => {
        if (res.claimFormUpdate.userErrors.length) {
          res.claimFormUpdate.userErrors.map(e => {
            enqueueSnackbar(e.message, {
              variant: 'error'
            })
          })
        }
        else if (res.claimFormUpdate.claimForm) {
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

  const CategoryAccountSelect = () => {
    return (
      <Select
        disabled={disabled}
        loading={false}
        label="類別:"
        variant="standard"
        items={claimBookKeepingAccountOptions??[]}
        render={(row, i) => <MenuItem key={i} value={row.value}>{row.label}</MenuItem>}
        value={formData.categoryAccountId}
        error={inputError.categoryAccountId}
        helperText={inputError.categoryAccountId}
        onChange={(e) => { onFormDataChange(["categoryAccountId"], [e.target.value]) }}
      />
    )
  }

  const BankAccountSelect = () => {
    return (
      <Select
        disabled={disabled}
        loading={false}
        label="扣數銀行:"
        variant="standard"
        items={bookKeepingAccountOptions.filter(e=>e.isBank)??[]}
        render={(row, i) => <MenuItem key={i} value={row.value}>{row.label}</MenuItem>}
        value={formData.bankAccountId}
        error={inputError.bankAccountId}
        helperText={inputError.bankAccountId}
        onChange={(e) => { onFormDataChange(["bankAccountId"], [e.target.value]) }}
      />
    )
  }

  const StaffSelect = () => {
    return (
      <UserSelect
       disabled={disabled}
       label={"*員工:"}
       value={formData.staffId}
       inputError={inputError.staffId}
       onChange={(e) => {
         onFormDataChange(["staffId"], [e.target.value])
         }}
       />
    )
  }

  const SettlementSelect = () => {
    return (
      <Select
        disabled={disabled}
        loading={false}
        label="*已核實:"
        variant="standard"
        items={[{
          label: "是",
          value: true
        }, {
          label: "否",
          value: false
        }]}
        render={(row, i) => <MenuItem key={i} value={row.value}>{row.label}</MenuItem>}
        value={formData.settlement}
        error={inputError.settlement}
        helperText={inputError.settlement}
        onChange={(e) => { onFormDataChange(["settlement"], [e.target.value]) }}
      />
    )
  }

  React.useEffect(() => {
      setFormData({...props.data})
  }, [props.data, props.mode, open])
  
  return (
    <>
    {
      (createStatus.loading || updateStatus.loading) && <BackdropLoading/>
    }
      <EditFormModal
        open={open}
        title={`${mode}報銷申請`}
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
                  員工
                </Typography>
                <Grid item xs={12}>
                  <StaffSelect />
                </Grid>
                <Typography variant="body2" sx={{ marginBottom: 1, marginTop: 5, fontWeight: 'bold', fontSize: 18 }}>
                  報銷內容
                </Typography>
                <Grid item xs={12}>
                  <ProjectSelect
                    onClear={() => { onFormDataChange(["projectId"], [null]) }}
                    label="工程專案:"
                    variant="standard"
                    value={formData.projectId}
                    error={inputError.projectId}
                    helperText={inputError.projectId}
                    onChange={(e) => { onFormDataChange(["projectId"], [e.target.value]) }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CategoryAccountSelect />
                </Grid>
                {/* <Grid item xs={12}>
                  <BankAccountSelect />
                </Grid> */}
                <Grid item xs={12}>
                  <Input
                    disabled={disabled}
                    label="供應商/報銷內容:"
                    variant="standard"
                    value={formData.vendor}
                    error={inputError.vendor}
                    helperText={inputError.vendor}
                    onChange={(e) => { onFormDataChange(["vendor"], [e.target.value]) }}
                  />
                </Grid>
                <Grid item xs={'auto'} sx={{ minWidth: 120, maxWidth: 120 }}>
                  <Input
                    disabled={disabled}
                    type="number"
                    label="*金額:"
                    variant="standard"
                    value={formData.amount}
                    error={inputError.amount}
                    helperText={inputError.amount}
                    onChange={(e) => { onFormDataChange(["amount"], [e.target.value]) }}
                  />
                </Grid>
                <Grid item xs={'auto'} sx={{ minWidth: 100, maxWidth: 100 }}>
                  <Input
                    disabled={disabled}
                    type="date"
                    label="*購買日期:"
                    variant="standard"
                    value={formData.purchasedDate}
                    error={inputError.purchasedDate}
                    helperText={inputError.purchasedDate}
                    onChange={(e) => { onFormDataChange(["purchasedDate"], [e.target.value]) }}
                  />
                </Grid>
                {
                mode == 'edit' && <Grid item xs={'auto'} sx={{ minWidth: 80, maxWidth: 80 }}>
                  <SettlementSelect />
                </Grid>
                }
                <Grid item xs={12}></Grid>
                <Typography variant="body2" sx={{ marginBottom: 1, marginTop: 1, fontWeight: 'bold', fontSize: 18 }}>
                  收據
                </Typography>
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