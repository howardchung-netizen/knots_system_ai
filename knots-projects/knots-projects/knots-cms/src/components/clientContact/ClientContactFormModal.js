import * as React from 'react';
import { Grid, MenuItem, Typography } from '@mui/material';
import { useSnackbar } from 'notistack';
import EditFormModal from '../EditFormModal';
import { useMutation } from '@apollo/client';
import BackdropLoading from '../BackdropLoading';
import language from '../../localization/language';
import { InfoCard } from '../InfoCard';
import { CLIENT_CONTACT_CREATE, CLIENT_CONTACT_UPDATE } from '../../apollo/mutations';
import Input from '../Input';
import TelInput from '../TelInput';
import { appellation, telCodes } from '../../constants/InputOptions';
import Select from '../Select';
import FilePicker, {File} from '../filePicker/FilePicker';

export default function ({ open, onCloseClick, onCompleted, ...props }) {
	
  const { enqueueSnackbar } = useSnackbar();
  const [formData, setFormData] = React.useState({});
  const [uploadFiles, setUploadFiles] = React.useState([]);
  const [inputError, setInputError] = React.useState({});
  const [formDataCreateMutate, createStatus] = useMutation(CLIENT_CONTACT_CREATE);
  const [formDataUpdateMutate, updateStatus] = useMutation(CLIENT_CONTACT_UPDATE);
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
    for (let i of []) {
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
        data: { ...formData}
      },
      onCompleted: (res) => {
        if (res.clientContactsCreate.userErrors.length) {
          res.clientContactsCreate.userErrors.map(e => {
            enqueueSnackbar(e.message, {
              variant: 'error'
            })
          })
        }
        else if (res.clientContactsCreate.clientContacts) {
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
          uuid: formData.uuid,
          nameCht: formData.nameCht,
          nameEn:  formData.nameEn ,
          appellation: formData.appellation,
          email:  formData.email,
          telCode:  formData.telCode,
          tel:  formData.tel,
          whatsappCode:  formData.whatsappCode,
          whatsapp:  formData.whatsapp,
          wechatCode:  formData.wechatCode,
          wechat:  formData.wechat,
          files: uploadFiles,
          deleteFile: formData.deleteFile
         }
      },
      onCompleted: (res) => {
        if (res.clientContactsUpdate.userErrors.length) {
          res.clientContactsUpdate.userErrors.map(e => {
            enqueueSnackbar(e.message, {
              variant: 'error'
            })
          })
        }
        else if (res.clientContactsUpdate.clientContacts) {
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

  const AppellationSelect = () => {
    return (
      <Select
        variant="standard"
        label={"稱謂"}
        labelId="appellation"
        value={formData.appellation}
        error={inputError.appellation}
        onChange={(e) => { onFormDataChange(["appellation"], [e.target.value]) }}
      >
        {appellation.map((item, index) => <MenuItem sx={{ borderBottomWidth: 1, borderColor: 'grey', borderStyle: 'groove' }} key={index} value={item.value}>{item.nameCht}</MenuItem>)}
      </Select>
    )
  }

  React.useEffect(() => {
    if(props.mode == 'update') {
      setFormData({
        ...props.data
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
        title={`${mode}聯絡人`}
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
                  聯絡人
                </Typography>
                <Grid item xs={12}>
                  <Input
                    label="名稱(中文)"
                    variant="standard"
                    value={formData.nameCht}
                    error={inputError.nameCht}
                    helperText={inputError.nameCht}
                    onChange={(e) => { onFormDataChange(["nameCht"], [e.target.value]) }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Input
                    label="名稱(英文)"
                    variant="standard"
                    value={formData.nameEn}
                    error={inputError.nameEn}
                    helperText={inputError.nameEn}
                    onChange={(e) => { onFormDataChange(["nameEn"], [e.target.value]) }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <AppellationSelect />
                </Grid>
                <Typography variant="body2" sx={{ marginTop: 3, marginBottom: 1, fontWeight: 'bold', fontSize: 18 }}>
                  聯絡方式
                </Typography>
                <Grid item xs={12}>
                  <Input
                    label="電郵"
                    variant="standard"
                    value={formData.email}
                    error={inputError.email}
                    helperText={inputError.email}
                    onChange={(e) => { onFormDataChange(["email"], [e.target.value]) }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TelInput
                    label="電話"
                    codes={telCodes}
                    code={formData.telCode}
                    number={formData.tel}
                    onCodeChange={(code) => { onFormDataChange(["telCode"], [code]) }}
                    onTelChange={(tel) => { onFormDataChange(["tel"], [tel]) }}
                    error={inputError.tel}
                    helperText={inputError.tel}
                  />
                </Grid>
                <Grid item xs={12}>
                </Grid>
                <Grid item xs={12}>
                  <TelInput
                    label="Whatsapp"
                    codes={telCodes}
                    code={formData.whatsappCode}
                    number={formData.whatsapp}
                    onCodeChange={(code) => { onFormDataChange(["whatsappCode"], [code]) }}
                    onTelChange={(whatsapp) => { onFormDataChange(["whatsapp"], [whatsapp]) }}
                    error={inputError.whatsapp}
                    helperText={inputError.whatsapp}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TelInput
                    label="Wechat"
                    codes={telCodes}
                    code={formData.wechatCode}
                    number={formData.wechat}
                    onCodeChange={(code) => { onFormDataChange(["wechatCode"], [code]) }}
                    onTelChange={(wechat) => { onFormDataChange(["wechat"], [wechat]) }}
                    error={inputError.wechat}
                    helperText={inputError.wechat}
                  />
                </Grid>
                <Grid item xs={12}>
                  <FilePicker
                    disabled={false}
                    title='檔案'
                    file={formData.contactFiles ? formData.contactFiles : []}
                    maxSize={200000}
                    onSelected={(e) => {
                      let contactFiles = formData.contactFiles?.map(e => e) ?? [];
                      contactFiles = contactFiles.concat(e);
                      let _uploadFiles = uploadFiles.map(e => e);
                      _uploadFiles.push(e);
                      setUploadFiles(uploadFiles.concat(e));
                      onFormDataChange(['contactFiles'], [contactFiles]);
                    }}
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
                            let contactFiles = formData.contactFiles.filter(e => e !== file)
                            let delList = formData.deleteFile?.map(e => e) || [];
                            if (file.id) delList.push(file.id);
                            onFormDataChange(['deleteFile', 'contactFiles'], [delList, contactFiles]);
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