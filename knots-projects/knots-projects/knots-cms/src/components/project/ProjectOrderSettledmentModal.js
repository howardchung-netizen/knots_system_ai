import * as React from 'react';
import { Grid, MenuItem, Typography, Button } from '@mui/material';
import { useSnackbar } from 'notistack';
import EditFormModal from '../EditFormModal';
import { useMutation } from '@apollo/client';
import BackdropLoading from '../BackdropLoading';
import language from '../../localization/language';
import { InfoCard, InfoRow } from '../InfoCard';
import { PROJECT_ORDER_CONFIRM_TRANSFER } from '../../apollo/mutations';
import Input from '../Input';
import { useNavigate } from 'react-router-dom';
import { OptionsContext } from '../../contexts/OptionsContextProvider';
import Select from '../Select';
import FilePicker, {File} from '../filePicker/FilePicker';
import { toMoney } from '../../utils';
import moment from 'moment';
import { gql } from '@apollo/client';

const OCR_RECEIPT = gql`
    mutation ocrReceipt($data: AiOcrReceiptInput!) {
      ocrReceipt(data: $data) {
        success
        amount
        desc
        date
        supplier
        error
      }
    }
`;

const REACT_APP_DEFAULT_COMPANY_ID = process.env.REACT_APP_DEFAULT_COMPANY_ID;

const defaultData = {
  transactionDate: moment().format('YYYY-MM-DD'),
  companyId: REACT_APP_DEFAULT_COMPANY_ID,
  financialYear: `${new Date().getFullYear()}-${new Date().getFullYear()+1}`,
}

const FinancialYearList = ()=>{
  let startYear = new Date().getFullYear() - 5;
  let list = [];
  for(let i = 0; i < 10; i++){
    list.push({
      label: `${startYear+i}-${startYear+i+1}`,
      value: `${startYear+i}-${startYear+i+1}`
    })
  }
  return list;
}
export default function ({ open, onCloseClick, onCompleted, ...props }) {
	
  const [optionsContext, optionsContextDispatch, {bookKeepingCompanyOptions, bookKeepingAccountOptions, bookKeepingAccountTypeOptions}] = React.useContext(OptionsContext);
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [formData, setFormData] = React.useState({...defaultData, ...props.data});
  const [inputError, setInputError] = React.useState({});
  const [formDataCreateMutate, createStatus] = useMutation(PROJECT_ORDER_CONFIRM_TRANSFER);
  const [ocrMutate, { loading: ocrLoading }] = useMutation(OCR_RECEIPT);
  const mode = '員工報銷單入帳';
  const disabled = formData.settlement;
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
    let checkList = [];
    checkList = ["categoryAccountId", "financialYear", "transactionDate", "companyId"];
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
      alert("已核實的報銷單無法編輯!");
      return
    }
    if (!props.files || props.files.length === 0) {
      enqueueSnackbar('硬性規定：結清前必須上傳憑證單據檔案！', { variant: 'error' });
      return;
    }
    if (checkInputError()) {
      enqueueSnackbar('請檢查輸入', {
        variant: 'error'
      })
      return;
    }

    formDataCreateMutate({
      variables: {
        data: {
          id: formData.id,
          categoryAccountId: formData.categoryAccountId,
          bankAccountId: formData.bankAccountId,
          transactionDate: formData.transactionDate,
          financialYearStart: parseInt(formData.financialYear.split('-')[0]),
          financialYearEnd: parseInt(formData.financialYear.split('-')[1]),
          companyId: formData.companyId,
          transactionDesc: formData.desc,
        }
      },
      onCompleted: (res) => {
        if (res.projectOrderConfirmTransfer.userErrors.length) {
          res.projectOrderConfirmTransfer.userErrors.map(e => {
            enqueueSnackbar(e.message, {
              variant: 'error'
            })
          })
        }
        else if (res.projectOrderConfirmTransfer.projectOrder) {
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
  }

  const handleOcrClick = async () => {
    if (!props.files || props.files.length === 0) {
      enqueueSnackbar("請先上傳憑證單據", { variant: "warning" });
      return;
    }
    const targetFile = props.files[0];
    if (targetFile.fileMimeType === 'application/pdf') {
      alert("目前 OCR 僅支援檢測圖片檔案 (JPG/PNG/HEIC)");
      return;
    }
    try {
      let base64 = "";
      if (targetFile.fileUrl) {
         let urlToFetch = targetFile.fileUrl;
         if (targetFile.fileMimeType === 'image/heic') {
             enqueueSnackbar("HEIC 轉換可能需要較長時間", { variant: 'info' });
         }
         const res = await fetch(urlToFetch);
         const blob = await res.blob();
         base64 = await new Promise((resolve) => {
           const reader = new FileReader();
           reader.onloadend = () => resolve(reader.result);
           reader.readAsDataURL(blob);
         });
      }

      const { data } = await ocrMutate({ variables: { data: { imageUrl: base64 } } });
      if (data.ocrReceipt.success) {
         const { desc, date, supplier } = data.ocrReceipt;
         let combinedDesc = "";
         if (supplier && supplier !== 'null') combinedDesc += `[${supplier}] `;
         if (desc && desc !== 'null') combinedDesc += desc;
         
         const payload = {};
         if (combinedDesc.trim() !== "") payload.desc = combinedDesc;
         if (date && date !== 'null' && moment(date).isValid()) payload.transactionDate = moment(date).format('YYYY-MM-DD');
         
         onFormDataChange(Object.keys(payload), Object.values(payload));
         enqueueSnackbar('🤖 OCR 解析成功，已自動回填', { variant: 'success'});
      } else {
         alert("OCR 失敗: " + data.ocrReceipt.error);
      }
    } catch (e) {
      enqueueSnackbar("OCR 服務異常: " + e.message, { variant: 'error' });
    }
  }

  const CategoryAccountSelect = () => {
    return (
      <Select
        disabled={disabled}
        loading={false}
        label="*費用類別:"
        variant="standard"
        items={bookKeepingAccountOptions.filter(e=>e.accountType.name == '費用' && !e.isPlaceholder)??[]}
        render={(row, i) => <MenuItem key={i} value={row.value}>{row.accountType.name}:{row.label}</MenuItem>}
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
        label="*付款帳號:"
        variant="standard"
        items={bookKeepingAccountOptions.filter(e=>e.accountType.name == '資產' && !e.isPlaceholder)??[]}
        render={(row, i) => <MenuItem key={i} value={row.value}>{row.accountType.name}:{row.label}</MenuItem>}
        value={formData.bankAccountId}
        error={inputError.bankAccountId}
        helperText={inputError.bankAccountId}
        onChange={(e) => { onFormDataChange(["bankAccountId"], [e.target.value]) }}
      />
    )
  }
  
  const FinancialYearSelect = () => { 
    return (
      <Select
        disabled={disabled}
        loading={false}
        label="*財政年度:"
        variant="standard"
        items={FinancialYearList()}
        render={(row, i) => <MenuItem key={i} value={row.value}>{row.label}</MenuItem>}
        value={formData.financialYear}
        error={inputError.financialYear}
        helperText={inputError.financialYear}
        onChange={(e) => { onFormDataChange(["financialYear"], [e.target.value]) }}
      />
    )
  }

  const CompaniesSelect = () => {
    return (
      <Select
        disabled={disabled}
        loading={false}
        label="*記帳公司:"
        variant="standard"
        items={bookKeepingCompanyOptions??[]}
        render={(row, i) => <MenuItem key={i} value={row.value}>{row.label}</MenuItem>}
        value={formData.companyId}
        error={inputError.companyId}
        helperText={inputError.companyId}
        onChange={(e) => { onFormDataChange(["companyId"], [e.target.value]) }}
      />
    )
  }

  React.useEffect(() => {
      setFormData({...defaultData, ...props.data})
  }, [props.data, props.mode, open])
  if(!open) return <></>
  return (
    <>
    {
      (createStatus.loading || ocrLoading) && <BackdropLoading/>
    }
      <EditFormModal
        open={open}
        title={`${mode}`}
        onConfirmClick={disabled ? null : _onConfirmClick}
        onCloseClick={_onCloseClick}
      >
        <Grid container spacing={1} padding={1}>
          <Grid item xs={12}>
            <InfoCard
              title={"訂單"}
            >
              <Grid item xs={12}>
                <InfoRow label={"訂單編號:"} value={formData.realId} flexDirection={'column'} />
                <InfoRow label={"工程:"} value={`${formData.project?.projectId+'-'}${formData.project?.code}`} flexDirection={'column'} />
                <InfoRow label={"Supplier:"} value={formData.supplier} flexDirection={'column'} />
                <InfoRow label={"現金付款:"} value={formData.cash ? '是' : ''} flexDirection={'column'} />
                <InfoRow label={"支票號碼:"} value={formData.cheque} flexDirection={'column'} />
                <InfoRow label={"金額:"} value={toMoney(formData.amount)} flexDirection={'column'} />
                <InfoRow label={"下單日期:"} value={formData.orderedDate} flexDirection={'column'} />
              </Grid>
            </InfoCard>
          </Grid>
          <Grid item xs={12}>
            <InfoCard
              title={"檔案"}
            >
              <Grid item xs={12}>
                <FilePicker
                  disabled={true}
                  file={props.files ? props.files : []}
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
                      />
                    )
                  }
                  }
                />
              </Grid>
            </InfoCard>
          </Grid>
          <Grid item xs={12}>
            <InfoCard
              title={""}
            >
              <Grid container spacing={2} padding={1}>
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                  <Typography variant="body2" sx={{ marginTop: 1, fontWeight: 'bold', fontSize: 18 }}>
                    入帳資料
                  </Typography>
                  {!disabled && (
                    <Button variant="outlined" color="secondary" onClick={handleOcrClick} sx={{ mt: 1 }}>
                      🤖 啟動 OCR 解析收據
                    </Button>
                  )}
                </div>
                <Grid item xs={12}>
                  <CategoryAccountSelect />
                </Grid>
                <Grid item xs={12}>
                  <BankAccountSelect />
                </Grid>
                <Grid item xs={12}>
                  <CompaniesSelect />
                </Grid>
                <Grid item xs={'auto'} sx={{ minWidth: 100, maxWidth: 100 }}>
                  <Input
                    disabled={disabled}
                    type="date"
                    label="*入帳日期:"
                    variant="standard"
                    value={formData.transactionDate}
                    error={inputError.transactionDate}
                    helperText={inputError.transactionDate}
                    onChange={(e) => { onFormDataChange(["transactionDate"], [e.target.value]) }}
                  />
                </Grid>
                <Grid item xs={'auto'} sx={{ minWidth: 100, maxWidth: 100 }}>
                  <FinancialYearSelect />
                </Grid>
                <Grid item xs={'auto'} sx={{ minWidth: 100, maxWidth: 100 }}>
                  <Input
                    label="金額:"
                    variant="standard"
                    value={toMoney(formData.amount)}
                    disabled
                    sx={{

                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Input
                    disabled={disabled}
                    label="*描述:"
                    variant="standard"
                    value={formData.desc}
                    error={inputError.desc}
                    helperText={inputError.desc}
                    onChange={(e) => {
                      onFormDataChange(["desc"], [e.target.value])
                    }}
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