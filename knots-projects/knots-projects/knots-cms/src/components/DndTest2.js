import { memo, useCallback, useMemo, useState } from 'react'
import { useDrag } from 'react-dnd'

export const Colors = {
  YELLOW: 'yellow',
  BLUE: 'blue',
}

const style = {
  border: '1px dashed gray',
  padding: '0.5rem',
  margin: '0.5rem',
}
export const SourceBox = memo(function SourceBox({ color, children }) {
  const [forbidDrag, setForbidDrag] = useState(false)
  const [{ isDragging }, drag] = useDrag(
    () => ({
      type: color,
      canDrag: !forbidDrag,
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    }),
    [forbidDrag, color],
  )
  const onToggleForbidDrag = useCallback(() => {
    setForbidDrag(!forbidDrag)
  }, [forbidDrag, setForbidDrag])
  const backgroundColor = useMemo(() => {
    switch (color) {
      case Colors.YELLOW:
        return 'lightgoldenrodyellow'
      case Colors.BLUE:
        return 'lightblue'
      default:
        return 'lightgoldenrodyellow'
    }
  }, [color])
  const containerStyle = useMemo(
    () => ({
      ...style,
      backgroundColor,
      opacity: isDragging ? 0.4 : 1,
      cursor: forbidDrag ? 'default' : 'move',
    }),
    [isDragging, forbidDrag, backgroundColor],
  )
  return (
    <div ref={drag} style={containerStyle} role="SourceBox" data-color={color}>
      <input
        type="checkbox"
        checked={forbidDrag}
        onChange={onToggleForbidDrag}
      />
      <small>Forbid drag</small>
      {children}
    </div>
  )
})

export const Container = memo(function Container() {
  return (
    <div style={{ overflow: 'hidden', clear: 'both', margin: '-.5rem' }}>
      <div style={{ float: 'left' }}>
        <SourceBox color={Colors.BLUE}>
          <SourceBox color={Colors.YELLOW}>
            <SourceBox color={Colors.YELLOW} />
            <SourceBox color={Colors.BLUE} />
          </SourceBox>
          <SourceBox color={Colors.BLUE}>
            <SourceBox color={Colors.YELLOW} />
          </SourceBox>
        </SourceBox>
      </div>

      {/* <div style={{ float: 'left', marginLeft: '5rem', marginTop: '.5rem' }}>
        <TargetBox />
      </div> */}
    </div>
  )
})

