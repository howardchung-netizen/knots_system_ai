import { Pagination } from "@mui/material"
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

export default function ({ table, setData, pageIndex, count, renderRow, onPageIndexChange, loading, actions, ...props }) {

	const items = useMemo(() => table.getRowModel().rows?.map((item) => item.original), [table.getRowModel()?.rows]);

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
    if (!active || !over) return;
    if (active.id !== over.id) {
      setData((items) => {
        const oldIndex = items.indexOf(items.find(e => e.id == active.id));
        const newIndex = items.indexOf(items.find(e => e.id == over.id))
        let newItems = arrayMove(items, oldIndex, newIndex);
        if(props.onDragEnd) props.onDragEnd(newItems);
        return newItems;
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
		<DndContext
			sensors={sensors}
			onDragEnd={handleDragEnd}
			onDragStart={handleDragStart}
			onDragCancel={handleDragCancel}
			collisionDetection={closestCenter}
		// modifiers={[restrictToVerticalAxis]}
		>
			<table className="table tree-table">
				<tbody>
					{loading && <PageLoadingProgress color="inherit" />}
					{table.getRowModel().rows.length == 0 && !loading && <tr><td colSpan="100%" className="text-center">No data found</td></tr>}
					<SortableContext items={items} strategy={verticalListSortingStrategy}>
						{items.map((row, i) => {
							return _renderItem(row, i);
						})}
					</SortableContext>
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
									onChange={_onPageIndexChange} />
							</div>
						</td>
					</tr>
				</tfoot>
			</table>
		</DndContext>
	)
}