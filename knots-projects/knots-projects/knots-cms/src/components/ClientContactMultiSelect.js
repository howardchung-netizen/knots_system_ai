import { gql, useQuery } from "@apollo/client";
import { CLIENT_CONTACTS_QUERY } from "../apollo/queries";
import Select from "./Select";
import { FaMobileAlt, FaUserCircle, FaWeixin } from "react-icons/fa";
import { AiOutlineMail, AiOutlineWhatsApp } from "react-icons/ai";
import { baseClientContactFragment } from "../apollo/baseFragment";
import { Checkbox, MenuItem } from "@mui/material";
import { MultipleSelectChip } from "./MultiSelect";

export default function (props) { 
	const {data, loading, error} = useQuery(gql`${CLIENT_CONTACTS_QUERY} ${baseClientContactFragment}`, 
	{
		fetchPolicy: 'network-only',
		variables: {
			first: 9999,
			deleted: false
		}
  })
	const dataRow = data?.clientContacts?.edges?.map(({node}) => {
		let label = "";
		if(node.nameCht) label = node.nameCht;
		else if(node.nameEn) label = node.nameEn;
		else if(node.tel) label = node.tel;
		else if(node.whatsapp) label = node.whatsapp;
		else if(node.wechat) label = node.wechat;
		else if(node.email) label = node.email;
    else label = node.id;
		return {...node,
      searchValue: node.nameCht + node.nameEn + node.tel + node.whatsapp + node.wechat + node.email,
			value: node.id,
			label: label
		}
	}) || [];
	
	return (
		<MultipleSelectChip
			label="聯絡人:"
			variant="standard"
			// loading={loading}
			error={error}
			searchable
			items={dataRow}
			value={props.value??[]}
			onRender={(row, checked) => 
				<MenuItem key={row.id} sx={{borderWidth: 1, borderStyle: 'groove'}} value={row.id}>
					<Checkbox checked={props.value?.includes(row.id)} />
					<div style={{ padding: 3 }}>
					 {(row.nameCht || row.nameEn) && <div className="flex-cell-div"><FaUserCircle size={17} />  &nbsp;{row.nameCht || row.nameEn}</div>}
					 {row.tel && <div className="flex-cell-div"><FaMobileAlt size={17} /> &nbsp;{row.telCode + " " + row.tel}</div>}
					 {
						!row.nameCht && !row.nameEn && !row.tel && row.whatsapp && <div className="flex-cell-div"><AiOutlineWhatsApp size={17} /> &nbsp;{row.whatsappCode + " " + row.whatsapp}</div>
					 }
					 {
						!row.nameCht && !row.nameEn && !row.tel && !row.whatsapp && row.wechat && <div className="flex-cell-div"><FaWeixin size={17} /> &nbsp;{row.wechatCode + " " + row.wechat}</div>
					 }
					 {
						!row.nameCht && !row.nameEn && !row.tel && !row.whatsapp && !row.wechat && row.email && <div className="flex-cell-div"><AiOutlineMail size={17} /> &nbsp;{row.email}</div>
					 }
					</div>
				</MenuItem>
			}
			onChange={(e)=>{
				//filter out the original data that id is inclues value
				let original = dataRow.filter(row => e.includes(row.id));
				if(props.onFormDataChange)props.onFormDataChange(e, original)
			}}
		>
		</MultipleSelectChip>
	)
}