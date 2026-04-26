import React, { useEffect, useState, useMemo, useRef } from 'react';
import 'react-image-gallery/styles/css/image-gallery.css';
import { makeStyles } from '@mui/styles';
import { Modal, Typography, Button } from '@mui/material';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CompareIcon from '@mui/icons-material/Compare';
import Badge from '@mui/material/Badge';
import DownloadIcon from '@mui/icons-material/Download';

const useStyles = makeStyles((theme) => ({
  modal: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  paper: {
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[5],
    padding: '10px',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    maxHeight: '80%',
    maxWidth: '80%',
    height: '100%',
    width: '100%',
  },
  buttonContainer: {
    position: 'absolute',
    top: 0,
    right: 0,
  },
  selectedImagesContainer: {
    marginLeft: theme.spacing(2),
    display: 'flex',
    flexDirection: 'column',
  },
  selectedImage: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing(1),
  },
  titleContainer: {
    flex: 0.1,
    width: '100%',
    textAlign: 'center',
  },
  confirmButtonContainer: {
    width: '100%',
    height: 40,
    position: 'absolute',
    textAlign: 'center',
    bottom: 0,
  }
}));

let scrollPosition = 0;

const GalleryModal = ({ images, open, handleClose, handleCompare }) => {
  const classes = useStyles();
  const [selectedImages, setSelectedImages] = useState([]);
  //const [currentImage, setCurrentImage] = useState(images?.length? images[0] : null);
  const scrollRef = useRef(null);

  // useEffect(()=>{
  //   if (images?.length) setCurrentImage(images[0]);
  //   // if (open && scrollRef.current) {
  //   //   scrollRef.current.scrollTop = scrollPosition;
  //   // }
  // },[open]);

  // useEffect(() => {
  //   console.log(scrollRef)
  //   if (scrollRef.current) {
  //     // store the scroll position whenever the user scrolls
  //     const handleScroll = () => {
  //       if (scrollRef.current) {
  //         console.log(scrollRef.current)
  //         scrollPosition = scrollRef.current.scrollTop;
  //       }
  //     };
  //     if (scrollRef.current) {
  //       scrollRef.current.addEventListener('scroll', handleScroll);
  //       console.log('add scor')
  //     }
  //     return () => {
  //       if (scrollRef.current) {
  //         scrollRef.current.removeEventListener('scroll', handleScroll);
  //       }
  //     };
  //   }
  // }, [scrollRef]);

  // useEffect(()=>{
  //   console.log(scrollPosition);
  // },[scrollPosition])

  // const handlePreviewClick = (event, index) => {
  //   event.preventDefault();
  //   const image = images[index];
  //   setCurrentImage(image);
  // };

  const handleDoubleClick = (event, index) => {
    event.preventDefault();
    const image = images[index];

    const selectIndex = selectedImages.findIndex(e=>e.id === image.id);
    const isSelected = selectIndex !== -1;
    if (isSelected) {
      setSelectedImages(selectedImages.filter((i) => i.id !== image.id));
    } else if (selectedImages.length !== 2) {
      setSelectedImages([...selectedImages, image]);
    }

    //setCurrentImage(image);
  };

  const modalCompare = () => {
    handleCompare(selectedImages?.[0]?.id, selectedImages?.[1]?.id);
  };

  // useEffect(()=>{
  //   console.log('select images',selectedImages)
  // },[selectedImages]);

  const modalClose = () => {
    setSelectedImages([]);
    handleClose();
    // if (scrollRef.current) {
    //   scrollRef.current.scrollTop = 0;
    // }
  };

  const PreviewList = ({ item, index }) => {
    const selectIndex = selectedImages.findIndex(e=>e.id === item.id);
    const isSelected = selectIndex !== -1;

    const memoizedPreview = useMemo(() => {
      return (
        <div className={`compareList_preview_image ${isSelected ? 'hightlight' : ''}`}>
          <Badge badgeContent={`V${item.version}`} color="primary" overlap="circular"
          sx={{ "& .MuiBadge-badge": { fontSize: 14, height: 30, width: 30, top:5, left:-25, borderRadius:'100%' } }} >
          <img
            src={item.img}
            alt={`V${item.version}`}
            // onClick={(e) => handlePreviewClick(e, index)}
            onDoubleClick={(e) => handleDoubleClick(e, index)}
          />
          <button className="check-button" onClick={(e) => handleDoubleClick(e, index)} color="primary">
            {isSelected ? <CheckBoxIcon /> : <CheckBoxOutlineBlankIcon /> }
          </button>
          </Badge>
        </div>
      )
    }, [isSelected]);

    return memoizedPreview;
  };

  const PreviewContent = ({item}) => {
    //const isSelected = selectedImages.includes(item);
    const sourceSrc = useMemo(() => item?.[0]?.img, [item?.[0]?.img]);
    const targetSrc = useMemo(() => item?.[1]?.img, [item?.[1]?.img]);
    const sourceTitle = useMemo(() => item?.[0]?.imgTitle, [item?.[0]?.imgTitle]);
    const targetTitle = useMemo(() => item?.[1]?.imgTitle, [item?.[1]?.imgTitle]);
    const sourceMergeSrc = useMemo(() => item?.[0]?.history?.[0]?.fileUrl, [item?.[0]?.history?.[0]?.fileUrl]);
    const sourceCompareSrc = useMemo(() => item?.[0]?.history?.[0]?.compareUrl, [item?.[0]?.history?.[0]?.compareUrl]);
    const targetMergeSrc = useMemo(() => item?.[1]?.history?.[0]?.fileUrl, [item?.[1]?.history?.[0]?.fileUrl]);
    const targetCompareSrc = useMemo(() => item?.[1]?.history?.[0]?.compareUrl, [item?.[1]?.history?.[0]?.compareUrl]);
    return (
      <div className='compareList_content'>
        <div className='compareList_content_image'>
          <div className='compareList_content_image_sub'>
            <div className={classes.titleContainer}>
              <Typography variant="h7">
                {sourceTitle}
              </Typography>
            </div>
            <div className='compareList_content_image_sub_img'>
              {sourceSrc ? <img src={sourceSrc} /> : <>請選擇</>}
              <div className='compareList_content_image_sub_button_div'>
              {sourceMergeSrc ?
                <a href={sourceMergeSrc} download target="_blank" >
                  <Button
                    variant="contained"
                    color="primary"
                    //onClick={() => modalCompare()}
                    //disabled={selectedImages.length !== 2}
                    className="compareList_content_image_sub_button"
                  >
                    歷史 <DownloadIcon />
                  </Button>
                </a>
              : ''}
               {sourceCompareSrc ?
                <a href={sourceCompareSrc} download target="_blank" >
                  <Button
                    variant="contained"
                    color="primary"
                    //onClick={() => modalCompare()}
                    //disabled={selectedImages.length !== 2}
                    className="compareList_content_image_sub_button"
                  >
                    比較歷史 <DownloadIcon />
                  </Button>
                </a>
              : ''}
              </div>
            </div>
          </div>
          <div className='compareList_content_image_sub'>
            <div className={classes.titleContainer}>
              <Typography variant="h7">
                {targetTitle}
              </Typography>
            </div>
            <div className='compareList_content_image_sub_img'>
            {targetSrc ? <img src={targetSrc} /> : <>請選擇</>}
            <div className='compareList_content_image_sub_button_div'>
              {targetMergeSrc ?
                <a href={targetMergeSrc} download target="_blank" >
                  <Button
                    variant="contained"
                    color="primary"
                    //onClick={() => modalCompare()}
                    //disabled={selectedImages.length !== 2}
                    className="compareList_content_image_sub_button"
                  >
                    歷史 <DownloadIcon />
                  </Button>
                </a>
              : ''}
               {targetCompareSrc ?
                <a href={targetCompareSrc} download target="_blank" >
                  <Button
                    variant="contained"
                    color="primary"
                    //onClick={() => modalCompare()}
                    //disabled={selectedImages.length !== 2}
                    className="compareList_content_image_sub_button"
                  >
                    比較歷史 <DownloadIcon />
                  </Button>
                </a>
              : ''}
              </div>
            </div>
          </div>
        </div>
        {/* <div className={classes.buttonContainer}>
          {isSelected ? (
            <IconButton color="error" onClick={(e) => handleDelete(e, item.index)}>
              <DeleteIcon />
            </IconButton>
          ) : (
            <IconButton color="primary" onClick={(e) => handleClick(e, item.index)}>
              <span style={{fontSize:16, paddingRight:5}}>Select:</span><CheckBoxOutlineBlankIcon />
            </IconButton>
          )}
        </div> */}
        <div className={classes.confirmButtonContainer}>
          <div style={{display: selectedImages.length === 2 ? 'block' : 'none'}}>
            <Button
              variant="contained"
              color="primary"
              onClick={() => modalCompare()}
              disabled={selectedImages.length !== 2}
              className="compare-button"
            >
              比較 <CompareIcon />
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const previewList = useMemo(() => {
    return images.map((e, i) => {
      return <PreviewList item={e} key={`preview_${i}`} index={i} />;
    });
  }, [images, selectedImages]);

  // const previewList = () => {
  //   images.map((e, i) => {
  //     return <PreviewList item={e} key={`preview_${i}`} index={i} />;
  //   });
  // }

  return (
    <Modal
      open={open}
      onClose={modalClose}
      className={classes.modal}
      aria-labelledby="image-gallery"
      aria-describedby="image-gallery"
    >
      <div className={classes.paper}>
        <div className='compareList_preview' ref={scrollRef}>
          {previewList}
        </div>
        <PreviewContent item={selectedImages} />
      </div>
    </Modal>
  );
};

export default GalleryModal;