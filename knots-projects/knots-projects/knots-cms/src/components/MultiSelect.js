import * as React from 'react';
import { Box, Checkbox, FormControl, FormHelperText, InputLabel, ListItemText, MenuItem } from "@mui/material"
import { useEffect, useState } from "react";
import Chip from '@mui/material/Chip';
import OutlinedInput from '@mui/material/OutlinedInput';
import Select from './Select';

export const MultipleSelectCheckmarks = ({ label, items, ...props }) => {
	const error = props.error? true: false;
	const [value, setValue] = useState(props.value !== null ? props.value : []);
	
	const _handleChange = (event) => {
    const {target: { value } } = event;
    const newValue = value === 'string' ? value.split(',') : value;
    setValue(newValue);
		if(props.onChange) props.onChange(newValue);
  };

	useEffect(()=>{
			setValue(props.value)
	}, [props.value])

	return (
			<FormControl variant={props.variant} sx={{ width: '100%' }} error={error}>
					<InputLabel id={props.labelId} style={{ fontSize: 18, backgroundColor: 'white' }} shrink={true}>{label}</InputLabel>
					<Select
							labelId={props.labelId}
							multiple
							input={<OutlinedInput label="Tag" />}
							renderValue={(selected) => selected.map(e=> items.find(i=> i.value === e)?.label).join(', ')}
							{...props}
							onChange={_handleChange}
							error={error}
							value={value}
					>
				{items?.map((e) => (
					<MenuItem key={e.key} value={e.value}>
						<Checkbox checked={value.indexOf(e.value) > -1} />
						<ListItemText primary={e.label} />
					</MenuItem>
				))}
					</Select>
					{props.error && <FormHelperText error>{props.error}</FormHelperText>}
			</FormControl>
	)
}

export const MultipleSelectChip = ({ label, items, ...props }) => {
	const error = props.error? true: false;
	const [value, setValue] = useState(props.value !== null ? props.value : []);
	
	const _handleChange = (event) => {
    const {target: { value } } = event;
    const newValue = value === 'string' ? value.split(',') : value;
    setValue(newValue);
		if(props.onChange) props.onChange(newValue);
  };

	useEffect(()=>{
			setValue(props.value)
	}, [props.value])

	return (
		<>
			<InputLabel id={props.labelId} style={{ fontSize: "18px", backgroundColor: 'white' }} shrink={true}>{label}</InputLabel>
			<FormControl sx={{ width: '100%' }} error={error}>
				<Select
					multiple
					input={<OutlinedInput />}
					renderValue={(selected) => <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
						{selected.map((value) => (
							<Chip key={value} label={items.find(i=> i.value === value)?.label} />
						))}
					</Box>}
					{...props}
					searchable
					items={items}
					onChange={_handleChange}
					error={error}
					value={value}
					render={props.onRender}
				>
					{/* {items?.map((e) => (
						props.onRender(e)
					))} */}
				</Select>
				{props.error && <FormHelperText error>{props.error}</FormHelperText>}
			</FormControl>
		</>
	)
}
