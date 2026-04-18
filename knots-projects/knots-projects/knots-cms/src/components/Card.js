import React from 'react';
import { useRef } from 'react'
import { useDrag, useDrop } from 'react-dnd'
import { GalleryImage } from './GalleryImage.js'
import { ItemTypes } from './ItemTypes.js'
const style = {
  border: '1px dashed gray',
  padding: '0',
  marginBottom: '.1rem',
  backgroundColor: 'white',
  cursor: 'move',
}
export const Card = ({ id, img, index, moveCard, onSelectedCard, isHighlight, isTarget, isMerge, page, isReset = false, handleReset, isInsert, insertPage, handleResetInsert, originPage, onDoubleClick, sourcePages }) => {
  const ref = useRef(null)
  const [{ handlerId }, drop] = useDrop({
    accept: ItemTypes.CARD,
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      }
    },
    hover(item, monitor) {
      if (!ref.current) {
        return
      }
      const dragIndex = item.index
      const hoverIndex = index
      // Don't replace items with themselves
      if (dragIndex === hoverIndex) {
        return
      }
      // Determine rectangle on screen
      const hoverBoundingRect = ref.current?.getBoundingClientRect()
      // Get vertical middle
      const hoverMiddleY =
        (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2
      // Determine mouse position
      const clientOffset = monitor.getClientOffset()
      // Get pixels to the top
      const hoverClientY = clientOffset.y - hoverBoundingRect.top
      // Only perform the move when the mouse has crossed half of the items height
      // When dragging downwards, only move when the cursor is below 50%
      // When dragging upwards, only move when the cursor is above 50%
      // Dragging downwards
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return
      }
      // Dragging upwards
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return
      }
      // Time to actually perform the action
      moveCard(dragIndex, hoverIndex)
      // Note: we're mutating the monitor item here!
      // Generally it's better to avoid mutations,
      // but it's good here for the sake of performance
      // to avoid expensive index searches.
      item.index = hoverIndex
    },
  })
  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.CARD,
    item: () => {
      return { id, index }
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  })
  const opacity = isDragging ? 0 : 1
  const border = isHighlight ? '2px solid #d32f2f' : '1px dashed gray';
  //const border = sourcePages.includes(index) ? '2px solid blue' : isHighlight ? '2px solid #d32f2f' : '1px dashed gray';
  drag(drop(ref))

  const handleDoubleClick = (index) => {
    onDoubleClick(index);
  };

  return (
    <div ref={ref} style={{ ...style, opacity, border }} data-handler-id={handlerId} onDoubleClick={()=>handleDoubleClick(index)}>
      {/* <img alt={`pdf_thumbnail_${index+1}`} src={`${img}`} /> */}
      <GalleryImage key={index} src={img} onSelectedCard={() => onSelectedCard(index)}
        isTarget={isTarget}
        isMerge={isMerge}
        page={page}
        isReset={isReset}
        handleReset={handleReset}
        isInsert={isInsert}
        insertPage={insertPage}
        handleResetInsert={handleResetInsert}
        index={index}
        originPage={originPage}
        clickPages={sourcePages}
      />
    </div>
  )
}
