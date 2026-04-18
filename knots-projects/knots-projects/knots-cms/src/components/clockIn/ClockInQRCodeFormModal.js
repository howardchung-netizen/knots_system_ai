import * as React from 'react';
import { Button, Grid, Typography } from '@mui/material';
import { useSnackbar } from 'notistack';
import { useMutation, useSubscription } from '@apollo/client';
import BackdropLoading from '../BackdropLoading';
import language from '../../localization/language';
import { InfoCard } from '../InfoCard';
import { CREATE_CLOCKIN_LOCATION, UPDATE_CLOCKIN } from '../../apollo/mutations';
import Input from '../Input';
import { useNavigate } from 'react-router-dom';
import { OptionsContext } from '../../contexts/OptionsContextProvider';
import ProjectSelect from '../ProjectSelect';
import EditFormModal from '../EditFormModal';
import { UserContext } from '../../contexts/UserContext';
import {QRCodeSVG} from 'qrcode.react';
import moment from 'moment';
import { ON_QRCODE_SCAN } from '../../apollo/subscriptions';

const REACT_APP_TODO_HTTP_ENDPOINT = process.env.REACT_APP_TODO_HTTP_ENDPOINT;

const updateQrCodeColor = (oldColor) => {
  const colors = [
    'black',
    '#e90000',
    '#0043cb',
    '#9e00c1',
    '#005503'
  ]
  // return 'darksalmon'
  let newColor = colors[Math.floor(Math.random() * colors.length)];
  if (newColor == oldColor) return updateQrCodeColor(oldColor);
  else return newColor;
}

export default function ({ open, onCloseClick, onCompleted, ...props }) {
	
  const [user, userDispatch] = React.useContext(UserContext);
  const [optionsContext, optionsContextDispatch, {quotationStautsIds}] = React.useContext(OptionsContext);
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [formData, setFormData] = React.useState({...props.data});
  const [inputError, setInputError] = React.useState({});
  const [qrCodeProps, setQRCodeProps] = React.useState(null);
  const [formDataCreateMutate, createStatus] = useMutation(CREATE_CLOCKIN_LOCATION);
  const [formDataUpdateMutate, updateStatus] = useMutation(UPDATE_CLOCKIN);
  const [location, setLocation] = React.useState({});
  const watchQRCode = useSubscription(ON_QRCODE_SCAN, {
    variables: {
      locationId: location.id
    },
    onSubscriptionData: ({subscriptionData: data}) =>{
      _onConfirmClick()
    }
  });
  const mode = props.mode == 'create' ? '新增' : '編輯';

  const _onCloseClick= () => {
    setFormData({})
    setInputError({});
    setQRCodeProps(null);
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
    for (let i of ["projectId"]) {
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
    if (props.mode == 'create') formDataCreateMutate({
      variables: {
        data: { 
          ...formData,
          staffId: user.info.id,
        }
      },
      onCompleted: (res) => {
        if (res.createClockInLocation.clockInLocation) {
          setLocation(res.createClockInLocation.clockInLocation)
          createQRCode(res.createClockInLocation.clockInLocation.nonce)
        }
        else if (res.createClockInLocation.userErrors.length) {
          res.createClockInLocation.userErrors.map(e => {
            enqueueSnackbar(e.message, {
              variant: 'error'
            })
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

  const createQRCode = (nonce) => {  
    setQRCodeProps({
      value: 'http://192.168.1.195:8003' + "/qrCode/" + nonce,
      fgColor: updateQrCodeColor(qrCodeProps?.fgColor??'black'),
      size: 250,
      createdAt: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
      qrCodeUpdateCounter: qrCodeProps?.qrCodeUpdateCounter ? qrCodeProps?.qrCodeUpdateCounter+1 : 1
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
        (createStatus.loading) && <BackdropLoading />
      }
      <EditFormModal
        open={open}
        title={`${mode}打卡QRCode`}
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
                  打卡QRCode
                </Typography>
                {
                  qrCodeProps === null && <>
                    <Grid item xs={12}>
                      <ProjectSelect
                      label="工程專案*:"
                      variant="standard"
                      value={formData.projectId}
                      error={inputError.projectId}
                      helperText={inputError.projectId}
                        onChange={(e) => { onFormDataChange(["projectId"], [e.target.value]) }}
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
                  </>
                }
                {
                  qrCodeProps && <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', flexDirection: 'column'}}>
                    <QRCodeSVG {...qrCodeProps} />
                    <div style={{marginTop: 15, marginBottom: 10}}>
                      {qrCodeProps.createdAt}
                    </div>
                    <Button variant='outlined' onClick={_onConfirmClick}>
                    {`更新(${qrCodeProps.qrCodeUpdateCounter})`}
                    </Button>
                  </div>
                }
              </Grid>
            </InfoCard>
          </Grid>
        </Grid>
      </EditFormModal>
    </>
  );

}