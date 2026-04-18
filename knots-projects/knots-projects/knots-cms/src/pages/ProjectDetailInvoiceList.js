import React, { useEffect, useLayoutEffect, useMemo, useState } from "react";
import { Button, Divider, Grid, Stack, Tooltip } from "@mui/material";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { radioFiltetBtnUseStyles } from "../components/RadioFiltetBtn";
import FilterBlock from "../components/FilterBlock";
import { gql, useLazyQuery, useMutation } from "@apollo/client";
import DebouncedInput from "../components/DebouncedInput";
import { createColumnHelper, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable } from "@tanstack/react-table";
import { rankItem } from "@tanstack/match-sorter-utils";
import { CreateBtn, PrintBtn, RefreshBtn, TableDelBtn, TableEditBtn, TableViewBtn } from "../components/TableActionBtn";
import BackdropLoading from "../components/BackdropLoading";
import { PROJECT_INVOICES_QUERY } from "../apollo/queries";
import { projectInvoiceFragment } from "../apollo/fragments";
import { TableRow } from "../components/TableRow";
import { PROJECT_INVOICE_DELETE } from "../apollo/mutations";
import { useSnackbar } from "notistack";
import ReactSortableTable from "../components/ReactSortableTable";
import { ChatBubble } from "@mui/icons-material";
import { toMoney } from "../utils";
import parse from 'html-react-parser';
import InvoiceFormModal from "../components/project/InvoiceFormModal";
import InvoiceFormSettledmentModal from "../components/invoice/InvoiceFormSettledmentModal";
import CheckIcon from '@mui/icons-material/Check';

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

export default ({projectCode, clientId, contactId}) => {

  const radioFiltetBtnClasses = radioFiltetBtnUseStyles();
  const { enqueueSnackbar } = useSnackbar();
  const { projectId } = useParams();
  const [openedModal, setOpenedModal] = React.useState({});
  const navigate = useNavigate();
  const location = useLocation();
  const [dataUseQuery, queryStatus] = useLazyQuery(gql`${PROJECT_INVOICES_QUERY} ${projectInvoiceFragment}`, {fetchPolicy: 'network-only',});
  const [formDataUpdateMutate, updateStatus] = useMutation(PROJECT_INVOICE_DELETE);
  const [globalFilter, setGlobalFilter] = React.useState('')
  const [sorting, setSorting] = React.useState([]);
  const queryParam = new URLSearchParams(window.location.search);
  const [{ pageIndex, pageSize }, setPagination] = React.useState({
    pageIndex: queryParam.get("pageIndex") ? parseInt(queryParam.get("pageIndex")): 1,
    pageSize: queryParam.get("pageSize") ? parseInt(queryParam.get("pageSize")): 10,
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
        textAlign: 'center',
        header: () => '操作',
        cell: info => {
          if(info.row.original.settlement)
          return (
            <div style={{display: 'flex'}}>
            <TableDelBtn
              onClick={() => { onDeleteBtnClick(info.row.original.id) }}
            />
            <PrintBtn onClick={()=>{onPrintClick(info.row.original.id)}}/>
          </div>
          )
          return (
            <div style={{display: 'flex'}}>
							<TableViewBtn onClick={()=>{onReviewBtnClick(info.row.original)}}/>
              <TableDelBtn
                onClick={() => { onDeleteBtnClick(info.row.original.id) }}
              />
              <PrintBtn onClick={()=>{onPrintClick(info.row.original.id)}}/>
            </div>
          )
        }
      }),
      columnHelper.accessor('invId', {
        id: 'invId',
        width: 120,
        textAlign: 'center',
        header: (header) => '發票編號',
        cell: info => {
          return (
							<div className="ellipsis" style={{width: 120}}>{info.row.original.invId}</div>
          )
        }
      }),
      columnHelper.accessor('date', {
        id: 'date',
        width: 120,
        textAlign: 'center',
        header: (header) => '發出日期',
        cell: info => info.getValue()
      }),
      columnHelper.accessor('totalAmount', {
        id: 'totalAmount',
        width: 100,
        header: (header) => '合計',
        cell: info => toMoney(info.getValue())
      }),
      // columnHelper.accessor('discount', {
      //   id: 'discount',
      //   width: 100,
      //   header: (header) => 'Discount',
      //   cell: info => toMoney(info.getValue())
      // }),
      columnHelper.accessor('ratioDiscount', {
        id: 'ratioDiscount',
        width: 100,
        header: (header) => '折扣',
        cell: info => `${toMoney(info.getValue())}(${info.row.original.discountRatio??0}%)`
      }),
      columnHelper.accessor('grandTotal', {
        id: 'grandTotal',
        width: 100,
        header: (header) => '收取金額',
        cell: info => toMoney(info.getValue())
      }),
      columnHelper.accessor('paid', {
        id: 'paid',
        width: 120,
        textAlign: 'center',
        header: (header) => '收款日期',
        cell: info => info.getValue()
      }),
      columnHelper.accessor('settlement', {
        id: 'settlement',
        width: 120,
        textAlign: 'center',
        header: (header) => '入帳',
        cell: info => {
          let paid = info.getValue();
          if(paid) return <CheckIcon style={{color: 'green'}}/>
          return <Button onClick={(e)=>onSettledmentClick(info.row.original, e)}>確認入帳</Button>
        }
      }),
      columnHelper.accessor('categoryAccount', {
        id: 'categoryAccount',
        width: 120,
        textAlign: 'center',
        header: (header) => '收入類別',
        cell: info => {
          let categoryAccount = info.getValue();
          if(categoryAccount) return categoryAccount.name;
        }
      }),
      columnHelper.accessor('bankAccount', {
        id: 'bankAccount',
        width: 120,
        textAlign: 'center',
        header: (header) => '轉帳',
        cell: info => {
          let bankAccount = info.getValue();
          if(bankAccount) return bankAccount.name;
        }
      }),
      columnHelper.accessor('transaction', {
        id: 'transaction',
        width: 120,
        textAlign: 'center',
        header: (header) => '入帳日期',
        cell: info => {
          let transaction = info.getValue();
          if(transaction) return transaction.transactionDate;
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
    if(queryStatus.data?.projectInvoices.edges) {
      rows = queryStatus.data?.projectInvoices.edges.map((e)=>e.node);
      setTotalCount(queryStatus.data?.projectInvoices.totalCount);
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
        projectId: projectId,
        deleted: false,
				first: pageSize,
				skip: pageSize * (pageIndex - 1)
      }
    });
  }
  
  const loading = queryStatus.loading || updateStatus.loading;

  const onCreateCompleted = () => {
    setOpenedModal({ open: '' })
    queryStatus.refetch();
  }

  const createBtnClick = () => { 
    setOpenedModal({ 
      open: 'createModal',
      mode: 'create',
      data: {
        projectId: projectId,
        projectCode: projectCode,
        clientId: clientId,
        contactId: contactId,
      },
      onCompleted: onCreateCompleted
     })
  }

	const onReviewBtnClick = (params, event) => {
     setOpenedModal({ 
      open: 'createModal',
      mode: 'update',
      data: {
        ...params,
        id: params.id,
        date: params.date,
        quotationCode: params.quotationNo,
        projectId: projectId,
        projectCode: projectCode,
        clientId: clientId,
        contactId: contactId,
        financialYear: `${params.financialYearStart}-${params.financialYearEnd}`,
        invoice: JSON.parse(params.invoice),
        discount: params.discount,
        discountRatio: params.discountRatio,
        ratioDiscount: params.ratioDiscount,
        totalAmount: params.totalAmount,
        grandTotal: params.grandTotal,
        remark: params.remark,
      },
      onCompleted: onCreateCompleted
     })
  }

  const onDeleteBtnClick = (id) => {
    formDataUpdateMutate({
      variables: {
        data : { 
          id: id
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
        else if (res.projectInvoiceDelete.projectInvoice) {
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

  const onSettledmentClick = (params, e) => {
    e.stopPropagation();
    e.preventDefault();
    setOpenedModal({ 
      open: 'settledmentModal',
      mode: 'create',
      data: {
        ...params,
        invoice: JSON.parse(params.invoice),
        projectId: projectId,
        projectCode: projectCode,
        financialYear: `${params.financialYearStart}-${params.financialYearEnd}`,
      },
      onCompleted: onCreateCompleted
     })
  }

  const onPrintClick = (id) => { 
    let url = `/cms/invoice/${id}/print`
    window.open(url, '_blank');
  }

	const onProjectBtnClick = (projectId, event) => {
    let url = `/cms/project/${projectId}?tab=2`
    // window.open(url, '_blank');
    navigate(url);
  }

  const onPageIndexChange = (e, pageIndex) => {
    setPagination({ pageIndex: pageIndex, pageSize: pageSize }); 
  }

  useEffect(() => {
    setPagination({
      pageIndex: queryParam.get("pageIndex") ? parseInt(queryParam.get("pageIndex")): 1,
      pageSize: queryParam.get("pageSize") ? parseInt(queryParam.get("pageSize")): 10,
    }); 
  }, [location])

  useLayoutEffect(() => { 
    query();
  },[])

  useLayoutEffect(() => {
    query();
  }, [pageIndex, pageSize])

  return (
    <div style={{ height: 'auto', width: '100%', padding: 0 }}>
      <InvoiceFormModal
        open={openedModal.open == 'createModal'}
        data={openedModal.data}
        mode={openedModal.mode}
        projectId={projectId}
        projectCode={projectCode}
        status={true}
        onCloseClick={()=>setOpenedModal({ open: '' })}
        onCompleted={onCreateCompleted}
      />
      <InvoiceFormSettledmentModal
        open={openedModal.open == 'settledmentModal'}
        data={openedModal.data}
        mode={openedModal.mode}
        date={openedModal.date}
        projectId={openedModal.projectId}
        projectCode={openedModal.projectCode}
        clientId={openedModal.clientId}
        contactId={openedModal.contactId}
        invId={openedModal.invId}
        onCloseClick={() => setOpenedModal({ open: '' })}
        onCompleted={onCreateCompleted}
      />
      <Divider/>
			<FilterBlock>
        <Stack direction="row" spacing={2}>
          <Grid container spacing={2}>
            <Grid item xs={'auto'}>
              <CreateBtn onClick={createBtnClick}>
                新增發票單
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
          {loading  && <BackdropLoading />}
          <ReactSortableTable
            table={table}
            sorting={sorting}
            pageIndex={pageIndex}
            count={Math.ceil(totalCount / pageSize)}
            data={rowData}
            setData={setData}
            renderRow={(row, index) => <TableRow 
              key={row.original.id??row.id} 
              row={row} 
              reorderRow={reorderRow} 
              onDoubleClick={onReviewBtnClick}
              menuItems={(()=>{
                if(row.original.settlement)
                return [
                  {label: '列印', onClick: ()=>{onPrintClick(row.original.id)}},
                  {label: '刪除', onClick: ()=>{onDeleteBtnClick(row.original.id)}, mode: 'warning', title: '確定刪除？'}
                ]
                else 
                return [
                  {label: '編輯', onClick: ()=>{onReviewBtnClick(row.original)}},
                  {label: '入帳', onClick: (e)=>{onSettledmentClick(row.original, e)}},
                  {label: '列印', onClick: ()=>{onPrintClick(row.original.id)}},
                  {label: '刪除', onClick: ()=>{onDeleteBtnClick(row.original.id)}, mode: 'warning', title: '確定刪除？'}
                ]
              })()}
              />
            }
            onPageIndexChange={onPageIndexChange}
          />
        </div>
      </div>
    </div>
  )
}
