import { gql, useQuery } from "@apollo/client";
import { MenuItem } from "@mui/material";
import { quotationsQuery } from "../apollo/queries";
import Select from "./Select";
import { quotationFragment } from "../apollo/fragments";

export default function ({selectBy, ...props}) { 

	const {data, loading, error} = useQuery(gql`${quotationsQuery} ${quotationFragment}`, {
		fetchPolicy: 'network-only',
		variables: {
			projectId: props.projectId,
			status: props.status, 
			delete: false,
		}
	})
	let dataRow = data?.quotations?.edges?.map(({node}) => {
		return {...node,
      searchValue: node.code + node.projectId+node.title,
			value: node[selectBy??'id']
		}
	}) || [];

	if(props.disabledIds) dataRow = dataRow.filter(e=> !props.disabledIds.includes(e.id))

  const onChange = (e) => {
		props.onChange(e, dataRow.find(x=>x.value==e.target.value))
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
					<div style={{display: 'flex', alignItems: 'center', width: '100%'}}>
					<div>{row.code}</div>
					<div style={{paddingLeft: '10px'}}>{row.title}</div>
					</div>
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