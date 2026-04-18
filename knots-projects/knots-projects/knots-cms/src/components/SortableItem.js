import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'

import {useSortable} from '@dnd-kit/sortable';
import {CSS} from '@dnd-kit/utilities';

import ViewHeadlineIcon from '@mui/icons-material/ViewHeadline';
import { SortableList } from './SortableList';
import ContextMenu from './ContextMenu';
import { toMoney } from '../utils';
import CheckIcon from '@mui/icons-material/Check';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import Input from './Input';
import { OptionsContext } from '../contexts/OptionsContextProvider';
import { Divider, MenuItem } from '@mui/material';
import Select from './Select';

export const ProjectItem = function SortableItem(props) {

	const { id, child, nameCht, nameEn } = props.data;

	const { isDragging, attributes, listeners, transform, transition, setNodeRef, setActivatorNodeRef } = useSortable({
		id: props.id,
		data: props.data,
	});

	const style = {
		position: 'relative',
		transform: CSS.Transform.toString(transform),
		transition,
		'--translate-x': transform ? transform.x : 0,
    '--translate-y': transform ? transform.y : 0,
    '--transition': transition,
		backgroundColor: 'white',
		zIndex: isDragging ? 1 : undefined,
		opacity: isDragging ? 0.6 : 1
	};

	const isHeigtLight = useMemo(()=>{
		let isHeigtLight = false;
		if(props.keyword && props.keyword.length) {
			let _nameCht = nameCht?.toLowerCase();
			let _nameEn = nameEn?.toLowerCase();
			let _keyword = props.keyword?.toLowerCase();
			isHeigtLight = _nameCht.includes(_keyword) || _nameEn.includes(_keyword)
		}
    return isHeigtLight
	}, [props.keyword])

	const _onClick = (e)=>{
		if(props.onClick) props.onClick(props.data, e);
		e.stopPropagation();
		e.preventDefault();
  }
	
	const _handleContextMenu = (e)=> {
		if(props.onContextMenu) props.onContextMenu(props.data, e)
		e.stopPropagation();
		e.preventDefault();
	}

	const menuItems = ()=>{
		if( typeof props.menuItems == 'function') return props.menuItems(props.data)
		return props.menuItems
	}

	useEffect(()=>{
		let expenItems =  localStorage.getItem('expenProjectItems');
		if(expenItems) {
			let _expenItems = JSON.parse(expenItems);
			if(_expenItems.includes(props.id)) {
				let target = document.getElementById(props.id);
				if(target) target.classList.add('active');
			}
		
		}
	}, [])

	return (
		<li id={props.id} className="tree-item hover-shadow pointer caret" ref={setNodeRef} {...attributes} style={style} onClick={_onClick} onContextMenu={_handleContextMenu}>
			<ContextMenu
			  data={props.data}	
				items={menuItems()}
			>
				<div className="tree-row">
					<div className="tree-cell">
						<div>
							<button
								ref={setActivatorNodeRef}
								{...listeners}
								style={{ backgroundColor: null, borderWidth: 0, cursor: 'all-scroll' }}>
								<ViewHeadlineIcon />
							</button>
						</div>
					</div>
					<div className="tree-cell" style={{ width: 25, justifyContent: 'center', color: '#3c8dbc' }}>{child?.length}</div>
					<div className="tree-cell" style={{ width: '100%', background: isHeigtLight ? 'yellow' : 'none' }}>
						{props.text}
					</div>
					<div className="tree-cell-action">
						{props.actions && props.actions(props.data)}
					</div>
				</div>
			</ContextMenu>
			{
				child && child.length > 0 &&
				<ul style={{ padding: 0, margin: 0 }}>
					<SortableList
					  onDragEnd={props.onDragEnd}
						items={child}
						renderItem={(item, index) => <ProjectItemChild
							key={index}
							index={index}
							id={item.id}
							text={item.nameCht}
							data={item}
							onDragEnd={props.onDragEnd}
							actions={props.actions}
							menuItems={props.menuItems}
							onClick={props.onClick}
							keyword={props.keyword}
							 />}
					/>
				</ul>
			}
		</li>
	)
};

export const ProjectItemChild = function SortableItem(props) {

	const {id, child, actions, nameCht, nameEn} = props.data;

	const { isDragging, attributes, listeners, transform, transition, setNodeRef, setActivatorNodeRef } = useSortable({
		id: props.id,
		data: props.data
	});

	const style = {
		position: 'relative',
		transform: CSS.Transform.toString(transform),
		transition,
		'--translate-x': transform ? transform.x : 0,
    '--translate-y': transform ? transform.y : 0,
    '--transition': transition,
		backgroundColor: 'white',
		zIndex: isDragging ? 1 : undefined,
		opacity: isDragging ? 0.6 : 1
	};

	const isHeigtLight = useMemo(()=>{
		let isHeigtLight = false;
		if(props.keyword && props.keyword.length) {
			let _nameCht = nameCht?.toLowerCase();
			let _nameEn = nameEn?.toLowerCase();
			let _keyword = props.keyword?.toLowerCase();
			isHeigtLight = _nameCht.includes(_keyword) || _nameEn.includes(_keyword)
		}
    return isHeigtLight
	}, [props.keyword])

	const _handleContextMenu = (e)=> {
		if(props.onContextMenu) props.onContextMenu(props.data, e)
		e.stopPropagation();
		e.preventDefault();
	}

	const _onClick = (e)=>{
		if(props.onClick) props.onClick(props.data, e);
		e.stopPropagation();
		e.preventDefault();
  }

	return (
		<li id={props.id} className="tree-item hover-shadow pointer caret child nested sub" ref={setNodeRef} {...attributes} style={style} onContextMenu={_handleContextMenu} onClick={_onClick}>
			<ContextMenu
			  data={props.data}	
				items={props.menuItems}
			>
				<div className="tree-row">
					<div className="tree-cell">
						<div className="border-left"></div>
						<div className="border-bottom"></div>
						<div style={{ width: 50 }}>
							<button
								ref={setActivatorNodeRef}
								{...listeners}
								style={{ backgroundColor: null, borderWidth: 0, cursor: 'all-scroll' }}>
								<ViewHeadlineIcon />
							</button>
						</div>
					</div>
					{child?.length > 0 && <div className="tree-cell" style={{ width: 25, justifyContent: 'center', color: '#3c8dbc' }}>{child?.length}</div>}
					<div className="tree-cell" style={{ width: '100%', background: isHeigtLight ? 'yellow' : 'none' }}>
						{props.text}
					</div>
					<div className="tree-cell-action" style={{ width: 'auto' }}>
						{props.actions && props.actions(props.data)}
					</div>
				</div>
			</ContextMenu>
			{
				child && child.length > 0 &&
				<ul style={{ padding: 0, margin: 0 }}>
					<SortableList
						items={child}
						renderItem={(item, index) => <ProjectItemChild
							key={index}
							index={index}
							id={item.id}
							text={item.nameCht}
							data={item}
							actions={props.actions}
							menuItems={props.menuItems}
							onClick={props.onClick}
							keyword={props.keyword}
							 />}
					/>
				</ul>
			}
		</li>
	)

};

export const TemplateProjectItem = function SortableItem(props) {

	const { id, child } = props.data;

	const { isDragging, attributes, listeners, transform, transition, setNodeRef, setActivatorNodeRef } = useSortable({
		id: props.id,
		data: props.data,
	});

	const style = {
		position: 'relative',
		transform: CSS.Transform.toString(transform),
		transition,
		'--translate-x': transform ? transform.x : 0,
    '--translate-y': transform ? transform.y : 0,
    '--transition': transition,
		backgroundColor: 'white',
		zIndex: isDragging ? 1 : undefined,
		opacity: isDragging ? 0.6 : 1
	};

	const _onClick = (e)=>{
		if(props.onClick) props.onClick(props.data, e);
		e.stopPropagation();
		e.preventDefault();
  }
	
	const _handleContextMenu = (e)=> {
		if(props.onContextMenu) props.onContextMenu(props.data, e)
		e.stopPropagation();
		e.preventDefault();
	}

	return (
		<li className="tree-item hover-shadow pointer caret active" ref={setNodeRef} {...attributes} style={style} onClick={_onClick} onContextMenu={_handleContextMenu}>
			<ContextMenu
				data={props.data}
				items={props.menuItems}
			>
				<div className="tree-row">
					<div className="tree-cell">
						<div style={{ width: 30 }}>
							<button
								ref={setActivatorNodeRef}
								{...listeners}
								style={{ backgroundColor: null, borderWidth: 0, cursor: 'all-scroll' }}>
								<ViewHeadlineIcon />
							</button>
						</div>
					</div>
					<div className="tree-cell" style={{ width: 40, justifyContent: 'center', fontWeight: 'bold', color: '#3c8dbc' }}>{child?.length}</div>
					<div className="tree-cell" style={{ width: '100%', fontWeight: 'bold' }}>
						{props.text}
					</div>
					<div className="tree-cell-action">
						{props.actions && props.actions(props.data)}
					</div>
				</div>
			</ContextMenu>
			{
				child && child.length > 0 &&
				<ul style={{ padding: 0, margin: 0 }}>
					<SortableList
						items={child}
						renderItem={(item, index) => <TemplateProjectItemChild
							key={item.id + '_' + index}
							index={index}
							id={item.id}
							text={item.name_cht}
							data={item}
							actions={props.actions}
							menuItems={props.childMenuItems}
						/>}
					/>
				</ul>
			}
		</li>
	)
};

export const TemplateProjectItemChild = function (props) {

	const {id, child, sactions, price} = props.data;
	
	const { isDragging, attributes, listeners, transform, transition, setNodeRef, setActivatorNodeRef } = useSortable({
		id: props.id,
		data: props.data
	});

	const style = {
		position: 'relative',
		transform: CSS.Transform.toString(transform),
		transition,
		'--translate-x': transform ? transform.x : 0,
    '--translate-y': transform ? transform.y : 0,
    '--transition': transition,
		backgroundColor: 'white',
		zIndex: isDragging ? 1 : undefined,
		opacity: isDragging ? 0.6 : 1
	};

	const _handleContextMenu = (e)=> {
		if(props.onContextMenu) props.onContextMenu(props.data, e)
		e.stopPropagation();
		e.preventDefault();
	}

	const _onDoubleClick = (e)=> {
		if(props.onDoubleClick)props.onDoubleClick(props.data, e)
     e.stopPropagation();
		 e.preventDefault();
	 }

	return (
		<li className="tree-item hover-shadow child nested sub cursor-default" 
		ref={setNodeRef}
		{...attributes} 
		style={style} 
		onContextMenu={_handleContextMenu} 
		onDoubleClick={_onDoubleClick} 
		onClick={(e)=>{
			e.stopPropagation();
			e.preventDefault();
	  }}>
			<ContextMenu
			  data={props.data}	
				items={props.menuItems}
			>
				<div className="tree-row">
					<div className="tree-cell">
						<div className="border-left"></div>
						<div className="border-bottom"></div>
						<div style={{ width: 50 }}>
							<button
								ref={setActivatorNodeRef}
								{...listeners}
								style={{ backgroundColor: null, borderWidth: 0, cursor: 'all-scroll' }}>
								<ViewHeadlineIcon />
							</button>
						</div>
					</div>
					<div className="tree-cell" style={{ width: '100%' }}>
						{props.text}
					</div>
					{/* <div className="tree-cell" style={{ width: '150px', textAlign: 'right' }}>
					    {price.name_cht??'null'}
					</div>
					<div className="tree-cell" style={{ width: '120px', textAlign: 'center' }}>
					    {price.value?toMoney(price.value):''}
					</div>
					<div className="tree-cell" style={{ width: '250px', textAlign: 'left' }}>
					    {price.unit_cht??''}
					</div> */}
					<div className="tree-cell" style={{ width: '120px', justifyContent: 'right' }}>
              {price?.name_cht ? price.name_cht+ ':' : null}
					</div>
					<div className="tree-cell" style={{ width: '250px', textAlign: 'left' }}>
					    {price ? `${toMoney(price.value)}${price.unit_cht? ' / ' + price.unit_cht : ''}` : null}
					</div>
					<div className="tree-cell-action" style={{ width: 'auto' }}>
						{props.actions && props.actions(props.data)}
					</div>
				</div>
			</ContextMenu>
		</li>
	)

};

export const QuotationItem = function (props) {

	const { id, child, isInInvoice, isAllChildInInvoice, price, progress, newProgress } = props.data;
	const { isDragging, attributes, listeners, transform, transition, setNodeRef, setActivatorNodeRef } = useSortable({
		id: props.id,
		data: props.data,
	});
	const newUnitPrice = price?.newUnitPrice??undefined;
	const unitPrice = price?.value;
	const newTotalAmount = price?.newTotalAmount??undefined;
	const totalAmount = unitPrice * price?.quantity;
	const lang = localStorage.getItem('lang') == 'en' ? 'en' : 'cht';
	const style = {
		position: 'relative',
		transform: CSS.Transform.toString(transform),
		transition,
		'--translate-x': transform ? transform.x : 0,
    '--translate-y': transform ? transform.y : 0,
    '--transition': transition,
		backgroundColor: 'white',
		zIndex: isDragging ? 1 : undefined,
		opacity: isDragging ? 0.6 : 1
	};
	const reviewMarkupStyle = newUnitPrice !== undefined ? { color: 'gray' } : { color: 'rgb(60, 72, 88)'}

	let hideItems = localStorage.getItem('hideQuotationItems') || '[]';
	hideItems = JSON.parse(hideItems);

	const _onClick = (e) => {
		if (props.onClick) props.onClick(props.data, e);
		let target = e.currentTarget;
		if (!target) return;
		if (target.classList.contains('active')) {
			target.classList.remove("active");
			hideItems.push(props.id);
			localStorage.setItem('hideQuotationItems', JSON.stringify(hideItems));
		}
		else {
			target.classList.add("active");
			hideItems = hideItems.filter(e => e != props.id);
			localStorage.setItem('hideQuotationItems', JSON.stringify(hideItems));
		}
		e.stopPropagation();
		e.preventDefault();
	}
	
	const _handleContextMenu = (e)=> {
		if(props.onContextMenu) props.onContextMenu(props.data, e)
		e.stopPropagation();
		e.preventDefault();
	}

	const onPrgressClcik = (e)=> {
		e.stopPropagation();
		e.preventDefault();
	}

	const onProgressChange = (e)=> {
		if(props.onProgressChange) props.onProgressChange(props.data, e)
		e.stopPropagation();
		e.preventDefault();
	}

	const className = `tree-item hover-shadow pointer caret active`
	
	useEffect(()=>{
		if(hideItems) {
			let target = document.getElementById(props.id);
			if(hideItems.includes(props.id)) {
				if(target) target.classList.remove('active');
			}
			else {
				if(target) target.classList.add('active');
			}
		}
	}, [])

	return (
		<li className={className} ref={setNodeRef} {...attributes} style={style} onClick={_onClick} onContextMenu={_handleContextMenu} id={props.id}>
			<ContextMenu
				data={props.data}
				items={props.menuItems}
			>
				<div className="tree-row">
					<div className="tree-cell" style={{ minWidth: 50, maxWidth: 50 }}>
						<div>
							<button
								ref={setActivatorNodeRef}
								{...listeners}
								style={{ backgroundColor: null, borderWidth: 0, cursor: 'all-scroll' }}>
								<ViewHeadlineIcon />
							</button>
						</div>
					</div>
					<div className="tree-cell" style={{ minWidth: 36, maxWidth: 36, justifyContent: 'center', fontWeight: 'bold', color: '#3c8dbc' }}>{child?.length}</div>
					<div className="tree-cell" style={{ width: '100%', minWidth: 270, fontWeight: 'bold', borderRight: '1px solid' }}>
						<div>
							<div>
								{props.data?.['name_' + lang]}
							</div>
							<div style={{ fontSize: 10 }}>
								{props.data?.['desc_' + lang]}
							</div>
						</div>
					</div>
					<div className="tree-cell" style={{ minWidth: 80, maxWidth: 80, justifyContent: 'right', borderRight: '1px dotted' }}>
						{price?.quantity ?? ''}
					</div>
					<div className="tree-cell" style={{ minWidth: 80, maxWidth: 80, justifyContent: 'left', borderRight: '1px solid' }}>
						{price?.['unit_' + lang] != null ? price?.['unit_' + lang] : ''}
					</div>
					<div className="tree-cell" style={{ minWidth: 150, maxWidth: 150, borderRight: '1px solid', flexDirection: 'column', justifyContent: 'center' }}>
						{
						newUnitPrice !== undefined && <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between' }}>
							<div>{newUnitPrice ? 'HK$' : ''}</div>
							<div>{newUnitPrice ? toMoney(newUnitPrice) : ''}</div>
						</div>
						}
						<div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', ...reviewMarkupStyle }}>
							<div>{price?.value ? 'HK$' : ''}</div>
							<div>{price?.value ? toMoney(unitPrice) : ''}</div>
						</div>
					</div>
					<div className="tree-cell" style={{ minWidth: 150, maxWidth: 150, borderRight: '1px solid', flexDirection: 'column', justifyContent: 'center' }}>
						{
						newTotalAmount !== undefined && <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between' }}>
							<div>{newTotalAmount ? 'HK$' : ''}</div>
							<div>{newTotalAmount ? toMoney(newTotalAmount) : ''}</div>
						</div>
						}
						<div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', ...reviewMarkupStyle }}>
							<div>{price?.amount ? 'HK$' : ''}</div>
							<div>
								{/* {
									newProgress > 0 && price?.amount &&<>
									<div>{toMoney(totalAmount * newProgress / 100)}</div>
									<Divider	/>
									</> 
								} */}
								<div>{price?.amount ? toMoney(totalAmount) : ''}</div>
								</div>
						</div>
					</div>
					{
						props.showProgress && <div style={{ display: 'flex', minWidth: 60, maxWidth: 60, justifyContent: 'center', alignItems: 'center', borderRight: '1px solid' }} onClick={onPrgressClcik}>
							{progress ? progress + '%' : ''}
						</div>
					}
					<div className="tree-cell" style={{ minWidth: 40, maxWidth: 40, justifyContent: 'center', alignItems: 'center', borderRight: '1px dotted' }}>
						{props.data.pro != 0 && progress == 100 ? <CheckIcon style={{ color: 'green' }} /> : ''}
						{props.data.upper == 0 && isInInvoice && isAllChildInInvoice ? <CheckIcon style={{ color: 'green' }} /> : ''}
						{props.data.upper == 0 && isInInvoice && !isAllChildInInvoice ? <FiberManualRecordIcon /> : ''}
					</div>
					<div className="tree-cell-action" style={{ minWidth: 150, maxWidth: 150 }}>
						{props.actions && props.actions(props.data)}
					</div>
				</div>
			</ContextMenu>
			{
				child && child.length > 0 &&
				<ul style={{ padding: 0, margin: 0 }}>
					<SortableList
						items={child}
						onDragEnd={props.onDragEnd}
						renderItem={(item, index) => <QuotationItemChild
							key={item.id + '_' + index}
							index={index}
							id={item.id}
							text={item.name_cht}
							data={item}
							onDragEnd={props.onDragEnd}
							markup={props.markup}
							actions={props.actions}
							menuItems={props.menuItems}
							showProgress={props.showProgress}
							level={props.level+1}
						/>}
					/>
				</ul>
			}
		</li>
	)
};

export const QuotationItemChild = function (props) {

	const {id, child, sactions, price, isInInvoice, isAllChildInInvoice, progress, newProgress} = props.data;
	const { isDragging, attributes, listeners, transform, transition, setNodeRef, setActivatorNodeRef } = useSortable({
		id: props.id,
		data: props.data
	});
	const newUnitPrice = price?.newUnitPrice??undefined;
	const unitPrice = price?.value;
	const newTotalAmount = price?.newTotalAmount??undefined;
	const totalAmount = unitPrice * price?.quantity;
	const lang = localStorage.getItem('lang') == 'en' ? 'en' : 'cht';
	const style = {
		position: 'relative',
		transform: CSS.Transform.toString(transform),
		transition,
		'--translate-x': transform ? transform.x : 0,
    '--translate-y': transform ? transform.y : 0,
    '--transition': transition,
		backgroundColor: 'white',
		zIndex: isDragging ? 1 : undefined,
		opacity: isDragging ? 0.6 : 1
	};
	const reviewMarkupStyle = newUnitPrice !== undefined ? { color: 'gray' } : { color: 'rgb(60, 72, 88)'}

	let hideItems = localStorage.getItem('hideQuotationItems') || '[]';
	hideItems = JSON.parse(hideItems);

	const _onClick = (e) => {
		if (props.onClick) props.onClick(props.data, e);
		let target = e.currentTarget;
		if (!target) return;
		if (target.classList.contains('active')) {
			target.classList.remove("active");
			hideItems.push(props.id);
			localStorage.setItem('hideQuotationItems', JSON.stringify(hideItems));
		}
		else {
			target.classList.add("active");
			hideItems = hideItems.filter(e => e != props.id);
			localStorage.setItem('hideQuotationItems', JSON.stringify(hideItems));
		}
		e.stopPropagation();
		e.preventDefault();
	}

	const _handleContextMenu = (e)=> {
		if(props.onContextMenu) props.onContextMenu(props.data, e)
		e.stopPropagation();
		e.preventDefault();
	}

	const _onDoubleClick = (e)=> {
		if(props.onDoubleClick)props.onDoubleClick(props.data, e)
     e.stopPropagation();
		 e.preventDefault();
	 }

	const onProgressClick = (e)=> {
		e.stopPropagation();
		e.preventDefault();
	}

	const onProgressChange = (e)=> {
		if(props.onProgressChange) props.onProgressChange(props.data, e)
		e.stopPropagation();
		e.preventDefault();
	}
	
	const className = `tree-item hover-shadow pointer caret child nested sub cursor-default active`

	useEffect(()=>{
		if(hideItems) {
			let target = document.getElementById(props.id);
			if(hideItems.includes(props.id)) {
				if(target) target.classList.remove('active');
			}
			else {
				if(target) target.classList.add('active');
			}
		}
	}, [])

	return (
		<li className={className}
		id={props.id} 
		ref={setNodeRef}
		{...attributes} 
		style={style} 
		onContextMenu={_handleContextMenu} 
		onDoubleClick={_onDoubleClick} 
		onClick={_onClick}>
			<ContextMenu
			  data={props.data}	
				items={props.menuItems}
			>
				<div className="tree-row">
					<div className="tree-cell" style={{minWidth: 56, maxWidth: 56 }}>
						<div className="border-left"></div>
						<div className="border-bottom"></div>
						<div>
							<button
								ref={setActivatorNodeRef}
								{...listeners}
								style={{ backgroundColor: null, borderWidth: 0, cursor: 'all-scroll' }}>
								<ViewHeadlineIcon />
							</button>
						</div>
					</div>
					<div className="tree-cell" style={{ width: '100%', minWidth: 300 - props.level * 30, paddingLeft: 15, fontWeight: 'bold', borderRight: '1px solid' }}>
						<div>
							<div>
								{props.data?.['name_' + lang] ? ` - ${props.data?.['name_' + lang]}` : ''}
							</div>
							<div style={{ fontSize: 10 }}>
							  {props.data?.['desc_' + lang] ? `   ${props.data?.['desc_' + lang]}` : ''}
							</div>
						</div>
					</div>
					<div className="tree-cell" style={{ minWidth: 80, maxWidth: 80, justifyContent: 'right', borderRight: '1px dotted' }}>
						{price?.quantity ?? ''}
					</div>
					<div className="tree-cell" style={{ minWidth: 80, maxWidth: 80, justifyContent: 'left', borderRight: '1px solid' }}>
						{price?.['unit_' + lang] != null ? price?.['unit_' + lang] : ''}
					</div>
					<div className="tree-cell" style={{ minWidth: 150, maxWidth: 150, borderRight: '1px solid', flexDirection: 'column', justifyContent: 'center' }}>
						{
						newUnitPrice !== undefined && <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between' }}>
							<div>{newUnitPrice ? 'HK$' : ''}</div>
							<div>{newUnitPrice ? toMoney(newUnitPrice) : ''}</div>
						</div>
						}
						<div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', ...reviewMarkupStyle }}>
							<div>{price?.value ? 'HK$' : ''}</div>
							<div>{price?.value ? toMoney(unitPrice) : ''}</div>
						</div>
					</div>
					<div className="tree-cell" style={{ minWidth: 150, maxWidth: 150, borderRight: '1px solid', flexDirection: 'column', justifyContent: 'center' }}>
						{
						newTotalAmount !== undefined && <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between' }}>
							<div>{newTotalAmount ? 'HK$' : ''}</div>
							<div>{newTotalAmount ? toMoney(newTotalAmount) : ''}</div>
						</div>
						}
						<div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', ...reviewMarkupStyle }}>
							<div>{price?.amount ? 'HK$' : ''}</div>
							<div>
							  {/* {
									newProgress > 0 && totalAmount &&<>
									<div>{toMoney(Math.ceil(totalAmount * newProgress / 100))}</div>
									<Divider	/>
									</> 
								} */}
								<div>{price?.amount ? toMoney(totalAmount) : ''}</div>
								</div>
						</div>
					</div>
					{
						props.showProgress && <div style={{ display: 'flex', minWidth: 60, maxWidth: 60, justifyContent: 'center', alignItems: 'center', borderRight: '1px solid' }} onClick={onProgressClick}>
							{progress ? progress + '%' : ''}
						</div>
					}
					<div className="tree-cell" style={{ minWidth: 40, maxWidth: 40, justifyContent: 'center', alignItems: 'center', borderRight: '1px dotted' }}>
						{ isInInvoice && progress == 100 ? <CheckIcon style={{color: 'green'}} /> : ''}
						{ isInInvoice && progress > 0 && progress < 100? <FiberManualRecordIcon /> : ''}
					</div>
					<div className="tree-cell-action" style={{ minWidth: 150, maxWidth: 150}}>
						{props.actions && props.actions(props.data)}
					</div>
				</div>
			</ContextMenu>
			{
				child && child.length > 0 &&
				<ul style={{ padding: 0, margin: 0 }}>
					<SortableList
						items={child}
						onDragEnd={props.onDragEnd}
						renderItem={(item, index) => <QuotationItemChild
							key={item.id + '_' + index}
							index={index}
							id={item.id}
							text={item.name_cht}
							data={item}
							onDragEnd={props.onDragEnd}
							markup={props.markup}
							actions={props.actions}
							menuItems={props.menuItems}
							showProgress={props.showProgress}
							level={props.level+1}
						/>}
					/>
				</ul>
			}
		</li>
	)

};

export const QuotationTerm = function (props) {

	const { id } = props.data;
	const { isDragging, attributes, listeners, transform, transition, setNodeRef, setActivatorNodeRef } = useSortable({
		id: props.id,
		data: props.data,
	});
	const lang = localStorage.getItem('lang') == 'en' ? 'en' : 'cht';
	const style = {
		position: 'relative',
		transform: CSS.Transform.toString(transform),
		transition,
		'--translate-x': transform ? transform.x : 0,
    '--translate-y': transform ? transform.y : 0,
    '--transition': transition,
		backgroundColor: 'white',
		zIndex: isDragging ? 1 : undefined,
		opacity: isDragging ? 0.6 : 1
	};

	const _onClick = (e)=>{
		if(props.onClick) props.onClick(props.data, e);
		e.stopPropagation();
		e.preventDefault();
  }
	
	const _handleContextMenu = (e)=> {
		if(props.onContextMenu) props.onContextMenu(props.data, e)
		e.stopPropagation();
		e.preventDefault();
	}

	const className = `tree-item hover-shadow pointer caret`
	return (
		<li className={className} ref={setNodeRef} {...attributes} style={style} onClick={_onClick} onContextMenu={_handleContextMenu}>
			<ContextMenu
				data={props.data}
				items={props.menuItems}
			>
				<div className="tree-row">
					<div className="tree-cell">
						<div style={{ width: 50 }}>
							<button
								ref={setActivatorNodeRef}
								{...listeners}
								style={{ backgroundColor: null, borderWidth: 0, cursor: 'all-scroll' }}>
								<ViewHeadlineIcon />
							</button>
						</div>
					</div>
					<div className="tree-cell" style={{ width: '100%' }}>
						<div>
						<div style={{fontWeight: 'bold'}}>
							{props.data?.['name_' + lang]}
						</div>
						<div>
							{` ${props.data?.['desc_' + lang]}`}
						</div>
						</div>
					</div>
					<div className="tree-cell-action" style={{ minWidth: 100}}>
						{props.actions && props.actions(props.data)}
					</div>
				</div>
			</ContextMenu>
		</li>
	)
};

export const QuotationInvoiceItem = function (props) {

	const { id, child } = props.data;
	const [isToggle, setIsToggle] = useState(false);
	const { isDragging, attributes, listeners, transform, transition, setNodeRef, setActivatorNodeRef } = useSortable({
		id: props.id,
		data: props.data,
	});
	const  lang = localStorage.getItem('lang') == 'en' ? 'en' : 'cht';
	const style = {
		position: 'relative',
		transform: CSS.Transform.toString(transform),
		transition,
		'--translate-x': transform ? transform.x : 0,
    '--translate-y': transform ? transform.y : 0,
    '--transition': transition,
		backgroundColor: 'white',
		zIndex: isDragging ? 1 : undefined,
		opacity: isDragging ? 0.6 : 1
	};

	const _onClick = (e)=>{
		if(props.onClick) props.onClick(props.data, e);
		if(child?.length) setIsToggle(!isToggle);
		e.stopPropagation();
		e.preventDefault();
  }
	
	const _handleContextMenu = (e)=> {
		if(props.onContextMenu) props.onContextMenu(props.data, e)
		e.stopPropagation();
		e.preventDefault();
	}

	const className = `tree-item hover-shadow pointer caret ${isToggle ? 'active' : ''}`
	return (
		<li className={className} ref={setNodeRef} {...attributes} style={style} onClick={_onClick} onContextMenu={_handleContextMenu}>
			<ContextMenu
				data={props.data}
				items={props.menuItems}
			>
				<div className="tree-row">
					<div className="tree-cell" style={{ minWidth: 50, maxWidth: 50 }}>
						<div>
							<button
								ref={setActivatorNodeRef}
								{...listeners}
								style={{ backgroundColor: null, borderWidth: 0, cursor: 'all-scroll' }}>
								<ViewHeadlineIcon />
							</button>
						</div>
					</div>
					<div className="tree-cell" style={{ minWidth: 36, maxWidth: 36, justifyContent: 'center', fontWeight: 'bold', color: '#3c8dbc' }}>{child?.length}</div>
					<div className="tree-cell" style={{ width: '100%', fontWeight: 'bold', borderLeft: '1px solid', borderRight: '1px solid' }}>
						<div>
						<div>
						{props.data?.['name_'+lang]}
						</div>
						<div style={{fontSize: 10}}>
						{props.data?.['desc_'+lang]}
						</div>
						</div>
					</div>
					<div className="tree-cell" style={{ minWidth: 80, maxWidth: 80, justifyContent: 'right', borderRight: '1px dotted' }}>
					</div>
					<div className="tree-cell" style={{ minWidth: 80, maxWidth: 80, justifyContent: 'left', borderRight: '1px solid' }}>
					</div>
					<div className="tree-cell" style={{ minWidth: 150, maxWidth: 150, justifyContent: 'space-between', borderRight: '1px solid' }}>
					</div>
					<div className="tree-cell" style={{ minWidth: 150, maxWidth: 150, justifyContent: 'space-between', borderRight: '1px solid', fontWeight: 'bold' }}>
					{!isToggle ? <>
						<div>HK$</div>
						<div>
								{
									toMoney(child?.reduce((a, b) => {
										try {
											if (b.price.amount) return a + (parseFloat(b.price.amount) || 0)
											return a
										} catch (error) {
											return a
										}
									}, 0))
								}
						</div>
					</> : null}
					</div>
					<div className="tree-cell-action" style={{ minWidth: 50}}>
						{props.actions && props.actions(props.data)}
					</div>
				</div>
			</ContextMenu>
			{
				child && child.length > 0 &&
				<ul style={{ padding: 0, margin: 0 }}>
					<SortableList
						items={child}
						renderItem={(item, index) => <QuotationInvoiceItemChild
							key={item.id + '_' + index}
							index={index}
							id={item.id}
							text={item.name_cht}
							data={item}
							actions={props.actions}
							menuItems={props.childMenuItems}
						/>}
					/>
				</ul>
			}
		</li>
	)
};

export const QuotationInvoiceItemChild = function (props) {

	const {id, child, sactions, price} = props.data;
	
	const { isDragging, attributes, listeners, transform, transition, setNodeRef, setActivatorNodeRef } = useSortable({
		id: props.id,
		data: props.data
	});
	const lang = localStorage.getItem('lang') == 'en' ? 'en' : 'cht';
	const style = {
		position: 'relative',
		transform: CSS.Transform.toString(transform),
		transition,
		'--translate-x': transform ? transform.x : 0,
    '--translate-y': transform ? transform.y : 0,
    '--transition': transition,
		backgroundColor: 'white',
		zIndex: isDragging ? 1 : undefined,
		opacity: isDragging ? 0.6 : 1,
	};

	const _handleContextMenu = (e)=> {
		if(props.onContextMenu) props.onContextMenu(props.data, e)
		e.stopPropagation();
		e.preventDefault();
	}

	const _onDoubleClick = (e)=> {
		if(props.onDoubleClick)props.onDoubleClick(props.data, e)
     e.stopPropagation();
		 e.preventDefault();
	 }

	return (
		<li className="tree-item hover-shadow child nested sub cursor-default" 
		ref={setNodeRef}
		{...attributes} 
		style={style} 
		onContextMenu={_handleContextMenu} 
		onDoubleClick={_onDoubleClick} 
		onClick={(e)=>{
			e.stopPropagation();
			e.preventDefault();
	  }}>
			<ContextMenu
			  data={props.data}	
				items={props.menuItems}
			>
				<div className="tree-row">
					<div className="tree-cell" style={{minWidth: 56, maxWidth: 56 }}>
						<div className="border-left"></div>
						<div className="border-bottom"></div>
						<div>
							<button
								ref={setActivatorNodeRef}
								{...listeners}
								style={{ backgroundColor: null, borderWidth: 0, cursor: 'all-scroll' }}>
								<ViewHeadlineIcon />
							</button>
						</div>
					</div>
					<div className="tree-cell" style={{ width: '100%', paddingLeft: 15, fontWeight: 'bold', borderLeft: '1px solid', borderRight: '1px solid' }}>
						<div>
							<div>
								{props.data?.['name_' + lang] ? ` - ${props.data?.['name_' + lang]}` : ''}
							</div>
							<div style={{ fontSize: 10 }}>
							  {props.data?.['desc_' + lang] ? `   ${props.data?.['desc_' + lang]}` : ''}
							</div>
						</div>
					</div>
					<div className="tree-cell" style={{ minWidth: 80, maxWidth: 80, justifyContent: 'right', borderRight: '1px dotted' }}>
						{price?.quantity ?? ''}
					</div>
					<div className="tree-cell" style={{ minWidth: 80, maxWidth: 80, justifyContent: 'left', borderRight: '1px solid' }}>
						{price?.unit_cht != null ? price?.unit_cht : ''}
					</div>
					<div className="tree-cell" style={{ minWidth: 150, maxWidth: 150, justifyContent: 'space-between', borderRight: '1px solid' }}>
						<div>HK$</div>
						<div>{price?.value ? toMoney(price.value) : ''}</div>
					</div>
					<div className="tree-cell" style={{ minWidth: 150, maxWidth: 150, justifyContent: 'space-between', borderRight: '1px solid' }}>
						<div>HK$</div>
						<div>{price?.amount? toMoney(price.amount) : ''}</div>
					</div>
					<div className="tree-cell-action"  style={{ minWidth: 100}}>
						{props.actions && props.actions(props.data)}
					</div>
				</div>
			</ContextMenu>
		</li>
	)

};

export const BookAccountItem = function SortableItem(props) {

	const { id, isPlaceholder, balance, child } = props.data;
	const sumOfChildbalance = child.reduce((a, b) => { return a+b.balance}, 0)
  const [isToggle, setIsToggle] = useState(true);
	const { isDragging, attributes, listeners, transform, transition, setNodeRef, setActivatorNodeRef } = useSortable({
		id: props.id,
		data: props.data,
	});

	const style = {
		position: 'relative',
		transform: CSS.Transform.toString(transform),
		transition,
		'--translate-x': transform ? transform.x : 0,
    '--translate-y': transform ? transform.y : 0,
    '--transition': transition,
		backgroundColor: 'white',
		zIndex: isDragging ? 1 : undefined,
		opacity: isDragging ? 0.6 : 1,
		minWidth: 892
	};

	const _onClick = (e)=>{
		if(props.onClick) props.onClick(props.data, e);
		e.stopPropagation();
		e.preventDefault();
		if(child?.length) setIsToggle(!isToggle);
		if(!isToggle) localStorage.setItem('activeAccount-'+id, 1);
		else localStorage.removeItem('activeAccount-'+id);
  }
	
	const _onDoubleClick = (e)=>{
		if(props.onDoubleClick && !isPlaceholder) props.onDoubleClick(props.data, e);
		e.stopPropagation();
		e.preventDefault();
  }

	const _handleContextMenu = (e)=> {
		if(props.onContextMenu) props.onContextMenu(props.data, e)
		e.stopPropagation();
		e.preventDefault();
	}

	useEffect(()=>{
		if(localStorage.getItem('activeAccount-'+id)) {
			setIsToggle(true);
			let node = document.getElementById(id);
			node.classList.add('active');
		}
		else setIsToggle(false);
	}, [id])

	return (
		<li className={`tree-item hover-shadow caret ${isPlaceholder ? '' : 'pointer'}`} id={id} ref={setNodeRef} {...attributes} style={style} onContextMenu={_handleContextMenu} onDoubleClick={_onDoubleClick}>
			<ContextMenu
			  data={props.data}	
				items={props.menuItems}
			>
				<div className="tree-row">
					<div className="tree-cell account-item-cell">
						<div style={{ width: 30 }}>
							{child?.length > 0 && <ArrowRightIcon sx={{ transform: isToggle ? 'rotate(90deg)' : 'rotate(0deg)' }}/>}
						</div>
					</div>
					<div className="tree-cell account-item-cell" style={{ width: '100%', fontWeight: isPlaceholder ? 'bold' : 400, textDecoration: isPlaceholder ? 'underline' : null, fontStyle: isPlaceholder ? 'italic' : null }}>
						<div className='pointer' onClick={_onClick}>
						{props.name}
						</div>
					</div>
					<div className="tree-cell" style={{ minWidth: 200, maxWidth: 200, justifyContent: 'space-between', borderRight: '1px solid', fontWeight: 'bold' }}>
						<div>HK$</div>
						<div>
							{
								toMoney(balance)
							}
						</div>
					</div>
					<div className="tree-cell-action">
						{props.actions && props.actions(props.data)}
					</div>
				</div>
			</ContextMenu>
			{
				child && child.length > 0 &&
				<ul style={{ padding: 0, margin: 0 }}>
					<SortableList
						items={child}
						renderItem={(item, index) => <BookAccountItemChild
							key={index}
							index={index}
							data={item}
							{...item}
							actions={props.actions}
							menuItems={props.menuItems}
							onClick={props.onClick}
							onDoubleClick={props.onDoubleClick}
							 />}
					/>
				</ul>
			}
		</li>
	)
};

export const BookAccountItemChild = function SortableItem(props) {

	const {id, child, isPlaceholder, balance, actions, data} = props.data;
	const sumOfChildbalance = child.reduce((a, b) => { return a+b.balance}, 0)
  const [isToggle, setIsToggle] = useState(false);
	const { isDragging, attributes, listeners, transform, transition, setNodeRef, setActivatorNodeRef } = useSortable({
		id: props.id,
		data: props.data
	});

	const style = {
		position: 'relative',
		transform: CSS.Transform.toString(transform),
		transition,
		'--translate-x': transform ? transform.x : 0,
    '--translate-y': transform ? transform.y : 0,
    '--transition': transition,
		backgroundColor: 'white',
		zIndex: isDragging ? 1 : undefined,
		opacity: isDragging ? 0.6 : 1,
		minWidth: 692 - 40
	};

	const _onClick = (e)=>{
		if(props.onClick) props.onClick(props.data, e);
		e.stopPropagation();
		e.preventDefault();
		if(child?.length) setIsToggle(!isToggle);
		if(!isToggle) localStorage.setItem('activeAccount-'+id, 1);
		else localStorage.removeItem('activeAccount-'+id);
  }

	const _onDoubleClick = (e)=>{
		if(props.onDoubleClick && !isPlaceholder) props.onDoubleClick(props.data, e);
		e.stopPropagation();
		e.preventDefault();
  }

	const _handleContextMenu = (e)=> {
		if(props.onContextMenu) props.onContextMenu(props.data, e)
		e.stopPropagation();
		e.preventDefault();
	}

	useEffect(()=>{
		if(localStorage.getItem('activeAccount-'+id)) {
			setIsToggle(true);
			let node = document.getElementById(id);
			node.classList.add('active');
		}
		else setIsToggle(false);
	}, [id])

	return (
		<li className={`tree-item hover-shadow child nested sub ${isPlaceholder ? '' : 'pointer'}`} id={id} ref={setNodeRef} {...attributes} style={style} onContextMenu={_handleContextMenu} onDoubleClick={_onDoubleClick}>
			<ContextMenu
			  data={props.data}	
				items={props.menuItems}
			>
				<div className="tree-row">
					<div className="tree-cell account-item-cell">
						<div style={{ width: 30 }}>
							{child?.length > 0 && <ArrowRightIcon sx={{ transform: isToggle ? 'rotate(90deg)' : 'rotate(0deg)' }} />}
						</div>
					</div>
					<div className="tree-cell account-item-cell" style={{ width: '100%', fontWeight: isPlaceholder ? 'bold' : 400, textDecoration: isPlaceholder ? 'underline' : null, fontStyle: isPlaceholder ? 'italic' : null }}>
					<div className='pointer' onClick={_onClick}>
						{props.name}
						</div>
					</div>
					<div className="tree-cell" style={{ minWidth: 200, maxWidth: 200, justifyContent: 'space-between', borderRight: '1px solid' }}>
					  {/* {
						!isToggle && child && child?.length > 0 && <>
							<div>HK$</div>
							<div>
								{
									toMoney(sumOfChildbalance)
								}
							</div>
						</>
						}
						{
						(!child || child?.length == 0) && <>
							<div>HK$</div>
							<div>
								{
									toMoney(balance)
								}
							</div>
						</>
						} */}
						<div>HK$</div>
						<div>
							{
								toMoney(balance)
							}
						</div>
					</div>
					<div className="tree-cell-action" style={{ width: 'auto' }}>
						{props.actions && props.actions(props.data)}
					</div>
				</div>
			</ContextMenu>
			{
				child && child.length > 0 &&
				<ul style={{ padding: 0, margin: 0 }}>
					<SortableList
						items={child}
						renderItem={(item, index) => <BookAccountItemChild
							key={index}
							index={index}
							data={item}
							{...item}
							actions={props.actions}
							menuItems={props.menuItems}
							onClick={props.onClick}
							 />}
					/>
				</ul>
			}
		</li>
	)

};

export const ImportQuotationItem = function SortableItem(props) {

	const [optionsContext, optionsContextDispatch, {
    measurementOptions
  }] = useContext(OptionsContext);

	const { id, child, nameCht, nameEn, prices } = props.data;
  const lang = localStorage.getItem('lang') == 'en' ? 'En' : 'Cht';
	const checkBoxRef = useRef(null);
	const [qty, setQty] = useState(props.data?.templatePrice?.qty);
	const [priceId, setPriceId] = useState(props.data?.templatePrice?.priceId);
  const [isSelected, setIsSelected] = useState(props.data?.templatePrice?.checked??false);
	const [price, setPrice] = useState(props.data?.templatePrice?.price);
	const [unitId, setUnitId] = useState(props.data?.templatePrice?.unitId);
	const [templatePrice, setTemplatePrice] = useState({
		itemId: id,
		priceId: priceId,
		price: price,
		qty: qty,
		unitId: unitId,
		checked: isSelected
	});

	const { isDragging, attributes, listeners, transform, transition, setNodeRef, setActivatorNodeRef } = useSortable({
		id: props.id,
		data: props.data,
	});

	const style = {
		position: 'relative',
		transform: CSS.Transform.toString(transform),
		transition,
		'--translate-x': transform ? transform.x : 0,
    '--translate-y': transform ? transform.y : 0,
    '--transition': transition,
		backgroundColor: 'white',
		zIndex: isDragging ? 1 : undefined,
		opacity: isDragging ? 0.6 : 1
	};

	const isHeigtLight = useMemo(()=>{
		let isHeigtLight = false;
		if(props.keyword && props.keyword.length) isHeigtLight = nameCht.includes(props.keyword) || nameEn.includes(props.keyword)
    return isHeigtLight
	}, [props.keyword])

	const _onClick = (e)=>{
		if(props.onClick) props.onClick(props.data, e);
		e.stopPropagation();
		e.preventDefault();
  }
	
	const _handleContextMenu = (e)=> {
		if(props.onContextMenu) props.onContextMenu(props.data, e)
		e.stopPropagation();
		e.preventDefault();
	}

	const menuItems = ()=>{
		if( typeof props.menuItems == 'function') return props.menuItems(props.data)
		return props.menuItems
	}

	const QtyInput = useCallback((props) => {
		return (<Input
			style={{ width: '100%', textAlign: 'center' }}
			type="number"
			placeholder="數量"
			variant="standard"
			value={props.value}
			InputProps={{
				inputProps: { min: 0 },
			}}
			onChange={(e) => {
				setQty(parseInt(e.target.value))
			}}
		/>)
	}, [])

	const PriceInput = useCallback((props) => {
		return (<Input
			style={{ height: '100%', width: '100%', textAlign: 'center' }}
			type="number"
			placeholder="價錢"
			variant="standard"
			value={props.value}
			InputProps={{
				inputProps: { min: 0 },
			}}
			onChange={(e) => {
				setPrice(parseFloat(e.target.value))
			}}
		/>)
	}, [])

	const Checkbox = (props) => {
		return <input
		  ref={checkBoxRef}
			className='pointer importCheckbox'
			style={{ height: 25, width: 25 }}
			type="checkbox"
			checked={isSelected}
			onChange={(c) => {
				setIsSelected(c.target.checked)
			}} />
	}

	useEffect(()=>{

    setTemplatePrice({
			itemId: id,
			priceId: priceId,
			price: price,
			qty: qty,
			unitId: unitId,
			checked: isSelected
		});

		if(props.onItemChange) props.onItemChange({
			itemId: id,
			priceId: priceId,
			price: price,
			qty: qty,
			unitId: unitId,
			checked: isSelected,
			ref: checkBoxRef,
			setIsSelected: setIsSelected
		}, props.data);
	},[priceId, qty, isSelected, price])

	return (
		<li className="import-quotation-item tree-item hover-shadow pointer caret active" ref={setNodeRef} {...attributes} style={style} onClick={_onClick}>
			<ContextMenu
			  data={props.data}	
				items={menuItems()}
			>
				<div className="tree-row">
				  <div className="tree-cell" style={{minWidth: 50}}>
					  <div>
							<button style={{ backgroundColor: null, borderWidth: 0 }}>
								<ArrowRightIcon />
							</button>
						</div>
					</div>
					<div className="tree-cell" style={{ minWidth: 25, justifyContent: 'center', color: '#3c8dbc' }}>{child?.length}</div>
					<div className="tree-cell" style={{ width: '100%', minWidth: 250, background: isHeigtLight ? 'yellow' : 'none', borderRight: '1px solid' }}>
						{lang == 'En' ? props.data.nameEn : props.data.nameCht}
					</div>
					<div className="tree-cell" style={{ minWidth: 100, maxWidth: 100, justifyContent: 'right', borderRight: '1px dotted' }}>
					<QtyInput value={qty}/>
					</div>
					<div className="tree-cell" style={{ minWidth: 100, maxWidth: 100, justifyContent: 'left', borderRight: '1px solid' }}>
						{measurementOptions.find(x => unitId == x.id)?.['name' + lang]}
					</div>
					<div className="tree-cell" style={{ minWidth: 150, maxWidth: 150, justifyContent: 'space-between', borderRight: '1px solid' }}>
						{prices?.length ? <Select
							variant="standard"
							searchable={true}
							items={prices}
							render={row =>
								<MenuItem sx={{ borderWidth: 1, borderStyle: 'groove', width: '100%', margin: 0 }}
									key={row.id}
									value={row.id}>
									{toMoney(row.price)} {row.deleted ? '(已刪除)' : ''}
								</MenuItem>
							}
							value={priceId}
							onChange={(e) => {
								setUnitId(prices.find(x => x.id == parseInt(e.target.value))?.unitId);
								setPriceId(parseInt(e.target.value));
								setPrice(parseFloat(prices.find(x => x.id == parseInt(e.target.value))?.price??0));
							}}
						/> :
            <PriceInput value={price} />
						}
					</div>
					<div className="tree-cell" style={{ minWidth: 50, maxWidth: 150, justifyContent: 'space-between', borderRight: '1px solid' }}>
						<Checkbox />
					</div>
					<div className="tree-cell-action">
						{props.actions && props.actions(props.data)}
					</div>
				</div>
			</ContextMenu>
			{
				child && child.length > 0 &&
				<ul style={{ padding: 0, margin: 0 }}>
					<SortableList
						items={child}
						renderItem={(item, index) => <ImportQuotationItemChild
							key={index}
							index={index}
							id={item.id}
							data={item}
							actions={props.actions}
							menuItems={props.menuItems}
							onClick={props.onClick}
							keyword={props.keyword}
							onItemChange={props.onItemChange}
							 />}
					/>
				</ul>
			}
		</li>
	)
};

export const ImportQuotationItemChild = function SortableItem(props) {

	const [optionsContext, optionsContextDispatch, {
    measurementOptions
  }] = useContext(OptionsContext);

	const checkBoxRef = useRef(null);
	const { id, child, nameCht, nameEn, prices } = props.data;
	const lang = localStorage.getItem('lang') == 'en' ? 'En' : 'Cht';
	const [qty, setQty] = useState(props.data?.templatePrice?.qty);
	const [priceId, setPriceId] = useState(props.data?.templatePrice?.priceId);
  const [isSelected, setIsSelected] = useState(props.data?.templatePrice?.checked??false);
	const [price, setPrice] = useState(props.data?.templatePrice?.price);
	const [unitId, setUnitId] = useState(props.data?.templatePrice?.unitId);
	const [templatePrice, setTemplatePrice] = useState({
		itemId: id,
		priceId: priceId,
		price: price, 
		qty: qty, 
		unitId: unitId,
		checked: isSelected
	});

	const { isDragging, attributes, listeners, transform, transition, setNodeRef, setActivatorNodeRef } = useSortable({
		id: props.id,
		data: props.data,
	});

	const style = {
		position: 'relative',
		transform: CSS.Transform.toString(transform),
		transition,
		'--translate-x': transform ? transform.x : 0,
    '--translate-y': transform ? transform.y : 0,
    '--transition': transition,
		backgroundColor: 'white',
		zIndex: isDragging ? 1 : undefined,
		opacity: isDragging ? 0.6 : 1
	};

	const isHeigtLight = useMemo(()=>{
		let isHeigtLight = false;
		if(props.keyword && props.keyword.length) isHeigtLight = nameCht.includes(props.keyword) || nameEn.includes(props.keyword)
    return isHeigtLight
	}, [props.keyword])

	const _onClick = (e)=>{
		if(props.onClick) props.onClick(props.data, e);
		e.stopPropagation();
		e.preventDefault();
  }
	
	const _handleContextMenu = (e)=> {
		if(props.onContextMenu) props.onContextMenu(props.data, e)
		e.stopPropagation();
		e.preventDefault();
	}

	const menuItems = ()=>{
		if( typeof props.menuItems == 'function') return props.menuItems(props.data)
		return props.menuItems
	}

	const QtyInput = useCallback((props) => {
		return (<Input
			style={{ width: '100%', textAlign: 'center' }}
			type="number"
			placeholder="數量"
			variant="standard"
			value={props.value}
			InputProps={{
				inputProps: { min: 0 },
			}}
			onChange={(e) => {
				setQty(parseInt(e.target.value))
			}}
		/>)
	}, [])

	const PriceInput = useCallback((props) => {
		return (<Input
			style={{ height: '100%', width: '100%', textAlign: 'center' }}
			type="number"
			placeholder="價錢"
			variant="standard"
			value={props.value}
			InputProps={{
				inputProps: { min: 0 },
			}}
			onChange={(e) => {
				setPrice(parseFloat(e.target.value))
			}}
		/>)
	}, [])

	const Checkbox = (props) => {
		return <input
		  ref={checkBoxRef}
			className='pointer importCheckbox'
			style={{ height: 25, width: 25 }}
			type="checkbox"
			checked={isSelected}
			onChange={(c) => {
				setIsSelected(c.target.checked)
			}} />
	}

	useEffect(()=>{
		
    setTemplatePrice({
			itemId: id,
			priceId: priceId,
			price: price,
			qty: qty,
			unitId: unitId,
			checked: isSelected
		});

		if(props.onItemChange) props.onItemChange({
			itemId: id,
			priceId: priceId,
			price: price,
			qty: qty,
			unitId: unitId,
			checked: isSelected,
			ref: checkBoxRef,
			setIsSelected: setIsSelected
		}, props.data);
	},[priceId, qty, isSelected, price])

	return (
		<li className="import-quotation-item tree-item hover-shadow pointer caret child nested sub active" ref={setNodeRef} {...attributes} style={style} onClick={_onClick}>
			<ContextMenu
			  data={props.data}	
				items={props.menuItems}
			>
				<div className="tree-row">
				  <div className="tree-cell" style={{minWidth: 50}}>
						<div className="border-left"></div>
						<div className="border-bottom"></div>
						<div>
							<button style={{ backgroundColor: null, borderWidth: 0 }}>
								<ArrowRightIcon />
							</button>
						</div>
					</div>
					{child?.length > 0 && <div className="tree-cell" style={{ minWidth: 25, justifyContent: 'center', color: '#3c8dbc' }}>{child?.length}</div>}
					<div className="tree-cell" style={{ width: '100%', minWidth: 250, background: isHeigtLight ? 'yellow' : 'none', borderRight: '1px solid' }}>
						{lang == 'En' ? props.data.nameEn : props.data.nameCht}
					</div>
					<div className="tree-cell" style={{ minWidth: 100, maxWidth: 100, justifyContent: 'right', borderRight: '1px dotted' }}>
					<QtyInput value={qty}/>
					</div>
					<div className="tree-cell" style={{ minWidth: 100, maxWidth: 100, justifyContent: 'left', borderRight: '1px solid' }}>
						{unitId && measurementOptions.find(x => unitId == x.id)?.['name' + lang]}
					</div>
					<div className="tree-cell" style={{ minWidth: 150, maxWidth: 150, justifyContent: 'space-between', borderRight: '1px solid' }}>
						{prices?.length ? <Select
							variant="standard"
							searchable={true}
							items={prices}
							render={row =>
								<MenuItem sx={{ borderWidth: 1, borderStyle: 'groove', width: '100%', margin: 0 }}
									key={row.id}
									value={row.id}>
									{toMoney(row.price)} {row.deleted ? '(已刪除)' : ''}
								</MenuItem>
							}
							value={priceId}
							onChange={(e) => {
								setUnitId(prices.find(x => x.id == parseInt(e.target.value))?.unitId);
								setPriceId(parseInt(e.target.value));
								setPrice(parseFloat(prices.find(x => x.id == parseInt(e.target.value))?.price??0));
							}}
						/> :
            <PriceInput value={price} />
						}
					</div>
					<div className="tree-cell" style={{ minWidth: 50, maxWidth: 150, justifyContent: 'space-between', borderRight: '1px solid' }}>
						<Checkbox />
					</div>
					<div className="tree-cell-action" style={{ width: 'auto' }}>
						{props.actions && props.actions(props.data)}
					</div>
				</div>
			</ContextMenu>
			{
				child && child.length > 0 &&
				<ul style={{ padding: 0, margin: 0 }}>
					<SortableList
						items={child}
						renderItem={(item, index) => <ImportQuotationItemChild
							key={index}
							index={index}
							id={item.id}
							data={item}
							actions={props.actions}
							menuItems={props.menuItems}
							onClick={props.onClick}
							keyword={props.keyword}
							onItemChange={props.onItemChange}
							 />}
					/>
				</ul>
			}
		</li>
	)

};

export const ImportQuotationTemplate = function SortableItem(props) {

	const [optionsContext, optionsContextDispatch, {
    measurementOptions
  }] = useContext(OptionsContext);

	const { id, child, nameCht, nameEn, prices, unitCht, unitEn } = props.data;
  const lang = localStorage.getItem('lang') == 'en' ? 'En' : 'Cht';
	const checkBoxRef = useRef(null);
	const [qty, setQty] = useState(props.data?.templatePrice?.qty);
	const [priceId, setPriceId] = useState(props.data?.templatePrice?.priceId);
  const [isSelected, setIsSelected] = useState(props.data?.templatePrice?.checked??false);
	const [price, setPrice] = useState(props.data?.templatePrice?.price);
	const [unitId, setUnitId] = useState(props.data?.prices?.unitId);
	const [templatePrice, setTemplatePrice] = useState({
		itemId: id,
		priceId: priceId,
		price: price,
		qty: qty,
		unitId: unitId,
		checked: isSelected
	});

	const { isDragging, attributes, listeners, transform, transition, setNodeRef, setActivatorNodeRef } = useSortable({
		id: props.id,
		data: props.data,
	});

	const style = {
		position: 'relative',
		transform: CSS.Transform.toString(transform),
		transition,
		'--translate-x': transform ? transform.x : 0,
    '--translate-y': transform ? transform.y : 0,
    '--transition': transition,
		backgroundColor: 'white',
		zIndex: isDragging ? 1 : undefined,
		opacity: isDragging ? 0.6 : 1
	};

	const isHeigtLight = useMemo(()=>{
		let isHeigtLight = false;
		if(props.keyword && props.keyword.length) isHeigtLight = nameCht.includes(props.keyword) || nameEn.includes(props.keyword)
    return isHeigtLight
	}, [props.keyword])

	const _onClick = (e)=>{
		if(props.onClick) props.onClick(props.data, e);
		e.stopPropagation();
		e.preventDefault();
  }
	
	const _handleContextMenu = (e)=> {
		if(props.onContextMenu) props.onContextMenu(props.data, e)
		e.stopPropagation();
		e.preventDefault();
	}

	const menuItems = ()=>{
		if( typeof props.menuItems == 'function') return props.menuItems(props.data)
		return props.menuItems
	}

	const QtyInput = useCallback((props) => {
		return (<Input
			style={{ width: '100%', textAlign: 'center' }}
			type="number"
			placeholder="數量"
			variant="standard"
			value={props.value}
			InputProps={{
				inputProps: { min: 0 },
			}}
			onChange={(e) => {
				setQty(parseInt(e.target.value))
			}}
		/>)
	}, [])

	const PriceInput = useCallback((props) => {
		return (<Input
			style={{ height: '100%', width: '100%', textAlign: 'center' }}
			type="number"
			placeholder="價錢"
			variant="standard"
			value={props.value}
			InputProps={{
				inputProps: { min: 0 },
			}}
			onChange={(e) => {
				setPrice(parseFloat(e.target.value))
			}}
		/>)
	}, [])

	const Checkbox = (props) => {
		return <input
		  ref={checkBoxRef}
			className='pointer importCheckbox'
			style={{ height: 25, width: 25 }}
			type="checkbox"
			checked={isSelected}
			onChange={(c) => {
				setIsSelected(c.target.checked)
			}} />
	}

	useEffect(()=>{

    setTemplatePrice({
			itemId: id,
			priceId: priceId,
			price: price,
			qty: qty,
			unitId: unitId,
			checked: isSelected
		});

		if(props.onItemChange) props.onItemChange({
			itemId: id,
			priceId: priceId,
			price: price,
			qty: qty,
			unitId: unitId,
			checked: isSelected,
			ref: checkBoxRef,
			setIsSelected: setIsSelected
		}, props.data);
	},[priceId, qty, isSelected, price])

	return (
		<li className="import-quotation-item tree-item hover-shadow pointer caret active" ref={setNodeRef} {...attributes} style={style} onClick={_onClick}>
			<ContextMenu
			  data={props.data}	
				items={menuItems()}
			>
				<div className="tree-row">
				  <div className="tree-cell" style={{minWidth: 50}}>
					  <div>
							<button style={{ backgroundColor: null, borderWidth: 0 }}>
								<ArrowRightIcon />
							</button>
						</div>
					</div>
					<div className="tree-cell" style={{ minWidth: 25, justifyContent: 'center', color: '#3c8dbc' }}>{child?.length}</div>
					<div className="tree-cell" style={{ width: '100%', minWidth: 250, background: isHeigtLight ? 'yellow' : 'none', borderRight: '1px solid' }}>
						{lang == 'En' ? props.data.nameEn : props.data.nameCht}
					</div>
					<div className="tree-cell" style={{ minWidth: 100, maxWidth: 100, justifyContent: 'right', borderRight: '1px dotted' }}>
					<QtyInput value={qty}/>
					</div>
					<div className="tree-cell" style={{ minWidth: 100, maxWidth: 100, justifyContent: 'left', borderRight: '1px solid' }}>
						{lang == 'En' ? unitEn : unitCht}
					</div>
					<div className="tree-cell" style={{ minWidth: 150, maxWidth: 150, justifyContent: 'space-between', borderRight: '1px solid' }}>
						{prices?.length ? <Select
							variant="standard"
							searchable={true}
							items={prices}
							render={row =>
								<MenuItem sx={{ borderWidth: 1, borderStyle: 'groove', width: '100%', margin: 0 }}
									key={row.id}
									value={row.id}>
									{toMoney(row.price)} {row.deleted ? '(已刪除)' : ''}
								</MenuItem>
							}
							value={priceId}
							onChange={(e) => {
								setUnitId(prices.find(x => x.id == parseInt(e.target.value))?.unitId);
								setPriceId(parseInt(e.target.value));
								setPrice(parseFloat(prices.find(x => x.id == parseInt(e.target.value))?.price??0));
							}}
						/> :
            <PriceInput value={price} />
						}
					</div>
					<div className="tree-cell" style={{ minWidth: 50, maxWidth: 150, justifyContent: 'space-between', borderRight: '1px solid' }}>
						<Checkbox />
					</div>
					<div className="tree-cell-action">
						{props.actions && props.actions(props.data)}
					</div>
				</div>
			</ContextMenu>
			{
				child && child.length > 0 &&
				<ul style={{ padding: 0, margin: 0 }}>
					<SortableList
						items={child}
						renderItem={(item, index) => <ImportQuotationTemplateChild
							key={index}
							index={index}
							id={item.id}
							data={item}
							actions={props.actions}
							menuItems={props.menuItems}
							onClick={props.onClick}
							keyword={props.keyword}
							onItemChange={props.onItemChange}
							 />}
					/>
				</ul>
			}
		</li>
	)
};

export const ImportQuotationTemplateChild = function SortableItem(props) {

	const [optionsContext, optionsContextDispatch, {
    measurementOptions
  }] = useContext(OptionsContext);

	const checkBoxRef = useRef(null);
	const { id, child, nameCht, nameEn, prices, unitCht, unitEn } = props.data;
	const lang = localStorage.getItem('lang') == 'en' ? 'En' : 'Cht';
	const [qty, setQty] = useState(props.data?.templatePrice?.qty);
	const [priceId, setPriceId] = useState(props.data?.templatePrice?.priceId);
  const [isSelected, setIsSelected] = useState(props.data?.templatePrice?.checked??false);
	const [price, setPrice] = useState(props.data?.templatePrice?.price);
	const [unitId, setUnitId] = useState(props.data?.prices?.unitId);
	const [templatePrice, setTemplatePrice] = useState({
		itemId: id,
		priceId: priceId,
		price: price, 
		qty: qty, 
		unitId: unitId,
		checked: isSelected
	});

	const { isDragging, attributes, listeners, transform, transition, setNodeRef, setActivatorNodeRef } = useSortable({
		id: props.id,
		data: props.data,
	});

	const style = {
		position: 'relative',
		transform: CSS.Transform.toString(transform),
		transition,
		'--translate-x': transform ? transform.x : 0,
    '--translate-y': transform ? transform.y : 0,
    '--transition': transition,
		backgroundColor: 'white',
		zIndex: isDragging ? 1 : undefined,
		opacity: isDragging ? 0.6 : 1
	};

	const isHeigtLight = useMemo(()=>{
		let isHeigtLight = false;
		if(props.keyword && props.keyword.length) isHeigtLight = nameCht.includes(props.keyword) || nameEn.includes(props.keyword)
    return isHeigtLight
	}, [props.keyword])

	const _onClick = (e)=>{
		if(props.onClick) props.onClick(props.data, e);
		e.stopPropagation();
		e.preventDefault();
  }
	
	const _handleContextMenu = (e)=> {
		if(props.onContextMenu) props.onContextMenu(props.data, e)
		e.stopPropagation();
		e.preventDefault();
	}

	const menuItems = ()=>{
		if( typeof props.menuItems == 'function') return props.menuItems(props.data)
		return props.menuItems
	}

	const QtyInput = useCallback((props) => {
		return (<Input
			style={{ width: '100%', textAlign: 'center' }}
			type="number"
			placeholder="數量"
			variant="standard"
			value={props.value}
			InputProps={{
				inputProps: { min: 0 },
			}}
			onChange={(e) => {
				setQty(parseInt(e.target.value))
			}}
		/>)
	}, [])

	const PriceInput = useCallback((props) => {
		return (<Input
			style={{ height: '100%', width: '100%', textAlign: 'center' }}
			type="number"
			placeholder="價錢"
			variant="standard"
			value={props.value}
			InputProps={{
				inputProps: { min: 0 },
			}}
			onChange={(e) => {
				setPrice(parseFloat(e.target.value))
			}}
		/>)
	}, [])

	const Checkbox = (props) => {
		return <input
		  ref={checkBoxRef}
			className='pointer importCheckbox'
			style={{ height: 25, width: 25 }}
			type="checkbox"
			checked={isSelected}
			onChange={(c) => {
				setIsSelected(c.target.checked)
			}} />
	}

	useEffect(()=>{
		
    setTemplatePrice({
			itemId: id,
			priceId: priceId,
			price: price,
			qty: qty,
			unitId: unitId,
			checked: isSelected
		});

		if(props.onItemChange) props.onItemChange({
			itemId: id,
			priceId: priceId,
			price: price,
			qty: qty,
			unitId: unitId,
			checked: isSelected,
			ref: checkBoxRef,
			setIsSelected: setIsSelected
		}, props.data);
	},[priceId, qty, isSelected, price])

	return (
		<li className="import-quotation-item tree-item hover-shadow pointer caret child nested sub active" ref={setNodeRef} {...attributes} style={style} onClick={_onClick}>
			<ContextMenu
			  data={props.data}	
				items={props.menuItems}
			>
				<div className="tree-row">
				  <div className="tree-cell" style={{minWidth: 50}}>
						<div className="border-left"></div>
						<div className="border-bottom"></div>
						<div>
							<button style={{ backgroundColor: null, borderWidth: 0 }}>
								<ArrowRightIcon />
							</button>
						</div>
					</div>
					{child?.length > 0 && <div className="tree-cell" style={{ minWidth: 25, justifyContent: 'center', color: '#3c8dbc' }}>{child?.length}</div>}
					<div className="tree-cell" style={{ width: '100%', minWidth: 250, background: isHeigtLight ? 'yellow' : 'none', borderRight: '1px solid' }}>
						{lang == 'En' ? props.data.nameEn : props.data.nameCht}
					</div>
					<div className="tree-cell" style={{ minWidth: 100, maxWidth: 100, justifyContent: 'right', borderRight: '1px dotted' }}>
					<QtyInput value={qty}/>
					</div>
					<div className="tree-cell" style={{ minWidth: 100, maxWidth: 100, justifyContent: 'left', borderRight: '1px solid' }}>
						{lang == 'En' ? unitEn : unitCht}
					</div>
					<div className="tree-cell" style={{ minWidth: 150, maxWidth: 150, justifyContent: 'space-between', borderRight: '1px solid' }}>
						{prices?.length ? <Select
							variant="standard"
							searchable={true}
							items={prices}
							render={row =>
								<MenuItem sx={{ borderWidth: 1, borderStyle: 'groove', width: '100%', margin: 0 }}
									key={row.id}
									value={row.id}>
									{toMoney(row.price)} {row.deleted ? '(已刪除)' : ''}
								</MenuItem>
							}
							value={priceId}
							onChange={(e) => {
								setUnitId(prices.find(x => x.id == parseInt(e.target.value))?.unitId);
								setPriceId(parseInt(e.target.value));
								setPrice(parseFloat(prices.find(x => x.id == parseInt(e.target.value))?.price??0));
							}}
						/> :
            <PriceInput value={price} />
						}
					</div>
					<div className="tree-cell" style={{ minWidth: 50, maxWidth: 150, justifyContent: 'space-between', borderRight: '1px solid' }}>
						<Checkbox />
					</div>
					<div className="tree-cell-action" style={{ width: 'auto' }}>
						{props.actions && props.actions(props.data)}
					</div>
				</div>
			</ContextMenu>
			{
				child && child.length > 0 &&
				<ul style={{ padding: 0, margin: 0 }}>
					<SortableList
						items={child}
						renderItem={(item, index) => <ImportQuotationTemplateChild
							key={index}
							index={index}
							id={item.id}
							data={item}
							actions={props.actions}
							menuItems={props.menuItems}
							onClick={props.onClick}
							keyword={props.keyword}
							onItemChange={props.onItemChange}
							 />}
					/>
				</ul>
			}
		</li>
	)

};


