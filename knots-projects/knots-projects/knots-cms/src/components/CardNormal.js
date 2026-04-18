import React from 'react';
import { GalleryImage } from './GalleryImage.js'
const style = {
  border: '1px dashed gray',
  padding: '0',
  marginBottom: '.1rem',
  backgroundColor: 'white',
}
export const CardNormal = ({ id, img, index, moveCard, onSelectedCard, isHighlight, isTarget, isMerge, page, isReset = false, handleReset, isInsert = false, onDoubleClick, targetPages }) => {

  const border = isHighlight ? '2px solid #d32f2f' : '1px dashed gray';

  const handleDoubleClick = (index) => {
    onDoubleClick(index);
  };
  return (
    <div style={{ ...style, border }} onDoubleClick={()=>handleDoubleClick(index)}>
      {/* <img alt={`pdf_thumbnail_${index+1}`} src={`${img}`} /> */}
      <GalleryImage
      key={index}
      src={img}
      onSelectedCard={() => onSelectedCard(index)}
      isTarget={isTarget}
      isMerge={isMerge}
      page={page}
      isReset={isReset}
      handleReset={handleReset}
      isInsert={isInsert}
      index={index}
      clickPages={targetPages} />
    </div>
  )
}
