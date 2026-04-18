import React, { useCallback, useEffect, useLayoutEffect, useMemo, useState } from "react";
import { Button, Divider, Grid, Stack } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import { radioFiltetBtnUseStyles } from "../components/RadioFiltetBtn";
import FilterBlock from "../components/FilterBlock";
import { gql, useLazyQuery, useMutation } from "@apollo/client";
import DebouncedInput from "../components/DebouncedInput";
import { createColumnHelper, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable } from "@tanstack/react-table";
import { rankItem } from "@tanstack/match-sorter-utils";
import { AddBtn, CreateBtn, RefreshBtn, TableDelBtn, TableEditBtn } from "../components/TableActionBtn";
import BackdropLoading from "../components/BackdropLoading";
import { PROJECT_ITEMS_QUERY } from "../apollo/queries";
import { projectItemFragment } from "../apollo/fragments";
import { PROJECT_ITEM_SORT, PROJECT_ITEM_UPDATE } from "../apollo/mutations";
import { useSnackbar } from "notistack";
import ProjectItemFormModal from "../components/project/ProjectItemFormModal";
import ReactTreeTable from "../components/ReactTreeTable";
import { ProjectItem } from "../components/SortableItem";

const findChildKeyword = (row, keyword) => {
  let hasChild = false;
  let hasKeyword = false;

  if(row.child?.length) hasChild = row.child.find(e=> findChildKeyword(e, keyword))
  if(row.keyword) {
    hasKeyword = row.keyword.toLowerCase().includes(keyword.toLowerCase())
  }
  
  return hasChild || hasKeyword;
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

  const [isShowAll, setIsShowAll] = useState(false);
  const radioFiltetBtnClasses = radioFiltetBtnUseStyles();
  const { enqueueSnackbar } = useSnackbar();
  const [openedModal, setOpenedModal] = React.useState({});
  const navigate = useNavigate();
  const location = useLocation();
  const [dataUseQuery, queryStatus] = useLazyQuery(gql`${PROJECT_ITEMS_QUERY} ${projectItemFragment}`,
    {
      fetchPolicy: 'network-only',
      variables: {
        delete: false
      }
    });
  const [formDataUpdateMutate, updateStatus] = useMutation(PROJECT_ITEM_UPDATE);
  const [formDataSortMutate, updateSortStatus] = useMutation(PROJECT_ITEM_SORT);
  const [globalFilter, setGlobalFilter] = React.useState('');
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
      }),
      columnHelper.accessor('nameCht', {
        id: 'nameCht',
        width: 450,
        header: (header) => '單位',
        cell: info => {
          return (
							<div>{info.row.original.nameCht} | {info.row.original.nameEn}</div>
          )
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
   
  const rows = useMemo(() => {
    let rows = [];
    if (queryStatus.data?.projectItems.edges) {
      let parents = queryStatus.data?.projectItems.edges.filter((e, i) => {
        return e.node.level == 0
      })
      .map(e=> e.node)

      if(globalFilter.length) parents = parents.filter(x=> { return findChildKeyword(x, globalFilter) });
      
      setTotalCount(queryStatus.data?.projectItems.totalCount);
      setData(parents);
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
        level: 0,
        delete: false,
				first: pageSize,
				skip: pageSize * (pageIndex - 1)
      }
    });
  }
  
  const loading = queryStatus.loading || updateSortStatus.loading;

  const onCreateCompleted = () => {
    queryStatus.refetch();
    setOpenedModal({ open: '' })
  }

  const createBtnClick = (params) => { 
    setOpenedModal({ 
      open: 'createModal',
      mode: 'create',
      data: { upperId: params.id },
      onCompleted: onCreateCompleted
     })
  }

	const onReviewBtnClick = (params, event) => {
     setOpenedModal({ 
      open: 'createModal',
      mode: 'update',
      data: {...params, upperId: params.upperId??'0' },
      onCompleted: onCreateCompleted
     })
  }

  const onRowClick = (params, event) => {
    let target = event.currentTarget;
    if(!target) return;
    if(target.classList.contains('active')) {
      target.classList.remove("active");
      let expenItems =  localStorage.getItem('expenProjectItems');
      if(expenItems) expenItems = JSON.parse(expenItems);
      else expenItems = [];
      expenItems = expenItems.filter(e=> e != params.id);
      localStorage.setItem('expenProjectItems', JSON.stringify(expenItems));
    }
    else {
      target.classList.add("active");
      let expenItems =  localStorage.getItem('expenProjectItems');
      if(expenItems) expenItems = JSON.parse(expenItems);
      else expenItems = [];
      expenItems.push(params.id);
      localStorage.setItem('expenProjectItems', JSON.stringify(expenItems));
    }
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
        if (res.projectItemUpdate.userErrors.length) {
          res.projectItemUpdate.userErrors.map(e => {
            enqueueSnackbar(e.message, {
              variant: 'error'
            })
          })
        }
        else if (res.projectItemUpdate.projectItem) {
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

   const onCheckChange = (id, check) => {
    formDataUpdateMutate({
      variables: {
        data : { 
          id: id,
          show: check
        }
      },
      onCompleted: (res) => {
        if (res.measurementUpdate.userErrors.length) {
          res.measurementUpdate.userErrors.map(e => {
            enqueueSnackbar(e.message, {
              variant: 'error'
            })
          })
        }
        else if (res.measurementUpdate.measurement) {
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

  const showAllClick = () => {
    setIsShowAll(true);
    let items = document.getElementsByClassName('tree-item');
    for (let i = 0; i < items.length; i++) {
      items[i].classList.add('active');
    }
  }

  const disableAllClick = () => {
    setIsShowAll(false);
    let items = document.getElementsByClassName('tree-item');
    for (let i = 0; i < items.length; i++) {
      items[i].classList.remove('active');
    }
  }

  const onPageIndexChange = (e, pageIndex) => {
    setPagination({ pageIndex: pageIndex, pageSize: pageSize }); 
    navigate(`${location.pathname}?pageIndex=${pageIndex}&pageSize=${pageSize}`)
  }

  const reOrderFormItem = (items, reOrderItems, upperId) => {

    let _form = [];

    for (let i in items) {
      let item = items[i]
      if (item.id == upperId) {
        item.child = reOrderItems;
      }
      else if (item.child?.length) {
        item.child = reOrderFormItem(item.child, reOrderItems, upperId);
      }
      _form.push(item)
    }

    return _form
  }

  const onItemDragEnd = (item) => {

    let _item = item.map((e, i)=> ({id: e.id, sort: i}))

    formDataSortMutate({
      variables: {
        data: {
          sort: _item,
        }
      },
      onCompleted: (res) => {
        if (res.projectItemSort.userErrors.length) {
          res.projectItemSort.userErrors.map(e => {
            enqueueSnackbar(e.message, {
              variant: 'error'
            })
          })
        }
        else if (res.projectItemSort.result) {
          onCreateCompleted();
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

  const Table = useCallback(() => {
    return (
      <ReactTreeTable
        table={table}
        sorting={sorting}
        pageIndex={pageIndex}
        count={Math.ceil(totalCount / pageSize)}
        setData={setData}
        onDragEnd={onItemDragEnd}
        renderRow={(row, index) => (
          <ProjectItem
            onDragEnd={onItemDragEnd}
            key={row.id}
            id={row.id}
            text={row.nameCht}
            data={row}
            onClick={onRowClick}
            onDoubleClick={onReviewBtnClick}
            actions={(data) => (
              <div style={{ display: 'flex' }}>
                <AddBtn onClick={() => { createBtnClick(data) }} />
                <TableEditBtn onClick={() => { onReviewBtnClick(data) }} />
                <TableDelBtn
                  onClick={() => { onDeleteBtnClick(data.id) }}
                />
              </div>
            )}
            menuItems={[
              {
                label: '新增子項目', onClick: (data) => {
                  createBtnClick(data)
                }
              },
              { label: '編輯', onClick: (data) => { onReviewBtnClick(data) } },
              { label: '刪除', onClick: (data) => { onDeleteBtnClick(data.id) } },
            ]}
            keyword={globalFilter}
          />
        )}
        onPageIndexChange={onPageIndexChange}
      />
    )
  }, [globalFilter])

  useEffect(() => {
    setPagination({
      pageIndex: queryParam.get("pageIndex") ? parseInt(queryParam.get("pageIndex")): 1,
      pageSize: queryParam.get("pageSize") ? parseInt(queryParam.get("pageSize")): 10,
    }); 
  }, [location]);

  useLayoutEffect(() => { 
    navigate(`${location.pathname}?pageIndex=1&pageSize=${pageSize}`, { replace: true })
  },[])

  useLayoutEffect(() => {
    query();
  }, [pageIndex, pageSize])

  return (
    <div style={{ height: '100%', width: '100%', padding: 0 }}>
      <ProjectItemFormModal
        open={openedModal.open == 'createModal'}
        data={openedModal.data}
        mode={openedModal.mode}
        onCloseClick={()=>setOpenedModal({ open: '' })}
        onCompleted={onCreateCompleted}
      />
      <div style={{padding: 5, fontWeight: 'bold'}}>項目列表</div>
      <Divider/>
      <div style={{
        position: 'sticky',
        top: 60,
        zIndex: 1,
        borderBottom: '1px solid #ddd',
      }}>
			<FilterBlock>
        <Stack direction="row" spacing={2}>
          <Grid container spacing={2}>
            <Grid item xs={'auto'}>
              <CreateBtn onClick={createBtnClick}>
                新增項目
              </CreateBtn>
            </Grid>
            <Grid item xs={'auto'} sm={'auto'} sx={{display: 'flex'}}>
             <RefreshBtn onClick={()=>query()}/>
             <Button onClick={showAllClick}>展開</Button>
             <Button onClick={disableAllClick}>收起</Button>
            </Grid>
            <Grid item xs={12} sm={12} sx={{display:'flex', justifyContent: 'center', alignItems: 'center'}}>
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
      </div>
      <div style={{ width: '100%' }}>
        <div style={{ height: 'auto', width: '100%', padding: 0, position: 'relative' }}>
          {loading && <BackdropLoading />}
          <Table />
        </div>
      </div>
    </div>
  )
}
