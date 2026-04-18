import React, { useState, useContext, useRef } from 'react';
import { useParams, useNavigate } from "react-router-dom";
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import './PDFCompare';
import { SnackbarContext } from './SnackbarProvider';
import { useMutation } from '@apollo/client';
import { PDFUploadQL } from '../apollo/mutations';
import { Button } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { GET_PDF_SHARES_CHECK_CODE } from '../apollo/queries';
import { useQuery } from '@apollo/client';
import logo from '../assets/logo/knots_logo.png';

const fileType = /^application\/pdf/gi;
const maxSize = 1024 * 1024 * 50; //KB

const PDFUploadMember = props => {
  const params = useParams();
  const navigate = useNavigate();
  const Snackbar = useContext(SnackbarContext);
  const [file, setFile] = useState(null);
  const fileRef = useRef();

  const onFileChange = (file) => {
    //setFile(event.target.files[0]);
    setFile(file);
  }

  const [project, setProject] = useState('');
  const [pdfName, setPdfName] = useState('');

  const { refetch } = useQuery(GET_PDF_SHARES_CHECK_CODE, {
    variables: { pdfId: params.pdfId },
    onCompleted: data => {
      const userErrors = data?.checkPdfShareCode?.userErrors;
      if (userErrors.length > 0) {
        Snackbar.open({ alertProps: { severity: 'error' }, title: '連結失效', message: userErrors.map(v => v.message) });
      } else {
        setProject(data?.checkPdfShareCode?.project);
        setPdfName(data?.checkPdfShareCode?.name);
      }
    },
  });

  const [upload, { data: uploadData, loading: uploadLoading }] = useMutation(PDFUploadQL, {
    onCompleted: data => {
      const userErrors = data?.pdfUploadCreate?.userErrors;
      if (userErrors.length > 0) {
        Snackbar.open({ alertProps: { severity: 'error' }, title: '上傳失敗', message: userErrors.map(v => v.message) });
      } else {
        Snackbar.open({ alertProps: { severity: 'success' }, message: '上傳成功' });
        setFile(null);
        fileRef.current.value = null;
      }
    },
    onError: error => {
      console.error(error);
      Snackbar.open({ alertProps: { severity: 'error' }, title: '上傳失敗', message: error.graphQLErrors.length ? error.graphQLErrors.map(v => v.message) : '上傳失敗' });
    },
  });

  const handleChange = (value) => {
    const { validity, files: [file] } = value;
    if (validity.valid) {
      if (!file?.type?.match(fileType)) {
        Snackbar.open({ alertProps: { severity: 'error' }, title: '只能上載PDF', message: [] });
        return;
      }
      else if (file.size > maxSize) {
        Snackbar.open({ alertProps: { severity: 'error' }, title: '檔案超出最大容量', message: [] });
      }
      onFileChange(file);
    }
  }

  const submitUpload = (e) => {
    let errors = [];

    if (!file) {
      errors.push('請選擇檔案');
    }

    if (file?.size > maxSize) {
      errors.push('檔案超出最大容量');
    }

    if (!params.pdfId) {
      Snackbar.open({ alertProps: { severity: 'error' }, title: '上傳失敗', message: errors });
      return false;
    }

    if (errors.length) {
      Snackbar.open({ alertProps: { severity: 'error' }, title: '上傳失敗', message: errors });
      return false;
    }

    upload({
      variables: {
        data: {
          pdfId: params.pdfId,
          file: file,
          share: false,
        }
      }
    });
  }

  return (
    <div className="PDFCompare">
      <div className='all_container'>
          <div className='back_btn_upload'>
            <Button
              startIcon={<ArrowBackIcon />}
              variant="contained" color="primary"
              onClick={()=>navigate(-1)}
            >
              返回
            </Button>
          </div>
        <div className='logo_container' ></div>
        <div className="upload_container">
          <div className='upload_content'>
            <img alt={'logo'} src={logo} style={{width:200,marginBottom:80}}></img>
            <div className='upload_content_box'>
              <div className='upload_content_project'>工程: {project}</div>
              <div className='upload_content_name'>名稱: {pdfName}</div>
              <label htmlFor="file">選擇檔案</label>{' '}
              <input onChange={(e) => handleChange(e.target)} type="file" ref={fileRef} />
            </div>
            <div className='send_box'>
              <Button
                disabled={uploadLoading || file === null}
                endIcon={<SendIcon />}
                variant="contained" color="primary"
                onClick={() => submitUpload()}
              >
                上傳
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PDFUploadMember;
