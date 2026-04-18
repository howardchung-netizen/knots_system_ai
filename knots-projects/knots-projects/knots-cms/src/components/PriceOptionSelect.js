import { gql, useQuery } from "@apollo/client";
import Select from "./Select";
import React, { useEffect, useMemo } from "react";
import { FaMobileAlt, FaUserCircle } from "react-icons/fa";
import { AiOutlineWhatsApp } from "react-icons/ai";
import { MenuItem } from "@mui/material";
import { projectItemFragment } from "../apollo/fragments";
import { PROJECT_ITEMS_QUERY } from "../apollo/queries";
import { toMoney } from "../utils";

export default function (props) { 
	const [value, setValue] = React.useState(props.value??'');
	const {data, loading, error} = useQuery(gql`${PROJECT_ITEMS_QUERY} ${projectItemFragment}`,{
		fetchPolicy: 'network-only',
		variables: { 
			id: props.id,
			first: 1
		}
	})
	const dataRow = useMemo(() => {
		let dataRow = []
		if(data?.projectItems?.edges?.length) {
			dataRow = data?.projectItems?.edges[0]?.node?.prices || [];
		}
		return dataRow;
	},[data])

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
				<MenuItem key={row.id} sx={{ borderWidth: 1, borderStyle: 'groove' }} value={row.price}>
					{toMoney(row.price)} {row.desc}
				</MenuItem>
			}
			value={value ?? ''}
			onChange={props.onChange}
		>
		</Select>
	)
}