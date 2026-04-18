import React, {useContext, useLayoutEffect, useMemo, useState } from "react";
import moment from "moment";
import { Button, Divider, Grid, Pagination, Stack, Tooltip } from "@mui/material";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { radioFiltetBtnUseStyles } from "../components/RadioFiltetBtn";
import FilterBlock from "../components/FilterBlock";
import { gql, useLazyQuery, useMutation } from "@apollo/client";
import { CLOCK_INS_QUERY } from "../apollo/queries";
import { clockInFragment } from "../apollo/fragments";
import DebouncedInput from "../components/DebouncedInput";
import { createColumnHelper, flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable } from "@tanstack/react-table";
import { useDrag, useDrop } from "react-dnd";
import { rankItem } from "@tanstack/match-sorter-utils";
import { CreateBtn, CustomToolBtn, RefreshBtn, TableDelBtn, TableViewBtn } from "../components/TableActionBtn";
import BackdropLoading from "../components/BackdropLoading";
import parse from 'html-react-parser';
import ChatBubbleIcon from '@mui/icons-material/ChatBubble';
import { OptionsContext } from "../contexts/OptionsContextProvider";
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import ReactSortableTable from "../components/ReactSortableTable";
import { TableRow } from "../components/TableRow";
import { DELETE_CLOCK_IN } from "../apollo/mutations";
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { toMoney } from "../utils";
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import ConfirmModal from "../components/ConfirmModal";
import AddClockInFormModal from "../components/clockIn/AddClockInFormModal";
import ClockInQRCodeFormModal from "../components/clockIn/ClockInQRCodeFormModal";
import ClockInContactFormModal from "../components/clockIn/ClockInContactFormModal";
import UpdateClockInSalaryFormModal from "../components/clockIn/UpdateClockInSalaryFormModal";
import { useSnackbar } from "notistack";

const DraggableRow = ({ row, reorderRow, term }) => {

  const [, dropRef] = useDrop({
    accept: 'row',
    drop: (draggedRow) => reorderRow(draggedRow.index, row.index),
  })

  const [{ isDragging }, dragRef, previewRef] = useDrag({
    collect: monitor => ({
      isDragging: monitor.isDragging(),
    }),
    item: () => row,
    type: 'row',
  })

  return (
    <tr
      ref={previewRef} //previewRef could go here
      style={{
         opacity: isDragging ? 0.5 : 1,
       }}
    >
      {/* <td ref={dropRef}>
          <button ref={dragRef} style={{backgroundColor: null, borderWidth: 0, cursor: 'all-scroll'}}>
            <ViewHeadlineIcon/>
          </button>
        </td> */}
      {row.getVisibleCells().map((cell, index) => {
        return (<td key={cell.id}>
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </td>)
      })}
    </tr>
  )
}
  
const columnHelper = createColumnHelper();

const fuzzyFilter = (row, columnId, value, addMeta) => {
  // Rank the item
  const itemRank = rankItem(row.getValue(columnId), value)
  // Store the itemRank info
  addMeta({
    itemRank,
  })
  // Return if the item should be filtered in/out
  return itemRank.passed
}

export default ({height}) => {

  const [optionsContext, optionsContextDispatch, {quotationStautsIds}] = useContext(OptionsContext);
  const { enqueueSnackbar } = useSnackbar();
  const [openedModal, setOpenedModal] = React.useState({});
  const navigate = useNavigate();
  const location = useLocation();
  const queryParam = new URLSearchParams(window.location.search);
  const [dataUseQuery, queryStatus] = useLazyQuery(gql`${CLOCK_INS_QUERY} ${clockInFragment}`, {fetchPolicy: 'network-only',});
  const [deleteMutation, deleteStatus] = useMutation(DELETE_CLOCK_IN);
  const [myConfirmModalOpen, setMyConfirmModalOpen] = React.useState({
    open: false,
    title: null,
    content: null,
    onConfirm: ()=>{},
  });
  const [globalFilter, setGlobalFilter] = React.useState('')
  const [sorting, setSorting] = React.useState([]);
	const [searchParams, setSearchParams] = useSearchParams();
  const [{ pageIndex, pageSize }, setPagination] = React.useState({
    pageIndex: searchParams.get("pageIndex") ? parseInt(searchParams.get("pageIndex")): 1,
    pageSize: searchParams.get("pageSize") ? parseInt(searchParams.get("pageSize")): 15,
  });
  const pagination = React.useMemo(
    () => ({
      pageIndex,
      pageSize,
    }),
    [pageIndex, pageSize]
  );
  const [rowData, setData] = React.useState([]);
  const [totalCount, setTotalCount] = useState(0);

  const handleMyConfirmModalOpen = (title, content, onConfirm) => setMyConfirmModalOpen({
    open: true,
    title: title,
    content: content,
    onConfirm: onConfirm,
    onClose: handleMyConfirmModalClose
  });

  const handleMyConfirmModalClose = () => setMyConfirmModalOpen({
    open: false,
    title: null,
    content: null,
    onConfirm: ()=>{},
    onClose: handleMyConfirmModalClose
  });

  const reorderRow = (draggedRowIndex, targetRowIndex) => {

    let selected = JSON.parse(JSON.stringify(rowData[targetRowIndex]));
    let target = JSON.parse(JSON.stringify(rowData[draggedRowIndex]));
    let selectedOrder = target.order;
    let targetOrder = selected.order;
    rowData.splice(targetRowIndex, 0, rowData.splice(draggedRowIndex, 1)[0])
    setData([...rowData]);
  }

  const columns = React.useMemo(() => {
    let columns = [
      columnHelper.accessor('location', {
        id: 'project',
        width: 450,
        header: (header) => '工程',
        cell: info => {
          let project = info.getValue().Project;
          return project.code??''
        }
      }),
      columnHelper.accessor('location', {
        id: 'address',
        width: 450,
        header: (header) => '地址',
        cell: info => {
          let location = info.getValue();
          let googleMap = location.lon && location.lat ? <a class="addressUrl" href="https://www.google.com/maps/@${location.lat},${location.lon},166m/data=!3m1!1e3" target="_blank"><LocationOnIcon/> </a> : ''
          return <div style={{display: 'flex', alignItems: 'center'}}>
            {location.address}{googleMap}
          </div>
        }
      }),
      columnHelper.accessor('location', {
        id: 'project',
        width: 200,
        header: (header) => '發起人',
        cell: info => {
          let user = info.getValue().user;
          return user.nameCht??''
        }
      }),
      columnHelper.accessor('createdAt', {
        id: 'createdAt',
        width: 110,
        style: {
          whiteSpace: 'nowrap'
        },
        header: (header) => '建立',
        cell: info => {
          return <div>
            <div style={{textAlign: 'right', fontWeight: 400}}>{moment(info.getValue()).format('YYYY-MM-DD')}</div>
            <div style={{textAlign: 'right', fontStyle: 'italic'}}>{moment(info.getValue()).format('HH:mm:ss')}</div>
          </div>
        }
      }),
      columnHelper.accessor('clockedInAt', {
        id: 'clockedInAt',
        width: 110,
        style: {
          whiteSpace: 'nowrap'
        },
        header: (header) => '打卡時間',
        cell: info => {
          return <div>
            <div style={{textAlign: 'right', fontWeight: 400}}>{moment(info.getValue()).format('YYYY-MM-DD')}</div>
            <div style={{textAlign: 'right', fontStyle: 'italic'}}>{moment(info.getValue()).format('HH:mm:ss')}</div>
        </div>
        }
      }),
      columnHelper.accessor('contact', {
        id: 'contact',
        width: 200,
        textAlign: 'center',
        header: (header) => '打卡員工',
        cell: info => {
          let contact = info.getValue();
          let name, nameEng, tel;
          if(contact) {
            name = contact.name;
            nameEng = contact.nameEng;
            tel = contact.tel;
          }
          else tel = info.row.original.tel
          return <Button
            variant="contained"
            style={{ width: '100%' }}
            onClick={() => {
              onUpdateContactClick(info.row.original)
            }}>
            {name || nameEng || tel.replace('852', '')}
          </Button>
        }
      }),
      columnHelper.accessor('salary', {
        id: 'salary',
        textAlign: 'center',
        width: 120,
        header: (header) => '人工',
        cell: info => {
          let salary = info.getValue();
          return (
            <Button
              variant="outliened"
              style={{ width: '100%' }}
              onClick={() => {
                onUpdateSalaryClick(info.row.original)
              }}>
              {toMoney(salary)}
            </Button>
          )
        }
      }),
      columnHelper.accessor('remark', {
        id: 'remark',
        textAlign: 'center',
				width: 50,
        header: (header) => '備註',
        cell: info => {
					const htmlString = info.getValue();
					if(htmlString) return <Tooltip title={<React.Fragment>{parse(htmlString)}</React.Fragment>} placement="right" arrow>
						<div style={{display: 'flex', justifyContent: 'center',alignItems: 'center', width: '100%'}}>
						<ChatBubbleIcon fontSize="small" />
						</div>
					</Tooltip>
        }
      }),
      columnHelper.accessor('nonce', {
        id: 'nonce',
        textAlign: 'center',
				width: 70,
        header: (header) => '驗證碼',
        cell: info => info.getValue()
      }),
      columnHelper.accessor('isDuplicated', {
        id: 'isDuplicated',
        textAlign: 'center',
				width: 70,
        header: (header) => '有效',
        cell: info => {
          let isDuplicated = info.getValue()
          if(!isDuplicated) return <CheckIcon style={{color: 'green'}} />
          else return <CloseIcon style={{color: 'red'}} />
        }
      }),
      columnHelper.accessor('action', {
        id: 'action',
				width: 50,
        textAlign: 'center',
        header: () => '操作',
        cell: info => {
          return (
            <div>
							{/* <TableViewBtn title={"查看"} onClick={()=>{onReviewBtnClick(info.row.original)}}/> */}
              <TableDelBtn onClick={()=>{onDelBtnClick(info.row.original) }}/>
            </div>
          )
        }
      }),
      columnHelper.accessor('empty', {
        id: 'empty',
        header: (header) => '',
        cell: info => {
        }
      })
    ]
    return columns
  })

  const rows = useMemo(()=>{
    let rows = [];
    if(queryStatus.data?.clockIns.edges) {
      rows = queryStatus.data?.clockIns.edges.map((e)=>e.node);
      setTotalCount(queryStatus.data?.clockIns.totalCount);
      setData(rows);
    }
    return rows
  }, [queryStatus, pageIndex, pageSize]);

  const table = useReactTable({
		initialState: {
			pagination: {
					pageSize: pageSize,
			},
	  },
    data: rowData,
    columns,
    state: {
      sorting,
      globalFilter,
    },
    filterFns: {
      fuzzy: fuzzyFilter,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    globalFilterFn: fuzzyFilter,
    onGlobalFilterChange: setData,
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  const query = ()=>{
    dataUseQuery({
      variables: {
				progressArray: quotationStautsIds,
				first: pageSize,
				skip: pageSize * (pageIndex - 1)
      }
    });
  }
  
  const loading = queryStatus.loading || deleteStatus.loading;

  const onCreateCompleted = () => {
    setOpenedModal({ open: '' })
    queryStatus.refetch();
    handleMyConfirmModalClose()
  }

  const createBtnClick = () => { 
    setOpenedModal({ 
      open: 'createModal',
      mode: 'create',
      onCompleted: onCreateCompleted
     })
  }

  const createQRCodeBtnClick = () => { 
    setOpenedModal({ 
      open: 'createQRCodeModal',
      mode: 'create',
      onCompleted: onCreateCompleted
     })
  }

  const onUpdateContactClick = (data) => {
    let contact = data.contact;
    setOpenedModal({ 
      open: 'clockInContactFormModal',
      mode: contact ? 'update' : 'create',
      data: contact ? {
         tel: data.tel?.replace("852", ""),
         name: contact.name,
         nameEng: contact.nameEng,
         address: contact.address,
         remark: contact.remark,
         clockInContactFiles: contact.clockInContactFiles
        }
        : { tel: data.tel.replace("852", "")},
      onCompleted: onCreateCompleted
     })
  }

  const onUpdateSalaryClick = (data) => {
    const { id, salary } = data;
    setOpenedModal({ 
      open: 'updateSalaryFormModal',
      mode: 'update',
      data: {
       id,
       salary
      },
      onCompleted: onCreateCompleted
     })
  }

	const onReviewBtnClick = (params, event) => {
    return
    let url = `/cms/quotation/${params.id}?tab=0`
    navigate(url);
  }

  const onDelBtnClick = (params, event) => {
    deleteMutation({
      variables: {
        data: {
          id: params.id,
        }
      },
      onCompleted: (res) => {
        if (res.deleteClockIn.userErrors.length) {
          res.deleteClockIn.userErrors.map(e => {
            enqueueSnackbar(e.message, {
              variant: 'error'
            })
          })
        }
        else if (res.deleteClockIn.result) {
          queryStatus.refetch();
          enqueueSnackbar(`刪除成功`, {
            variant: 'success'
          })
        }
      },
      onError: (error) => {
        enqueueSnackbar(error.message, {
          variant: 'error'
        })
        return;
      }
    })
  }

  const onPageIndexChange = (e, pageIndex) => {
    setPagination({ pageIndex: pageIndex, pageSize: pageSize }); 
    navigate(`${location.pathname}?pageIndex=${pageIndex}&pageSize=${pageSize}`)
  }

  useLayoutEffect(() => {
    query();
  }, [pageIndex, pageSize])

  return (
    <div style={{ height: height??'85vh', width: '100%', padding: 0 }}>
      <AddClockInFormModal
        open={openedModal.open == 'createModal'}
        data={openedModal.data}
        mode={openedModal.mode}
        onCloseClick={() => setOpenedModal({ open: '' })}
        onCompleted={onCreateCompleted}
      /> 
      <ClockInQRCodeFormModal
        open={openedModal.open == 'createQRCodeModal'}
        data={openedModal.data}
        mode={openedModal.mode}
        onCloseClick={() => setOpenedModal({ open: '' })}
        onCompleted={onCreateCompleted}
      />
      <ClockInContactFormModal
        open={openedModal.open == 'clockInContactFormModal'}
        data={openedModal.data}
        mode={openedModal.mode}
        onCloseClick={() => setOpenedModal({ open: '' })}
        onCompleted={onCreateCompleted}
      />
      <UpdateClockInSalaryFormModal
        open={openedModal.open == 'updateSalaryFormModal'}
        data={openedModal.data}
        mode={openedModal.mode}
        onCloseClick={() => setOpenedModal({ open: '' })}
        onCompleted={onCreateCompleted}
      />        
      <ConfirmModal
        mode={'confirm'}
        open={myConfirmModalOpen.open}
        title={myConfirmModalOpen.title}
        content={myConfirmModalOpen.content}
        onCloseClick={myConfirmModalOpen.onClose}
        onConfirmClick={myConfirmModalOpen.onConfirm}
      />
      <div style={{padding: 5, fontWeight: 'bold'}}>打卡紀錄</div>
      <Divider/>
			<FilterBlock>
        <Stack direction="row" spacing={2}>
          <Grid container spacing={2}>
            <Grid item xs={'auto'}>
              <CreateBtn onClick={createBtnClick}>
                新增
              </CreateBtn>
            </Grid>
            <Grid item xs={'auto'}>
              <CustomToolBtn onClick={createQRCodeBtnClick}>
                打卡QR Code
              </CustomToolBtn>
            </Grid>
            <Grid item xs={'auto'} sm={'auto'}>
             <RefreshBtn onClick={()=>query()}/>
            </Grid>
            <Grid item xs={12} sm={1} minWidth={200} sx={{display:'flex', justifyContent: 'center', alignItems: 'center'}}>
              <DebouncedInput
                sx={{'& .MuiInputBase-root': {
                  borderBottom: 'none',
                },}}
                value={globalFilter ?? ''}
                onChange={value => setGlobalFilter(value)}
                className="p-2 font-lg shadow border border-block"
                placeholder="Search..."
              />
            </Grid>
          </Grid>
        </Stack>
			</FilterBlock>
      <div style={{ width: '100%' }}>
        <div style={{ height: 'auto', width: '100%', padding: 0, position: 'relative' }}>
          {loading && <BackdropLoading />}
          <ReactSortableTable
            table={table}
            sorting={sorting}
            pageIndex={pageIndex}
            count={Math.ceil(totalCount / pageSize)}
            renderRow={(row, index) => <TableRow key={row.id} row={row} onDoubleClick={onReviewBtnClick}
              menuItems={[
                { label: '查看', onClick: () => { onReviewBtnClick(row.original) } },
                { label: '刪除', onClick: () => { onDelBtnClick(row.original) }, mode: 'warning', title: '確認刪除?' }
              ]}
            />}
            onPageIndexChange={onPageIndexChange}
          />
        </div>
      </div>
    </div>
  )
}
