import React, { useState, useEffect, useCallback, useContext, useRef, useLayoutEffect } from 'react';
import { useParams, useNavigate } from "react-router-dom";
import { Document, Page, pdfjs } from 'react-pdf';
import generatePdfThumbnails from 'pdf-thumbnails-generator';
import './PDFCompare.css';
import { FormControl, MenuItem, InputLabel, Select, Button, Backdrop, CircularProgress, IconButton } from '@mui/material';
import { GET_PDF_UPLOADS } from '../apollo/queries';
import { useLazyQuery, useQuery } from '@apollo/client';
import moment from 'moment';
import { DndProvider } from 'react-dnd'
import update from 'immutability-helper'
import { Card } from './Card.js'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { PDFSourceCreate, PDFSourceSave, PDFUploadDelete } from '../apollo/mutations';
import { useMutation } from '@apollo/client';
import { SnackbarContext } from './SnackbarProvider';
import { Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { makeStyles } from '@mui/styles';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import MergeTypeIcon from '@mui/icons-material/MergeType';
import GalleryModal from './GalleryModal';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CompareIcon from '@mui/icons-material/Compare';
import PDFCompareResult from './PDFCompareResult';
import PDFCompareUploadResult from './PDFCompareUploadResult';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import { CardNormal } from './CardNormal';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

const options = {
  cMapUrl: 'cmaps/',
  cMapPacked: true,
  standardFontDataUrl: 'standard_fonts/',
};

const useStyles = makeStyles((theme) => ({
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: '#fff',
  },
  selectItem: {
    fontSize: '14px !important',
  },
  menuItem: {
    fontSize: 14,
  },
}));

const PDFCompare = props => {
  const params = useParams();
  const navigate = useNavigate();
  const classes = useStyles();
  const Snackbar = useContext(SnackbarContext);
  const [imageGalleryList, setImageGalleryList] = useState({});
  const [galleryImages, setGalleryImages] = useState([]);
  const [initPdf, setInitPdf] = useState(false);
  const [refetch, { data, loading }] = useLazyQuery(GET_PDF_UPLOADS, {
    fetchPolicy: 'network-only',
    variables: { id: params.id },
    onCompleted: data => {
      const uploads = data?.pdfs?.edges?.[0]?.node?.pdfUploads?.map(e => ({
        fileURL: e.fileUrl,
        id: e.id,
        createdAt: e.createdAt,
        merge: false,
        insert: false,
      })).sort((a, b) => b.createdAt - a.createdAt);
      if (uploads?.length) {
        setUploadData(uploads);
        setSelectData(uploads?.map(e=>({
          text: `${moment(e.createdAt).format('YYYY-MM-DD HH:mm')} 上傳`,
          value: e.id,
        })));
      }
      const sources = data?.pdfs?.edges?.[0]?.node?.pdfSources?.map(e => ({
        id: e.id,
        fileURL: e.fileUrl,
        merge: false,
        insert: false,
        originPage: null,
        original: null,
        pdfSourcePages: e.pdfSourcePages,
      }));
      if (sources?.length) {
        setSourceData(sources);
        setSourceItem(sources?.[0].id);
        setSourceFile(sources?.[0].fileURL);
        setInitPdf(true);
      }
      let list = { ...imageGalleryList };
      const pdfSources = data?.pdfs?.edges?.[0]?.node?.pdfSources;
      const firstPdfSource = pdfSources && pdfSources[0];
      const pdfSourcePages = firstPdfSource?.pdfSourcePages;
      //console.log('pdfSourcePages',pdfSourcePages)

      if (pdfSourcePages) {
        pdfSourcePages.map((e) => {
          if (e.historyVersions?.length) {
            //const historyVersions = e.historyVersions?.length > 1 ? e.historyVersions.sort((a,b) => b.version - a.version) : e.historyVersions;
            const historyVersions = [...e.historyVersions].sort((a,b) => b.version - a.version);
            //historyVersions.sort((a,b) => b.version - a.version);
            if (!list[e.id]) list[e.id] = [];
            historyVersions.map(d => {
              const history = e.pdfSourcePageHistories?.filter(f => f.lastVersion === d.version);
              const historyVersion = {
                ...d,
                history: history,
              };
              list[e.id].push(historyVersion);
            });
          }
        });
      }
      if (Object.keys(list).length) {
        //console.log('set imagegallerylist',list)
        setImageGalleryList(list);
      }
    },
  });

  const [openSave, setOpenSave] = useState(false);
  const [openMergeSave, setOpenMergeSave] = useState(false);
  const [openMergeAll, setOpenMergeAll] = useState(false);
  const [currentAction, setCurrentAction] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [sourceFile, setSourceFile] = useState(null);
  const [targetFile, setTargetFile] = useState(null);
  const [sourceItem, setSourceItem] = useState('');
  const [targetItem, setTargetItem] = useState('');
  const [currentSourceIndex, setCurrentSourceIndex] = useState(null);
  const [currentSourcePage, setCurrentSourcePage] = useState(null);
  const [currentSourceSubPage, setCurrentSourceSubPage] = useState(null);
  const [currentTargetIndex, setCurrentTargetIndex] = useState(null);
  const [currentTargetPage, setCurrentTargetPage] = useState(null);
  const [currentSourcePageMerge, setCurrentSourcePageMerge] = useState(false);
  const [pdfSourceThumbnails, setPdfSourceThumbnails] = useState([]);
  const [pdfTargetThumbnails, setPdfTargetThumbnails] = useState([]);
  const [pdfSourceThumbnailsCopy, setPdfSourceThumbnailsCopy] = useState([]);
  const [mergeList, setMergeList] = useState([]);
  const [insertList, setInsertList] = useState([]);
  const [uploadData, setUploadData] = useState([]);
  const [sourceData, setSourceData] = useState([]);
  const [selectData, setSelectData] = useState([]);
  const [mergeDisable, setMergeDisable] = useState(true);
  const [insertDisable, setInsertDisable] = useState(true);
  const [lockUpload, setLockUpload] = useState(false);
  const [merging, setMerging] = useState(false);
  const [mergingAll, setMergingAll] = useState(false);
  const [galleryModalOpen, setGalleryModalOpen] = useState(false);
  const [compareModalOpen, setCompareModalOpen] = useState(false);
  const [compareUploadModalOpen, setCompareUploadModalOpen] = useState(false);
  const [sourcePageVersionId, setSourcePageVersionId] = useState(null);
  const [targetPageVersionId, setTargetPageVersionId] = useState(null);
  const [sourcePages, setSourcePages] = useState([]);
  const [targetPages, setTargetPages] = useState([]);
  const [currentSourceScrollTop, setCurrentSourceScrollTop] = useState(0);
  const [currentTargetScrollTop, setCurrentTargetScrollTop] = useState(0);
  const sourcePreviewRef = useRef(null);
  const targetPreviewRef = useRef(null);
  const [pdfSourceSave, { loading: pdfSourceSaveDataLoading }] = useMutation(PDFSourceSave, {
    onCompleted: (data) => {
      const userErrors = data?.pdfSourceSave?.userErrors;
      if (userErrors.length > 0) {
        Snackbar.open({ alertProps: { severity: 'error' }, title: '儲存失敗', message: userErrors.map(v => v.message) });
      } else {
        Snackbar.open({ alertProps: { severity: 'success' }, message: '儲存成功' });
        refetch();
        resetAll();
      }
    }
  });
  const [pdfUploadDelete, { oading: pdfUploadDeleteLoading }] = useMutation(PDFUploadDelete, {
    onCompleted: async (data) => {
      const userErrors = data?.pdfUploadDelete?.userErrors;
      if (userErrors.length > 0) {
        Snackbar.open({ alertProps: { severity: 'error' }, title: '刪除失敗', message: userErrors.map(v => v.message) });
      } else {
        Snackbar.open({ alertProps: { severity: 'success' }, message: '刪除成功' });
        resetAll();
        await refetch();
      }
    }
  });
  const [pdfSourceCreate, { loading: pdfSourceCreateLoading }] = useMutation(PDFSourceCreate, {
    onCompleted: async (data) => {
      const userErrors = data?.pdfSourceCreate?.userErrors;
      if (userErrors.length > 0) {
        Snackbar.open({ alertProps: { severity: 'error' }, title: '創建失敗', message: userErrors.map(v => v.message) });
      } else {
        Snackbar.open({ alertProps: { severity: 'success' }, message: '創建成功' });
        resetAll();
        await refetch();
      }
    }
  });

  const resetAll = () => {
    setSourceItem('');
    setPdfSourceThumbnails([]);
    setCurrentSourcePage(null);
    setCurrentSourceSubPage(null);
    setCurrentSourceIndex(null);
    setSourceFile(null);
    setTargetItem('');
    setPdfTargetThumbnails([]);
    setCurrentTargetIndex(null);
    setCurrentTargetPage(null);
    setTargetFile(null);
    setUploadData([]);
    setSelectData([]);
    setMergeDisable(true);
    setInsertDisable(true);
    setMerging(false);
    setMergingAll(false);
    setImageGalleryList({});
    setMergeList([]);
    setInsertList([]);
    setLockUpload(false);
    setSourcePages([]);
    setTargetPages([]);
  }

  const clearAll = () => {
    //setSourceItem('');
    setPdfSourceThumbnails(pdfSourceThumbnailsCopy);
    setCurrentSourcePage(1);
    setCurrentSourceSubPage(null);
    setCurrentSourceIndex(1);
    //setSourceFile(null);
    setTargetItem('');
    setPdfTargetThumbnails([]);
    setCurrentTargetIndex(null);
    setCurrentTargetPage(null);
    setTargetFile(null);
    //setSelectData([]);
    setMergeDisable(true);
    setInsertDisable(true);
    setMerging(false);
    setMergingAll(false);
    //setImageGalleryList({});
    setMergeList([]);
    setInsertList([]);
    setLockUpload(false);
    setSourcePages([]);
    setTargetPages([]);
  }

  const handleSaveOpen = (action) => {
    setCurrentAction(action);
    setOpenSave(true);
  };

  const handleSaveClose = () => {
    setOpenSave(false);
  };

  const handleMergeSaveOpen = (action) => {
    setOpenMergeSave(true);
  };

  const handleMergeSaveClose = () => {
    setOpenMergeSave(false);
  };

  const handleMergeAllOpen = (action) => {
    setOpenMergeAll(true);
  };

  const handleMergeAllClose = () => {
    setOpenMergeAll(false);
  };

  const handleSave = () => {
    const item = currentAction === 'source' ? sourceItem : targetItem;
    const filterData = uploadData.find(e=>e.id === item);
    const uploadId = filterData.id;
    const pages = currentAction === 'source' ? pdfSourceThumbnails.map(e=>e.page-1) : pdfTargetThumbnails.map(e=>e.page-1);
    if (currentAction === 'source') {
      pdfSourceCreate({
        variables: {
          data: {
            pdfId: params.id,
            pdfUploadId: uploadId,
            pages: pages,
          }
        },
      });
    }
    setOpenSave(false);
  };

  // const handleDeleteOpen = (action) => {
  //   setCurrentAction(action);
  //   setOpenDelete(true);
  // };

  const handleLock = () => {
    setLockUpload(lockUpload === false);
  }

  const handleDeleteClose = () => {
    setOpenDelete(false);
  };

  const handleDelete = () => {
    const item = currentAction === 'source' ? sourceItem : targetItem;
    const filterData = uploadData.find(e=>e.id === item);
    const pdfUploadId = filterData.id;
    pdfUploadDelete({
      variables: {
        data: {
          id: pdfUploadId,
        }
      },
    });
    setOpenDelete(false);
  };

  useEffect(() => { pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;});
  const onSourceItemChange = (event) => {
    if (event.target.value === targetItem) return;
    setSourceItem(event.target.value);
    const filterData = uploadData.find(e=>e.id === event.target.value);
    if (filterData) {
      setSourceFile(filterData?.fileURL);
    }
  }

  // useEffect(() => {
  //   console.log('insertList:', insertList);
  // },[insertList])

  const onTargetItemChange = (event) => {
    if (event.target.value === sourceItem) return;
    clearAll();
    setTargetItem(event.target.value);
    const filterData = uploadData.find(e=>e.id === event.target.value);
    if (filterData) {
      setTargetFile(filterData?.fileURL);
    }
  }

  const changeSourcePage = (page, ref) => {
    const scrollTop = ref.current.scrollTop;
    // Perform any necessary actions when the GalleryImage is clicked

    setCurrentSourceIndex(page);
    //console.log('setCurrentSourcePage',pdfSourceThumbnails[(page-1)].page);
    const actionType = pdfSourceThumbnails[(page-1)]?.merge ? 'merge' : pdfSourceThumbnails[(page-1)]?.insert ? 'insert' : 'normal'
    if (actionType === 'merge') {
      // setMergeDisable(true);
      // setInsertDisable(true);
      setCurrentSourcePageMerge(true);
      setCurrentSourceSubPage(pdfSourceThumbnails[(page-1)].page);
    } else if (actionType === 'insert') {
      // setMergeDisable(true);
      // setInsertDisable(true);
      setCurrentSourcePageMerge(true);
      setCurrentSourceSubPage(pdfSourceThumbnails[(page-1)].targetPage);
    } else {
      // const mergeIndex = mergeList.findIndex(e => e.target === currentTargetPage);
      // if (targetItem && mergeIndex === -1) {
      //   setMergeDisable(false);
      //   setInsertDisable(false);
      // }
      setCurrentSourcePageMerge(false);
    }
    setCurrentSourcePage(actionType === 'insert' ? 0 : pdfSourceThumbnails[(page-1)].page);
    if (!initPdf) return;
    //console.log('click page',page);
    const sourcePageIndex = sourceData?.[0]?.pdfSourcePages?.findIndex(e=>e.page===pdfSourceThumbnails[(page-1)].originPage);
    //console.log('sourcePageIndex',sourcePageIndex)
    if (sourcePageIndex !== -1) {
      changeImageList(sourceData[0].pdfSourcePages[sourcePageIndex].id);
    } else {
      changeImageList([]);
    }
    setDisableButton();
    if (scrollTop !== undefined) {
      //console.log('set source scrolll', scrollTop)
      setCurrentSourceScrollTop(scrollTop);
    }
  }

  const changeTargetPage = (page, ref) => {
    const scrollTop = ref.current.scrollTop;
    setCurrentTargetIndex(page);
    setCurrentTargetPage(page);
    if (scrollTop !== undefined) {
      //console.log('set target scrolll', scrollTop)
      setCurrentTargetScrollTop(scrollTop);
    }
  }

  // useEffect(()=>{
  //   console.log('currentTargetIndex',currentTargetIndex);
  // },[currentTargetIndex])

  // useEffect(() => {
  //   sourcePreviewRef.current.scrollTop = currentSourceScrollTop;
  //   console.log('currentSourceScrollTop',currentSourceScrollTop)
  // }, [currentSourceScrollTop, currentSourceIndex, sourcePages]);

  useEffect(() => {
    setDisableButton();
    sourcePreviewRef.current.scrollTop = currentSourceScrollTop;
    targetPreviewRef.current.scrollTop = currentTargetScrollTop;
  }, [merging, mergingAll, insertDisable, mergeDisable, currentSourceScrollTop, currentSourceIndex, currentSourcePage, sourcePages, currentTargetScrollTop, currentTargetIndex, currentTargetPage, targetPages]);

  // useEffect(()=> {
  //   if (currentSourceIndex && merging) changeSourcePage(currentSourceIndex);
  // }, [pdfSourceThumbnails, merging]);

  useEffect(()=> {
    setMerging(mergeList.length !== 0);
  }, [mergeList]);

  const changeImageList = (id) => {
    if (imageGalleryList[id]) {
      setGalleryImages(imageGalleryList[id]);
    }
  }

  // useEffect(()=>{
  //   console.log('mergeList',mergeList)
  //   console.log('insertList',insertList)
  // }, [mergeList, insertList])

  // useEffect(()=> {
  //   console.log('galleryImages',galleryImages)
  // },[galleryImages])

  // useEffect(()=>{
  //   console.log(sourceData);
  // },[sourceData])

  useEffect(()=>{
  //   console.log('sourceData',sourceData);
  //   console.log('pdfSourceThumbnails',pdfSourceThumbnails);
  //   console.log('pdfTargetThumbnails',pdfTargetThumbnails);
    if (pdfSourceThumbnails.length && pdfTargetThumbnails.length) {
      setMergingAll(true);
    }
  },[sourceData, pdfSourceThumbnails, pdfTargetThumbnails]);

  // useEffect(()=>{
  //   console.log('imageGalleryList',imageGalleryList);
  // },[imageGalleryList]);

  const setDisableButton = () => {
    if (!currentSourceIndex || !currentTargetPage) return;
    if (pdfSourceThumbnails[currentSourceIndex-1] === undefined) return;
    const mergeSource = mergeList.findIndex(e => e.source === pdfSourceThumbnails[currentSourceIndex-1].originPage);
    const insertSource = insertList.findIndex(e => pdfSourceThumbnails[currentSourceIndex-1].insert === true);
    const mergeTarget = mergeList.findIndex(e => e.target === currentTargetPage);
    const insertTarget = insertList.findIndex(e => e.target === currentTargetPage);
    const inTargetPages = targetPages.findIndex(e => e === currentTargetPage);
    setMergeDisable((mergeSource !== -1 || insertSource !== -1 || mergeTarget !== -1 || insertTarget !== -1)? true : false);
    setInsertDisable((mergeTarget !== -1 || insertTarget !== -1 || inTargetPages !== -1) ? true : false);
  }
  useEffect(()=>{
    //setDisableButton();
  },[currentSourceIndex, currentTargetPage, sourcePages, targetPages]);

  const handleMerge = () => {
    // console.log('currentSourceIndex',currentSourceIndex)
    // console.log('currentTargetPage',currentTargetPage)
    const mergeIndex = mergeList.findIndex((e) => e.target === currentTargetPage);
    if (mergeIndex === -1) {
      setMergeList(prev => [...prev, {source:currentSourcePage, target:currentTargetPage}]);
    } else {
      return;
    }
    const index = pdfSourceThumbnails.findIndex(e=>e.page===currentSourcePage && !e.merge);
    const data = [...pdfSourceThumbnails];
    const original = pdfSourceThumbnails[index];
    data.splice((index), 1 , { ...pdfTargetThumbnails[(currentTargetPage-1)], merge: true, original: original, originPage: original.originPage});
    setPdfSourceThumbnails(data);
    setMerging(true);
    setMergeDisable(true);
    setInsertDisable(true);
    setLockUpload(true);
  }

  const handleInsert = () => {
    const insertIndex = insertList.findIndex((e) => e.target === currentTargetPage);
    const mergeIndex = mergeList.findIndex((e) => e.target === currentTargetPage);
    if (mergeIndex === -1 && insertIndex === -1) {
      setInsertList(prev => [...prev, {source:pdfSourceThumbnails.length + 1, target:currentTargetPage}]);
    } else {
      return;
    }
    const data = [...pdfSourceThumbnails];
    data.splice((currentSourceIndex), 0 , { ...pdfTargetThumbnails[(currentTargetPage-1)], merge: false, insert: true, original: null, originPage: null, page: pdfSourceThumbnails.length + 1, targetPage: pdfTargetThumbnails[(currentTargetPage-1)].page});
    setPdfSourceThumbnails(data);
    setMerging(true);
    setMergeDisable(true);
    setInsertDisable(true);
    setLockUpload(true);
  }

  const handleReset = (pdfSourceThumbnails, mergeList, index) => {
    const mergeIndex = mergeList.findIndex(e => e.source === pdfSourceThumbnails[index].originPage);
    if (mergeIndex !== -1) {
      const data = [...mergeList];
      data.splice(mergeIndex, 1);
      setMergeList(data);
    }
    //const index = pdfSourceThumbnails.findIndex(e=>e.page===currentSourcePage && e.merge);
    const original = pdfSourceThumbnails[index].original;
    const data = [...pdfSourceThumbnails];
    data.splice((index), 1 , { ...original});
    setPdfSourceThumbnails(data);
    setDisableButton();
  }

  const handleResetInsert = (pdfSourceThumbnails, insertList, index) => {
    const insertIndex = insertList.findIndex(e => e.target === pdfSourceThumbnails[index].targetPage);
    if (insertIndex !== -1) {
      const data = [...insertList];
      data.splice(insertIndex, 1);
      setInsertList(data);
    }
    //const index = pdfSourceThumbnails.findIndex(e=>e.page===currentSourcePage && e.merge);
    const data = [...pdfSourceThumbnails];
    data.splice((index), 1);
    setPdfSourceThumbnails(data);
    //setMerging(true);
  }

  const handleUp = () => {
    if (currentSourceIndex !== 1) changeSourcePage(currentSourceIndex - 1, sourcePreviewRef);
    if (currentTargetIndex !== 1) changeTargetPage(currentTargetIndex - 1, targetPreviewRef);
  }

  const handleDown = () => {
    if (pdfSourceThumbnails.length > currentSourceIndex) changeSourcePage(currentSourceIndex + 1, sourcePreviewRef);
    if (pdfTargetThumbnails.length > currentTargetIndex) changeTargetPage(currentTargetIndex + 1, targetPreviewRef);
  }

  const handleCompare = (sourceVersionId, targetVersionId) => {
    setSourcePageVersionId(sourceVersionId);
    setTargetPageVersionId(targetVersionId);
    setCompareModalOpen(true);
  }

  const handleCompareUpload = () => {
    // setSourcePageVersionId(sourceVersionId);
    // setTargetPageVersionId(targetVersionId);
    setCompareUploadModalOpen(true);
  }

  const handleMergeSave = () => {
    const pages = pdfSourceThumbnails.map((e, i) => {
      const index = sourcePages.findIndex(d => d === e.page);
      const merge = index !== -1;
      let targetPage = undefined;
      let originPage = undefined;
      if (merge) {
        targetPage = targetPages[index];
        originPage = sourcePages[index];
      } else if (e.insert) {
        const insertIndex = insertList.findIndex(d => d.source === e.page);
        targetPage = insertIndex !== -1 ? insertList[insertIndex].target : e.page;
      } else {
        targetPage = e.page;
      }
      return {
        insert: e.insert || false,
        targetPage: targetPage || null,
        merge: merge || false,
        page: targetPage || e.page,
        originalPage: e.originPage || undefined,
      }
    });
    //console.log('merge data:',pages)
    setOpenMergeSave(false);
    pdfSourceSave({
      variables: {
        data: {
          pdfSourceId: sourceItem,
          pdfUploadId: targetItem || undefined,
          pdfSourcePages: pages,
        }
      },
    });
  }

  const handleMergeAll = () => {
    const pages = pdfSourceThumbnails.map((e, i) => {
      const page = i + 1;
      return {
        insert: false,
        targetPage: page,
        merge: true,
        page: page,
        originalPage: page,
      }
    });
    //console.log('merge data:',pages)
    setOpenMergeAll(false);
    pdfSourceSave({
      variables: {
        data: {
          pdfSourceId: sourceItem,
          pdfUploadId: targetItem || undefined,
          pdfSourcePages: pages,
        }
      },
    });
  }

  const onDocumentLoadSuccessSource = async ({ numPages: nextNumPages }) => {
    //setNumSourcePages(nextNumPages);
    setCurrentSourceIndex(1);
    setCurrentSourcePage(1);
    const data = (await generateThumbnails('source'))?.map((e, i) => {
      return {
        ...e,
        originPage: i + 1,
      }
    });
    setPdfSourceThumbnails(data);
    setPdfSourceThumbnailsCopy(data);
  }

  const onDocumentLoadSuccessTarget = async ({ numPages: nextNumPages }) => {
    //setNumTargetPages(nextNumPages);
    setCurrentTargetIndex(1);
    setCurrentTargetPage(1);
    const data = (await generateThumbnails('target'))?.map((e, i) => {
      return {
        ...e,
        originPage: i + 1,
      }
    });
    setPdfTargetThumbnails(data);
  }

  const generateThumbnails = async (fileType) => {
    const thumbnail_size = 150;
    let thumbnails = [];
    if (fileType === 'source') {
      thumbnails = await generatePdfThumbnails(sourceFile, thumbnail_size);
    } else {
      thumbnails = await generatePdfThumbnails(targetFile, thumbnail_size);
    }
    //console.log('thumbnails',thumbnails)
    return thumbnails;
  }

  const moveSourceCard = useCallback((dragIndex, hoverIndex) => {
    setPdfSourceThumbnails((prevCards) =>
      update(prevCards, {
        $splice: [
          [dragIndex, 1],
          [hoverIndex, 0, prevCards[dragIndex]],
        ],
      }),
    );
    if (sourceData) {
      setMerging(true);
    }
  }, [])
  // const moveTargetCard = useCallback((dragIndex, hoverIndex) => {
  //   setPdfTargetThumbnails((prevCards) =>
  //     update(prevCards, {
  //       $splice: [
  //         [dragIndex, 1],
  //         [hoverIndex, 0, prevCards[dragIndex]],
  //       ],
  //     }),
  //   )
  // }, [])
  // const onDeleteSourceCard = useCallback((index) => {
  //   setPdfSourceThumbnails((prevItems) => {
  //     const newItems = [...prevItems];
  //     newItems.splice(index, 1);
  //     return newItems;
  //   });
  // }, []);
  // const onDeleteTargetCard = useCallback((index) => {
  //   setPdfTargetThumbnails((prevItems) => {
  //     const newItems = [...prevItems];
  //     newItems.splice(index, 1);
  //     return newItems;
  //   });
  // }, []);

  const onSelectedSourceCard = (selectIndex) => {
    //console.log('selectIndex',selectIndex)
    setGalleryModalOpen(true);
  }

  const handleGalleryModalClose = () => {
    setGalleryModalOpen(false);
  }

  const handleCompareyModalClose = () => {
    setCompareModalOpen(false);
  }

  const handleCompareUploadModalClose = () => {
    setCompareUploadModalOpen(false);
  }

  const handleSourceDoubleClick = (insertList, index, ref) => {
    //console.log('source ref', ref);
    const scrollTop = ref.current.scrollTop;
    const page = index;
    //console.log('page',page);
    const sourceIndex = insertList.findIndex(e => e.source === page);
    //console.log('index',sourceIndex)
    if (sourceIndex !== -1) return;
    //console.log('sourceDoubleClick: ',page);
    setSourcePages(prevPages => {
      if (prevPages.includes(page)) {
        return prevPages.filter(p => p !== page);
      } else {
        return [...prevPages, page];
      }
    });
    if (scrollTop !== undefined) {
      //console.log('set source scrolll', scrollTop)
      setCurrentSourceScrollTop(scrollTop);
    }
  }
  useEffect(()=>{
    // console.log('sourcePages: ',sourcePages);
    // console.log('targetPages: ',targetPages);
    setMerging(sourcePages?.length && targetPages?.length && (sourcePages?.length === targetPages?.length));
  },[sourcePages, targetPages])

  const handleTargetDoubleClick = (insertList, index, ref) => {
    //console.log('target ref', ref);
    const scrollTop = ref.current.scrollTop;
    const page = index;
    const targetIndex = insertList.findIndex(e => e.target === page);
    if (targetIndex !== -1) return;
    //console.log('targetDoubleClick: ',page);
    setTargetPages(prevPages => {
      if (prevPages.includes(page)) {
        return prevPages.filter(p => p !== page);
      } else {
        return [...prevPages, page];
      }
    });
    if (scrollTop !== undefined) {
      //console.log('set target scrolll', scrollTop)
      setCurrentTargetScrollTop(scrollTop);
    }
  }

  const renderSourceCard = useCallback((card, index, isHighlight, mergeList, pdfSourceThumbnails, insertList, sourcePages, sourcePreviewRef) => {
    const mergeIndex = mergeList.findIndex(e=>pdfSourceThumbnails[index].originPage === e.source);
    return (
      <Card
        key={index}
        index={index}
        id={index}
        img={card.thumbnail}
        moveCard={moveSourceCard}
        onSelectedCard={onSelectedSourceCard}
        isHighlight={isHighlight}
        isMerge={card.merge}
        isInsert={card.insert}
        insertPage={card.insert?card.targetPage:0}
        page={card.page}
        originPage={card.originPage}
        isReset={mergeIndex!==-1}
        handleReset={() => handleReset(pdfSourceThumbnails, mergeList, index)}
        handleResetInsert={() => handleResetInsert(pdfSourceThumbnails, insertList, index)}
        onDoubleClick={() => handleSourceDoubleClick(insertList, card.page, sourcePreviewRef)}
        sourcePages={sourcePages}
      />
    )
  }, [])

  const renderTargetCard = useCallback((card, index, isHighlight, mergeList, insertList, targetPages, targetPreviewRef) => {
    const mergeIndex = mergeList.findIndex(e=>e.target === index+1);
    const insertIndex = insertList.findIndex(e=>e.target === index+1);
    return (
      <CardNormal
        key={index}
        index={index}
        id={index}
        img={card.thumbnail}
        // moveCard={moveTargetCard}
        //onDeleteCard={onDeleteTargetCard}
        isHighlight={isHighlight}
        style={{border: isHighlight ? '1px dashed #d32f2f' : '1px dashed gray' }}
        isTarget={true}
        isMerge={mergeIndex!==-1}
        isInsert={insertIndex!==-1}
        //page={mergeIndex !== -1 ? mergeList[mergeIndex].source : 0}
        page={card.page}
        onDoubleClick={() => handleTargetDoubleClick(insertList, card.page, targetPreviewRef)}
        targetPages={targetPages}
      />
    )
  }, [])

  const RenderThumbnails = props => {
    if (props.fileType === 'source') {
      return (
      <div className='PDFCompare__preview__content' ref={props.sourcePreviewRef}>
        <DndProvider backend={HTML5Backend}>
        {pdfSourceThumbnails.length ? pdfSourceThumbnails?.map((e,i) => (
        <div className={`PDFCompare__preview__image`} key={`pdf_source_thumbnail_${i+1}`} onClick={()=>changeSourcePage(i+1, props.sourcePreviewRef)}>
          {renderSourceCard(e, i, currentSourceIndex === (i+1), mergeList, pdfSourceThumbnails, insertList, sourcePages, props.sourcePreviewRef)}
        </div>
        ))
       : ''}
       </DndProvider>
      </div>);
    } else {
      return (
        <div className='PDFCompare__preview__content' ref={props.targetPreviewRef}>
          {pdfTargetThumbnails.length ? pdfTargetThumbnails?.map((e,i) => (
          <div className={`PDFCompare__preview__image`} key={`pdf_target_thumbnail_${i+1}`} onClick={()=>changeTargetPage(i+1, props.targetPreviewRef)}>
            {renderTargetCard(e, i, currentTargetPage === (i+1), mergeList, insertList, targetPages, props.targetPreviewRef)}
          </div>
          ))
         : ''}
        </div>);
    }
  }

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (targetItem) {
        if (event.key === 'ArrowUp') {
          handleUp();
        } else if (event.key === 'ArrowDown') {
          handleDown();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [targetItem, handleUp, handleDown]);

  useLayoutEffect(() => {
    refetch();
  }, [data])
  return (
    <div className="PDFCompare">
      <div className="PDFCompare__container">
        <RenderThumbnails fileType={'source'} sourcePreviewRef={sourcePreviewRef} />
        <div className="PDFCompare__content">
          <div className='back_btn'>
            <IconButton
              variant="contained" color="primary"
              onClick={()=>navigate(-1)}
              size="large"
            ><ArrowBackIcon></ArrowBackIcon></IconButton>
          </div>
          <div className='PDFCompare__container__load'>
            {sourceData?.length === 0 ?
            <FormControl variant="standard" style={{minWidth:200}}>
              <InputLabel variant="standard" id="demo-simple-select-label" style={{fontSize:16}}>現時版本</InputLabel>
              <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                value={sourceItem}
                label="現時版本"
                onChange={onSourceItemChange}
                disabled={sourceData?.length !== 0}
                sx={{fontSize:16}}
              >
                {selectData?.map((e,i)=>{
                  return <MenuItem key={`sourceItem_${i+1}`}
                  sx={{fontSize:16}}
                  value={e.value}>{e.text}</MenuItem>
                })}
              </Select>
            </FormControl>
            : <div style={{
              minWidth:200,
              height:55,
              color:'#2C363C',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              }}>現時版本:&nbsp;<PictureAsPdfIcon style={{color:'#566B76'}}/></div>}
            {sourceItem && sourceData.length === 0 ?
            <div className='version_control_box'>
              <Button variant="contained" color="primary" onClick={() => handleSaveOpen('source')}>創建版本</Button>
              {/* <Button variant="contained" color="error" onClick={() => handleDeleteOpen('source')}>Delete</Button> */}
            </div> : ''}
          </div>
          <div className="PDFCompare__container__document">
            <div style={{display: currentSourcePageMerge ? 'none' : 'block'}}>
            <Document file={sourceFile} onLoadSuccess={onDocumentLoadSuccessSource} options={options} >
              {currentSourcePage ?
                <Page key={`page_current`} pageNumber={currentSourcePage} renderTextLayer={false} />
              : ''}
            </Document>
            </div>
            <div style={{display: currentSourcePageMerge ? 'block' : 'none'}}>
            <Document file={targetFile} onLoadSuccess={onDocumentLoadSuccessTarget} options={options}>
              {currentTargetPage ?
                <Page key={`page_current`} pageNumber={currentSourceSubPage || 1} renderTextLayer={false} />
              : ''}
            </Document>
            </div>
          </div>
        </div>
        <div className='PDFCompare__preview__content_action'>
          <div className='compare_btn'>
            <div className='compare_row' style={{display: 'none'}}>
              <Button
                disabled={(!sourceData?.length
                  //|| (sourceData?.length && targetItem === '')
                  || mergeDisable)}
                endIcon={<MergeTypeIcon />}
                variant="contained" color="primary"
                onClick={()=>handleMerge()}
              >
                合併
              </Button>
            </div>
            <div className='compare_row' >
              <Button
                disabled={(!sourceData?.length
                  //|| (sourceData?.length && targetItem === '')
                  || insertDisable)}
                startIcon={<KeyboardArrowLeftIcon />}
                variant="contained" color="primary"
                onClick={()=>handleInsert()}
              >
                插入
              </Button>
            </div>
            <div className='compare_row'>
              <Button
                disabled={(!sourceItem || !targetItem)}
                endIcon={<KeyboardArrowUpIcon />}
                variant="outlined" color="primary"
                onClick={()=>handleUp()}
              >
                上
              </Button>
            </div>
            <div className='compare_row'>
              <Button
                disabled={(!sourceItem || !targetItem)}
                endIcon={<KeyboardArrowDownIcon />}
                variant="outlined" color="primary"
                onClick={()=>handleDown()}
              >
                下
              </Button>
            </div>
            <div className='compare_row'>
              <Button
                disabled={(!sourceItem || !targetItem)}
                endIcon={<CompareIcon />}
                variant="outlined" color="primary"
                onClick={()=>handleCompareUpload()}
              >
                比較
              </Button>
            </div>
            <div className='compare_row' style={{display: merging ? 'flex' : 'none'}}>
              <Button
                disabled={(!merging)}
                //endIcon={<CompareIcon />}
                variant="contained" color="primary"
                onClick={()=>handleMergeSaveOpen()}
              >
                合併儲存
              </Button>
            </div>
            <div className='compare_row' style={{display: 'flex' }}>
              <Button
                disabled={(!mergingAll)}
                variant="contained" color="primary"
                onClick={()=>handleMergeAllOpen()}
              >
                全部合併
              </Button>
            </div>
          </div>
        </div>
        <div className="PDFCompare__content">
          <div className='PDFCompare__container__load'>
            <FormControl variant="standard" style={{minWidth:200}}>
              <InputLabel variant="standard" id="demo-simple-select-label" style={{fontSize:16}} >上傳檔案</InputLabel>
              <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                value={targetItem}
                label="Target"
                onChange={onTargetItemChange}
                disabled={sourceData.length === 0 || lockUpload}
                sx={{fontSize:16}}
              >
                {selectData?.map((e,i)=>{
                  return <MenuItem key={`targetItem_${i+1}`} value={e.value}
                  sx={{fontSize:16}}
                  >{e.text}</MenuItem>
                })}
              </Select>
            </FormControl>
            {targetItem ?
            <div className='version_control_box'>
              {/* <Button variant="contained" color="error" onClick={() => handleDeleteOpen('target')}>Delete</Button> */}
              <IconButton variant="contained" color="primary" onClick={() => handleLock()} size="small">
                {lockUpload ? <LockOpenIcon /> : <LockIcon />}
              </IconButton>
            </div> : ''}
          </div>
          <div className="PDFCompare__container__document">
            <Document file={targetFile} onLoadSuccess={onDocumentLoadSuccessTarget} options={options}>
              {currentTargetPage ?
                <Page key={`page_current`} pageNumber={currentTargetPage} renderTextLayer={false} />
              : ''}
            </Document>
          </div>
        </div>
        <RenderThumbnails fileType={'target'} targetPreviewRef={targetPreviewRef} />
      </div>
      <Dialog open={openSave} onClose={handleSaveClose}>
        <DialogTitle>確認</DialogTitle>
        <DialogContent>
          確定要創建新版本?
        </DialogContent>
        <DialogActions>
        <Button variant='contained' onClick={handleSave} color="primary">
            確定
          </Button>
          <Button variant='outlined' onClick={handleSaveClose} color="primary">
            取消
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={openDelete} onClose={handleDeleteClose}>
        <DialogTitle>Confirm </DialogTitle>
        <DialogContent>
          確定要刪除?
        </DialogContent>
        <DialogActions>
        <Button variant='contained' onClick={handleDelete} color="error">
            確定
          </Button>
          <Button variant='outlined' onClick={handleDeleteClose} color="primary">
            取消
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={openMergeSave} onClose={handleMergeSaveClose}>
        <DialogTitle>確定</DialogTitle>
        <DialogContent>
          確定要合併?
        </DialogContent>
        <DialogActions>
        <Button variant='contained' onClick={handleMergeSave} color="primary">
            確定
          </Button>
          <Button variant='outlined' onClick={handleMergeSaveClose} color="primary">
            取消
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={openMergeAll} onClose={handleMergeAllClose}>
        <DialogTitle>確定</DialogTitle>
        <DialogContent>
          確定要全部合併?
        </DialogContent>
        <DialogActions>
        <Button variant='contained' onClick={handleMergeAll} color="primary">
            確定
          </Button>
          <Button variant='outlined' onClick={handleMergeAllClose} color="primary">
            取消
          </Button>
        </DialogActions>
      </Dialog>
      <Backdrop className={classes.backdrop} open={pdfSourceCreateLoading || pdfUploadDeleteLoading || pdfSourceSaveDataLoading || loading}>
        <CircularProgress color="inherit" />
      </Backdrop>
      <GalleryModal
        images={galleryImages.map((e,i) => ({
          img: e.imageUrl,
          index: i,
          id: e.id,
          imgTitle: `Version: ${e.version}`,
          version: e.version,
          history: e.history,
        }))}
        open={galleryModalOpen}
        handleClose={handleGalleryModalClose}
        handleCompare={handleCompare}
      />
      <PDFCompareResult
        open={compareModalOpen}
        handleClose={handleCompareyModalClose}
        sourcePageVersionId={sourcePageVersionId}
        targetPageVersionId={targetPageVersionId}
      />
      <PDFCompareUploadResult
        open={compareUploadModalOpen}
        handleClose={handleCompareUploadModalClose}
        sourceId={sourceItem}
        sourcePage={currentSourcePage}
        uploadId={targetItem}
        uploadPage={currentTargetPage}
      />
    </div>
  );
}

export default PDFCompare;
