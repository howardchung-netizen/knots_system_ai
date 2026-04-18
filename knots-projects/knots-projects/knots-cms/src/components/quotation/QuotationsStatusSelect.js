import { gql, useQuery } from "@apollo/client";
import { PROJECT_ITEMS_QUERY } from "../../apollo/queries";
import Select from "../Select";
import { MenuItem } from "@mui/material";
import { projectItemFragment } from "../../apollo/fragments";
import { OptionsContext } from "../../contexts/OptionsContextProvider";
import { useContext } from "react";

export default function (props) { 
	
	let selectBy = props.selectBy ?? 'id';
	const [optionsContext, optionsContextDispatch, {quotationStauts}] = useContext(OptionsContext);

	let dataRow = quotationStauts.map((node) => {
		return {...node,
      searchValue: node.nameCht + node.nameEn,
			value: node[selectBy]
		}
	}) || [];

	if(props.disabledIds) dataRow = dataRow.filter(e=> !props.disabledIds.includes(e[selectBy]))

  const onChange = (e) => {
		props.onChange(e, dataRow.find(x=>x[selectBy]===e.target.value))
	}

	const NewSelect = () => <Select
		label={props.label}
		variant={props.variant}
		loading={props.loading}
		disabled={props.disabled}
		readOnly={props.readOnly}
		searchable={true}
		items={dataRow}
		render={row =>
			<MenuItem sx={{ borderWidth: 1, borderStyle: 'groove' }}
				key={row[selectBy]}
				value={row[selectBy]}>
				{row.nameCht} | {row.nameEn}
			</MenuItem>
		}
		error={props.error}
		defaultValue={props.defaultValue}
		value={props.value}
		onChange={onChange}
	>
	</Select>
	
	return (
		<>
			<NewSelect />
		</>
	)
}