import React, { useEffect, useLayoutEffect, useMemo, useState } from "react";
import { Button, Divider, Grid, Stack } from "@mui/material";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { radioFiltetBtnUseStyles } from "../components/RadioFiltetBtn";
import FilterBlock from "../components/FilterBlock";
import { gql, useLazyQuery, useMutation } from "@apollo/client";
import DebouncedInput from "../components/DebouncedInput";
import { createColumnHelper, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable } from "@tanstack/react-table";
import { rankItem } from "@tanstack/match-sorter-utils";
import { CreateBtn, RefreshBtn, TableDelBtn, TableEditBtn, TableViewBtn } from "../components/TableActionBtn";
import BackdropLoading from "../components/BackdropLoading";
import { PORJECT_ORDERS_QUERY } from "../apollo/queries";
import { projectOrderFragment } from "../apollo/fragments"; 
import { TableRow } from "../components/TableRow";
import moment from "moment";
import { toMoney } from "../utils";
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxOutlinedIcon from '@mui/icons-material/CheckBoxOutlined';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import RadioButtonUncheckedOutlinedIcon from '@mui/icons-material/RadioButtonUncheckedOutlined';
import AttachMoneyOutlinedIcon from '@mui/icons-material/AttachMoneyOutlined';
import ProjectOrderFormModal from "../components/project/ProjectOrderFormModal";
import { PROJECT_ORDER_DELETE, PROJECT_ORDER_UPDATE } from "../apollo/mutations";
import { useSnackbar } from "notistack";
import ReactSortableTable from "../components/ReactSortableTable";
import CheckIcon from '@mui/icons-material/Check';
import ProjectOrderSettledmentModal from "../components/project/ProjectOrderSettledmentModal";

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

  const radioFiltetBtnClasses = radioFiltetBtnUseStyles();
  const {projectId} = useParams();
  const { enqueueSnackbar } = useSnackbar();
  const [openedModal, setOpenedModal] = React.useState({});
  const navigate = useNavigate();
  const location = useLocation();
  const [dataUseQuery, queryStatus] = useLazyQuery(gql`${PORJECT_ORDERS_QUERY} ${projectOrderFragment}`, {fetchPolicy: 'network-only',});
  const [formDataUpdateMutate, updateStatus] = useMutation(PROJECT_ORDER_DELETE);
  const [globalFilter, setGlobalFilter] = React.useState('')
  const [sorting, setSorting] = React.useState([]);
  const queryParam = new URLSearchParams(window.location.search);
  const [{ pageIndex, pageSize, keyword }, setPagination] = React.useState({
    pageIndex: queryParam.get("pageIndex") ? parseInt(queryParam.get("pageIndex")): 1,
    pageSize: queryParam.get("pageSize") ? parseInt(queryParam.get("pageSize")): 10,
    keyword: queryParam.get("keyword") ? queryParam.get("keyword") : ''
  });
  const pagination = React.useMemo(
    () => ({
      pageIndex,
      pageSize,
      keyword
    }),
    [pageIndex, pageSize, keyword]
  );
  const [rowData, setData] = React.useState([]);
  const [totalCount, setTotalCount] = useState(0);

  const columns = React.useMemo(() => {
    let columns = [
      columnHelper.accessor('action', {
        id: 'action',
				width: 80,
        textAlign: 'center',
        header: () => '操作',
        cell: info => {
          return (
            <div style={{display: 'flex'}}>
							<TableEditBtn onClick={()=>{onUpdateBtnClick(info.row.original)}}/>
              <TableDelBtn
                onClick={() => { onDeleteBtnClick(info.row.original.id) }}
              />
            </div>
          )
        }
      }),
      columnHelper.accessor('project', {
        id: 'project',
        width: 80,
        textAlign: 'center',
        canSort: true,
        header: (header) => 'Project No.',
        cell: info => {
          let project = info.getValue()
          if (project)
            return <Button
              variant="contained"
              onClick={() => { onReviewProjectBtnClick(project.projectId) }}>
              {info.row.original.project.projectId}
            </Button>
        }
      }),
      columnHelper.accessor('supplier', {
        id: 'supplier',
        width: 300,
        canSort: true,
        header: (header) => 'Supplier',
        cell: info => info.getValue()
      }),
      columnHelper.accessor('desc', {
        id: 'desc',
        width: 300,
        header: (header) => '描述',
        cell: info => info.getValue()
      }),
			columnHelper.accessor('amount', {
        id: 'amount',
        width: 120,
        textAlign: 'center',
        header: (header) => '價錢',
        cell: info => {
          let unit = info.row.original.unit;
          if(info.getValue())
          return toMoney(info.getValue())
        }
      }),
      columnHelper.accessor('orderedDate', {
        id: 'orderedDate',
        width: 120,
        header: (header) => '下單日期',
        cell: info => {
          if(info.getValue()) return moment(info.getValue()).format('YYYY-MM-DD')
        }
      }),
      columnHelper.accessor('payment', {
        id: 'payment',
        width: 20,
        header: (header) => '已付款',
        cell: info =>{
          let payment = info.getValue();
          return <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            { payment ? <CheckCircleOutlineOutlinedIcon style={{color:"green", fontSize: 30}} /> : <RadioButtonUncheckedOutlinedIcon color={'error'} /> }
          </div>
        }
      }),
      columnHelper.accessor('cash', {
        id: 'cash',
        width: 20,
        header: (header) => '現金付款',
        cell: info => {
          if (info.getValue()) return 
          <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <AttachMoneyOutlinedIcon />
          </div>
        }
      }),
      columnHelper.accessor('cheque', {
        id: 'cheque',
        width: 20,
        header: (header) => '支票號碼', 
        cell: info => info.getValue()
      }),
      columnHelper.accessor('deliveryDate', {
        id: 'deliveryDate',
        width: 120,
        header: (header) => '送貨日期',
        cell: info =>{
          if(info.getValue()) return moment(info.getValue()).format('YYYY-MM-DD')
        }
      }),
      columnHelper.accessor('delivery', {
        id: 'delivery',
        width: 20,
        header: (header) => '已收貸',
        cell: info =>{
          let delivery = info.getValue();
          return <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
           { delivery ? <CheckBoxOutlinedIcon style={{color:"green", fontSize: 30}} /> : <CheckBoxOutlineBlankIcon style={{color:"#ff7518"}} /> }
          </div>
        }
      }),
      // columnHelper.accessor('remark', {
      //   id: 'remark',
      //   header: (header) => '備註',
      //   cell: info => {
			// 		const htmlString = info.getValue();
			// 		if(htmlString) return <Tooltip title={<React.Fragment>{parse(htmlString)}</React.Fragment>} placement="right" arrow>
			// 			<ChatBubbleIcon fontSize="small" />
			// 		</Tooltip>
      //   }
      // }),
      columnHelper.accessor('claimForm', {
        id: 'claimForm',
        width: 120,
        textAlign: 'center',
        header: (header) => '報銷單',
        cell: info => {
          let claimForm = info.getValue();
          if(claimForm) return <Button onClick={(e)=>onSettledmentClick(info.row.original, e)}>查看</Button>
        }
      }),
      columnHelper.accessor('settlement', {
        id: 'settlement',
        width: 120,
        textAlign: 'center',
        header: (header) => '入帳',
        cell: info => {
          let paid = info.getValue();
          if(paid) return <TableViewBtn onClick={(e)=>onSettledmentClick(info.row.original, e)} style={{color: 'green'}}/>
          return <Button onClick={(e)=>onSettledmentClick(info.row.original, e)}>確認入帳</Button>
        }
      }),
      columnHelper.accessor('empty', {
        id: 'empty',
        header: (header) => '',
        cell: info => null
      })
    ]
    return columns
  })
   
  const rows = useMemo(()=>{
    let rows = [];
    if(queryStatus.data?.projectOrders
      .edges) {
      rows = queryStatus.data?.projectOrders
      .edges.map((e)=>e.node);
      setTotalCount(queryStatus.data?.projectOrders
        .totalCount);
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
        projectId: projectId ? parseInt(projectId) : null,
        deleted: false,
				first: pageSize,
				skip: pageSize * (pageIndex - 1),
        keyword: keyword,
        sort: sorting[0]?.id,
        order: sorting[0]?.desc ? 'DESC' : 'ASC'
      }
    });
  }
  
  const loading = queryStatus.loading || updateStatus.loading;

  const onCreateCompleted = () => {
    setOpenedModal({ open: '' })
    query();
  }

  const createBtnClick = () => { 
    setOpenedModal({ 
      open: 'createModal',
      mode: 'create',
      onCompleted: onCreateCompleted
     })
  }

  const onReviewProjectBtnClick = (id, event) => { 
    navigate(`/cms/project/${id}?tab=1`)
  }

  const onUpdateBtnClick = (params, event) => {
    setOpenedModal({ 
      open: 'createModal',
      mode: 'update',
      data: {...params, projectId: params.project?.projectId},
      onCompleted: onCreateCompleted
     })
  }

  const onSettledmentClick = (params, event) => {
    setOpenedModal({ 
      open: 'settledmentModal',
      mode: 'edit',
      files: params.files,
      data: {
        id: params.id,
        readId: params.readId,
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

  const onDeleteBtnClick = (id) => {
    formDataUpdateMutate({
      variables: {
        data: {
          id: id,
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
    setPagination({ pageIndex: pageIndex, pageSize: pageSize, keyword: keyword }); 
  }

  useEffect(() => {
    setPagination({
      pageIndex: queryParam.get("pageIndex") ? parseInt(queryParam.get("pageIndex")): 1,
      pageSize: queryParam.get("pageSize") ? parseInt(queryParam.get("pageSize")): 10,
      keyword: queryParam.get("keyword") ?? ''
    }); 
  }, [location]);
  
  useLayoutEffect(() => {
    query();
  }, [pageIndex, pageSize, keyword, sorting])

  return (
    <div style={{ width: '100%', padding: 0 }}>
      <ProjectOrderFormModal
        open={openedModal.open == 'createModal'}
        data={openedModal.data}
        mode={openedModal.mode}
        onCloseClick={()=>setOpenedModal({ open: '' })}
      />
      <ProjectOrderSettledmentModal
        open={openedModal.open == 'settledmentModal'}
        data={openedModal.data}
        mode={openedModal.mode}
        files={openedModal.files}
        onCloseClick={() => setOpenedModal({ open: '' })}
        onCompleted={onCreateCompleted}
      />
			<FilterBlock>
        <Stack direction="row" spacing={2}>
          <Grid container spacing={2}>
            <Grid item xs={'auto'}>
              <CreateBtn onClick={createBtnClick}>
                新增訂單
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
                value={keyword ?? ''}
                onChange={value => {
                  setPagination({ pageIndex: 1, pageSize: pageSize, keyword: value })
                }}
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
            renderRow={(row, index) => <TableRow key={row.id} row={row} onDoubleClick={onUpdateBtnClick}
            menuItems={[
              {label: '查看工程', onClick: ()=>{onReviewProjectBtnClick(row.original.project.projectId)}},
              {label: '編輯', onClick: ()=>{onUpdateBtnClick(row.original)}},
              {label: '刪除', onClick: ()=>{onDeleteBtnClick(row.original.id)}}
            ]}
            />}
            onPageIndexChange={onPageIndexChange}
          />
        </div>
      </div>
    </div>
  )
}
