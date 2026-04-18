import { Card, Divider, Grid, MenuItem, Typography } from "@mui/material";
import { InfoCard } from "../InfoCard";
import Input from "../Input";
import Select from "../Select";
import language from "../../localization/language";
import { OptionsContext } from "../../contexts/OptionsContextProvider";
import { useCallback, useContext } from "react";
import { ClientContractSelectItem, ClientSelectItem } from "../client/ClientInfo";
import { MultipleSelectChip } from "../MultiSelect";
import UserSelect, { MultiUserSelect } from "../UserSelect";

export const ProjectInfoForm = function ({ onFormDataChange, inputError, ...props }) {

  const [optionsContext, optionsContextDispatch, {
    projectStautsOptions, 
    projectSpotlightOptions, 
    projectTypeOptions, 
    clientOptions,
    clientContactOptions,
    projectHashtagOptions
  }] = useContext(OptionsContext);

  let yearsList = [];
  const currentYear = new Date().getFullYear();
  for (let i = currentYear - 50; i <= currentYear + 50; i++) {
    yearsList.push({ value: i, label: i});
  }

  const YearSelect = () => { 
    return (
      <Select
      sx={{ width: '120px' }}
      variant="standard"
      label={"*年份:"}
      labelId="year"
      value={props.year}
      error={inputError.year}
      onChange={(e) => { onFormDataChange(["year"], [e.target.value]) }}
    >
      {yearsList.map((item, index) => <MenuItem key={index} value={item.value}>{item.label}</MenuItem>)}
    </Select>
    )
  }

  const StatusSelect = () => {
    return (
      <Select
      sx={{ width: '150px' }}
      variant="standard"
      label={"*狀態:"}
      labelId="statusId"
      value={props.statusId}
      error={inputError.statusId}
      onChange={(e) => { onFormDataChange(["statusId"], [e.target.value]) }}
    >
      {projectStautsOptions.map((item, index) => <MenuItem key={index} value={item.value}>{item.label}</MenuItem>)}
    </Select>
    )
  }

  const SpotlightSelect = () => {
    return (
      <Select
        sx={{ width: '50px' }}
        variant="standard"
        label={"顏色:"}
        labelId="spotlight"
        value={props.spotlight}
        error={inputError.spotlight}
        onChange={(e) => { onFormDataChange(["spotlight"], [e.target.value]) }}
      >
        {projectSpotlightOptions.map((item, index) => <MenuItem key={index} value={item.label} sx={{ padding: 1 }}>
          <div className='spotlight-color' style={{ backgroundColor: item.label, width: 50, height: 30, padding: 0 }}></div>
        </MenuItem>)}
      </Select>
    )
  }

  const TypeSelect = () => { 
    return (
      <Select
        sx={{ minWidth: 200 }}
        variant="standard"
        label={"*工程類型:"}
        labelId="typeId"
        value={props.typeId}
        error={inputError.typeId}
        onChange={(e) => { onFormDataChange(["typeId"], [e.target.value]) }}
      >
        {projectTypeOptions.map((item, index) => <MenuItem key={index} value={item.value}>{item.label}</MenuItem>)}
      </Select>
    )
  }

  let contacts = props.clientId ? clientOptions.find(e=> e.id == props.clientId).contacts.map(e=> ({...e, value: e.id})) : clientContactOptions;

  const ClientSelect = () => {
    return (
      <Select
        variant="standard"
        label={"客戶:"}
        labelId="clientId"
        value={props.clientId}
        error={inputError.clientId}
        onChange={(e) => { onFormDataChange(["clientId", "contactId"], [e.target.value, null]) }}
        onClear={() => { onFormDataChange(["clientId", "contactId"], [null, null]) }}
      >
        {clientOptions.map((item, index) => <MenuItem sx={{ borderBottomWidth: 1, borderColor: 'grey', borderStyle: 'groove' }} key={index} value={item.value}><div style={{ width: '100%', padding: 1 }}>
          {<ClientSelectItem {...item} />}
        </div></MenuItem>)}
      </Select>
    )
  }
  
  const ContactSelect = () => {
    return (
      <Select
        variant="standard"
        label={"聯絡人:"}
        labelId="clientId"
        value={props.contactId}
        error={inputError.contactId}
        onChange={(e) => { 
          console.log("props.contactId", e.target.value)
          onFormDataChange(["contactId"], [e.target.value])
         }}
        onClear={() => { onFormDataChange(["contactId"], [null]) }}
      >
        {
          (() => contacts.map((item, index) => <MenuItem sx={{ borderBottomWidth: 1, borderColor: 'grey', borderStyle: 'groove' }} key={item.id} value={item.value}><div style={{ width: '100%', padding: 1 }}>
            {<ClientSelectItem {...item} />}
          </div></MenuItem>))()
        }
      </Select>
    )
  }

  const HashtagSelect = () => {
    return (
      <MultipleSelectChip
      variant="standard"
      labelId="hashtags"
      items={projectHashtagOptions ?? []}
      onRender={(item, index) => <MenuItem value={item.value}>{item.label}</MenuItem>}
      value={props.hashtags??[]}
      error={inputError.hashtags}
      onChange={(e) => { onFormDataChange(["hashtags"], [e]) }} />
    )
  }

  return (
    <>
      <InfoCard
        title={""}
      >
        <Grid container spacing={2} padding={1}>
          <Typography variant="body2" sx={{ marginBottom: 1, fontWeight: 'bold', fontSize: 18 }}>
            專案
          </Typography>
          <Grid item xs={12}>
            <Input
              label="*專案名稱:"
              variant="standard"
              value={props.code}
              error={inputError.code}
              helperText={inputError.code}
              onChange={(e) => { onFormDataChange(["code"], [e.target.value]) }}
            />
          </Grid>
          <Grid item xs={'auto'}>
            <YearSelect />
         </Grid>
          <Grid item xs={'auto'}>
            <StatusSelect />
          </Grid>
          <Grid item xs={'auto'}>
            <SpotlightSelect />
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
          <Typography variant="body2" sx={{ marginTop: 3, fontWeight: 'bold', fontSize: 18 }}>
            工程
          </Typography>
          <Grid item xs={12}>
            <Input
              label="施工地點:"
              variant="standard"
              value={props.address}
              error={inputError.address}
              helperText={inputError.address}
              onChange={(e) => { onFormDataChange(["address"], [e.target.value]) }}
            />
          </Grid>
          <Grid item xs={"auto"}>
           <TypeSelect />
          </Grid>
          <Grid item xs={"auto"}>
            <div style={{width: 150}}>
            <Input
              type="date"
              label="*施工日期(開始):"
              variant="standard"
              value={props.start}
              error={inputError.start}
              helperText={inputError.start}
              onChange={(e) => { onFormDataChange(["start"], [e.target.value]) }}
            />
            </div>
          </Grid>
          <Grid item xs={"auto"}>
            <div style={{ width: 150 }}>
              <Input
                type="date"
                label="*施工日期(結束):"
                variant="standard"
                value={props.end}
                error={inputError.end}
                helperText={inputError.end}
                onChange={(e) => { onFormDataChange(["end"], [e.target.value]) }}
              />
            </div>
          </Grid>
          <Grid item xs={12}></Grid>
          <Typography variant="body2" sx={{ marginTop: 3, fontWeight: 'bold', fontSize: 18 }}>
            標籤
          </Typography>
          <Grid item xs={12}>
            <HashtagSelect />
          </Grid>
          {/* <Typography variant="body2" sx={{ marginTop: 3, fontWeight: 'bold', fontSize: 18 }}>
            客戶
          </Typography>
          <Grid item xs={12}>
            <ClientSelect />
          </Grid>
          <Grid item xs={12}>
            <ContactSelect />
          </Grid> */}
        </Grid>
      </InfoCard>
    </>
  );
}

export const MemberForm = function ({ onFormDataChange, inputError, ...props }) {

  const [optionsContext, optionsContextDispatch, {
    projectStautsOptions, 
    projectSpotlightOptions, 
    projectTypeOptions, 
    clientOptions,
    clientContactOptions,
    projectHashtagOptions
  }] = useContext(OptionsContext);

  let yearsList = [];
  const currentYear = new Date().getFullYear();
  for (let i = currentYear - 50; i <= currentYear + 50; i++) {
    yearsList.push({ value: i, label: i});
  }

  let contacts = props.clientId ? clientOptions.find(e=> e.id == props.clientId).contacts.map(e=> ({...e, value: e.id})) : clientContactOptions;

  const ClientSelect = () => {
    return (
      <Select
        variant="standard"
        label={"客戶:"}
        labelId="clientId"
        value={props.clientId}
        error={inputError.clientId}
        onChange={(e) => { onFormDataChange(["clientId", "contactId"], [e.target.value, null]) }}
        onClear={() => { onFormDataChange(["clientId", "contactId"], [null, null]) }}
      >
        {clientOptions.map((item, index) => <MenuItem sx={{ borderBottomWidth: 1, borderColor: 'grey', borderStyle: 'groove' }} key={index} value={item.value}><div style={{ width: '100%', padding: 1 }}>
          {<ClientSelectItem {...item} />}
        </div></MenuItem>)}
      </Select>
    )
  }
  
  const ContactSelect = () => {
    return (
      <Select
        variant="standard"
        label={"聯絡人:"}
        labelId="clientId"
        value={props.contactId}
        error={inputError.contactId}
        onChange={(e) => { 
          console.log("props.contactId", e.target.value)
          onFormDataChange(["contactId"], [e.target.value])
         }}
        onClear={() => { onFormDataChange(["contactId"], [null]) }}
      >
        {
          (() => contacts.map((item, index) => <MenuItem sx={{ borderBottomWidth: 1, borderColor: 'grey', borderStyle: 'groove' }} key={item.id} value={item.value}><div style={{ width: '100%', padding: 1 }}>
            {<ClientSelectItem {...item} />}
          </div></MenuItem>))()
        }
      </Select>
    )
  }

  const PicSelect = () => {
    return (
      <UserSelect
       label={"P.I.C:"}
       value={props.managerId}
       inputError={inputError.managerId}
       onChange={(e) => { onFormDataChange(["managerId"], [e.target.value]) }}
       />
    )
  }

  const AssigneeSelect = useCallback(({value}) => {
    return (
      <MultiUserSelect
      label={"員工:"} 
      value={value??[]}
      onChange={(e) => { onFormDataChange(["assginess"], [e]) }}
      />
    )
  }, [props.managerId, props.id])

  return (
    <>
      <InfoCard
        title={""}
      >
        <Grid container spacing={2} padding={1}>
          <Typography variant="body2" sx={{ marginBottom: 1, fontWeight: 'bold', fontSize: 18 }}>
            成員
          </Typography>
          <Grid item xs={12}>
            <PicSelect />
          </Grid>
          <Grid item xs={12}>
            <AssigneeSelect value={props.assginess}/>
          </Grid>
        </Grid>
      </InfoCard>
    </>
  );
}

export const ClientForm = function ({ onFormDataChange, inputError, ...props }) {

  const [optionsContext, optionsContextDispatch, {
    projectStautsOptions, 
    projectSpotlightOptions, 
    projectTypeOptions, 
    clientOptions,
    clientContactOptions,
    projectHashtagOptions
  }] = useContext(OptionsContext);

  let contacts = props.clientId ? clientOptions.find(e=> e.id == props.clientId).contacts.map(e=> ({...e, value: e.id})) : clientContactOptions;

  const ClientSelect = () => {
    return (
      <Select
        variant="standard"
        label={"*客戶:"}
        labelId="clientId"
        value={props.clientId}
        error={inputError.clientId}
        onChange={(e) => { onFormDataChange(["clientId", "contactId"], [e.target.value, null]) }}
        onClear={() => { onFormDataChange(["clientId", "contactId"], [null, null]) }}
        items={clientOptions}
      >
        {clientOptions.map((item, index) => <MenuItem sx={{ borderBottomWidth: 1, borderColor: 'grey', borderStyle: 'groove' }} key={index} value={item.value}><div style={{ width: '100%', padding: 1 }}>
          {<ClientSelectItem {...item} />}
        </div></MenuItem>)}
      </Select>
    )
  }
  
  const ContactSelect = () => {
    return (
      <Select
        disabled={!props.clientId}
        variant="standard"
        label={"聯絡人:"}
        labelId="contactId"
        value={props.contactId}
        error={inputError.contactId}
        onChange={(e) => { 
          onFormDataChange(["contactId"], [e.target.value])
         }}
        onClear={() => { onFormDataChange(["contactId"], [null]) }}
        items={contacts}
      >
        {
          (() => contacts.map((item, index) => <MenuItem sx={{ borderBottomWidth: 1, borderColor: 'grey', borderStyle: 'groove' }} key={item.id} value={item.value}><div style={{ width: '100%', padding: 1 }}>
            {<ClientContractSelectItem {...item} />}
          </div></MenuItem>))()
        }
      </Select>
    )
  }

  return (
    <>
      <Grid container spacing={2} padding={0}>
        <Grid item xs={12}>
          <ClientSelect />
        </Grid>
        <Grid item xs={12}>
          <ContactSelect />
        </Grid>
      </Grid>
    </>
  );
}