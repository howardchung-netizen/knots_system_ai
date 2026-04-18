import { gql, useQuery } from "@apollo/client";
import { MEASUREMENT_QUERY } from "../../apollo/queries";
import Select from "../Select";
import { Button, MenuItem } from "@mui/material";
import { measurementFragment } from "../../apollo/fragments";
import Input from "../Input";

export default function ({value, prices, onUnitChange, inputError, onAddClick, onDeleteClick, ...props}) { 

	const {data, loading, error} = useQuery(gql`${MEASUREMENT_QUERY} ${measurementFragment}`, {
		variables: { 
			// deleted: false,
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
						{row.nameCht} | {row.nameEn} {row.deleted ? '(已刪除)' : ''}
					</MenuItem>
				}
				error={props.error}
				helperText={props.error}
				value={value}
				onChange={onUnitChange}
			>
			</Select>
		)
	}
  
	const onFormDataChange= (value, index) => { 
		return props.onChange(value, index);
	}
 
	return (
		<>
		<table style={{width: '100%'}}>
			<thead>
				<tr> 
					<th style={{width: '50%'}}> 
					<NewSelect />
					</th>
					<th style={{width: '50%'}}>
					<Button sx={{width: '100%', height: '56px'}} variant="contained" onClick={onAddClick}>新增價錢</Button>
						 </th>
				</tr>
			</thead>
		</table>
			<table className="table" style={{ width: '100%' }}>
				<thead>
					<tr>
						<th >描述(中)</th>
						<th >描述(英)</th>
						<th text-align="true" style={{ width: 150, textAlign: 'center' }}>單位</th>
						<th style={{ width: 100, textAlign: 'center' }}>價錢</th>
						<th style={{ width: 80, textAlign: 'center' }}>操作</th>
					</tr>
				</thead>
				<tbody>
					{
						prices?.length > 0 && prices?.map((item, index) => {
							return (
								<tr key={index}>
									<td style={{ height: 58 }}>
										<Input
											placeholder="*描述(中):"
											variant="standard"
											value={item.desc_cht}
											error={item.desc_cht ? false : true}
											helperText={item.desc_cht ? false : '必填'}
											onChange={(e, v) => { onFormDataChange({ desc_cht: e.target.value }, index) }}
										/>
									</td>
									<td style={{ height: 58 }}>
										<Input
											placeholder="*描述(英):"
											variant="standard"
											value={item.desc_en}
											error={item.desc_en ? false : true}
											helperText={item.desc_en ? false : '必填'}
											onChange={(e, v) => { onFormDataChange({ desc_en: e.target.value }, index) }}
										/>
									</td>
									<td style={{ height: 58, textAlign: 'center' }}>
										{dataRow.find(e => e.id == value)?.nameCht} | {dataRow.find(e => e.id == value)?.nameEn}
									</td>
									<td style={{ height: 58, textAlign: 'center' }}>
										<Input
											type="number"
											placeholder="*價錢:"
											variant="standard"
											value={item.price}
											error={item.price === undefined || item.price === null ? true : false}
											helperText={item.price === undefined || item.price === null ? '必填' : false}
											onChange={(e, v) => { onFormDataChange({ price: e.target.value ? parseFloat(e.target.value) : null }, index) }}
										/>
									</td>
									<td style={{ height: 58, textAlign: 'center' }}>
										<Button
											color="error"
											onClick={(e) => onDeleteClick(e, index)}
										>
											刪除
										</Button>
									</td>
								</tr>
							)
						})
					}
				</tbody>
			</table>
		</>
	)
}