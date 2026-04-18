import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Button, Divider, Grid, Stack } from "@mui/material";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { radioFiltetBtnUseStyles } from "../components/RadioFiltetBtn";
import FilterBlock from "../components/FilterBlock";
import { gql, useLazyQuery, useMutation } from "@apollo/client";
import DebouncedInput from "../components/DebouncedInput";
import { createColumnHelper, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable } from "@tanstack/react-table";
import { rankItem } from "@tanstack/match-sorter-utils";
import { AddBtn, CreateBtn, RefreshBtn, TableDelBtn, TableEditBtn, TableViewBtn } from "../components/TableActionBtn";
import BackdropLoading from "../components/BackdropLoading";
import { BOOK_KEEPING_TRANSACTIONS_QUERY } from "../apollo/queries";
import { bookKeepingTransactionFragment } from "../apollo/fragments";
import { BOOK_KEEPING_TRANSACTIONS_DELETE, CHEQUE_BOOK_DELETE, CLAIM_FORM_DELETE, PROJECT_INVOICE_DELETE, PROJECT_ORDER_DELETE } from "../apollo/mutations";
import { useSnackbar } from "notistack";
import { toMoney } from "../utils";
import BookKeepingTransactionFormModal from "../components/bookKeepingAccount/BookKeepingTransactionFormModal";
import moment from "moment";
import ReactSortableTable from "../components/ReactSortableTable";
import { TableRow } from "../components/TableRow";
import ProjectOrderSettledmentModal from "../components/project/ProjectOrderSettledmentModal";

// 获取屏幕的宽度和高度
const screenWidth = window.screen.width;
const screenHeight = window.screen.height;

function organizeItems(items) {
  // 创建一个映射，以便根据 id 查找项目
  const itemMap = {};
  let expenditure = 0;
  let income = 0;
  // 将项目按照 id 存入映射
  items.forEach(item => {
    item.child = []; // 初始化子项目数组
    itemMap[item.id] = item;
  });

  // 存储最终结果的数组
  const result = [];

  // 遍历项目，将其放入相应的父项目的 child 数组中
  items.forEach(item => {
    const parentAccountId = item.parentAccount?.id;
    if (item.balance > 0) income += item.balance;
    else expenditure += item.balance;

    if (parentAccountId) {
      // 如果有父项目，将当前项目加入父项目的 child 数组
      const parentItem = itemMap[parentAccountId];
      if (parentItem) {
        parentItem.child.push(item);
      }
    } else {
      // 如果沒有 parentAccount ，表示是最顶层的项目
      result.push(item);
    }
  });

  return {data: result, expenditure: expenditure, income: income, balance: income + expenditure};
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

export default ({height, refetchAccount, accountTypeId}) => {

  const radioFiltetBtnClasses = radioFiltetBtnUseStyles();
  const { enqueueSnackbar } = useSnackbar();
  const [openedModal, setOpenedModal] = React.useState({});
  const navigate = useNavigate();
  const {accountId} = useParams();
  const location = useLocation();
  const [dataUseQuery, queryStatus] = useLazyQuery(gql`${BOOK_KEEPING_TRANSACTIONS_QUERY} ${bookKeepingTransactionFragment}`, {fetchPolicy: 'network-only',});
  const [formDataUpdateMutate, updateStatus] = useMutation(BOOK_KEEPING_TRANSACTIONS_DELETE);
  const [deletedInVoiceMutate, deletedInVoiceStatus] = useMutation(PROJECT_INVOICE_DELETE);
  const [deleteChequeMutation, deleteChequeStatus] = useMutation(gql`${CHEQUE_BOOK_DELETE}`);
  const [deleteOrderMutate, deleteOrderStatus] = useMutation(PROJECT_ORDER_DELETE);
  const [deleteClaimFormMutate, deleteClaimFormStatus] = useMutation(CLAIM_FORM_DELETE); 
  const [globalFilter, setGlobalFilter] = React.useState('');
  const [sorting, setSorting] = React.useState([]);
  const queryParam = new URLSearchParams(window.location.search);
  const [{ pageIndex, pageSize }, setPagination] = React.useState({
    pageIndex: queryParam.get("pageIndex") ? parseInt(queryParam.get("pageIndex")): 1,
    pageSize: queryParam.get("pageSize") ? parseInt(queryParam.get("pageSize")): 9999,
  });
  
  const incomeRef = useRef(0);
  const expenditureRef = useRef(0);
  const balanceRef = useRef(0);
  const pagination = React.useMemo(
    () => ({
      pageIndex,
      pageSize,
    }),
    [pageIndex, pageSize]
  );
  const [rowData, setData] = React.useState([]);
  const [totalCount, setTotalCount] = useState(0);

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
      columnHelper.accessor('action', {
        id: 'action',
        width: 50,
        header: () => '操作',
        cell: info => {
          let chequeBook = info.row.original.chequeBook;
          console.log(info.row.original.claimForm)
          return (
            <div style={{display: 'flex'}}>
							{/* <TableEditBtn onClick={()=>{onEditBtnClick(info.row.original)}}/> */}
              <TableDelBtn
                onClick={() => { 
                  onDeleteBtnClick(info.row.original.id, info.row.original.invoice?.id, chequeBook?.id, info.row.original.order?.id, info.row.original.claimForm?.id)
                 }}
              />
            </div>
          )
        }
      }),
      columnHelper.accessor('transactionDate', {
        id: 'transactionDate',
        textAlign: 'center',
        width: 120,
        header: (header) => '日期',
        cell: info => moment(info.getValue()).format('YYYY-MM-DD')
      }),
      columnHelper.accessor('chequeBook', {
        id: 'chequeBook',
        textAlign: 'center',
        width: 150,
        header: (header) => '備用金(Cheque No)',
        cell: info => {
          let chequeBook = info.getValue();
          if(chequeBook) return chequeBook.chequeNo
        }
      }),
      columnHelper.accessor('order', {
        id: 'order',
        textAlign: 'center',
        width: 120,
        header: (header) => '訂單(Supplier)',
        cell: info => {
          let order = info.getValue();
          if(order) return (<Button onClick={()=>{onOrderViewClick(order)}}>{order.realId}</Button>)
        }
      }),
      columnHelper.accessor('invoice', {
        id: 'invoice',
        textAlign: 'center',
        width: 120,
        header: (header) => '發票單',
        cell: info => {
          let invoice = info.getValue();
          if(invoice) return (<Button onClick={()=>{onInvoicePrintClick(invoice.id)}}>{invoice.invId}</Button>)
        }
      }),
      columnHelper.accessor('transactionItems', {
        id: 'transactionItemsType',
        width: 120,
        header: (header) => '類型',
        cell: info => {
          let transactionItem = info.getValue().find(e=>e.account.id != accountId);
          const accountType = transactionItem?.account?.accountType?.name;
          let isDebit = transactionItem.isDebit;
          if(transactionItem) return accountType
        }
      }),
      columnHelper.accessor('transactionItems', {
        id: 'transactionItemsScource',
        width: 330,
        header: (header) => '轉帳',
        cell: info => {
          let transactionItem = info.getValue().find(e=>e.account.id != accountId);
          let isDebit = transactionItem.isDebit;
          if(transactionItem) return <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
            <Button onClick={()=>{onReviewBtnClick(transactionItem?.account.id)}}>{transactionItem?.account?.name}</Button>
            <div>{isDebit ? '借:' : '貸:'}{toMoney(transactionItem?.amount)}</div>
          </div>
        }
      }),
      columnHelper.accessor('transactionItems', {
        id: 'desc',
        width: 250,
        header: (header) => '描述',
        cell: info => {
          let transactionItem = info.getValue().find(e=>e.account.id != accountId);
          return transactionItem.desc
        }
      }),
      columnHelper.accessor('empty', {
        id: 'empty',
        header: (header) => '',
      })
    ]
    return columns
  })

  const rows = useMemo(() => {
    let rows = [];
    if (queryStatus.data?.bookKeepingTransactions.edges) {
      rows = queryStatus.data?.bookKeepingTransactions.edges.map((e)=>e.node);
      setTotalCount(queryStatus.data?.bookKeepingTransactions.totalCount);
      setData(rows);
    }
    return rows
  }, [queryStatus, pageIndex, pageSize, globalFilter]);

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
      // globalFilter,
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
        accountId: accountId,
        deleted: false,
				first: pageSize,
				skip: pageSize * (pageIndex - 1)
      }
    });
  }
  
  const loading = queryStatus.loading || updateStatus.loading || deletedInVoiceStatus.loading || deleteChequeStatus.loading || deleteOrderStatus.loading || deleteClaimFormStatus.loading;

  const onCreateCompleted = () => {
    queryStatus.refetch();
    setOpenedModal({ open: '' })
  }

  const createBtnClick = (params) => { 
    setOpenedModal({ 
      open: 'createModal',
      mode: 'create',
      data: { parentAccountId: params?.id },
      accountTypeId: accountTypeId,
      onCompleted: onCreateCompleted
     })
  }

  const createChildBtnClick = (params) => { 
    setOpenedModal({ 
      open: 'createModal',
      mode: 'create',
      data: { parentAccountId: params?.id },
      onCompleted: onCreateCompleted
     })
  }

	const onEditBtnClick = (params, event) => {
     setOpenedModal({ 
      open: 'createModal',
      mode: 'update',
      data: {
        ...params,
        companyId: params.company?.id,
      },
      onCompleted: onCreateCompleted
     })
  }

  const onReviewBtnClick = (params, event) => {
    const width = screenWidth;
    const height = screenHeight;

    let url = `/cms/book_keeping_account_detail/${params}?tab=0`;
    window.open(url, '_blank', `width=${width},height=${height},menubar=no,toolbar=no,location=no,status=no,resizable=yes,scrollbars=yes`);
  }

  const onRowClick = (params, event) => {
    let target = event.currentTarget;
    if(!target) return;
    if(target.classList.contains('active')) target.classList.remove("active");
    else target.classList.add("active");
  }

  const onDeleteBtnClick = (id, invoiceId, chequeId, orderId, claimFormId) => {
    if (invoiceId) {
      deletedInVoiceMutate({
        variables: {
          data : { 
            id: invoiceId,
          }
        },
        onCompleted: (res) => {
          if (res.projectInvoiceDelete.userErrors.length) {
            res.projectInvoiceDelete.userErrors.map(e => {
              enqueueSnackbar(e.message, {
                variant: 'error'
              })
            })
          }
          else if (res.projectInvoiceDelete.result) {
            onCreateCompleted();
            refetchAccount();
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
      return;
    }
    else if (chequeId) {
      deleteChequeMutation({
        variables: {
          data : { 
            id: chequeId,
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
            onCreateCompleted();
            refetchAccount();
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
      return;
    }
    else if (orderId) {
      deleteOrderMutate({
        variables: {
          data : { 
            id: orderId,
          }
        },
        onCompleted: (res) => {
          if (res.projectOrderDelete.userErrors.length) {
            res.projectOrderDelete.userErrors.map(e => {
              enqueueSnackbar(e.message, {
                variant: 'error'
              })
            })
          }
          else if (res.projectOrderDelete.result) {
            onCreateCompleted();
            refetchAccount();
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
      return;
    }
    else if (claimFormId) { 
      deleteClaimFormMutate({
        variables: {
          data : { 
            id: claimFormId,
          }
        },
        onCompleted: (res) => {
          if (res.claimFormDelete.userErrors.length) {
            res.claimFormDelete.userErrors.map(e => {
              enqueueSnackbar(e.message, {
                variant: 'error'
              })
            })
          }
          else if (res.claimFormDelete.result) {
            onCreateCompleted();
            refetchAccount();
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
    else formDataUpdateMutate({
      variables: {
        data: {
          id: id,
        }
      },
      onCompleted: (res) => {
        if (res.bookKeepingTransactionDelete.userErrors.length) {
          res.bookKeepingTransactionDelete.userErrors.map(e => {
            enqueueSnackbar(e.message, {
              variant: 'error'
            })
          })
        }
        else if (res.bookKeepingTransactionDelete.result) {
          onCreateCompleted();
          refetchAccount();
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
    // setPagination({ pageIndex: pageIndex, pageSize: pageSize }); 
    // navigate(`${location.pathname}?pageIndex=${pageIndex}&pageSize=${pageSize}`)
  }

  const onInvoicePrintClick = (id) => { 
    let url = `/cms/invoice/${id}/print`
    window.open(url, '_blank', 'width=800,height=600');
  }

  const onOrderViewClick = (params) => { 
    setOpenedModal({ 
      open: 'orderModal',
      mode: 'edit',
      files: params.files,
      data: {
        id: params.id,
        realId: params.realId,
        project: params.project,
        supplier: params.supplier,
        bankAccountId: params.bankAccount?.id??null,
        categoryAccountId: params.categoryAccount?.id??null,
        settlement: params.settlement,
        orderedDate: params.orderedDate,
        desc: params.desc,
        cash: params.cash,
        cheque: params.cheque,
        amount: parseFloat(params.amount),
      },
      onCompleted: onCreateCompleted
     })
  }

  useEffect(() => {
    setPagination({
      pageIndex: queryParam.get("pageIndex") ? parseInt(queryParam.get("pageIndex")): 1,
      pageSize: queryParam.get("pageSize") ? parseInt(queryParam.get("pageSize")): 10,
    }); 
  }, [location]);
  
  useLayoutEffect(() => {
    query();
  }, [pageIndex, pageSize])

  return (
    <div style={{ height: '100%', width: '100%', padding: 0 }}>
      {loading && <BackdropLoading />}
      <BookKeepingTransactionFormModal
        open={openedModal.open == 'createModal'}
        data={openedModal.data}
        accountTypeId={accountTypeId}
        mode={openedModal.mode}
        onCloseClick={()=>setOpenedModal({ open: '' })}
        onCompleted={onCreateCompleted}
      />
      <ProjectOrderSettledmentModal
        open={openedModal.open == 'orderModal'}
        data={openedModal.data}
        mode={openedModal.mode}
        files={openedModal.files}
        onCloseClick={() => setOpenedModal({ open: '' })}
        onCompleted={onCreateCompleted}
      />
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
        <ReactSortableTable
            table={table}
            sorting={sorting}
            pageIndex={pageIndex}
            count={Math.ceil(totalCount / pageSize)}
            renderRow={(row, index) => <TableRow key={row.id} row={row} onDoubleClick={onReviewBtnClick}
            menuItems={[
              // {label: '編輯', onClick: ()=>{onReviewBtnClick(row.original)}},
              {label: '刪除', onClick: ()=>{onDeleteBtnClick(row.original.id, row.original.invoice?.id, row.original.chequeBook?.id, row.original.order?.id, row.original.claimForm?.id)}}
            ]}
            />}
            onPageIndexChange={onPageIndexChange}
          />
        </div>
      </div>
    </div>
  )
}
