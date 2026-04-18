import { gql, useQuery } from "@apollo/client";
import { MEASURE_TYPES_QUERY } from "../../apollo/queries";
import Select from "../Select";
import { FaMobileAlt, FaUserCircle, FaWeixin } from "react-icons/fa";
import { AiOutlineMail, AiOutlineWhatsApp } from "react-icons/ai";
import { MenuItem } from "@mui/material";
import { measureTypeFragment } from "../../apollo/fragments";

export default function (props) { 

	const {data, loading, error} = useQuery(gql`${MEASURE_TYPES_QUERY} ${measureTypeFragment}`, {
		variables: { 
			deleted: false,
		}
	})
	const dataRow = data?.measureTypes?.edges?.map(({node}) => {
		return {...node,
      searchValue: node.nameCht + node.nameEn,
			value: node.id
		}
	}) || [];

	const NewSelect = () => <Select
		label={props.label}
		variant="standard"
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
		<NewSelect />
	)
}