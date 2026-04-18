import React, {useContext, useLayoutEffect, useMemo, useState } from "react";
import moment from "moment";
import { Button, Grid, Stack, Tooltip } from "@mui/material";
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { radioFiltetBtnUseStyles } from "../components/RadioFiltetBtn";
import FilterBlock from "../components/FilterBlock";
import { gql, useApolloClient, useLazyQuery, useMutation } from "@apollo/client";
import { CHEQUE_BOOKS_QUERY } from "../apollo/queries";
import { chequeBookFragmentOnUser } from "../apollo/fragments";
import DebouncedInput from "../components/DebouncedInput";
import { createColumnHelper, flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable } from "@tanstack/react-table";
import { useDrag, useDrop } from "react-dnd";
import { rankItem } from "@tanstack/match-sorter-utils";
import { CreateBtn, RefreshBtn, TableDelBtn, TableViewBtn } from "../components/TableActionBtn";
import { OptionsContext } from "../contexts/OptionsContextProvider";
import { TableRow } from "../components/TableRow";
import ReactSortableTable from "../components/ReactSortableTable";
import { toMoney } from "../utils";
import ChatBubble from "@mui/icons-material/ChatBubble";
import BackdropLoading from "../components/BackdropLoading";
import PettyCashFormModal from "../components/user/PettyCashFormModal";
import { CHEQUE_BOOK_DELETE } from "../apollo/mutations";
import { useSnackbar } from "notistack";
import CheckIcon from '@mui/icons-material/Check';
import parse from 'html-react-parser';
import ChequeSettledmentModal from "../components/chequeBook/ChequeSettledmentModal";

const UPDATE_STAFF_PETTY_CASH = gql`
  fragment updateAmount on User {
    pettyCash 
  }
`;

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

export default ({staff, reload}) => {

  const [optionsContext, optionsContextDispatch, {quotationStautsIds}] = useContext(OptionsContext);
  const radioFiltetBtnClasses = radioFiltetBtnUseStyles();
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const location = useLocation();
  const { staffId } = useParams();
  const client = useApolloClient();
  const queryParam = new URLSearchParams(window.location.search);
  const [selectedMonth, setSelectedMonth] = useState(moment().format('YYYY-MM')); 
  const [dataUseQuery, queryStatus] = useLazyQuery(gql`${CHEQUE_BOOKS_QUERY} ${chequeBookFragmentOnUser}`, {fetchPolicy: 'network-only',});
  const [deleteMutation, deleteStatus] = useMutation(gql`${CHEQUE_BOOK_DELETE}`)
  const [globalFilter, setGlobalFilter] = React.useState('')
  const [sorting, setSorting] = React.useState([]);
	const [searchParams, setSearchParams] = useSearchParams();
  const [openedModal, setOpenedModal] = React.useState({});
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

  const columns = React.useMemo(() => {
    let columns = [
			columnHelper.accessor('action', {
        id: 'action',
				width: 100,
        header: () => '操作',
        cell: info => {
          return (
            <div style={{display: 'flex'}}>
							<TableViewBtn title={"查看"} onClick={()=>{onReviewBtnClick(info.row.original)}}/>
              <TableDelBtn onClick={()=>{onDeleteBtnClick(info.row.original)}}/>
            </div>
          )
        }
      }),
      columnHelper.accessor('chequeNo', {
        id: 'chequeNo',
        width: 150,
        header: (header) => 'Cheque No.',
        cell: info => {
          return info.getValue()
        }
      }),
      columnHelper.accessor('date', {
        id: 'date',
				width: 120,
        header: (header) => '日期',
        cell: info => {
          return info.getValue()
        }
      }),
			columnHelper.accessor('amount', {
        id: 'amount',
				width: 120,
        header: (header) => '	金額',
        cell: info => {
          return toMoney(info.getValue())
        }
      }),
      columnHelper.accessor('chargeAccount', {
        id: 'chargeAccount',
				width: 120,
        header: (header) => '扣款項目',
        cell: info => {
          return info.getValue()?.name
        }
      }),
      columnHelper.accessor('confirmTransfer', {
        id: 'confirmTransfer',
        width: 120,
        textAlign: 'center',
        header: (header) => '入帳',
        cell: info => {
          let paid = info.getValue();
          if(paid) return <CheckIcon style={{color: 'green'}}/>
          return <Button onClick={(e)=>onSettledmentClick(info.row.original, e)}>確認入帳</Button>
        }
      }),
      columnHelper.accessor('transaction', {
        id: 'transaction',
        width: 120,
        textAlign: 'center',
        header: (header) => '入帳日期',
        cell: info => {
          let data = info.getValue()?.transactionDate;
          return data
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
						<ChatBubble fontSize="small" />
						</div>
					</Tooltip>
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
    if(queryStatus.data?.chequeBooks.edges) {
      rows = queryStatus.data?.chequeBooks.edges.map((e)=>e.node);
      setTotalCount(queryStatus.data?.chequeBooks.totalCount);
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
				staffId: staffId,
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
  }

  const createBtnClick = (params, event) => {
    setOpenedModal({
      open: 'create',
      mode: 'create',
      data: {
        ...params,
        username: staff?.username,
        id: staffId
      },
      onCompleted: onCreateCompleted
    })
  }

  const onReviewBtnClick = (params, event) => {
    setOpenedModal({
      open: 'create',
      mode: 'edit',
      data: {
        ...params,
        nameCht: params.forPettyCashStaff.nameCht,
        nameEng: params.forPettyCashStaff.nameEng,
        username: params.forPettyCashStaff.username,
        status: params.forPettyCashStaff.status,
      },
      onCompleted: onCreateCompleted
    })
  }

  const onDeleteBtnClick = (params) => {
    deleteMutation({
      variables: {
        data: {
          id: params.id,
        }
      },
      onCompleted: (res) => {
        if (res.chequeBookDelete.userErrors.length) {
          res.chequeBookDelete.userErrors.map(e => {
            enqueueSnackbar(e.message, {
              variant: 'error'
            })
          })
        }
        else if (res.chequeBookDelete.result) {
          queryStatus.refetch();
          if(reload)reload();
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

  const onSettledmentClick = (params, e) => {
    e.stopPropagation();
    e.preventDefault();
    setOpenedModal({ 
      open: 'settledmentModal',
      mode: 'create',
      data: {
        ...params,
      },
      onCompleted: onCreateCompleted
     })
  }

  const onPageIndexChange = (e, pageIndex) => {
    setPagination({ pageIndex: pageIndex, pageSize: pageSize }); 
  }

  useLayoutEffect(() => {
    query();
  }, [pageIndex, pageSize])

  return (
    <div style={{ width: '100%', padding: 0 }}>
      {loading && <BackdropLoading/>}
      <PettyCashFormModal
        open={openedModal.open == 'create'}
        data={openedModal.data}
        mode={openedModal.mode}
        onCloseClick={() => setOpenedModal({ open: '' })}
        onCompleted={onCreateCompleted}
      />
      <ChequeSettledmentModal
        open={openedModal.open == 'settledmentModal'}
        data={openedModal.data}
        mode={openedModal.mode}
        date={openedModal.date}
        onCloseClick={() => setOpenedModal({ open: '' })}
        onCompleted={onCreateCompleted}
      />
			<FilterBlock>
        <Stack direction="row" spacing={2}>
          <Grid container spacing={2}>
          <Grid item xs={'auto'}>
              <CreateBtn onClick={createBtnClick}>
                新增備用金
              </CreateBtn>
            </Grid>
            <Grid item xs={'auto'} sm={'auto'}>
             <RefreshBtn onClick={()=>{query();if(reload)reload();}}/>
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
            <Grid item xs={'auto'} sm={'auto'} style={{display: 'flex', alignItems: 'center'}}>
            當前金額: {toMoney(staff?.pettyCash)}
            </Grid>
          </Grid>
        </Stack>
			</FilterBlock>
      <div style={{ width: '100%' }}>
        <div style={{ height: 'auto', width: '100%', padding: 0, position: 'relative' }}>
        <div style={{ height: 'auto', width: '100%', padding: 0, position: 'relative' }}>
        <ReactSortableTable
            table={table}
            sorting={sorting}
            pageIndex={pageIndex}
            count={Math.ceil(totalCount / pageSize)}
            renderRow={(row, index) => <TableRow key={row.id} row={row} onDoubleClick={onReviewBtnClick}
            menuItems={[
              { label: '查看', onClick: () => { onReviewBtnClick(row.original) } },
              {
                label: '入帳', onClick: () => {
                  // if (row.original.lastChequeBook) onReviewPettyCashClick(row.original)
                  // else alert('沒有備用金資料')
                }
              },
              { label: '刪除', onClick: ()=>{onDeleteBtnClick(row.original.id)}, mode: 'warning', title: '確定刪除？'},
            ]}
            />}
            onPageIndexChange={onPageIndexChange}
          />
        </div>
        </div>
      </div>
    </div>
  )
}
