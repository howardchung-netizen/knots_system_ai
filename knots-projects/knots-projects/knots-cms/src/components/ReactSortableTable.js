import { Pagination } from "@mui/material"
import SortIcon from "../assets/SortIcon"
import { flexRender } from "@tanstack/react-table"
import PageLoadingProgress from "./PageLoadingProgress"
import {
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  restrictToVerticalAxis,
  restrictToWindowEdges,
} from '@dnd-kit/modifiers';
import { useCallback, useMemo, useState } from "react";

export default function ({table, setData, pageIndex, count, renderRow, onPageIndexChange, loading, ...props}) {

	const items = useMemo(() => table.getRowModel().rows?.map((item) => item.original), [table.getRowModel().rows]);

	const [activeId, setActiveId] = useState();

	const selectedRow = useMemo(() => {
		if (!activeId) {
			return null;
		}
		const item = items.find(({ original }) => original.id === activeId);

		return item;
	}, [activeId, items]);

	const sensors = useSensors(
		useSensor(PointerSensor),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		})
	);

	const _renderItem = useCallback((item, index) => {
		return (renderRow(item, index))
	}, [items]);

	function handleDragStart(event) {
		// setActiveId(event.active.id);
	}

	function handleDragEnd(event) {

		const { active, over } = event;
    if(!active || !over) return;
		if (active.id !== over.id) {
			setData((items) => {
				const oldIndex = items.indexOf(items.find(e => e.id == active.id));
				const newIndex = items.indexOf(items.find(e => e.id == over.id))

				return arrayMove(items, oldIndex, newIndex);
			});
		}
	}

	function handleDragCancel() {
		setActiveId(null);
	}

	const _onPageIndexChange = (e, page) => {
		if (onPageIndexChange) onPageIndexChange(e, page)
	}

	return (
		<div style={{overflowX: 'auto'}}>
		<table className="table">
		<thead>
			{table.getHeaderGroups().map(headerGroup => (
				<tr key={'tr_key'}>
					{headerGroup.headers.map((header, index) => {
						let canSort = header.column.columnDef.canSort;
						return <th key={"th_"+index} style={{ 
							width: header.column.columnDef.width ?? '450'}}>
							<div className={`thInner ${canSort ? 'pointer' : ''}`}>
								<div className="thInnnerContent">
									<div className="headerText"
										style={{
											textAlign: header.column.columnDef.textAlign ?? 'left',
											...header.column.columnDef.style
										}}
										onClick={ canSort ? header.column.getToggleSortingHandler() : null}>
										{flexRender(
											header.column.columnDef.header,
											header.getContext()
										)}
									</div>
									{canSort && <button
										className="sortBtn table-header-sort-btn"
										tabIndex="-1"
										type="button"
										aria-label="Sort"
										title="Sort"
										onClick={ canSort ? header.column.getToggleSortingHandler() : null}>
										{{
											asc: <SortIcon sortBy="asc" />,
											desc: <SortIcon sortBy="dsce" />,
										}[header.column.getIsSorted()] ?? null}
										{/* {
											sorting.length == 0 &&
											<SortIcon />
										} */}
									</button>}
								</div>
								{
									index < headerGroup.headers.length - 1 && (
										<div className="rightBorderWrap">
											<svg className="" focusable="false" aria-hidden="true" viewBox="0 0 24 24" data-testid="SeparatorIcon"><path d="M11 19V5h2v14z"></path></svg>
										</div>
									)
								}
							</div>
						</th>
					})}
				</tr>
			))}
		</thead>
		<tbody>
			{loading && <PageLoadingProgress color="inherit" />}
			{table.getRowModel().rows.length == 0 && !loading && <tr><td colSpan="100%" className="text-center">No data found</td></tr>}
			{table.getRowModel().rows.map((row, index) => (
				renderRow(row, index)
			))}
			{/* <SortableContext items={items} strategy={verticalListSortingStrategy}>
				{items.map((row, i) => {
					return _renderItem(row, i);
				})}
			</SortableContext> */}
		</tbody>
		<tfoot>
			<tr className="flex items-center gap-2">
				<td colSpan="100%">
					<div>	
						<Pagination 
						color="primary" 
						count={count}
						page={pageIndex} 
						defaultPage={1} 
						onChange={_onPageIndexChange}/>
					</div>
				</td>
			</tr>
		</tfoot>
	</table>
	</div>
	)
}