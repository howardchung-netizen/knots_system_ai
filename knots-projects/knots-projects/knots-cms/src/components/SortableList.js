import * as React from 'react';
import update from 'immutability-helper'
import { useCallback, useState } from 'react'
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
import PageLoadingProgress from './PageLoadingProgress';

export const SortableList = ({ items, renderItem, loading, onDragEnd }) => {

  const [_items, setItems] = useState([])

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const _renderItem = useCallback((item, index) => {
    return (renderItem(item, index))
  }, [_items]);

  function handleDragEnd(event) {
    const { active, over } = event;
    if (!active || !over) return;
    if (active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.indexOf(items.find(e => e.id == active.id));
        const newIndex = items.indexOf(items.find(e => e.id == over.id))
        let newItems = arrayMove(items, oldIndex, newIndex);
        if(onDragEnd) onDragEnd(newItems);
        return newItems;
      });
    }
  }

  React.useEffect(() => {
    setItems(items ?? [])
  }, [items])

  return (
    <DndContext
      sensors={sensors}
      // modifiers={[restrictToVerticalAxis, restrictToWindowEdges]}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={_items}
        strategy={verticalListSortingStrategy}
      >
        {_items?.map((item, index) => (_renderItem(item, index)))}
      </SortableContext>
    </DndContext>
  )

}