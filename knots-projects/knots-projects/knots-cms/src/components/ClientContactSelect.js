import { gql, useQuery } from "@apollo/client";
import { CLIENT_CONTACTS_QUERY } from "../apollo/queries";
import Select from "./Select";
import { FaMobileAlt, FaUserCircle, FaWeixin } from "react-icons/fa";
import { AiOutlineMail, AiOutlineWhatsApp } from "react-icons/ai";
import { baseClientContactFragment } from "../apollo/baseFragment";
import { MenuItem } from "@mui/material";

export default function (props) { 
	const {data, loading, error} = useQuery(gql`${CLIENT_CONTACTS_QUERY} ${baseClientContactFragment}`)
	const dataRow = data?.clientContacts?.edges?.map(({node}) => {
		return {...node,
      searchValue: node.nameCht + node.nameEn + node.tel + node.whatsapp + node.wechat + node.email,
			value: node.id
		}
	}) || [];

	return (
		<Select
			label="主要聯絡人"
			variant="standard"
			// loading={loading}
			error={error}
			searchable
			items={dataRow}
			render={row => 
				<MenuItem sx={{borderWidth: 1, borderStyle: 'groove'}} value={row.id}>
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
					{/* 
					<div style={{ "padding":"3px" }}>
					  <div className="flex-cell-div" style={{width:'20%'}}><FaUserCircle size={17} />  &nbsp;{row.nameCht ?? row.nameEn}</div>
					  <div className="flex-cell-div" style={{width:'20%'}}><FaMobileAlt size={17} /> &nbsp;{row.telCode + " " + row.tel}</div>
					  <div className="flex-cell-div" style={{width:'20%'}}><AiOutlineWhatsApp size={17} /> &nbsp;{row.whatsappCode + " " + row.whatsapp}</div>
					  <div className="flex-cell-div" style={{width:'20%'}}><FaWeixin size={17} /> &nbsp;{row.wechatCode + " " + row.wechat}</div>
					  <div className="flex-cell-div" style={{width:'20%'}}><AiOutlineMail size={17} /> &nbsp;{row.email}</div>
					</div>
					 */}
				</MenuItem>
			}
			value={props.contacts}
			onChange={props.onFormDataChange}
		>
		</Select>
	)
}