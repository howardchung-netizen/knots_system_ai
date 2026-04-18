import * as React from 'react';
import { Grid, Typography } from '@mui/material';
import { useSnackbar } from 'notistack';
import EditFormModal from '../EditFormModal';
import { useMutation } from '@apollo/client';
import BackdropLoading from '../BackdropLoading';
import language from '../../localization/language';
import { ClientBaseInput, ClientContactInput, MainContactCheckList } from './ClientForm';
import { InfoCard } from '../InfoCard';
import { CLIENT_CREATE, CLIENT_UPDATE } from '../../apollo/mutations';

export default function ({ open, onCloseClick, onCompleted, ...props }) {
	
  const { enqueueSnackbar } = useSnackbar();
  const [formData, setFormData] = React.useState({});
  const  mainContactId = React.useRef(null);
  const [inputError, setInputError] = React.useState({});
  const [formDataCreateMutate, createStatus] = useMutation(CLIENT_CREATE);
  const [formDataUpdateMutate, updateStatus] = useMutation(CLIENT_UPDATE);
  const mode = props.mode == 'create' ? '新增' : '編輯';
  
  const _onCloseClick= () => {
    setFormData({})
    setInputError({});
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
    for (let i of ['companyEn', 'companyCht']) {
      if (formData[i] == null || formData[i] == "" || formData[i] == '') inputError[i] = language.inputError.required;
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
    if (props.mode == 'create') formDataCreateMutate({
      variables: {
        data: { ...formData, contacts: formData?.contacts?.map(e => ({ id: e.id, isMainContact: e.isMainContact })) }
      },
      onCompleted: (res) => {
        if (res.clientCreate.userErrors.length) {
          res.clientCreate.userErrors.map(e => {
            enqueueSnackbar(e.message, {
              variant: 'error'
            })
          })
        }
        else if (res.clientCreate.client) {
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
          prefix: formData.prefix,
          companyEn: formData.companyEn,
          companyCht:  formData.companyCht ,
          address:  formData.address ,
          email:  formData.email ,
          telCode:  formData.telCode ,
          tel:  formData.tel ,
          faxCode:  formData.faxCode ,
          fax:  formData.fax ,
          whatsappCode:  formData.whatsappCode ,
          whatsapp:  formData.whatsapp ,
          wechatCode:  formData.wechatCode ,
          wechat:  formData.wechat ,
          remark:  formData.remark ,
          contacts: formData?.contacts?.map(e => ({ id: e.id, isMainContact: e.isMainContact }))
         }
      },
      onCompleted: (res) => {
        if (res.clientUpdate.userErrors.length) {
          res.clientUpdate.userErrors.map(e => {
            enqueueSnackbar(e.message, {
              variant: 'error'
            })
          })
        }
        else if (res.clientUpdate.client) {
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

  React.useEffect(() => {
    if(props.mode == 'edit') {
      mainContactId.current = props.data?.mainContact?.id;
      setFormData({
        ...props.data,
        contacts: props.data?.contacts?.map(x => ({ ...x, isMainContact: x.id == props.data?.mainContact?.id  }))
      })
    }
  }, [props.data, props.mode, open])

  return (
    <>
    {
      (createStatus.loading || updateStatus.loading) && <BackdropLoading/>
    }
      <EditFormModal
        open={open}
        title={`${mode}客戶`}
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
                  客戶資料
                </Typography>
                <ClientBaseInput
                  {...formData}
                  onFormDataChange={onFormDataChange}
                  inputError={inputError} />
                <Typography variant="body2" sx={{ marginTop: 3, marginBottom: 1, fontWeight: 'bold', fontSize: 18 }}>
                  聯絡人
                </Typography>
                <ClientContactInput 
                  mainContactId={mainContactId.current}
                  {...formData}
                  onFormDataChange={onFormDataChange}
                  inputError={inputError} 
                />
                <MainContactCheckList 
                  {...formData}
                  onCheck={(id)=>mainContactId.current = id}
                  onFormDataChange={onFormDataChange}
                  inputError={inputError} 
                />
              </Grid>
            </InfoCard>
          </Grid>
        </Grid>
      </EditFormModal>
    </>
  );

}