import { gql, useQuery } from "@apollo/client";
import { PROJECT_ITEMS_QUERY } from "../../apollo/queries";
import Select from "../Select";
import { MenuItem } from "@mui/material";
import { projectItemFragment } from "../../apollo/fragments";

export default function (props) { 
	const {data, loading, error} = useQuery(gql`${PROJECT_ITEMS_QUERY} ${projectItemFragment}`, {
		fetchPolicy: 'network-only',
		variables: { 
			upper: props.upper,
			delete: false,
			first: 99999
		}
	})
	let dataRow = data?.projectItems?.edges?.map(({node}) => {
		return {...node,
      searchValue: node.nameCht + node.nameEn,
			value: node.id
		}
	}) || [];

	if(props.disabledIds) dataRow = dataRow.filter(e=> !props.disabledIds.includes(e.id))

	dataRow.unshift({
		searchValue: '頂層 | Top',
		id: '0',
		value: '0',
		nameCht: '頂層',
		nameEn: 'Top',
	});

	const NewSelect = () => <Select
		label={props.label}
		variant="standard"
		readOnly={props.readOnly}
		disabled={props.disabled}
		loading={loading}
		searchable={true}
		items={dataRow}
		render={row =>
			<MenuItem sx={{ borderWidth: 1, borderStyle: 'groove' }}
				key={row.id}
				value={row.id}>
				{row.nameCht} | {row.nameEn}
			</MenuItem>
		}
		error={props.error}
		value={props.value}
		onChange={props.onChange}
	>
	</Select>
	return (
		<>
			<NewSelect />
		</>
	)
}