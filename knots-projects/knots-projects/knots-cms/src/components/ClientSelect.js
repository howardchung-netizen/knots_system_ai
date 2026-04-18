import { gql, useQuery } from "@apollo/client";
import { CLIENTS_QUERY } from "../apollo/queries";
import Select from "./Select";
import { baseClient } from "../apollo/baseFragment";
import React, { useEffect } from "react";
import { FaMobileAlt, FaUserCircle } from "react-icons/fa";
import { AiOutlineWhatsApp } from "react-icons/ai";
import { Checkbox, MenuItem } from "@mui/material";

export default function (props) { 
	const [value, setValue] = React.useState(props.value??'');
	const {data, loading, error} = useQuery(gql`${CLIENTS_QUERY} ${baseClient}`)
	const dataRow = data?.clients?.edges?.map(({node}) => {
		return {...node,
      searchValue: node.companyCht+node.companyEn+node.tel+node.whatsapp,
			value: node.id
		}
	}) || [];

	useEffect(() => {
		if(props.value !== value)	setValue(props.value)
	}, [props.value])

	return (
		<Select
			label={props.label}
			variant="standard"
			loading={loading}
			error={error || props.error}
			helperText={props.helperText}
			searchable
			items={dataRow}
			render={row =>
				<MenuItem key={row.id} sx={{ borderWidth: 1, borderStyle: 'groove' }} value={row.id}>
					<div style={{ padding: 3 }}>
						{(row.companyCht || row.companyEn) && <div className="flex-cell-div"><FaUserCircle size={17} />  &nbsp;{row.companyCht} {row.companyEn ? ` | ${row.companyEn}` : ''}</div>}
						{row.tel && <div className="flex-cell-div"><FaMobileAlt size={17} /> &nbsp;{row.telCode + " " + row.tel}</div>}
						{
						 row.whatsapp && <div className="flex-cell-div"><AiOutlineWhatsApp size={17} /> &nbsp;{row.wechatCode + " " + row.whatsapp}</div>
						}
					</div>
				</MenuItem>
			}
			value={value ?? ''}
			onChange={props.onChange}
		>
		</Select>
	)
}