// use react and mui create a component. right side is a select input for tel code. left side is a input for tel number. 
import React from 'react';
import { MenuItem } from '@mui/material';
import { FaMobileAlt } from 'react-icons/fa';
import { de } from 'date-fns/locale';
import Select from './Select';
import Input from './Input';

export default function TelInput(props) {
	return (
		<div style={{display: 'flex', flexDirection: 'row'}}>
			<div style={{width: 100}}>
			<Select
			  label={props.codes?props.label:' '}
			  variant="standard"
			  placeholder="國碼"
				value={props.code}
				onChange={(e) => {
					if (props.onCodeChange) props.onCodeChange(e.target.value)
				}}
			>
				{props.codes.map((code) => { return <MenuItem key={code} value={code}>{'+' + code}</MenuItem>})}
				</Select>
			</div>
			<Input
			  label={props.codes?' ':props.label}
				type='tel'
				variant="standard"
				value={props.number}
				error={props.error}
				helperText={props.error}
				onChange={(e) => {
					if (props.onTelChange) props.onTelChange(e.target.value)
				}}
			/>
		</div>
	)
}
