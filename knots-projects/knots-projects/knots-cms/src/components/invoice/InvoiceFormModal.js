import * as React from 'react';
import { Button, Divider, Grid, MenuItem, Typography } from '@mui/material';
import { useSnackbar } from 'notistack';
import EditFormModal from '../EditFormModal';
import { useMutation } from '@apollo/client';
import BackdropLoading from '../BackdropLoading';
import language from '../../localization/language';
import { InfoCard } from '../InfoCard';
import { PROJECT_INVOICES_CREATE, PROJECT_INVOICES_UPDATE } from '../../apollo/mutations';
import Input from '../Input';
import ProjectSelect from '../ProjectSelect';
import Select from '../Select';
import moment from 'moment-timezone';

const companyInfo = {
  companyAddr: "Unit A, 25/F, Block 3, Golden Dragon Industrial Centre, 172-180 Tai Lin Pai Road, Kwai Chung, N.T., H.K.",
  companyTel: "+852 2368 5300",
  companyFax: "3016 9980",
  companyEmail: "admin@knotsltd.com"
}

const defaultData = {
  date: moment().format('YYYY-MM-DD'),
  financialYear: `${moment().year()}-${moment().year() + 1}`,
  paid: moment().format('YYYY-MM-DD')
}

export default function ({ open, onCloseClick, onCompleted, ...props }) {

  const { enqueueSnackbar } = useSnackbar();
  const [formData, setFormData] = React.useState({ ...defaultData, ...props.data });
  const [inputError, setInputError] = React.useState({});
  const [formDataCreateMutate, createStatus] = useMutation(PROJECT_INVOICES_CREATE);
  const [formDataUpdateMutate, updateStatus] = useMutation(PROJECT_INVOICES_UPDATE);
  const mode = props.mode == 'create' ? '新增' : '編輯';
  
  const _onCloseClick= () => {
    setFormData({})
    setInputError({});
    onCloseClick();
  }

  const onFormDataChange = (key, value) => {
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
    for (let i of ["date", "to"]) {
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
        data: { 
          ...formData,
          ...companyInfo
        }
      },
      onCompleted: (res) => {
        if (res.termsCreate.userErrors.length) {
          res.termsCreate.userErrors.map(e => {
            enqueueSnackbar(e.message, {
              variant: 'error'
            })
          })
        }
        else if (res.termsCreate.terms) {
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
          nameCht:formData.nameCht,
          nameEn: formData.nameEn,
          descCht:formData.descCht,
          descEn: formData.descEn,
          typeId: formData.typeId
         }
      },
      onCompleted: (res) => {
        if (res.termsUpdate.userErrors.length) {
          res.termsUpdate.userErrors.map(e => {
            enqueueSnackbar(e.message, {
              variant: 'error'
            })
          })
        }
        else if (res.termsUpdate.terms) {
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

  const StatusSelect = () => {
    return (
      <Select
        loading={false}
        label="*狀態:"
        variant="standard"
        sx={{ minWidth: '80px' }}
        items={[
          { label: '無效', value: false },
          { label: '有效', value: true },
        ]}
        render={(row, i) => <MenuItem key={i} value={row.value}>{row.label}</MenuItem>}
        value={formData.status}
        error={inputError.status}
        helperText={inputError.status}
        onChange={(e) => { onFormDataChange(["status"], [e.target.value]) }}
      />
    )
  }

  const defaultCompanyInfo = () => { 
    onFormDataChange(["companyAddr", "companyTel", "companyFax", "companyEmail"],
                     ["Unit A, 25/F, Block 3, Golden Dragon Industrial Centre, 172-180 Tai Lin Pai Road, Kwai Chung, N.T., H.K.",
                      "+852 2368 5300",
                       "3016 9980", 
                       "admin@knotsltd.com"])
  }

  React.useEffect(() => {
    if(props.mode == 'update') {
      setFormData({
        ...defaultData,
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
        title={`${mode}發票單`}
        onConfirmClick={_onConfirmClick}
        onCloseClick={_onCloseClick}
      >
        <Grid container spacing={2} padding={1}>
          <Grid item sm={12} padding={0}>
            <InfoCard
              title={""}
            >
              <Grid container spacing={2} padding={1}>
                <Typography variant="body2" sx={{ marginBottom: 1, fontWeight: 'bold', fontSize: 18, width: '100%' }}>
                  發票單
                </Typography>
                <Grid item xs={12}>
                  <Input
                    label="*To:"
                    variant="standard"
                    value={formData.to}
                    error={inputError.to}
                    helperText={inputError.to}
                    onChange={(e) => { onFormDataChange(["to"], [e.target.value]) }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Input
                    label="Attn.:"
                    variant="standard"
                    value={formData.attn}
                    error={inputError.attn}
                    helperText={inputError.attn}
                    onChange={(e) => { onFormDataChange(["attn"], [e.target.value]) }}
                  />
                </Grid>
                <Grid item xs={12}>
                 <Input
                    label="Addr.:"
                    variant="standard"
                    value={formData.Add}
                    error={inputError.Add}
                    helperText={inputError.Add}
                    onChange={(e) => { onFormDataChange(["Add"], [e.target.value]) }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Input
                    type="email"
                    label="Email:"
                    variant="standard"
                    value={formData.Email}
                    error={inputError.Email}
                    helperText={inputError.Email}
                    onChange={(e) => { onFormDataChange(["Email"], [e.target.value]) }}
                  />
                </Grid>
                <Grid item xs={12} sm={'auto'}>
                 <Input
                    type="date"
                    label="*發出日期:"
                    variant="standard"
                    value={formData.date}
                    error={inputError.date}
                    helperText={inputError.date}
                    onChange={(e) => { onFormDataChange(["date", "year"], [e.target.value, moment(e.target.value, 'YYYY').format('YYYY')]) }}
                  />
                </Grid>
                <Grid item xs={12} sm={'auto'}>
                 <Input
                    type="date"
                    label="收款日期:"
                    variant="standard"
                    value={formData.paid}
                    error={inputError.paid}
                    helperText={inputError.paid}
                    onChange={(e) => { onFormDataChange(["paid"], [e.target.value]) }}
                  />
                </Grid>
                <Grid item xs={12} sm={'auto'}>
                  <StatusSelect/>
                </Grid>
                <Typography variant="body2" sx={{ marginBottom: 1, marginTop: 3, fontWeight: 'bold', fontSize: 18, width: '100%' }}>
                  內容
                </Typography>
                <Grid item xs={12}>
                  <ProjectSelect
                    label="工程專案:"
                    variant="standard"
                    selectBy={'projectId'}
                    value={formData.projecId}
                    error={inputError.projecId}
                    helperText={inputError.projecId}
                    onClear={(e) => { onFormDataChange(["projecId"], [null]) }}
                    onChange={(e) => { onFormDataChange(["projecId"], [e.target.value]) }}
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