import React, { useContext, useLayoutEffect, useMemo, useState } from "react";
import { Divider, Grid, Stack } from "@mui/material";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { radioFiltetBtnUseStyles } from "../components/RadioFiltetBtn";
import FilterBlock from "../components/FilterBlock";
import { gql, useLazyQuery, useMutation, useQuery } from "@apollo/client";
import { GET_ROLES, usersQuery } from "../apollo/queries";
import { userFragment } from "../apollo/fragments";
import DebouncedInput from "../components/DebouncedInput";
import { createColumnHelper, flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable } from "@tanstack/react-table";
import { useDrag, useDrop } from "react-dnd";
import { rankItem } from "@tanstack/match-sorter-utils";
import { CreateBtn, RefreshBtn, TableViewBtn } from "../components/TableActionBtn";
import BackdropLoading from "../components/BackdropLoading";
import { OptionsContext } from "../contexts/OptionsContextProvider";
import ReactSortableTable from "../components/ReactSortableTable";
import { TableRow } from "../components/TableRow";
import { toMoney } from "../utils";
import UserFormModal from "../components/user/UserFormModal";
import { userStatus } from "../constants/InputOptions";
import { UserContext } from "../contexts/UserContext";

// help me to add code about keyword like ProjectOrderList.js

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

export default ({ height }) => {

  const [user, userDispatch] = React.useContext(UserContext);
  const [optionsContext, optionsContextDispatch, { quotationStautsIds }] = useContext(OptionsContext);
  const [openedModal, setOpenedModal] = React.useState({});
  const navigate = useNavigate();
  const location = useLocation();
  const queryParam = new URLSearchParams(window.location.search);
  const [dataUseQuery, queryStatus] = useLazyQuery(gql`${usersQuery} ${userFragment}`, { fetchPolicy: 'network-only', });
  const [globalFilter, setGlobalFilter] = React.useState('')
  const [sorting, setSorting] = React.useState([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const [{ pageIndex, pageSize, keyword }, setPagination] = React.useState({
    pageIndex: searchParams.get("pageIndex") ? parseInt(searchParams.get("pageIndex")) : 1,
    pageSize: searchParams.get("pageSize") ? parseInt(searchParams.get("pageSize")) : 15,
    keyword: searchParams.get("keyword") ? searchParams.get("keyword") : ''
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

  const { data: rolesData } = useQuery(GET_ROLES, {
    fetchPolicy: 'network-only',
    notifyOnNetworkStatusChange: true,
    variables: {}
  });

  const rolesList = useMemo(() => {
    let rolesList = [];
    if (rolesData?.roles?.length) rolesList = rolesData.roles.map(e => e.name)
    return rolesList;
  }, [rolesData])

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
          let lastChequeBook = info.row.original.lastChequeBook;
          return (
            <div style={{ display: 'flex' }}>
              <TableViewBtn title={"查看"} onClick={() => { onReviewBtnClick(info.row.original) }} />
            </div>
          )
        }
      }),
      columnHelper.accessor('username', {
        id: 'username',
        width: 250,
        header: (header) => '帳號',
        cell: info => info.getValue()
      }),
      columnHelper.accessor('status', {
        id: 'status',
        textAlign: 'center',
        width: 80,
        header: (header) => '狀態',
        cell: info => userStatus[info.getValue() - 1].label
      }),
      columnHelper.accessor('name', {
        id: 'name',
        width: 250,
        header: (header) => '名稱',
        cell: info => {
          let nameCht = info.row.original.nameCht;
          let nameEn = info.row.original.nameEn;
          return (
            <div>
              <div>{nameCht}</div>
              <div>{nameEn}</div>
            </div>
          )
        }
      }),
      columnHelper.accessor('tel', {
        id: 'tel',
        width: 150,
        header: (header) => '電話',
        cell: info => {
          let tel1 = info.row.original.tel1;
          let tel2 = info.row.original.tel2;
          if (tel2)
            return (
              <div>
                <div>{`${tel1} ${tel2}`}</div>
              </div>
            )
        }
      }),
      columnHelper.accessor('whatsApp', {
        id: 'whatsApp',
        width: 150,
        header: (header) => 'WhatsApp',
        cell: info => {
          let whatsApp = info.row.original.whatsApp;
          let whatsApp2 = info.row.original.whatsApp2;
          if (whatsApp2)
            return (
              <div>
                <div>{`${whatsApp} ${whatsApp2}`}</div>
              </div>
            )
        }
      }),
      columnHelper.accessor('lastChequeNoForPettyCash', {
        id: 'lastChequeNoForPettyCash',
        width: 150,
        header: (header) => 'Cheque No.',
        cell: info => info.getValue()
      }),
      columnHelper.accessor('lastChequeBook', {
        id: 'lastChequeBook',
        width: 150,
        header: (header) => '備用金額',
        cell: info => {
          let lastChequeBook = info.getValue();
          return toMoney(lastChequeBook?.amount);
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

  const rows = useMemo(() => {
    let rows = [];
    if (queryStatus.data?.users.edges) {
      rows = queryStatus.data?.users.edges.map((e) => e.node);
      setTotalCount(queryStatus.data?.users.totalCount);
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

  const query = () => {
    dataUseQuery({
      variables: {
        first: pageSize,
        skip: pageSize * (pageIndex - 1),
        keyword: keyword
      }
    });
  }

  const loading = queryStatus.loading;

  const onCreateCompleted = () => {
    setOpenedModal({ open: '' })
    queryStatus.refetch();
  }

  const createBtnClick = () => {

    setOpenedModal({
      open: 'createModal',
      mode: 'create',
      rolesList: rolesList,
      onCompleted: onCreateCompleted
    })
  }

  const editBtnClick = (data) => {
    setOpenedModal({
      open: 'createModal',
      mode: 'edit',
      data: data,
      rolesList: rolesList,
      onCompleted: onCreateCompleted
    })
  }

  const onReviewBtnClick = (params, event) => {
    // editBtnClick({...params, roles: params?.roles.map(e=> e.name)})
    window.open(`/cms/staff/${params.id}?tab=0`, '_blank');
  }

  const onIncreasePettyCashClick = (params, event) => {
    setOpenedModal({
      open: 'pettyCashModal',
      mode: 'create',
      data: params,
      onCompleted: onCreateCompleted
    })
  }

  const onReviewPettyCashClick = (params, event) => {
    let lastChequeBook = params.lastChequeBook;
    let { financialYearStart, financialYearEnd } = lastChequeBook.transaction;
    setOpenedModal({
      open: 'pettyCashModal',
      mode: 'edit',
      data: {
        ...params,
        ...lastChequeBook,
        companyId: lastChequeBook.company.id,
        categoryAccountId: lastChequeBook.categoryAccount.id,
        financialYear: `${financialYearStart}-${financialYearEnd}`
      },
      onCompleted: onCreateCompleted
    })
  }

  const onPageIndexChange = (e, pageIndex) => {
    setPagination({ pageIndex: pageIndex, pageSize: pageSize, keyword: keyword});
    navigate(`${location.pathname}?pageIndex=${pageIndex}&pageSize=${pageSize}&keyword=${keyword}`)
  }

  useLayoutEffect(() => {
    query();
  }, [pageIndex, pageSize, keyword])

  return (
    <div style={{ height: height ?? '85vh', width: '100%', padding: 0 }}>
      <UserFormModal
        open={openedModal.open == 'createModal'}
        data={openedModal.data}
        mode={openedModal.mode}
        rolesList={openedModal.rolesList}
        onCloseClick={() => setOpenedModal({ open: '' })}
        onCompleted={onCreateCompleted}
      />
      <div style={{ padding: 5, fontWeight: 'bold' }}>員工列表</div>
      <Divider />
      <FilterBlock>
        <Stack direction="row" spacing={2}>
          <Grid container spacing={2}>
            <Grid item xs={'auto'}>
              <CreateBtn onClick={createBtnClick}>
                新增員工
              </CreateBtn>
            </Grid>
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
            renderRow={(row, index) => <TableRow key={row.id} row={row} onDoubleClick={onReviewBtnClick}
              menuItems={[
                { label: '查看', onClick: () => { onReviewBtnClick(row.original) } },
              ]}
            />}
            onPageIndexChange={onPageIndexChange}
          />
        </div>
      </div>
    </div>
  )
}
