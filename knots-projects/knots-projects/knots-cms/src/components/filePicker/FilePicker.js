import React, { createRef, useLayoutEffect, useState } from 'react';
import { Button, Card, Checkbox, Divider, FormControl, FormHelperText, } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { styled } from '@mui/styles';
import FolderIcon from '@mui/icons-material/Folder';
import { PictureAsPdf } from '@mui/icons-material';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import { useDropzone } from 'react-dropzone';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import Cookies from 'universal-cookie';
import moment from 'moment';
import heic2any from 'heic2any';
import style from './style.css';

const REACT_APP_HOST = process.env.REACT_APP_HOST;
let host = REACT_APP_HOST;
let local = 'http://127.0.0.1:5001/';
let cookies = new Cookies();

let typeLang = {
  NA: '未知類型檔案',
  ID: '身份證',
  ADDRESS : '地址證明',
  INCOME: '入息證明',
  BANK_STATEMENT: '銀行月結單',
  PROPERTY_DEEP: '物業證明',
  ADDITIONAL_DOCUMENTS: '其他文件',
}

export async function displayProtectedImage(
  imageUrl, authToken, mimeType
) {
  // Fetch the image.

  function fetchWithAuthentication(url, authToken) {
    const headers = new Headers();
    headers.set('Authorization', `Bearer ${authToken}`);
    return fetch(url, { headers });
  }

  const response = await fetchWithAuthentication(
    imageUrl,
    authToken
  );

  if (mimeType == 'image/heic') {
    const blob = await heic2any({
      blob: await response.blob(),
      toType: 'image/jpeg',
      quality: 0.7,
    });
    const dataUrl = URL.createObjectURL(blob);
    return dataUrl;
  }
  else {
    const blob = await response.blob();
    const dataUrl = URL.createObjectURL(blob);
    return dataUrl;
  }
}

export const downloadContractPdf = async (url, fileName) => {
  let headers = new Headers();
  let file = url;
  headers.append('Authorization', cookies.get('authToken'));

  function fetchWithAuthentication(url, authToken) {
    const headers = new Headers();
    headers.set('Authorization', `Bearer ${authToken}`);
    return fetch(url, { headers });
  }

  let response = await fetchWithAuthentication(file, cookies.get('authToken'));

  const blob = await response.blob();
  const dataUrl = URL.createObjectURL(blob);
  let anchor = document.createElement("a");
  anchor.href = dataUrl;
  anchor.download = `${fileName}.pdf`;
  anchor.click();
  window.URL.revokeObjectURL(dataUrl);
}

export const openContractPdf = async (url) => {
  let headers = new Headers();
  let file = url;
  headers.append('Authorization', cookies.get('authToken'));

  function fetchWithAuthentication(url, authToken) {
    const headers = new Headers();
    headers.set('Authorization', `Bearer ${authToken}`);
    return fetch(url, { headers });
  }

  let response = await fetchWithAuthentication(file, cookies.get('authToken'));
  const blob = await response.blob();
  const dataUrl = URL.createObjectURL(blob);
  let anchor = document.createElement("a");
  anchor.href = dataUrl;
  anchor.target="_blank"
  anchor.click();
}

export const UploadBtn = styled(Button)(({ theme, color = 'primary' }) => ({
  width: '100%',
  minWidth: 0,
  height: 'auto'
}));

const RemoveItemBtn = ({ onClick }) => {
  return (
    <Button
      sx={{
        minWidth: 'auto',
        height: 'auto',
        position: 'absolute',
        top: 1,
        right: 1,
        zIndex: 10,
        borderRadius: 50,
        padding: 0,
        backgroundColor: '#0000007a',
        '&:hover': {
          backgroundColor: '#000000ad',
        },
        display: 'none'
      }}
      onClick={onClick} className='file-picker-remove-btn'>
      <HighlightOffIcon sx={{ color: 'white' }} />
    </Button>
  )
};

const FileCard = styled(Card)(({ theme }) => ({
  height: 150,
  width: 150,
  margin: '1px',
  position: 'relative'
}));

const ProtectedImage = ({ imageUrl, mimeType, onClick }) => {
  const [url, setUrl] = useState(null)
  useLayoutEffect(() => {
    if (!url)
      (async () => {
        let image = await displayProtectedImage(imageUrl, cookies.get('authToken'), mimeType);
        setUrl(image)
      })()
  }, [])
  if (!url) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', width: '100%', fontSize: '12px' }}>loading...</div>
  return (
    <a href={url} target="_blank">
      <img alt={url} src={url} style={{ objectFit: 'cover', height: '100%', width: '100%', cursor: 'pointer' }} onClick={(e)=> {e.stopPropagation();}}/>
    </a>
  )
}

export default function ({ title, maxFile, maxFileSize, accept, file, onSelected, onRender, disabled, error }) {

  const hasError = error ? { borderColor: "red", borderWidth: 1, borderStyle: 'groove' } : null
  const inputRef = createRef();
  const acceptFile = accept ? accept.join(',') : '*';
  const onDrop = acceptedFiles => {
    if (maxFile < (file.length + acceptedFiles.length)) alert(title + "檔案上限為" + maxFile + "個");
    else if (acceptedFiles && onSelected) onSelected(acceptedFiles);
  }

  const onInputChange = (e) => {
    if (!e.target.files.length) return
    else if (maxFile < (file.length + e.target.files.length)) alert(title + "檔案上限為" + maxFile + "個");
    else if (e.target.files && onSelected) {
      let files = [];
      for (let i of e.target.files) files.push(i);
      onSelected(files);
      inputRef.current.value = null;
    };
  }
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: onDrop,
    noClick: true,
    disabled: disabled,
    noDragEventsBubbling: true,
    accept: {
      'application/pdf': ['.pdf'],
      'image/png': ['.png'],
      'image/jpg': ['.jpg', '.jpeg']
    }
  })
  const images = file?.filter(e => {
    if (e.type)
      return e.type.includes('image');
    else return e
  }) ?? [];

  return (
    <FormControl variant="outlined" sx={{ width: '100%' }} error={error ? true : false}>
      <div style={{ minWidth: '160px', ...hasError }} {...getRootProps()}>
        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', cursor: disabled ? null : 'pointer', minWidth: '160px' }}>
          <input
            //  {...getInputProps()}
            style={{ display: 'none' }}
            ref={inputRef}
            type='file'
            multiple
            accept={acceptFile}
            onChange={onInputChange} />
          <UploadBtn color='primary' variant='contained' sx={{ borderRadius: 0 }}  onClick={(x) => {
              if (disabled) return
              x.preventDefault();
              inputRef.current.click()
            }}>{!disabled && <AddIcon />}{title}</UploadBtn>
        </div>
        <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', minHeight: '160px', minWidth: '160px', borderStyle: 'dashed', borderWidth: 1, cursor: disabled ? null : 'pointer' }}
          onClick={(x) => {
            if (disabled) return
            x.preventDefault();
            inputRef.current.click()
          }}>
          {
            (!file || !file.length) && !disabled && (
              <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }} >
                <CloudUploadIcon sx={{ fontSize: 80, color: "#cdcccc" }} />
                <div style={{ fontSize: 18, color: '#727171' }}>按此/把檔案拖動到這裏</div>
              </div>
            )
          }
          {
            file && file.map((e, index) => {
              return onRender(e, index, images)
            })
          }
        </div>
      </div>
      {error && <FormHelperText error>{error}</FormHelperText>}
    </FormControl>
  );
}

export const ProvenFile = (props) => {
  const e = props.file;
  const index = props.index;
  const images = props.images;
  const onItemClick = props.onItemClick;
  const referenceNumber = props.referenceNumber;
  const onRemoveItemClick = props.onRemoveItemClick;
  const onCheckClick = () => {
    if (props.onCheckClick) props.onCheckClick(e);
  }
  return (
    <FileCard className='file-picker-item' key={index} onClick={(e)=>{e.stopPropagation();}}>
      {
        onRemoveItemClick &&
        <RemoveItemBtn onClick={(x) => {
          x.preventDefault();
          x.stopPropagation();
          if (onRemoveItemClick) onRemoveItemClick(index);
        }} className='file-picker-remove-btn'>
          <HighlightOffIcon sx={{ color: 'white' }} />
        </RemoveItemBtn>
      }
      {
        (() => {
          let imageUrl = e.provenUrl.replace(host, host);
          switch (e.fileMimeType) {
            case 'image/png':
            case 'image/jpeg':
            case 'image/heic':
              return <ProtectedImage
                imageUrl={imageUrl}
                mimeType={e.fileMimeType}
                onClick={(x, url) => {
                  x.preventDefault();
                  x.stopPropagation();
                  onItemClick({ ...e, uri: url, index: images.findIndex((x) => x.provenUrl == e.provenUrl), files: images });
                }}
              />
            case 'application/pdf':
              return <div className='file-picker-item-pdf'
                onClick={async (x) => {
                  x.stopPropagation();
                  await openContractPdf(e.provenUrl)
                }}>
                <PictureAsPdf sx={{ fontSize: 80, color: '#e72828' }} />
              </div>
            default:
              return <div className='file-picker-item-pdf'>
                <FolderIcon sx={{ fontSize: 80 }} />
              </div>
          }
        })()
      }
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          width: '100%',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          backgroundColor: '#fffffff7',
          zIndex: 999
        }}
      >
        <div style={{ width: '100%', justifyContent: 'space-between', alignItems: 'center', display: 'flex' }}>
          <div> {props.onCheckClick && <Checkbox style={{ padding: '1px' }} readOnly={props.readOnly} checked={e.checked} onChange={(x) => {
            x.preventDefault();
            x.stopPropagation();
            onCheckClick(e.id)
          }} />}</div>
          <div>{moment(e.createdAt).format('YYYY-MM-DD')}</div>
        </div>
        <div style={{ width: '100%', justifyContent: 'space-between', alignItems: 'center', display: 'flex' }}>
        {
            e.fileMimeType == 'application/pdf' && <button style={{ width: '100%', justifyContent: 'center', display: 'flex' }}
              onClick={(x) => {
                downloadContractPdf(e.provenUrl, referenceNumber+'_'+typeLang[e.type]);
                x.stopPropagation();
                x.preventDefault();
              }}
            >下載</button>
          }
        </div>
      </div>
    </FileCard>
  )
}

export const IncreaseLimitFile = (props) => {
  const e = props.file;
  const index = props.index;
  const images = props.images;
  const onItemClick = props.onItemClick;
  const onRemoveItemClick = props.onRemoveItemClick;
  const status = props.status;
  const onCheckClick = () => {
    if (props.onCheckClick) props.onCheckClick(e.id);
  }
  return (
    <FileCard className='file-picker-item' key={index} onClick={(e)=>{e.stopPropagation();}}>
      {
        onRemoveItemClick &&
        <RemoveItemBtn onClick={(x) => {
          x.preventDefault();
          x.stopPropagation();
          if (onRemoveItemClick) onRemoveItemClick(index);
        }} className='file-picker-remove-btn'>
          <HighlightOffIcon sx={{ color: 'white' }} />
        </RemoveItemBtn>
      }
      {
        (() => {
          let imageUrl = e.provenUrl.replace(host, host);
          switch (e.fileMimeType) {
            case 'image/png':
            case 'image/jpeg':
            case 'image/heic':
              return <ProtectedImage
                imageUrl={imageUrl}
                mimeType={e.fileMimeType}
                onClick={(x, url) => {
                  x.preventDefault();
                  x.stopPropagation();
                  onItemClick({ ...e, uri: url, index: images.findIndex((x) => x.provenUrl == e.provenUrl), files: images });
                }}
              />
            case 'application/pdf':
              return <div className='file-picker-item-pdf'
                onClick={(x) => {
                  x.stopPropagation();
                  if (onItemClick) onItemClick(e)
                }}>
                <PictureAsPdf sx={{ fontSize: 80, color: '#e72828' }} />
              </div>
            default:
              return <div className='file-picker-item-pdf'>
                <FolderIcon sx={{ fontSize: 80 }} />
              </div>
          }
        })()
      }
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          width: '100%',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          backgroundColor: '#fffffff7'
        }}
      >
        <div style={{ width: '100%', justifyContent: 'end', alignItems: 'center', display: 'flex' }}>
          {/* {status == 'REQUEST' && <CheckBoxOutlineBlankIcon readOnly={props.readOnly} checked={e.checked} onChange={() => onCheckClick(e.id)} />}
          {status == 'APPROVED' && <CheckBox color='primary' readOnly={props.readOnly} checked={e.checked} onChange={() => onCheckClick(e.id)} />}
          {status == 'REJECTED' && <CloseIcon color='error' readOnly={props.readOnly} checked={e.checked} onChange={() => onCheckClick(e.id)} />} */}
          <div>{moment(e.createdAt).format('YYYY-MM-DD')}</div>
        </div>
      </div>
    </FileCard>
  )
}

export const FaceDetect = (props) => {
  const e = props.file;
  const index = props.index;
  const images = props.images;
  const onItemClick = props.onItemClick;
  const onRemoveItemClick = props.onRemoveItemClick;
  return (
    <FileCard className='file-picker-item' key={index} onClick={(e)=>{e.stopPropagation();}}>
      {/* <RemoveItemBtn onClick={(x) => {
        x.preventDefault();
        x.stopPropagation();
        if (onRemoveItemClick) onRemoveItemClick(index);
      }} className='file-picker-remove-btn'>
        <HighlightOffIcon sx={{ color: 'white' }} />
      </RemoveItemBtn> */}
      {
        (() => {
          let imageUrl = e.fileUrl;
          switch (e.fileMimeType) {
            case 'image/png':
            case 'image/jpeg':
            case 'image/heic':
              return <ProtectedImage
                imageUrl={imageUrl}
                mimeType={e.fileMimeType}
                onClick={(x, url) => {
                  x.preventDefault();
                  x.stopPropagation();
                  onItemClick({ ...e, uri: url, index: images.findIndex((x) => x.fileUrl == e.fileUrl), files: images });
                }}
              />
            case 'application/pdf':
              return <div className='file-picker-item-pdf'
                onClick={(x) => {
                  x.stopPropagation();
                  if (onItemClick) onItemClick(e)
                }}>
                <PictureAsPdf sx={{ fontSize: 80, color: '#e72828' }} />
              </div>
            default:
              return <div className='file-picker-item-pdf'>
                <FolderIcon sx={{ fontSize: 80 }} />
              </div>
          }
        })()
      }
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          width: '100%',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          backgroundColor: '#fffffff7'
        }}
      >
        <div style={{ width: '100%', justifyContent: 'flex-end', display: 'flex' }}>{moment(e.createdAt).format('YYYY-MM-DD')}</div>
      </div>
    </FileCard>
  )
}

export const ContractFile = (props) => {

  const e = props.file;
  const index = props.index;
  const images = props.images;
  const onItemClick = props.onItemClick;
  const referenceNumber = props.referenceNumber;
  const password = props.password;
  const onRemoveItemClick = props.onRemoveItemClick;
  const canDownload = props.canDownload;

  return (
    <FileCard className='file-picker-item' key={index} onClick={(e)=>{e.stopPropagation();}}>
      {
        (() => {
          return <div
            className='file-picker-item-pdf'
            onClick={(x) => {
              onItemClick(e)
              x.stopPropagation();
              x.preventDefault();
            }}
          >
            <PictureAsPdf sx={{ fontSize: 80, color: '#e72828' }} />
          </div>
        })()
      }
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          width: '100%',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          backgroundColor: '#fffffff7'
        }}
      >
        <div style={{ width: '100%', justifyContent: 'flex-end', display: 'flex' }}>{moment(e.createdAt).format('YYYY-MM-DD')}</div>
        <button style={{ width: '100%', justifyContent: 'center', display: 'flex' }} 
        onClick={(x)=> {
          navigator.clipboard.writeText(password)
          x.stopPropagation();
          x.preventDefault();
        }}
        >複製密碼</button>
       { canDownload && <button style={{ width: '100%', justifyContent: 'center', display: 'flex' }} 
        onClick={(x)=>{ 
           downloadContractPdf(e.fileUrl, referenceNumber);
          x.stopPropagation();
          x.preventDefault();
        }}
        >下載</button>
       }
      </div>
    </FileCard>
  )
}

export const SignedContractFile = (props) => {

  const e = props.file;
  const index = props.index;
  const images = props.images;
  const onItemClick = props.onItemClick;
  const onRemoveItemClick = props.onRemoveItemClick;

  return (
    <FileCard className='file-picker-item' key={index} onClick={(e)=>{e.stopPropagation();}}>
      <RemoveItemBtn onClick={(x) => {
        x.preventDefault();
        x.stopPropagation();
        if (onRemoveItemClick) onRemoveItemClick(index);
      }} className='file-picker-remove-btn'>
        <HighlightOffIcon sx={{ color: 'white' }} />
      </RemoveItemBtn>
      {
        (() => {
          let f = e.fileUrl.split('.');
          switch (f[f.length - 1]) {
            case 'pdf':
              return (
                <div
                  className='file-picker-item-pdf'
                  onClick={(x) => {
                    onItemClick(e)
                    x.stopPropagation();
                  }}
                >
                  <PictureAsPdf sx={{ fontSize: 80, color: '#e72828' }} />
                </div>
              )
            default:
              return <div className='file-picker-item-pdf'>
                <FolderIcon sx={{ fontSize: 80 }} />
              </div>
          }
        })()
      }
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          width: '100%',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          backgroundColor: '#fffffff7'
        }}
      >
        <div style={{ width: '100%', justifyContent: 'flex-end', display: 'flex' }}>{moment(e.createdAt).format('YYYY-MM-DD')}</div>
      </div>
    </FileCard>
  )
}

export const PaymentReceiptFile = (props) => {
  let e = props.file;
  if (!e.fileUrl) e = {
    fileUrl: URL.createObjectURL(e),
    fileMimeType: e.type,
  }
  const index = props.index;
  const images = props.images;
  const onItemClick = props.onItemClick;
  const onRemoveItemClick = props.onRemoveItemClick;
  const onCheckClick = () => {
    if (e.checked == false && props.onCheckClick) props.onCheckClick(e.id)
  }

  return (
    <FileCard className='file-picker-item' key={index} onClick={(e)=>{e.stopPropagation();}}>
      {
        onRemoveItemClick &&
        <RemoveItemBtn onClick={(x) => {
          x.preventDefault();
          x.stopPropagation();
          if (onRemoveItemClick) onRemoveItemClick(index);
        }} className='file-picker-remove-btn'>
          <HighlightOffIcon sx={{ color: 'white' }} />
        </RemoveItemBtn>
      }
      {
        (() => {
          let imageUrl = e.fileUrl ?? URL.createObjectURL(e);
          switch (e.fileMimeType) {
            case 'image/png':
            case 'image/jpeg':
            case 'image/heic':
              return <ProtectedImage
                imageUrl={imageUrl}
                mimeType={e.fileMimeType}
                onClick={(x, url) => {
                  x.preventDefault();
                  x.stopPropagation();
                  onItemClick({ ...e, uri: url, index: images.findIndex((x) => x.fileUrl == e.fileUrl), files: images });
                }}
              />
            case 'application/pdf':
              return <div className='file-picker-item-pdf'
                onClick={(x) => {
                  x.stopPropagation();
                  if (onItemClick) onItemClick(e)
                }}>
                <PictureAsPdf sx={{ fontSize: 80, color: '#e72828' }} />
              </div>
            default:
              return <div className='file-picker-item-pdf'>
                <FolderIcon sx={{ fontSize: 80 }} />
              </div>
          }
        })()
      }
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          width: '100%',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          backgroundColor: '#fffffff7',
          zIndex: 999,
          fontSize: 15
        }}
      >
        <Divider />
        <div style={{ width: '100%', justifyContent: 'flex-end', alignItems: 'center', display: 'flex' }}>
          <div>{e.paymentMethod}</div>
        </div>
        <Divider />
        <div style={{ width: '100%', justifyContent: 'space-between', alignItems: 'center', display: 'flex' }}>
          <div>
            {props.onCheckClick && <Checkbox style={{ padding: '1px' }} readOnly={props.readOnly} checked={e.checked} onChange={(x) => {
              x.preventDefault();
              x.stopPropagation();
              onCheckClick(e.id)
            }} />}
          </div>
          <div>{moment(e.paymentDate).format('YYYY-MM-DD')}</div>
        </div>
      </div>
    </FileCard>
  )
}

export const BannerFile = (props) => {
  const e = props.file;
  const index = props.index;
  let url = e.fileUrl.replace('http://127.0.0.1:5001/', host)
  let thumbnailUrl = e.thumbnailUrl.replace('http://127.0.0.1:5001/', host)

  return (
    <FileCard className='file-picker-item' key={index} onClick={(e)=>{e.stopPropagation();}}>
      <a href={url} target={'_blank'}>
        <img style={{ objectFit: 'cover', height: '100%', width: '100%', cursor: 'pointer' }} src={thumbnailUrl} />
      </a>
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          width: '100%',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          backgroundColor: '#fffffff7'
        }}
      >
        <div style={{ width: '100%', justifyContent: 'flex-end', display: 'flex' }}>{moment(e.createdAt).format('YYYY-MM-DD')}</div>
      </div>
    </FileCard>
  )
}

export const BannerFileEng = (props) => {
  const e = props.file;
  const index = props.index;
  let url = e.fileUrlEng.replace('http://127.0.0.1:5001/', host)
  let thumbnailUrl = e.thumbnailUrlEng.replace('http://127.0.0.1:5001/', host)

  return (
    <FileCard className='file-picker-item' key={index} onClick={(e)=>{e.stopPropagation();}}>
      <a href={url} target={'_blank'}>
        <img style={{ objectFit: 'cover', height: '100%', width: '100%', cursor: 'pointer' }} src={thumbnailUrl} />
      </a>
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          width: '100%',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          backgroundColor: '#fffffff7'
        }}
      >
        <div style={{ width: '100%', justifyContent: 'flex-end', display: 'flex' }}>{moment(e.createdAt).format('YYYY-MM-DD')}</div>
      </div>
    </FileCard>
  )
}

export const File = (props) => {

  let e = props.file;
  let fileUrl = props.fileUrl??URL.createObjectURL(e);
  let fileMimeType = props.isTempFile ? e.type : e.fileMimeType;

  const index = props.index;
  const images = props.images;
  const onItemClick = props.onItemClick;
  const onRemoveItemClick = props.onRemoveItemClick;

  const onCheckClick = () => {
    if (e.checked == false && props.onCheckClick) props.onCheckClick(e.id)
  }

  return (
    <FileCard className='file-picker-item' key={index}
      sx={{ height: 200 }}
      onClick={(x) => {
        x.stopPropagation();
      }}>
      {
        onRemoveItemClick &&
        <RemoveItemBtn onClick={(x) => {
          x.preventDefault();
          x.stopPropagation();
          if (onRemoveItemClick) onRemoveItemClick(index);
        }} className='file-picker-remove-btn'>
          <HighlightOffIcon sx={{ color: 'white' }} />
        </RemoveItemBtn>
      }
      {
        (() => {
          switch (fileMimeType) {
            case 'image/png':
            case 'image/jpeg':
            case 'image/heic':
              return <ProtectedImage
                imageUrl={fileUrl}
                mimeType={fileMimeType}
                onClick={(x, url) => {
                  x.preventDefault();
                  x.stopPropagation();
                  onItemClick({ ...e, uri: url, files: images });
                }}
              />
            case 'application/pdf':
              return <div className='file-picker-item-pdf'
                onClick={(x) => {
                  x.stopPropagation();
                  if (onItemClick) onItemClick(e);
                }}>
                <PictureAsPdf sx={{ fontSize: 80, color: '#e72828' }} />
              </div>
            default:
              return <div className='file-picker-item-pdf'
              onClick={(x) => {
                x.stopPropagation();
                if (onItemClick) onItemClick(e);
              }}>
                <FolderIcon sx={{ fontSize: 80 }} />
              </div>
          }
        })()
      }
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          width: '100%',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          backgroundColor: '#fffffff7',
          zIndex: 999
        }}
      >
        <Divider />
        <div style={{ width: '100%', justifyContent: 'space-between', alignItems: 'center', display: 'flex' }}>
          <div>
          </div>
          <div>{moment(e.createdAt).format('YYYY-MM-DD')}</div>
        </div>
      </div>
    </FileCard>
  )
}