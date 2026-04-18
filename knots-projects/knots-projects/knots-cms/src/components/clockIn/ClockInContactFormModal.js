import * as React from 'react';
import { Grid, Typography } from '@mui/material';
import { useSnackbar } from 'notistack';
import { useMutation } from '@apollo/client';
import BackdropLoading from '../BackdropLoading';
import language from '../../localization/language';
import { InfoCard } from '../InfoCard';
import { UPDATE_CLOCK_IN_CONTACT } from '../../apollo/mutations';
import Input from '../Input';
import { useNavigate } from 'react-router-dom';
import { OptionsContext } from '../../contexts/OptionsContextProvider';
import EditFormModal from '../EditFormModal';
import FilePicker, {File} from '../filePicker/FilePicker';

export default function ({ open, onCloseClick, onCompleted, ...props }) {
	
  const [] = React.useContext(OptionsContext);
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [formData, setFormData] = React.useState({...props.data});
  const [uploadFiles, setUploadFiles] = React.useState([]);
  const [inputError, setInputError] = React.useState({});
  const [formDataUpdateMutate, updateStatus] = useMutation(UPDATE_CLOCK_IN_CONTACT);
  const mode = '編輯';

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
    for (let i of ["tel"]) {
      if (formData[i] == null || formData[i] == undefined) inputError[i] = language.inputError.required;
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
    formDataUpdateMutate({
      variables: {
        data: {
         ...formData,
         tel: "852"+formData.tel,
         clockInContactFiles: uploadFiles
        }
      },
      onCompleted: (res) => {
        if (res.updateClockInContact.userErrors.length) {
          res.updateClockInContact.userErrors.map(e => {
            enqueueSnackbar(e.message, {
              variant: 'error'
            })
          })
        }
        else if (res.updateClockInContact.clockInContact) {
          if (onCompleted) onCompleted();
          enqueueSnackbar(`編輯成功`, {
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
      setFormData({
        ...props.data
      })
  }, [props.data, props.mode, open])
  
  return (
    <>
      {
        (updateStatus.loading) && <BackdropLoading />
      }
      <EditFormModal
        open={open}
        title={`${mode}打卡紀錄`}
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
                  打卡人資料
                </Typography>
                <Grid item xs={12}>
                  <Input
                    label="*電話:"
                    variant="standard"
                    value={formData.tel}
                    error={inputError.tel}
                    helperText={inputError.tel}
                    onChange={(e) => { onFormDataChange(["tel"], [e.target.value]) }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Input
                    label="中文姓名:"
                    variant="standard"
                    value={formData.name}
                    error={inputError.name}
                    helperText={inputError.name}
                    onChange={(e) => { onFormDataChange(["name"], [e.target.value]) }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Input
                    label="英文姓名:"
                    variant="standard"
                    value={formData.nameEng}
                    error={inputError.nameEng}
                    helperText={inputError.nameEng}
                    onChange={(e) => { onFormDataChange(["nameEng"], [e.target.value]) }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Input
                    label="地址:"
                    variant="standard"
                    value={formData.address}
                    error={inputError.address}
                    helperText={inputError.address}
                    onChange={(e) => { onFormDataChange(["address"], [e.target.value]) }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Input
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
                <Grid item xs={12}>
                  <FilePicker
                    disabled={false}
                    title='檔案'
                    file={formData.clockInContactFiles ? formData.clockInContactFiles : []}
                    maxSize={200000}
                    onSelected={(e) => {
                      let clockInContactFiles = formData.clockInContactFiles?.map(e=>e)??[];
                      clockInContactFiles = clockInContactFiles.concat(e);
                      let _uploadFiles = uploadFiles.map(e=>e);
                      _uploadFiles.push(e);
                      setUploadFiles(uploadFiles.concat(e));
                      onFormDataChange(['clockInContactFiles'], [clockInContactFiles]);
                    }}
                    onRender={(file, index, images) => {
                      return (
                        <File
                          key={index} 
                          file={file} 
                          fileUrl={file.clockInContactFileUrl} 
                          isTempFile={file.clockInContactFileUrl ? false :true}
                          onItemClick={(e)=>{
                            window.open(e.clockInContactFileUrl??e.url, "_blank")
                          }}
                          onRemoveItemClick={() => {
                            let clockInContactFiles = formData.clockInContactFiles.filter(e=> e!==file)
                            let delList = formData.deleteFile?.map(e=>e) || [];
                            if(file.id) delList.push(file.id);
                            onFormDataChange(['deleteFile', 'clockInContactFiles'], [delList, clockInContactFiles]);
                            setUploadFiles(uploadFiles.filter(e=> e!==file));
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