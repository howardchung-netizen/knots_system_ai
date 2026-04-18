import React, {useContext, useLayoutEffect, useMemo, useState } from "react";
import moment from "moment";
import { Button, Divider, Grid, Pagination, Stack, Tooltip } from "@mui/material";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { radioFiltetBtnUseStyles } from "../components/RadioFiltetBtn";
import FilterBlock from "../components/FilterBlock";
import { gql, useLazyQuery, useMutation } from "@apollo/client";
import { BOOK_KEEPING_PERIOD_EXPENSES_QUERY } from "../apollo/queries";
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
import { BOOK_KEEPING_PERIOD_EXPENSE_DELETE } from "../apollo/mutations";
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
import { bookKeepingPeriodOptions } from "../constants/InputOptions";
import language from "../localization/language";
import { bookKeepingPeriodExpenseFragment } from "../apollo/fragments";
import BookKeepingPeriodExpenseTransactionFormModal from "../components/bookKeepingPeriodExpense/BookKeepingPeriodExpenseTransactionFormModal";

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
  const [dataUseQuery, queryStatus] = useLazyQuery(gql`${BOOK_KEEPING_PERIOD_EXPENSES_QUERY} ${bookKeepingPeriodExpenseFragment}`, {fetchPolicy: 'network-only',});
  const [deleteMutation, deleteStatus] = useMutation(BOOK_KEEPING_PERIOD_EXPENSE_DELETE);
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
      columnHelper.accessor('company', {
        id: 'company',
        width: 110,
        header: (header) => '記帳公司',
        cell: info => {
          const { companyName } = info.getValue();
          return companyName
        }
      }),
      columnHelper.accessor('categoryAccount', {
        id: 'categoryAccount',
        width: 200,
        header: (header) => '從以下項目',
        cell: info => {
          let account = info.getValue();
          return account?.name
        }
      }),
      columnHelper.accessor('chargeAccount', {
        id: 'chargeAccount',
        width: 200,
        header: (header) => '入帳到',
        cell: info => {
          let account = info.getValue();
          return account?.name
        }
      }),
      columnHelper.accessor('amount', {
        id: 'amount',
        width: 120,
        header: (header) => '金額',
        cell: info => {
          return toMoney(info.getValue())
        }
      }),
      columnHelper.accessor('fromDate', {
        id: 'fromDate',
        width: 120,
        header: (header) => '開始日期',
        cell: info => {
          return info.getValue()
        }
      }),
      columnHelper.accessor('toDate', {
        id: 'toDate',
        width: 120,
        header: (header) => '結束日期',
        cell: info => {
          return info.getValue()
        }
      }),
      columnHelper.accessor('period', {
        id: 'period',
        width: 150,
        header: (header) => '週期',
        cell: info => {
          let period = info.getValue();
          let periodDay = info.row.original.periodDay;
          let fromDate = moment(info.row.original.fromDate);
          switch(period){ 
            case 'weekly':
              return language.bookKeepingPeriodOptions[info.getValue()] + periodDay
            case 'monthly':
              return language.bookKeepingPeriodOptions[info.getValue()] + fromDate.format('DD日')
            case 'yearly':
              return language.bookKeepingPeriodOptions[info.getValue()] + fromDate.format('MM月DD日')
            case 'quarterly':
              return language.bookKeepingPeriodOptions[info.getValue()] + fromDate.format('DD日')
          }
          
        }
      }),
      columnHelper.accessor('desc', {
        id: 'desc',
        width: 200,
        header: (header) => '描述',
        cell: info => {
          return <div>{info.getValue()}</div>
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
      columnHelper.accessor('action', {
        id: 'action',
				width: 100,
        textAlign: 'center',
        header: () => '操作',
        cell: info => {
          return (
            <div style={{display: 'flex'}}>
							<TableViewBtn title={"查看"} onClick={()=>{onReviewBtnClick(info.row.original)}}/>
              <TableDelBtn onClick={()=>{onDelBtnClick(info.row.original)}}/>
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
    if(queryStatus.data?.bookKeepingPeriodExpenses.edges) {
      rows = queryStatus.data?.bookKeepingPeriodExpenses.edges.map((e)=>e.node);
      setTotalCount(queryStatus.data?.bookKeepingPeriodExpenses.totalCount);
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
        deleted: false,
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

	const onReviewBtnClick = (params, event) => {
    //replace params.period fisrt char to upper case
    let period = params.period.charAt(0).toUpperCase() + params.period.slice(1);
    setOpenedModal({ 
      open: 'createModal',
      mode: 'update',
      data: {
        id: params.id,
        companyId: params.company.id,
        categoryAccountId: params.categoryAccount.id,
        chargeAccountId: params.chargeAccount.id,
        amount: params.amount,
        fromDate: params.fromDate,
        toDate: params.toDate,
        period: period,
        periodDay: params.periodDay,
        desc: params.desc,
        remark: params.remark,
      },
      onCompleted: onCreateCompleted
     })
  }

  const onDelBtnClick = (params, event) => {
    deleteMutation({
      variables: {
        data: {
          id: params.id,
        }
      },
      onCompleted: (res) => {
        if (res.bookKeepingPeriodExpenseDelete.userErrors.length) {
          res.bookKeepingPeriodExpenseDelete.userErrors.map(e => {
            enqueueSnackbar(e.message, {
              variant: 'error'
            })
          })
        }
        else if (res.bookKeepingPeriodExpenseDelete.result) {
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
      <BookKeepingPeriodExpenseTransactionFormModal
        open={openedModal.open == 'createModal'}
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
      <div style={{padding: 5, fontWeight: 'bold'}}>自動入帳列表</div>
      <Divider/>
			<FilterBlock>
        <Stack direction="row" spacing={2}>
          <Grid container spacing={2}>
            <Grid item xs={'auto'}>
              <CreateBtn onClick={createBtnClick}>
                新增
              </CreateBtn>
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
