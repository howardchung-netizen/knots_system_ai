
import { useCallback, useEffect, useRef, useState } from 'react'
import { useDrag, useDrop } from 'react-dnd'
import ViewHeadlineIcon from '@mui/icons-material/ViewHeadline';
import update from 'immutability-helper'

const ItemRow = ({ data, name, childrenCount, children, index, reorderRow, actions, onClick, onDoubleClick, type }) => {
  
	const style = {
    border: '1px dashed gray',
    padding: '0.5rem 1rem',
    marginBottom: '.5rem',
    backgroundColor: 'white'
  };
	const [form, setForm] = useState(children);

	const reorder = useCallback((dragIndex, hoverIndex) => {
    setForm((prevCards) =>
      update(prevCards, {
        $splice: [
          [dragIndex, 1],
          [hoverIndex, 0, prevCards[dragIndex]],
        ],
      }),
    )
  }, [])

  const ref = useRef(null);
	const [{handlerId}, drop] = useDrop(() => ({
    accept: type,
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

			console.log("hover", dragIndex, hoverIndex)

      // Time to actually perform the action
      if(reorderRow) reorderRow(dragIndex, hoverIndex)
      // Note: we're mutating the monitor item here!
      // Generally it's better to avoid mutations,
      // but it's good here for the sake of performance
      // to avoid expensive index searches.

      // item.index = hoverIndex
    },
  }))

  const [{isDragging}, drag, preview] = useDrag({
    type: type,
    item: { ...data, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
			canDrag: monitor.canDrag(),
    })
  });

	const _onClick = (e)=>{
    onClick(data, e);
  }

	const opacity = isDragging ? 0 : 1

	drop(ref);

	useEffect(() => {	
		// setForm(children)
	},[data])

  return (
    <ul className="tree-item caret active" style={{ ...style, opacity }} data-handler-id={handlerId} ref={preview} onClick={_onClick}>
      <li ref={ref}>
        <div className="tree-row">
          <div className="tree-cell">
            <div style={{ width: 50 }}>
              <button ref={drag} style={{ backgroundColor: null, borderWidth: 0, cursor: 'all-scroll' }}>
                <ViewHeadlineIcon />
              </button>
            </div>
          </div>
          <div className="tree-cell" style={{ width: 40, justifyContent: 'center', fontWeight: 'bold', color: '#3c8dbc' }}>{childrenCount}</div>
          <div className="tree-cell" style={{ width: '100%', fontWeight: 'bold' }}>
            {name}
          </div>
          <div className="tree-cell-action" style={{ width: 'auto' }}>
            {actions(data)}
          </div>
        </div>
        {
          form && form.length > 0 &&
          <ul className="tree-item caret">
            {form.map((child, index) => {
              return (
                <ItemRow
                  key={index}
                  data={child}
                  name={child.name_cht}
                  childrenCount={child.child?.length}
                  children={child.child}
                  index={index}
                  type={data.id}
                  reorderRow={reorder}
                  actions={() => { }}
                  onClick={() => { }}
                />
              )
            })}
          </ul>
        }
     
		  </li>
    </ul>
  )
}

export default ItemRow