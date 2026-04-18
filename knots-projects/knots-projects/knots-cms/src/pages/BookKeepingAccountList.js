import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Divider, Grid, LinearProgress, MenuItem, Stack } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import { radioFiltetBtnUseStyles } from "../components/RadioFiltetBtn";
import FilterBlock from "../components/FilterBlock";
import { gql, useLazyQuery, useMutation } from "@apollo/client";
import DebouncedInput from "../components/DebouncedInput";
import { createColumnHelper, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable } from "@tanstack/react-table";
import { rankItem } from "@tanstack/match-sorter-utils";
import { RefreshBtn, TableDelBtn, TableEditBtn } from "../components/TableActionBtn";
import BackdropLoading from "../components/BackdropLoading";
import { BOOK_KEEPING_ACCOUNTS_QUERY } from "../apollo/queries";
import { bookKeepingAccountFragment } from "../apollo/fragments";
import { BOOK_KEEPING_ACCOUNT_DELETE } from "../apollo/mutations";
import { useSnackbar } from "notistack";
import { BookAccountItem } from "../components/SortableItem";
import { SortableList } from "../components/SortableList";
import BookKeepingAccountFormModal from "../components/bookKeepingAccount/BookKeepingAccountFormModal";
import { toMoney } from "../utils";
import Select from "../components/Select";

function organizeItems(items, globalFilter) {
  // 将 globalFilter 转换为小写
  const lowerCaseFilter = globalFilter.toLowerCase();

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

  // 递归检查子项目是否包含名称
  function hasFilteredChild(item, filter) {
    if (item.name.toLowerCase().includes(filter)) {
      return true;
    }
    for (const child of item.child) {
      if (hasFilteredChild(child, filter)) {
        return true;
      }
    }
    return false;
  }

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

  // 过滤最终结果，移除名称中不包含 globalFilter 的项目
  function filterItems(items, filter) {
    return items
      .filter(item => item.name.toLowerCase().includes(filter) || hasFilteredChild(item, filter))
      .map(item => {
        return {
          ...item,
          child: filterItems(item.child, filter)
        };
      });
  }

  const filteredResult = filterItems(result, lowerCaseFilter);

  return { data: filteredResult, expenditure: expenditure, income: income, balance: income + expenditure };
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

  const radioFiltetBtnClasses = radioFiltetBtnUseStyles();
  const { enqueueSnackbar } = useSnackbar();
  const [listWidth, setListWidth] = useState(localStorage.getItem('listWidth') || '100%');
  const [openedModal, setOpenedModal] = React.useState({});
  const navigate = useNavigate();
  const location = useLocation();
  const [dataUseQuery, queryStatus] = useLazyQuery(gql`${BOOK_KEEPING_ACCOUNTS_QUERY} ${bookKeepingAccountFragment}`, {fetchPolicy: 'network-only',});
  const [formDataUpdateMutate, updateStatus] = useMutation(BOOK_KEEPING_ACCOUNT_DELETE);
  const [globalFilter, setGlobalFilter] = React.useState('');
  const [sorting, setSorting] = React.useState([]);
  const queryParam = new URLSearchParams(window.location.search);
  const [{ pageIndex, pageSize }, setPagination] = React.useState({
    pageIndex: queryParam.get("pageIndex") ? parseInt(queryParam.get("pageIndex")): 1,
    pageSize: queryParam.get("pageSize") ? parseInt(queryParam.get("pageSize")): 9999,
  });
  const incomeRef = useRef(0);
  const expenditureRef = useRef(0);
  const equityRef = useRef(0);
  const balanceRef = useRef(0);
  const liabilitiesRef = useRef(0);
  const assetsRef = useRef(0);
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
							<TableEditBtn onClick={()=>{onEditBtnClick(info.row.original)}}/>
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
    if (queryStatus.data?.bookKeepingAccounts.edges) {
      let nodes = queryStatus.data?.bookKeepingAccounts.edges.map(e => ({...e.node}));
      let {data} = organizeItems(nodes, globalFilter);
      nodes.forEach((node, index) => {
        if(node.name == '資產') {
          assetsRef.current = node.balance;
        } else if (node.name == '收入') {
          incomeRef.current = node.balance;
        } else if (node.name == '費用') {
          expenditureRef.current = node.balance;
        } else if (node.name == '股東權益') {
          equityRef.current = node.balance;
        } else if (node.name == '負債') {
          liabilitiesRef.current = node.balance;
        }
      })
      balanceRef.current = incomeRef.current - expenditureRef.current;
      setTotalCount(queryStatus.data?.bookKeepingAccounts.totalCount);
      console.log('data', data)
      setData(data);
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
        deleted: false,
				first: pageSize,
				skip: pageSize * (pageIndex - 1),
        // keyword: globalFilter,
      }
    });
  }
  
  const loading = queryStatus.loading || updateStatus.loading;

  const onCreateCompleted = () => {
    queryStatus.refetch();
    setOpenedModal({ open: '' })
  }

  const createBtnClick = (params) => { 
    setOpenedModal({ 
      open: 'createModal',
      mode: 'create',
      data: { parentAccountId: params?.id },
      onCompleted: onCreateCompleted
     })
  }

  const createChildBtnClick = (params) => { 
    setOpenedModal({ 
      open: 'createModal',
      mode: 'create',
      data: { 
        parentAccountId: params?.id,
        accountTypeId: params?.accountType?.id,
      },
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
        accountTypeId: params.accountType?.id,
      },
      onCompleted: onCreateCompleted
     })
  }

  const onReviewBtnClick = (params, event) => {
   let url = `/cms/book_keeping_account_detail/${params.id}?tab=0&pageIndex=1&pageSize=15`;
    navigate(url)
 }

  const onRowClick = (params, event) => {
    let target = event.currentTarget.closest('.tree-item');
    if(!target) return;

    if(target.classList.contains('active')) target.classList.remove("active");
    else target.classList.add("active");
  }

  const onDeleteBtnClick = (id) => {
    formDataUpdateMutate({
      variables: {
        data : { 
          id: id,
        }
      },
      onCompleted: (res) => {
        if (res.bookKeepingAccountDelete.userErrors.length) {
          res.bookKeepingAccountDelete.userErrors.map(e => {
            enqueueSnackbar(e.message, {
              variant: 'error'
            })
          })
        }
        else if (res.bookKeepingAccountDelete.result) {
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

  useLayoutEffect(() => { 
    navigate(`${location.pathname}?pageIndex=1&pageSize=${pageSize}`, { replace: true })
  },[])

  const onPageIndexChange = (e, pageIndex) => {
    setPagination({ pageIndex: pageIndex, pageSize: pageSize }); 
    navigate(`${location.pathname}?pageIndex=${pageIndex}&pageSize=${pageSize}`)
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
    <div style={{ height: '100%', width: '100%', padding: 0 }}>
      {/* <BookKeepingTransactionFormModal
        open={openedModal.open == 'transactionModal'}
        data={openedModal.data}
        mode={openedModal.mode}
        onCloseClick={()=>setOpenedModal({ open: '' })}
        onCompleted={onCreateCompleted}
      /> */}
      <BookKeepingAccountFormModal
        open={openedModal.open == 'createModal'}
        data={openedModal.data}
        mode={openedModal.mode}
        onCloseClick={()=>setOpenedModal({ open: '' })}
        onCompleted={onCreateCompleted}
      />
      <div style={{padding: 5, fontWeight: 'bold'}}>會計項目列表</div>
      <Divider/>
      <div style={{ width: '100%' }}>
        <div style={{
          position: 'sticky',
          top: 60,
          zIndex: 1,
          borderBottom: '1px solid #ddd',
          width: listWidth,
          minWidth: 892,
        }}>
        {loading && <LinearProgress />}
          <FilterBlock>
            <Stack direction="row" spacing={2}>
              <Grid container spacing={2}>
                {/* <Grid item xs={'auto'}>
              <CreateBtn onClick={createBtnClick}>
                新增會計項目
              </CreateBtn>
            </Grid> */}
                <Grid item xs={'auto'} sm={'auto'}>
                  <RefreshBtn onClick={() => query()} />
                </Grid>
                <Grid item xs={12} sm={1} minWidth={200} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <DebouncedInput
                    sx={{
                      '& .MuiInputBase-root': {
                        borderBottom: 'none',
                      },
                    }}
                    value={globalFilter ?? ''}
                    onChange={value => setGlobalFilter(value)}
                    className="p-2 font-lg shadow border border-block"
                    placeholder="Search..."
                  />
                </Grid>
                <Grid item xs={12} sm={1} minWidth={200} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <Select
                    style={{ height: 40 }}
                    label={"列表闊度"}
                    value={listWidth}
                    items={[{ value: "40%", label: "40%" }, { value: "50%", label: "50%" }, { value: "60%", label: "60%" }, { value: "70%", label: "70%" }, { value: "80%", label: "80%" }, { value: "90%", label: "90%" }, { value: "100%", label: "100%" }]}
                    render={(e) => <MenuItem key={e.value} value={e.value}>{e.label}</MenuItem>}
                    onChange={(e) => { setListWidth(e.target.value); localStorage.setItem('listWidth', e.target.value) }}
                  />
                </Grid>
              </Grid>
            </Stack>
          </FilterBlock>
        </div>
        <div style={{ width: listWidth }}>
          <div style={{ height: 'auto', width: '100%', padding: 0, position: 'relative' }}>
            <SortableList
              items={rowData}
              renderItem={(row, index) => (
                <BookAccountItem
                  key={index}
                  id={row.id}
                  data={row}
                  {...row}
                  onClick={onRowClick}
                  onDoubleClick={(data)=>{
                    if (data.isPlaceholder) alert('此項目為標題，無入帳紀錄!');
                    else onReviewBtnClick(data)
                  }}
                  actions={(data) => (
                    <div style={{ display: 'flex' }}>
                      {/* <TableViewBtn onClick={() => { onReviewBtnClick(data) }} /> */}
                      {/* <AddBtn onClick={() => { createChildBtnClick(data) }} /> */}
                      {data.parentAccount && <TableEditBtn onClick={() => { onEditBtnClick(data) }} />}
                      {data.parentAccount && <TableDelBtn
                        onClick={() => {
                          if(data.balance != 0) alert('此項目有餘額，無法刪除!')
                          else onDeleteBtnClick(data.id)
                        }}
                      />}
                      {!data.parentAccount && <div style={{ width: 82 }}></div>}
                    </div>
                  )}
                  menuItems={[
                    {
                      label: '入帳紀錄', onClick: (data) => {
                        if (data.isPlaceholder) alert('此項目為標題，無入帳紀錄!');
                        else onReviewBtnClick(data)
                      }
                    },
                    {
                      label: '新增子項目', onClick: (data) => { createChildBtnClick(data) }
                    },
                    {
                      label: '編輯', onClick: (data) => {
                        if (data.parentAccount) onEditBtnClick(data)
                        else alert('頂層項目，無法編輯!')
                      }
                    },
                    { label: '刪除', onClick: (data) => { 
                      if(data.parentAccount == null) alert('頂層項目，無法刪除!')
                      else if(data.balance != 0) alert('此項目有餘額，無法刪除!')
                      else onDeleteBtnClick(data.id)
                     }, mode: 'warning', title: '確定刪除？' },
                  ]}
                />
              )}
              onPageIndexChange={onPageIndexChange}
            />
            <li className="tree-item cursor-default" style={{ background: 'white', minWidth: 892, position: 'sticky', bottom: 46, borderBottom: "1px solid rgb(221, 221, 221)", backgroundColor: '#eaeaea' }} >
              <div className="tree-row">
                <div className="tree-cell account-item-cell">
                  <div style={{ width: 30 }}>

                  </div>
                </div>
                <div className="tree-cell account-item-cell" style={{ width: '100%', fontWeight: 'bold' }}>

                </div>
                <div className="tree-cell" style={{ minWidth: 200, maxWidth: 200, justifyContent: 'space-between', borderRight: '1px solid' }}>
                  <div>收入(R):</div>
                  <div>{toMoney(incomeRef.current)}</div>
                </div>
                <div className="tree-cell" style={{ minWidth: 200, maxWidth: 200, justifyContent: 'space-between', borderRight: '1px solid' }}>
                  <div>費用(X):</div>
                  <div>{toMoney(expenditureRef.current)}</div>
                </div>
                <div className="tree-cell" style={{ minWidth: 200, maxWidth: 200, justifyContent: 'space-between', borderRight: '1px solid' }}>
                  <div>損益(R-X):</div>
                  <div>{toMoney(balanceRef.current)}</div>
                </div>
                <div className="tree-cell" style={{ minWidth: 200, maxWidth: 200, justifyContent: 'space-between', borderRight: '1px solid' }}>
                </div>
                <div className="tree-cell-action" style={{ minWidth: 82, maxWidth: 82 }}>
                </div>
              </div>
            </li>
            <li className="tree-item cursor-default" style={{ background: 'white', minWidth: 892, position: 'sticky', bottom: 0, borderBottom: "1px solid rgb(221, 221, 221)", backgroundColor: '#eaeaea' }} >
              <div className="tree-row">
                <div className="tree-cell account-item-cell">
                  <div style={{ width: 30 }}>

                  </div>
                </div>
                <div className="tree-cell account-item-cell" style={{ width: '100%', fontWeight: 'bold' }}>

                </div>
                <div className="tree-cell" style={{ minWidth: 200, maxWidth: 200, justifyContent: 'space-between', borderRight: '1px solid' }}>
                  <div>負債(L):</div>
                  <div>{toMoney(liabilitiesRef.current)}</div>
                </div>
                <div className="tree-cell" style={{ minWidth: 200, maxWidth: 200, justifyContent: 'space-between', borderRight: '1px solid' }}>
                  <div>權益(E):</div>
                  <div>{toMoney(equityRef.current)}</div>
                </div>
                <div className="tree-cell" style={{ minWidth: 200, maxWidth: 200, justifyContent: 'space-between', borderRight: '1px solid' }}>
                </div>
                <div className="tree-cell" style={{ minWidth: 200, maxWidth: 200, justifyContent: 'space-between', borderRight: '1px solid' }}>
                  <div>資產(A):</div>
                  <div>{toMoney(assetsRef.current)}</div>
                </div>
                <div className="tree-cell-action" style={{ minWidth: 82, maxWidth: 82 }}>
                </div>
              </div>
            </li>
          </div>
        </div>
      </div>
    </div>
  )
}
