

import React, { useMemo, useState } from 'react';
import { GET_ROLES } from '../../apollo/queries';
import { ROLE_UPDATE, ROLE_CREATE, ROLE_DELETE } from '../../apollo/mutations';
import { useMutation, useQuery } from '@apollo/client';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../../contexts/UserContext';
import { useSnackbar } from 'notistack';
import { createColumnHelper, flexRender, getCoreRowModel, getFilteredRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { rankItem } from '@tanstack/match-sorter-utils';
import { Button, Chip, Divider, IconButton, Tooltip } from "@mui/material";
import moment from "moment";
import { HTML5Backend } from 'react-dnd-html5-backend';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { Stack } from "@mui/system";
import CachedIcon from '@mui/icons-material/Cached';
import PageLoadingProgress from "../../components/PageLoadingProgress";
import DebouncedInput from "../../components/DebouncedInput";
import BackdropLoading from '../../components/BackdropLoading';
import TableLoading from '../../components/TableLoading';
import RolesDetails from './RolesDetails';

const SortIcon = ({ sortBy }) => {
  return <svg className={"sortIcon " + sortBy ?? ''} focusable="false" aria-hidden="true" viewBox="0 0 24 24" data-testid="ArrowUpwardIcon">
    <path d="M4 12l1.41 1.41L11 7.83V20h2V7.83l5.58 5.59L20 12l-8-8-8 8z"></path>
  </svg>
}

const DraggableRow = ({ row, reorderRow }) => {
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
      style={{ opacity: isDragging ? 0.5 : 1 }}
    >
      {/* <td ref={dropRef}>
          <button ref={dragRef} style={{backgroundColor: null, borderWidth: 0, cursor: 'all-scroll'}}>
            <ViewHeadlineIcon/>
          </button>
        </td> */}
      {row.getVisibleCells().map(cell => (
        <td key={cell.id}>
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </td>
      ))}
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

export default function PermissionTable(props) {


  const navigate = useNavigate();
  const queryParam = new URLSearchParams(window.location.search);
  const [user, userDispatch] = React.useContext(UserContext);
  const { enqueueSnackbar } = useSnackbar();

  const [globalFilter, setGlobalFilter] = React.useState('')
  const [radioFilter, setRadioFilter] = React.useState(queryParam.get('filter') ?? 'All');
  const [sorting, setSorting] = React.useState([]);

  const [filterName, setFilterName] = React.useState('');
  const [sort, setSort] = useState(0);

  const [inDetail, setInDetail] = useState(null);
  const [editModalOpen, setEditModalOpen] = React.useState(false);
  const handleEditModalOpen = () => setEditModalOpen(true);
  const handleEditModalClose = () => setEditModalOpen(false);

  const { data, error, loading, refetch } = useQuery(GET_ROLES, {
    fetchPolicy: 'network-only',
    notifyOnNetworkStatusChange: true,
    variables: {}
  });

  const [rowData, setData] = React.useState([]);
  const rows = useMemo(() => {
    let rows = data?.roles || [];
    setData(rows)
    return rows;
  }, [data])

  const [create, { loading: createLoading }] = useMutation(ROLE_CREATE, {
    onCompleted: (data) => {
      const userErrors = data?.roleCreate?.userErrors;
      if (userErrors.length) {
        userErrors.map(e => {
          enqueueSnackbar(e.message, {
            variant: 'error'
          })
        })
      }
      else {
        handleEditModalClose();
        enqueueSnackbar("新增成功", {
          variant: 'success'
        })
        refetch();
        setInDetail(false);
      }
    }
  });

  const [update, { loading: updateLoading }] = useMutation(ROLE_UPDATE, {
    onCompleted: (data) => {
      const userErrors = data?.roleUpdate?.userErrors;
      if (userErrors.length) {
        userErrors.map(e => {
          enqueueSnackbar(e.message, {
            variant: 'error'
          })
        })
      }
      else {
        handleEditModalClose();
        enqueueSnackbar("更改成功", {
          variant: 'success'
        })
        refetch();
        setInDetail(false);
      }
    }
  });

  const [del, { loading: deleteLoading }] = useMutation(ROLE_DELETE, {
    onCompleted: (data) => {
      const userErrors = data?.roleDelete?.userErrors;
      if (userErrors.length) {
        userErrors.map(e => {
          enqueueSnackbar(e.message, {
            variant: 'error'
          })
        })
      }
      else {
        handleEditModalClose();
        refetch();
        enqueueSnackbar("刪除成功", {
          variant: 'success'
        })
      }
    }
  });

  const columns = React.useMemo(() => {
    return [
      columnHelper.accessor('name', {
        id: 'name',
        header: (header) => '角色名稱',
        cell: info => {
          return info.getValue()
        }
      }),
      columnHelper.accessor('explicitPermissions', {
        id: 'explicitPermissions',
        header: (header) => '明確權限',
        cell: info => {
          return info.getValue()?.map((x, i) => <Chip key={i} label={x.name} style={{ marginRight: 2 }} />)
        }
      }),
      columnHelper.accessor('permissions', {
        id: 'permissions',
        header: (header) => '權限',
        cell: info => {
           return info.getValue()?.map((x, i) => <Chip key={i} label={x.name} style={{ marginRight: 2 }} />)
        }
      }),
      columnHelper.accessor('roles', {
        id: 'roles',
        header: (header) => '上級員工角色',
        cell: info => {
           return info.getValue()?.map((x, i) => <Chip key={i} label={x.name} style={{ marginRight: 2 }} />)
        }
      }),
      columnHelper.accessor('action', {
        width: 150,
        id: 'action',
        header: () => '權限',
        // accessorFn: (row) => row.increaseLimits,
        cell: info => {
          return (
            <div>
              <Tooltip title={'編輯'}>
                <IconButton onClick={() => {
                   setInDetail(info.row.original);
                   handleEditModalOpen();
                }}>
                  <EditIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title={'刪除'} >
                <IconButton
                  onClick={(e) => {
                    if (!deleteLoading && window.confirm(`確定刪除?`)) {
                      del({
                        variables: {
                          data: {
                            name: info.row.original.name
                          }
                        },
                      });
                    }
                  }}
                >
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
            </div>
          )
        }
      }),
    ]
  })

  const table = useReactTable({
    data: rowData,
    columns,
    state: {
      sorting,
      globalFilter
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
  })

  const reorderRow = (draggedRowIndex, targetRowIndex) => {

    let selected = JSON.parse(JSON.stringify(rowData[targetRowIndex]));
    let target = JSON.parse(JSON.stringify(rowData[draggedRowIndex]));
    let selectedOrder = target.order;
    let targetOrder = selected.order;
    // update({
    //   variables: {
    //     data: {
    //       id:selected.id,
    //     order: targetOrder
    //     },
    //     onCompleted: ()=>{}
    //   }
    // });
    // update({
    //   variables: {
    //     data: {
    //       id:target.id,
    //       order: targetOrder
    //     }
    //   },
    //   onCompleted: ()=>{}
    // });
    rowData.splice(targetRowIndex, 0, rowData.splice(draggedRowIndex, 1)[0])
    setData([...rowData]);
  }

  return (
    <div style={{ padding: 0 }}>
      <div style={{ padding: 5 }}>角色設定</div>
      <Divider />
      <RolesDetails
        open={editModalOpen}
        data={inDetail}
        onConfirmClick={inDetail ? update : create}
        rolesList={rowData?.filter(r => !inDetail || r?.name !== inDetail?.name)}
        onCloseClick={() => {
          setInDetail(null)
          handleEditModalClose()
        }}
      />
      <DndProvider backend={HTML5Backend}>
        {
          loading && <PageLoadingProgress />
        }
        {
          (createLoading ||
            updateLoading ||
            deleteLoading) && <BackdropLoading />
        }
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            endIcon={<CachedIcon />}
            onClick={() => { refetch() }}
          >
            重新整理
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              handleEditModalOpen()
            }}
          >
            新增
          </Button>
          <DebouncedInput
            value={globalFilter ?? ''}
            onChange={value => setGlobalFilter(value)}
            className="p-2 font-lg shadow border border-block"
            placeholder="Search..."
          />
        </Stack>
        
        <div style={{ height: 'auto', width: '100%', padding: 0, position: 'relative'}}>
          {
            loading && <TableLoading />
          }
          <table className="table">
            <thead>
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={'tr_key'}>
                  {/* <th style={{width: 20}}/> */}
                  {headerGroup.headers.map((header, index) => {
                    return <th key={header.id} style={{ width: header.column.columnDef.width ?? 'auto' }}>
                      <div className="thInner">
                        <div className="thInnnerContent">
                          <div className="headerText" onClick={header.column.getToggleSortingHandler()}>
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                          </div>
                          <button
                            className="sortBtn"
                            tabIndex="-1"
                            type="button"
                            aria-label="Sort"
                            title="Sort"
                            onClick={header.column.getToggleSortingHandler()}>
                            {{
                              asc: <SortIcon sortBy="asc" />,
                              desc: <SortIcon sortBy="dsce" />,
                            }[header.column.getIsSorted()] ?? null}
                            {
                              sorting.length == 0 &&
                              <SortIcon />
                            }
                          </button>
                        </div>
                        {
                          index < headerGroup.headers.length - 1 && (
                            <div className="rightBorderWrap">
                              <svg className="" focusable="false" aria-hidden="true" viewBox="0 0 24 24" data-testid="SeparatorIcon"><path d="M11 19V5h2v14z"></path></svg>
                            </div>
                          )
                        }
                      </div>
                    </th>
                  })}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map(row => (
                <DraggableRow key={row.id} row={row} reorderRow={reorderRow} />
              ))}
            </tbody>
          </table>
        </div>
      </DndProvider>
    </div>
  )
}
