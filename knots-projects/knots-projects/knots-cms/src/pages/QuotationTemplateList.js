import React, { useEffect, useLayoutEffect, useMemo, useState } from "react";
import { Divider, Grid, Stack } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import { radioFiltetBtnUseStyles } from "../components/RadioFiltetBtn";
import FilterBlock from "../components/FilterBlock";
import { gql, useLazyQuery, useMutation } from "@apollo/client";
import DebouncedInput from "../components/DebouncedInput";
import { createColumnHelper, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable } from "@tanstack/react-table";
import { rankItem } from "@tanstack/match-sorter-utils";
import { CreateBtn, RefreshBtn, TableDelBtn, TableEditBtn } from "../components/TableActionBtn";
import BackdropLoading from "../components/BackdropLoading";
import { QUOTATION_TEMPLATES_QUERY } from "../apollo/queries";
import { quotationTemplateFragment } from "../apollo/fragments";
import ReactTable from "../components/ReactTable";
import { TableRow } from "../components/TableRow";
import { IOSSwitch } from "../components/MuiSwitch";
import { QUOTATION_TEMPLATE_UPDATE } from "../apollo/mutations";
import { useSnackbar } from "notistack";
import { FaCheck } from "react-icons/fa";
import QuotationTemplateFormModal from "../components/quotation/QuotationTemplateFormModal";
import ReactSortableTable from "../components/ReactSortableTable";

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
  const { enqueueSnackbar } = useSnackbar();
  const [openedModal, setOpenedModal] = React.useState({});
  const navigate = useNavigate();
  const location = useLocation();
  const [dataUseQuery, queryStatus] = useLazyQuery(gql`${QUOTATION_TEMPLATES_QUERY} ${quotationTemplateFragment}`, {fetchPolicy: 'network-only',});
  const [formDataUpdateMutate, updateStatus] = useMutation(QUOTATION_TEMPLATE_UPDATE);
  const [globalFilter, setGlobalFilter] = React.useState('')
  const [sorting, setSorting] = React.useState([]);
  const queryParam = new URLSearchParams(window.location.search);
  const [{ pageIndex, pageSize, keyword }, setPagination] = React.useState({
    pageIndex: queryParam.get("pageIndex") ? parseInt(queryParam.get("pageIndex")): 1,
    pageSize: queryParam.get("pageSize") ? parseInt(queryParam.get("pageSize")): 10,
    keyword: queryParam.get("keyword") ?? '',
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
      columnHelper.accessor('name', {
        id: 'name',
        textAlign: 'center',
        width: 600,
        header: (header) => '模板名稱',
        cell: info => {
          return (
						<div>
              <div>{info.row.original.name}</div>
						</div>
          )
        }
      }),
      // columnHelper.accessor('inUsed', {
      //   id: 'inUsed',
      //   textAlign: 'center',
      //   width: 80,
      //   header: (header) => '使用中',
      //   cell: info => {
      //     if(info.getValue())
      //     return <FaCheck style={{color:"green", fontSize: 18}} />
      //   }
      // }),
			columnHelper.accessor('show', {
        id: 'show',
        width: 80,
        textAlign: 'center',
        header: (header) => '顯示',
        cell: info => {
          return <IOSSwitch
           inputProps={{ 'aria-label': 'Switch demo', color: 'green' }}
           onChange={(e)=>{ 
            onCheckChange(info.row.original.id, e.target.checked)
           }} 
           defaultChecked={info.getValue()} />
        }
      }),
      columnHelper.accessor('action', {
        id: 'action',
        header: () => '操作',
        cell: info => {
          return (
            <div style={{display: 'flex'}}>
							<TableEditBtn onClick={()=>{onReviewBtnClick(info.row.original)}}/>
              <TableDelBtn
                onClick={() => { onDeleteBtnClick(info.row.original.id) }}
              />
            </div>
          )
        }
      })
    ]
    return columns
  })
   
  const rows = useMemo(()=>{
    let rows = [];
    if(queryStatus.data?.quotationTemplates.edges) {
      rows = queryStatus.data?.quotationTemplates.edges.map((e)=>e.node);
      setTotalCount(queryStatus.data?.quotationTemplates.totalCount);
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
        delete: false,
				first: pageSize,
				skip: pageSize * (pageIndex - 1),
        keyword: keyword
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
      onCompleted: onCreateCompleted
     })
  }

	const onReviewBtnClick = (params, event) => {
    navigate(`/cms/template/${params.id}?tab=0`)
  }

  const onDeleteBtnClick = (id) => {
    formDataUpdateMutate({
      variables: {
        data : { 
          id: id,
          delete: true
        }
      },
      onCompleted: (res) => {
        if (res.quotationTemplateUpdate.userErrors.length) {
          res.quotationTemplateUpdate.userErrors.map(e => {
            enqueueSnackbar(e.message, {
              variant: 'error'
            })
          })
        }
        else if (res.quotationTemplateUpdate.projectHashtag) {
          queryStatus.refetch();
          enqueueSnackbar(`刪除成功`, {
            variant: 'success'
          })
        }
        onCreateCompleted();
      },
      onError: (error) => {
        enqueueSnackbar(error.message, {
          variant: 'error'
        })
        return;
      }
    })
   }

   const onCheckChange = (id, check) => {
    formDataUpdateMutate({
      variables: {
        data : { 
          id: id,
          show: check
        }
      },
      onCompleted: (res) => {
        if (res.quotationTemplateUpdate.userErrors.length) {
          res.quotationTemplateUpdate.userErrors.map(e => {
            enqueueSnackbar(e.message, {
              variant: 'error'
            })
          })
        }
        else if (res.quotationTemplateUpdate.projectHashtag) {
          queryStatus.refetch();
          enqueueSnackbar(`更改成功`, {
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

  useLayoutEffect(() => { 
    navigate(`${location.pathname}?pageIndex=1&pageSize=${pageSize}`, { replace: true })
  },[])

  const onPageIndexChange = (e, pageIndex) => {
    setPagination({ pageIndex: pageIndex, pageSize: pageSize, keyword }); 
    navigate(`${location.pathname}?pageIndex=${pageIndex}&pageSize=${pageSize}`)
  }

  useEffect(() => {
    setPagination({
      pageIndex: queryParam.get("pageIndex") ? parseInt(queryParam.get("pageIndex")): 1,
      pageSize: queryParam.get("pageSize") ? parseInt(queryParam.get("pageSize")): 10,
      keyword: queryParam.get("keyword") ?? '',
    }); 
  }, [location]);
  
  useLayoutEffect(() => {
    query();
  }, [pageIndex, pageSize, keyword])

  return (
    <div style={{ height: height??'85vh', width: '100%', padding: 0 }}>
      <QuotationTemplateFormModal
        open={openedModal.open == 'createModal'}
        data={openedModal.data}
        mode={openedModal.mode}
        onCloseClick={()=>setOpenedModal({ open: '' })}
        onCompleted={onCreateCompleted}
      />
      <div style={{padding: 5, fontWeight: 'bold'}}>模板列表</div>
      <Divider/>
			<FilterBlock>
        <Stack direction="row" spacing={2}>
          <Grid container spacing={2}>
            <Grid item xs={'auto'}>
              <CreateBtn onClick={createBtnClick}>
                新增模板
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
          {loading  && <BackdropLoading />}
          <ReactSortableTable
            table={table}
            sorting={sorting}
            pageIndex={pageIndex}
            count={Math.ceil(totalCount / pageSize)}
            renderRow={(row, index) => <TableRow key={row.id} row={row} onDoubleClick={onReviewBtnClick} 
            menuItems={[
              {label: '編輯', onClick: ()=>{onReviewBtnClick(row.original)}},
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
