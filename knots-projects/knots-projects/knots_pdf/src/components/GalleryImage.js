import React from 'react';
import CompareIcon from '@mui/icons-material/Compare';
import Badge from '@mui/material/Badge';
import RotateLeftIcon from '@mui/icons-material/RotateLeft';

export const GalleryImage = ({ src, onSelectedCard, isTarget, isMerge, page, isReset = false, handleReset, isInsert, insertPage = 0, handleResetInsert, index, originPage, clickPages }) => {
  const handleSelect = () => {
    onSelectedCard();
  };

  const handle_reset = () => {
    if (isReset) {
      handleReset();
    } else {
      handleResetInsert();
    }
  };

  const RenderMerge = () => {
    return (
        <Badge badgeContent={isMerge ? page : isInsert ? '+' : 0} color="primary" overlap="circular"
        sx={{ "& .MuiBadge-badge": { fontSize: 16, height: 24, width: 24, top:0, right:0, borderRadius:'100%' } }} >
          <RenderContent/>
        </Badge>
    )
  }

  const RenderPages = () => {
    const currentIndex = clickPages?.findIndex(e=> e === page);
    return (
        <Badge badgeContent={currentIndex !== -1 ? currentIndex + 1 : 0} color="primary" overlap="circular"
        sx={{ "& .MuiBadge-badge": { fontSize: 16, height: 24, width: 24, top:0, right:0, borderRadius:'100%' } }} >
          <RenderContent/>
        </Badge>
    )
  }

  const RenderInsert = () => {
    return (
        <Badge badgeContent={'+'} color="primary" overlap="circular"
        sx={{ "& .MuiBadge-badge": { fontSize: 16, height: 24, width: 24, top:0, right:0, borderRadius:'100%' } }} >
          <Badge badgeContent={insertPage} color="secondary" overlap="circular"
          sx={{ "& .MuiBadge-badge": { fontSize: 16, height: 24, width: 24, top:25, right:0, borderRadius:'100%' } }} >
            <RenderContent/>
          </Badge>
        </Badge>
    )
  }

  const RenderContent = () => {
    return (
    <div className={`gallery-image${isTarget?'-target':''}`}>
      <Badge badgeContent={isTarget ? 0 : originPage} color="primary" overlap="circular"
      sx={{ "& .MuiBadge-badge": { fontSize: 16, height: 24, width: 24, left:-40, top:'50% !important', borderRadius:'100%' } }} >
      <img src={src} alt="gallery item" />
      </Badge>
      <button className="select-button" style={{display:(!isTarget && !isInsert)?'flex':'none'}} onClick={handleSelect}>
        <CompareIcon />
      </button>
      <button className="reset-button" onClick={handle_reset} style={{display: isReset || (isInsert && !isTarget) ? 'flex': 'none'}}>
        <RotateLeftIcon />
      </button>
    </div>)
  }

  //return (isInsert ? <RenderInsert /> : <RenderMerge/>)
  //return (<RenderPages />)
  return (isInsert ? <RenderInsert /> : <RenderPages />)
};