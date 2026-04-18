import { useEffect, useState } from "react";
import { CircularProgress, FormControl, FormHelperText, IconButton, InputLabel, MenuItem, Select } from "@mui/material"
import ClearIcon from '@mui/icons-material/Clear';
import { FaSpinner } from "react-icons/fa";

export default ({ label, items, loading, searchable, render, ...props }) => {
	const [open, setOpen] = useState(false);
	const error = props.error ? true : false;
	const [value, setValue] = useState(props.value !== null ? props.value : '');

	const [filter, setFilter] = useState('');

	useEffect(() => {
		setValue(props.value)
	}, [props.value])

	return (
		<FormControl variant={props.variant} sx={{ width: '100%' }} error={error}>
			{label && <InputLabel id={props.labelId} style={{ fontSize: 18, backgroundColor: 'white' }} shrink={true}>{label}</InputLabel>}
			<Select
				labelId={props.labelId}
				startAdornment={loading ? <CircularProgress size={20} /> : null}
				endAdornment={props.onClear && value ? <IconButton style={{ backgroundColor: 'white', height: 30, width: 30 }} onClick={props.onClear}><ClearIcon /></IconButton> : null}
				MenuProps={{
					autoFocus: false,
					PaperProps: { // 在这里设置最大高度样式
						style: {
							maxHeight: 500,
						}
					},
				}}
				{...props}
				onChange={(e) => {
					let item = items?.find(x=> x.value == e.target.value);
					if(props.onChange) props.onChange(e, item);
				}}
				// helperText={props.helperText}
				error={error}
				value={value}
				onClick={(e) => {
					e.preventDefault();
					e.stopPropagation();
				}}
				onBlur={(e) => {
					if (open) {
						setOpen(false);
					}
				}}
			>
				{
					
					searchable && <div style={{ 
						width: '100%', 
						padding: 5,
						position: 'sticky',
            top: 0,
						background: 'white',
						zIndex: 1
					 }}
						onKeyDown={(e) => {
							e.stopPropagation();
						}}
					>
						<input style={{ height: 40, width: "100%" }}
							placeholder={'Search...'}
							value={filter}
							onClick={(e) => {
								e.preventDefault();
								e.stopPropagation();
							}}
							onFocus={(e) => {
								e.preventDefault();
								e.stopPropagation();
							}}
							onChange={(e) => {
								setFilter(e.target.value);
								e.preventDefault();
								e.stopPropagation();
							}}
						>
						</input>
					</div>
				}
				{
					props.children ?? null
				}
				{
					items && filter && render ? items.filter(e => {
						let lowerCaseSearchValue = e.searchValue?.toLowerCase();
						let lowerCaseFilter = filter.toLowerCase();
						return lowerCaseSearchValue?.includes(lowerCaseFilter) || e.value == value
					}).map(e => render(e)) : null
				}
				{
					items && !filter && render? items.map(e => render(e)) : null
				}
			</Select>
			{props.error && <FormHelperText error>{props.error}</FormHelperText>}
		</FormControl>
	)
}