import { gql, useQuery } from "@apollo/client";
import { MEASUREMENT_QUERY } from "../../apollo/queries";
import Select from "../Select";
import { Button, MenuItem } from "@mui/material";
import { measurementFragment } from "../../apollo/fragments";
import Input from "../Input";

export default function ({value, inputError, onDeleteClick, ...props}) { 

	const {data, loading, error} = useQuery(gql`${MEASUREMENT_QUERY} ${measurementFragment}`, {
		variables: { 
			deleted: false,
		}
	})
	
	let dataRow = data?.measurements?.edges?.map(({node}) => {
		return {...node,
      searchValue: node.nameCht + node.nameEn,
			value: node.id
		}
	}) || [];

	const NewSelect = () => {
		return (
			<Select
				label="*單位:"
				loading={loading}
				searchable={true}
				items={dataRow}
				render={row =>
					<MenuItem sx={{ borderWidth: 1, borderStyle: 'groove', width: 'auto', margin: 0 }}
						key={row.id}
						value={row.id}>
						{row.nameCht} | {row.nameEn}
					</MenuItem>
				}
				error={props.error}
				helperText={props.error}
				value={value}
				onChange={props.onChange}
			>
			</Select>
		)
	}

	return (<NewSelect />)
}