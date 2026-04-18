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
import { TERMSES_QUERY } from "../apollo/queries";
import { termsFragment } from "../apollo/fragments";
import ReactTable from "../components/ReactTable";
import { DraggableTableRow } from "../components/TableRow";
import { IOSSwitch } from "../components/MuiSwitch";
import { TERMS_UPDATE } from "../apollo/mutations";
import { useSnackbar } from "notistack";
import ReactSortableTable from "../components/ReactSortableTable";
import TermsFormModal from "../components/terms/TermsFormModal";

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

export default () => {

  const radioFiltetBtnClasses = radioFiltetBtnUseStyles();
  const { enqueueSnackbar } = useSnackbar();
  const [openedModal, setOpenedModal] = React.useState({});
  const navigate = useNavigate();
  const location = useLocation();
  const [dataUseQuery, queryStatus] = useLazyQuery(gql`${TERMSES_QUERY} ${termsFragment}`, {fetchPolicy: 'network-only',});
  const [formDataUpdateMutate, updateStatus] = useMutation(TERMS_UPDATE);
  const [globalFilter, setGlobalFilter] = React.useState('')
  const [sorting, setSorting] = React.useState([]);
  const queryParam = new URLSearchParams(window.location.search);
  const [{ pageIndex, pageSize }, setPagination] = React.useState({
    pageIndex: queryParam.get("pageIndex") ? parseInt(queryParam.get("pageIndex")): 1,
    pageSize: queryParam.get("pageSize") ? parseInt(queryParam.get("pageSize")): 9999,
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
      columnHelper.accessor('sorting', {
        id: 'sorting',
				width: 50,
        header: () => '排序'
      }),
      columnHelper.accessor('name', {
        id: 'name',
        width: 800,
        header: (header) => '條款名稱',
        cell: info => {
          return (
							<div className="ellipsis" style={{width: 800}}>{info.row.original.nameCht}</div>
          )
        }
      }),
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
    if(queryStatus.data?.termses.edges) {
      rows = queryStatus.data?.termses.edges.map((e)=>e.node);
      setTotalCount(queryStatus.data?.termses.totalCount);
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
        show: true,
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
      onCompleted: onCreateCompleted
     })
  }

	const onReviewBtnClick = (params, event) => {
     setOpenedModal({ 
      open: 'createModal',
      mode: 'update',
      data: {...params, typeId: params.type?.id},
      onCompleted: onCreateCompleted
     })
  }

  const onDeleteBtnClick = (id) => {
    formDataUpdateMutate({
      variables: {
        data : { 
          id: id,
          deleted: true
        }
      },
      onCompleted: (res) => {
        if (res.termsUpdate.userErrors.length) {
          res.termsUpdate.userErrors.map(e => {
            enqueueSnackbar(e.message, {
              variant: 'error'
            })
          })
        }
        else if (res.termsUpdate.terms) {
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

   const onCheckChange = (id, check) => {
    formDataUpdateMutate({
      variables: {
        data : { 
          id: id,
          show: check
        }
      },
      onCompleted: (res) => {
        if (res.termsUpdate.userErrors.length) {
          res.termsUpdate.userErrors.map(e => {
            enqueueSnackbar(e.message, {
              variant: 'error'
            })
          })
        }
        else if (res.termsUpdate.terms) {
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

  const onPageIndexChange = (e, pageIndex) => {
    setPagination({ pageIndex: pageIndex, pageSize: pageSize }); 
  }

  useEffect(() => {
    setPagination({
      pageIndex: queryParam.get("pageIndex") ? parseInt(queryParam.get("pageIndex")): 1,
      pageSize: queryParam.get("pageSize") ? parseInt(queryParam.get("pageSize")): 9999,
    }); 
  }, [location]);
  
  useLayoutEffect(() => {
    query();
  }, [pageIndex, pageSize])

  return (
    <div style={{ width: '100%', padding: 0 }}>
      <TermsFormModal
        open={openedModal.open == 'createModal'}
        data={openedModal.data}
        mode={openedModal.mode}
        onCloseClick={()=>setOpenedModal({ open: '' })}
        onCompleted={onCreateCompleted}
      />
			<FilterBlock>
        <Stack direction="row" spacing={2}>
          <Grid container spacing={2}>
            <Grid item xs={'auto'}>
              <CreateBtn onClick={createBtnClick}>
                新增條款
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
            loading={loading}
            sorting={sorting}
            pageIndex={pageIndex}
            count={Math.ceil(totalCount / pageSize)}
            data={rowData}
            setData={setData}
            renderRow={(row, index) => <DraggableTableRow 
              key={row.original.id??row.id} 
              row={row} 
              reorderRow={reorderRow} 
              onDoubleClick={onReviewBtnClick}
              menuItems={[
                {label: '編輯', onClick: ()=>{onReviewBtnClick(row.original)}},
                {label: '刪除', onClick: ()=>{onDeleteBtnClick(row.original.id)}}
              ]}
              />
            }
            onPageIndexChange={onPageIndexChange}
          />
        </div>
      </div>
    </div>
  )
}
