import { gql, useQuery } from "@apollo/client";
import { PROJECT_ITEMS_QUERY } from "../../apollo/queries";
import Select from "../Select";
import { MenuItem } from "@mui/material";
import { projectItemFragment } from "../../apollo/fragments";
import { useMemo } from "react";

export default function (props) { 
	let selectBy = props.selectBy ?? 'id';

	const {data, loading, error} = useQuery(gql`${PROJECT_ITEMS_QUERY} ${projectItemFragment}`, {
		fetchPolicy: 'network-only',
		variables: { 
			upper: props.upper,
			id: props.id,
			delete: false,
			first: 9999
		}
	})
	let dataRow = useMemo(() => {
		let dataRow = []
		if(data?.projectItems?.edges?.length) {
			dataRow = data?.projectItems?.edges?.map(({node}) => {
				let childSearchValue = '';
				if(node?.child) childSearchValue = node?.child?.map((item) => item.nameCht + node.nameEn).join(' ') ?? '';
				return {...node,
					searchValue: node.nameCht + node.nameEn + childSearchValue,
					value: node[selectBy]
				}
			}) || [];
		}
		return dataRow;
	}, [data])

	if(props.disabledIds) dataRow = dataRow.filter(e=> !props.disabledIds.includes(e[selectBy]))

  const onChange = (e) => {
		props.onChange(e, dataRow.find(x=>x[selectBy]===e.target.value))
	}

	const NewSelect = () => <Select
		label={props.label}
		variant="outlined"
		loading={loading}
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