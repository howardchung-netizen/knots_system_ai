import { gql, useQuery } from "@apollo/client";
import { usersQuery } from "../apollo/queries";
import Select from "./Select";
import { FaMobileAlt, FaUserCircle } from "react-icons/fa";
import { AiOutlineWhatsApp } from "react-icons/ai";
import { baseUser } from "../apollo/baseFragment";
import { Checkbox, MenuItem } from "@mui/material";
import { MultipleSelectChip } from "./MultiSelect";
import React, { useCallback, useEffect, useMemo } from "react";

export default function (props) { 
	const [value, setValue] = React.useState(props.value??'');
	const {data, loading, error} = useQuery(gql`${usersQuery} ${baseUser}`)
	const dataRow = data?.users?.edges?.map(({node}) => {
		return {...node,
      searchValue: node.username+node.nameCht+node.nameEn+node.tel1+node.tel2+node.whatsApp+node.whatsapp2,
			value: node.id
		}
	}) || [];

  useEffect(() => {
		if(props.value !== value)	setValue(props.value)
	}, [props.value])

	return (
		<Select
		  disabled={props.disabled}
			label={props.label}
			variant="standard"
			loading={loading}
			error={error || props.error}
			helperText={props.helperText}
			searchable
			items={dataRow}
			render={row => 
				<MenuItem key={row.id} sx={{borderWidth: 1, borderStyle: 'groove'}} value={row.id}>
					<div style={{ padding: 3 }}>
					{(row.username) && <div className="flex-cell-div"><FaUserCircle size={17} />  &nbsp;{row.nameCht} {row.nameEn ? ` | ${row.nameEn}` : ''}</div>}
					 {row.tel2 && <div className="flex-cell-div"><FaMobileAlt size={17} /> &nbsp;{row.tel1 + " " + row.tel2}</div>}
					 {
						!row.tel2 && row.whatsapp2 && <div className="flex-cell-div"><AiOutlineWhatsApp size={17} /> &nbsp;{row.whatsApp+ " " + row.whatsapp2}</div>
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

export const MultiUserSelect = function (props) {

	const [value, setValue] = React.useState(props.value??'');
	const { data, loading, error } = useQuery(gql`${usersQuery} ${baseUser}`)

	const dataRow = useMemo(() => {
		let dataRow = [];
		dataRow = data?.users?.edges?.map(({ node }) => {
			return {
				...node,
				searchValue: node.username + node.nameCht + node.nameEn + node.tel1 + node.tel2 + node.whatsApp + node.whatsapp2,
				label: node.username,
				value: node.id
			}
		}) || [];
		return dataRow;
	}, [data])

	const Select = useCallback(({value}) => {

		return (
			<MultipleSelectChip
				label={props.label}
				variant="standard"
				// loading={loading}
				error={error}
				searchable
				items={dataRow}
				onRender={(row) => {
					// console.log(props.value, row.id)
					return <MenuItem key={row.id} sx={{ borderWidth: 1, borderStyle: 'groove' }} value={row.id}>
						<Checkbox checked={value.includes(row.id)} />
						<div style={{ padding: 3 }}>
							{(row.username) && <div className="flex-cell-div"><FaUserCircle size={17} />  &nbsp;{row.username}</div>}
							{row.tel2 && <div className="flex-cell-div"><FaMobileAlt size={17} /> &nbsp;{row.tel1 + " " + row.tel2}</div>}
							{
								!row.tel2 && row.whatsapp2 && <div className="flex-cell-div"><AiOutlineWhatsApp size={17} /> &nbsp;{row.whatsApp + " " + row.whatsapp2}</div>
							}
						</div>
					</MenuItem>
				}
				}
				value={props.value ?? []}
				onChange={props.onChange}
			>
			</MultipleSelectChip>
		)
	}, [dataRow])
  
	useEffect(() => {
		if(props.value !== value)	setValue(props.value)
	}, [props.value])

	return <Select value={props.value}/>
}