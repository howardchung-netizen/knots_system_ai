import { gql, useQuery } from "@apollo/client";
import { MenuItem } from "@mui/material";
import { projectsQuery } from "../apollo/queries";
import { baseProjectFragment } from "../apollo/baseFragment";
import Select from "./Select";

export default function ({selectBy, ...props}) { 

	const {data, loading, error} = useQuery(gql`${projectsQuery} ${baseProjectFragment}`, {
		fetchPolicy: 'network-only',
		variables: { 
			upper: 0,
			delete: false,
		}
	})
	let dataRow = data?.projects?.edges?.map(({node}) => {
		return {...node,
      searchValue: node.code + node.projectId,
			value: node[selectBy??'id']
		}
	}) || [];

	if(props.disabledIds) dataRow = dataRow.filter(e=> !props.disabledIds.includes(e.id))

  const onChange = (e) => {
		props.onChange(e, dataRow.find(x=>x.id===e.target.value))
	}

	const NewSelect = () => <Select
	  disabled={props.disabled}
		label={props.label}
		variant={props.variant??'outlined'}
		loading={loading}
		searchable={true}
		items={dataRow}
		render={row =>
			<MenuItem sx={{ borderWidth: 1, borderStyle: 'groove' }}
				key={row.id}
				value={row.value}>
				{`ID:${row.projectId} ｜ ${row.code}`}
			</MenuItem>
		}
		error={props.error}
		helperText={props.helperText}
		value={props.value}
		onChange={onChange}
		onClear={props.onClear}
	>
	</Select>
	
	return (
		<>
			<NewSelect />
		</>
	)
}