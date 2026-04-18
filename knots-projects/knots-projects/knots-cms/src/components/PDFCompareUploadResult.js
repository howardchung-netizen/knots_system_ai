import React, { useState, useEffect, useContext } from 'react';
import './PDFCompare';
import { Backdrop, CircularProgress, ToggleButton, ToggleButtonGroup, Typography, Slider, IconButton, Modal } from '@mui/material';
import { useMutation } from '@apollo/client';
import { PDFCompare, PDFCompareUpload } from '../apollo/mutations';
import { SnackbarContext } from './SnackbarProvider';
import { makeStyles } from '@mui/styles';
import ReactCompareImage from 'react-compare-image';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const useStyles = makeStyles((theme) => ({
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: '#fff',
  },
}));

function OpacitySlider({ value, onChange }) {
  const handleChange = (event, newValue) => {
    onChange(newValue);
  };

  return (
    <Slider
      size="small"
      value={value}
      min={0}
      max={1}
      step={0.01}
      onChange={handleChange}
      aria-label="Opacity slider"
    />
  );
}

const PDFCompareUploadResult = ({ sourceId, sourcePage, uploadId, uploadPage, open, handleClose }) => {
  
  const classes = useStyles();
  const Snackbar = useContext(SnackbarContext);
  const [compareImg, setCompareImg] = useState(null);
  const [sourceImg, setSourceImg] = useState(null);
  const [targetImg, setTargetImg] = useState(null);
  const [activeButton, setActiveButton] = useState("page4");
  const [opacity, setOpacity] = useState(0);

  const handleButtonChange = (event, newButton) => {
    if (newButton !== null) {
      setActiveButton(newButton);
    }
  };

  const [pdfCompare, { data: pdfCompareData, loading: pdfCompareLoading }] = useMutation(PDFCompareUpload, {
    //refetchQueries: [''],
    onCompleted: (data) => {
      const userErrors = data?.pdfCompareUpload?.userErrors;
      if (userErrors.length > 0) {
        Snackbar.open({ alertProps: { severity: 'error' }, title: 'Compare fail', message: userErrors.map(v => v.message) });
      } else {
        Snackbar.open({ alertProps: { severity: 'success' }, message: 'Compare Success' });
      }
      setCompareImg(data?.pdfCompareUpload?.compareBase64);
      setSourceImg(data?.pdfCompareUpload?.sourceBase64);
      setTargetImg(data?.pdfCompareUpload?.targetBase64);
    }
  });

  useEffect(() => {
    // pdfCompare({
    //   variables: {
    //     data: {
    //       sourcePageVersionId: history.location.state.sourcePageVersionId,
    //       targetPageVersionId: history.location.state.targetPageVersionId,
    //     }
    //   },
    // });
    if (sourceId && sourcePage && uploadId && uploadPage && open) {
      pdfCompare({
        variables: {
          data: {
            sourceId: sourceId,
            sourcePage: sourcePage,
            uploadId: uploadId,
            uploadPage: uploadPage,
          }
        },
      });
    }
  }, [sourceId, sourcePage, uploadId, uploadPage, open]);

  // useEffect(() => {
  //   console.log('compareImg',compareImg)
  //   console.log('sourceImg',sourceImg)
  //   console.log('targetImg',targetImg)
  // }, [compareImg, sourceImg, targetImg]);

  const modalClose = () => {
    handleClose();
  };

  return (
    <Modal
      open={open}
      onClose={() => modalClose()}
      className={classes.modal}
      aria-labelledby="image-gallery"
      aria-describedby="image-gallery"
    >
    <div className="PDFCompare_result_container">
      <div className="PDFCompare_result_content_container">
        <div className='back_btn'>
          <IconButton
            variant="contained" color="primary"
            onClick={modalClose}
            size="large"
          ><ArrowBackIcon></ArrowBackIcon></IconButton>
        </div>
      <ToggleButtonGroup
        value={activeButton}
        exclusive
        onChange={handleButtonChange}
        className='toogle_button_group_container'
      >
        <ToggleButton className='toogle_button_group' value="page4">Difference</ToggleButton>
        {/* <ToggleButton className='toogle_button_group' value="page1">Split</ToggleButton> */}
        <ToggleButton className='toogle_button_group' value="page2">Fade</ToggleButton>
        <ToggleButton className='toogle_button_group' value="page3">Slider</ToggleButton>
      </ToggleButtonGroup>
      {/* {activeButton === "page1" && (
        <div className='PDFCompare_result_content'>
          <Typography variant="h6">Split</Typography>
          <div className='PDFCompare_result_split'>
            <div className='PDFCompare_result_split_content'>
              <img src={sourceImg} />
            </div>
            <div className='PDFCompare_result_split_content'>
              <img src={targetImg} />
            </div>
          </div>
        </div>
      )} */}
      {activeButton === "page2" && (
        <div className='PDFCompare_result_content'>
          <Typography variant="h6">Fade</Typography>
          <div style={{width:'50%'}}>
            <OpacitySlider value={opacity} onChange={setOpacity} />
          </div>
          <div className='PDFCompare_result_fade'>
            <div className='PDFCompare_result_fade_content'>
              <img src={`data:image/jpeg;base64,${sourceImg}`} />
            </div>
            <div className='PDFCompare_result_fade_content' style={{ opacity }}>
              <img src={`data:image/jpeg;base64,${targetImg}`} />
            </div>
          </div>
        </div>
      )}
      {activeButton === "page3" && (
        <div className='PDFCompare_result_content'>
          <Typography variant="h6">Slider</Typography>
          <div className='PDFCompare_result_slider_content'>
            <ReactCompareImage style={{height:'90%'}} leftImage={`data:image/jpeg;base64,${sourceImg}`} rightImage={`data:image/jpeg;base64,${targetImg}`}  />
          </div>
        </div>
      )}
      {activeButton === "page4" && (
        <div className='PDFCompare_result_content'>
          <Typography variant="h6">Difference</Typography>
          <div className='PDFCompare_result_difference'>
            <div className='PDFCompare_result_difference_content'>
              <img src={`data:image/jpeg;base64,${compareImg}`} />
            </div>
          </div>
        </div>
      )}
      <Backdrop className={classes.backdrop} open={pdfCompareLoading}>
        <CircularProgress color="inherit" />
      </Backdrop>
    </div>
    </div>
    </Modal>
  );
}

export default PDFCompareUploadResult;
