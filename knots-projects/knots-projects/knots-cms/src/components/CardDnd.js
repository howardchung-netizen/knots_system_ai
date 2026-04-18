import { useRef } from 'react'
import { useDrag, useDrop } from 'react-dnd'
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

import {useSortable} from '@dnd-kit/sortable';
import {CSS} from '@dnd-kit/utilities';
import { ProjectItem } from './SortableItem';
import {
  restrictToVerticalAxis,
  restrictToWindowEdges,
} from '@dnd-kit/modifiers';

export const Container = (porps) => {
  {
		const [items, setItems] = useState([{"id":"84","name_en":"Test H","name_cht":"測試 H","desc_en":"","desc_cht":"","upper":0,"sort":1,"ref":"84","child":[{"id":"94","name_en":"H-10","name_cht":"H-10","desc_en":"","desc_cht":"","upper":"84","sort":1,"ref":"94","delete":0,"price":{"id":"1","name_en":"N/A","name_cht":"N/A","value":"0.00","unit":1,"unit_en":"Unit","unit_cht":"單位"}},{"id":"93","name_en":"H-9","name_cht":"H-9","desc_en":"","desc_cht":"","upper":"84","sort":2,"ref":"93","delete":0,"price":{"id":"1","name_en":"N/A","name_cht":"N/A","value":"0.00","unit":1,"unit_en":"Unit","unit_cht":"單位"}}],"delete":0},{"id":"17","name_en":"Test A","name_cht":"測試 A","desc_en":"Test A Desc","desc_cht":"測試 A 描述","upper":0,"sort":2,"ref":"17","child":[{"id":"66","name_en":"Test 3A","name_cht":"測試 3A","desc_en":"","desc_cht":"","upper":"17","sort":3,"ref":"66","delete":0,"price":{"id":"1","name_en":"大理石","name_cht":"大理石","value":"10.00","unit":36,"unit_en":"in²","unit_cht":"吋²"}}],"delete":0}])

    const sensors = useSensors(
      useSensor(PointerSensor),
      useSensor(KeyboardSensor, {
        coordinateGetter: sortableKeyboardCoordinates,
      })
    );

    const moveCard = useCallback((dragIndex, hoverIndex) => {
      setItems((prevCards) =>
        update(prevCards, {
          $splice: [
            [dragIndex, 1],
            [hoverIndex, 0, prevCards[dragIndex]],
          ],
        }),
      )
    }, [])

    const renderCard = useCallback((card, index) => {
      return (
        <ProjectItem
          key={card.id}
          index={index}
          id={card.id}
					text={card.name_cht}
          name_en={card.name_en}
					name_cht={card.name_cht}
					desc_en	={card.desc_en}
					desc_cht={card.desc_cht}
          child={card.child}
          data={card}
          moveCard={moveCard}
        />
      )
    }, [])
    
    function handleDragEnd(event) {
      const {active, over} = event;
      
      if (active.id !== over.id) {
        setItems((items) => {
          const oldIndex = items.indexOf(active.id);
          const newIndex = items.indexOf(over.id);
          
          return arrayMove(items, oldIndex, newIndex);
        });
      }
    }

    return (
      <DndContext
        sensors={sensors}
        // modifiers={[restrictToVerticalAxis]}
        // collisionDetection={closestCenter}
        // onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={items}
          // strategy={verticalListSortingStrategy}
        >
          {items.map((item) => (renderCard(item, item.id)))}
        </SortableContext>
      </DndContext>
    )
  }
}

