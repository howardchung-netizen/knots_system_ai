import { Grid } from "@mui/material";
import Input from "../Input";
import TelInput from "../TelInput";
import ContactSelect from "../ClientContactSelect";
import { telCodes } from "../../constants/InputOptions";
import ClientContactMultiSelect from "../ClientContactMultiSelect";
import ClientContactSelect from "../ClientContactSelect";

export const ClientBaseInput = ({ onFormDataChange, inputError, ...props }) => {
  return (
    <>
      <Grid item xs={12}>
        <Input
          label="名稱(中文):"
          variant="standard"
          value={props.companyCht}
          error={inputError.companyCht}
          helperText={inputError.companyCht}
          onChange={(e) => { onFormDataChange(["companyCht"], [e.target.value]) }}
        />
      </Grid>
      <Grid item xs={12}>
        <Input
          label="名稱(英文):"
          variant="standard"
          value={props.companyEn}
          error={inputError.companyEn}
          helperText={inputError.companyEn}
          onChange={(e) => { onFormDataChange(["companyEn"], [e.target.value]) }}
        />
      </Grid>
      <Grid item xs={12}>
        <Input
          label="客戶代號:"
          variant="standard"
          value={props.prefix}
          error={inputError.prefix}
          helperText={inputError.prefix}
          onChange={(e) => { onFormDataChange(["prefix"], [e.target.value]) }}
        />
      </Grid>
      <Grid item xs={12}>
        <Input
          label="地址:"
          variant="standard"
          value={props.address}
          error={inputError.address}
          helperText={inputError.address}
          onChange={(e) => { onFormDataChange(["address"], [e.target.value]) }}
        /> 
      </Grid>
      <Grid item xs={12}>
        <Input
          label="電郵:"
          variant="standard"
          value={props.email}
          error={inputError.email}
          helperText={inputError.email}
          onChange={(e) => { onFormDataChange(["email"], [e.target.value]) }}
        />
      </Grid>
      <Grid item xs={12} sm={6}> 
        <TelInput
          label="電話:"
          codes={telCodes}
          code={props.telCode}
          number={props.tel}
          onCodeChange={(code) => { 
            console.log("code", code)
            onFormDataChange(["telCode"], [code])
           }}
          onTelChange={(tel) => { onFormDataChange(["tel"], [tel]) }}
          error={inputError.tel}
          helperText={inputError.tel}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TelInput 
          label="傳真:"
          codes={telCodes}
          code={props.faxCode}
          number={props.fax}
          onCodeChange={(code) => { onFormDataChange(["faxCode"], [code]) }}
          onTelChange={(fax) => { onFormDataChange(["fax"], [fax]) }}
          error={inputError.fax}
          helperText={inputError.fax}
        />
      </Grid>
      <Grid item xs={12}>
      </Grid>
      <Grid item xs={12} sm={6}>
        <TelInput 
          label="Whatsapp:"
          codes={telCodes}
          code={props.whatsappCode}
          number={props.whatsapp}
          onCodeChange={(code) => { onFormDataChange(["whatsappCode"], [code]) }}
          onTelChange={(whatsapp) => { onFormDataChange(["whatsapp"], [whatsapp]) }}
          error={inputError.whatsapp}
          helperText={inputError.whatsapp}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TelInput 
          label="Wechat:"
          codes={telCodes}
          code={props.wechatCode}
          number={props.wechat}
          onCodeChange={(code) => { onFormDataChange(["wechatCode"], [code]) }}
          onTelChange={(wechat) => { onFormDataChange(["wechat"], [wechat]) }}
          error={inputError.wechat}
          helperText={inputError.wechat}
        />
      </Grid>
      <Grid item xs={12}>
        <Input
          label="備註:"
          variant="outlined"
          value={props.remark}
          error={inputError.remark}
          helperText={inputError.remark}
          maxRows={4}
          minRows={4}
          multiline
          onChange={(e) => { onFormDataChange(["remark"], [e.target.value]) }}
        />
      </Grid>
    </>
  )
}

export const ClientContactInput = ({mainContactId, onFormDataChange, inputError, ...props }) => {
  return (
    <>
      <Grid item xs={12}>
        <ClientContactMultiSelect
          onFormDataChange={(e, original) => { 
            onFormDataChange(["contacts"], [original.map(e=> ({...e, isMainContact: e.id == mainContactId? true: false}))])
           }}
          value={props.contacts?.map(e=>e.id)??[]}
        />
      </Grid>
    </>
  )
}

export const MainContactCheckList = ({ onCheck, onFormDataChange, inputError, ...props }) => {

  return (
    <>
      {props.contacts?.length > 0 && <Grid item xs={12}>
        <table className="table" style={{width: '100%'}}>
          <thead align="left">
            <tr>
              <th style={{width: 50}}>主要</th>
              <th>名稱</th>
              <th>電話</th>
              <th>Whatsapp</th>
              <th>Wechat</th>
            </tr>
          </thead>
          <tbody>
            {
              props.contacts?.map((contact, index) => {
                return (
                  <tr key={contact.id}>
                    <td>
                      <input
                        style={{ width: '25px', height: '25px', cursor: 'pointer' }}
                        type="checkbox"
                        checked={props.contacts.find(e =>e.id == contact.id)?.isMainContact ?? false}
                        onChange={(e) => {
                          let contacts = props.contacts.map(x => x.id == contact.id ? { ...x, isMainContact: e.target.checked } : { ...x, isMainContact: false })
                          if(onCheck)onCheck(contact.id)
                          onFormDataChange(["contacts"], [contacts])
                        }}
                      />
                    </td>
                    <td>
                      {contact.nameCht || contact.nameEn}
                    </td>
                    <td>
                      {contact.tel ? contact.telCode +' '+ contact.tel: null}
                    </td>
                    <td>
                      {contact.whatsapp ? contact.whatsappCode +' '+ contact.whatsapp: null}
                    </td>
                    <td>
                      {contact.wechat ? contact.wechatCode +' '+ contact.wechat: null}
                    </td>
                  </tr>
                )
              }
              )
            }
          </tbody>
        </table>
      </Grid>}
    </>
  )
}
