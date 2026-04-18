import React, {useContext, useLayoutEffect, useMemo, useState } from "react";
import { Button, Divider, Grid, Stack } from "@mui/material";
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import FilterBlock from "../components/FilterBlock";
import { gql, useLazyQuery, useMutation } from "@apollo/client";
import { CLAIM_FORM_QUERY} from "../apollo/queries";
import { claimFormFragment } from "../apollo/fragments";
import DebouncedInput from "../components/DebouncedInput";
import { createColumnHelper, flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable } from "@tanstack/react-table";
import { useDrag, useDrop } from "react-dnd";
import { rankItem } from "@tanstack/match-sorter-utils";
import { CreateBtn, CustomActionBtn, RefreshBtn, TableDelBtn, TableViewBtn } from "../components/TableActionBtn";
import BackdropLoading from "../components/BackdropLoading";
import { OptionsContext } from "../contexts/OptionsContextProvider";
import ReactSortableTable from "../components/ReactSortableTable";
import { TableRow } from "../components/TableRow";
import { toMoney } from "../utils";
import moment from "moment";
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import CheckIcon from '@mui/icons-material/Check';
import ClaimFormModal from "../components/claimForm/ClaimFormModal";
import ClaimFormSettledmentModal from "../components/claimForm/ClaimFormSettledmentModal";
import { CLAIM_FORM_DELETE } from "../apollo/mutations";
import { useSnackbar } from "notistack";
import InfoIcon from '@mui/icons-material/Info';

const RepeatClaimList = ({ sameAmount, onClick }) => {
  const [hoveredRowIndex, setHoveredRowIndex] = useState(null);

  return (
    <table style={{width: 350}}>
      <thead>
        <tr>
          <th style={{ textAlign: 'left' }}>申請人</th>
          <th style={{ textAlign: 'left' }}>金額</th>
          <th style={{ textAlign: 'left' }}>購買日期</th>
          <th style={{ textAlign: 'left' }}>已入帳</th>
        </tr>
      </thead>
      <tbody>
        {sameAmount.map((e, i) => (
          <tr
            key={i}
            style={{
              cursor: 'pointer',
              boxShadow: hoveredRowIndex === i ? 'rgba(0, 0, 0, 0.35) 0px 5px 15px' : 'none',
            }}
            onClick={(event) => {
              event.stopPropagation(); 
              onClick(e)
             }}
            onMouseEnter={() => setHoveredRowIndex(i)}
            onMouseLeave={() => setHoveredRowIndex(null)}
          >
            <td>{e.staff.nameCht || e.staff.nameEn}</td>
            <td>{toMoney(e.amount)}</td>
            <td>{moment(e.purchasedDate).format('YYYY-MM-DD')}</td>
            <td style={{textAlign: 'left'}}>{e.settlement && <CheckIcon style={{color: 'green', fontSize: 15}}/>}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
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

export default ({height}) => {

  const [optionsContext, optionsContextDispatch, {quotationStautsIds}] = useContext(OptionsContext);
  const { enqueueSnackbar } = useSnackbar();
  const [openedModal, setOpenedModal] = React.useState({});
  const navigate = useNavigate();
  const location = useLocation();
  const queryParam = new URLSearchParams(window.location.search);
  const {staffId} = useParams();
  const [dataUseQuery, queryStatus] = useLazyQuery(gql`${CLAIM_FORM_QUERY} ${claimFormFragment}`, {fetchPolicy: 'network-only',});
  const [formDataUpdateMutate, updateStatus] = useMutation(CLAIM_FORM_DELETE);
  const [globalFilter, setGlobalFilter] = React.useState('')
  const [sorting, setSorting] = React.useState([]);
	const [searchParams, setSearchParams] = useSearchParams();
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
				width: 100,
        textAlign: 'center',
        header: () => '操作',
        cell: info => {
          let {id, staff, amount} = info.row.original;
          let sameAmount = rowData.filter(e=> e.id !== id && e.staff.id === staff.id && e.amount === amount);
          return (
            <div style={{display: 'flex'}}>
							<TableViewBtn title={"查看"} onClick={()=>{onReviewBtnClick(info.row.original)}}/>
              <TableDelBtn onClick={()=>{onDeleteBtnClick(info.row.original)}}/>
              {sameAmount.length > 0 && 
                <CustomActionBtn 
                componentsProps={{
                  tooltip: {
                    sx: {
                        maxWidth: 750
                    },
                },
                }}
                title={
                <div>
                  <div>相同金額</div>
                  <Divider/>
                  <RepeatClaimList 
                  sameAmount={sameAmount}
                  onClick={(item)=>{onReviewBtnClick(item)}}/>
                </div>
              }>
                  <InfoIcon style={{color: staff.color}}/>
                </CustomActionBtn>}
            </div>
          )
        }
      }),
      columnHelper.accessor('createdAt', {
        id: 'created_at',
        width: 120,
        canSort: true,
        textAlign: 'center',
        header: (header) => '提交日期',
        cell: info => moment(info.getValue()).format('YYYY-MM-DD')
      }),
      columnHelper.accessor('staff', {
        id: 'staff',
        width: 250,
        header: (header) => '申請人',
        cell: info => {
          let staff = info.row.original.staff;
          let nameCht = staff?.nameCht;
          let nameEn = staff?.nameEn;
          let tel2 = staff?.tel2;
          return <div>
            <div>{nameCht||nameEn}</div>
            <div>{tel2}</div>
          </div>
        }
      }),
      columnHelper.accessor('amount', {
        id: 'amount',
        width: 100,
        header: (header) => '金額',
        cell: info => toMoney(info.getValue())
      }),
      columnHelper.accessor('vendor', {
        id: 'vendor',
        width: 250,
        header: (header) => '供應商',
        cell: info => info.getValue()
      }),
      columnHelper.accessor('purchasedDate', {
        id: 'purchasedDate',
        width: 120,
        canSort: true,
        textAlign: 'center',
        header: (header) => '購買日期',
        cell: info => moment(info.getValue()).format('YYYY-MM-DD')
      }),
      // columnHelper.accessor('bankAccount', {
      //   id: 'bankAccount',
      //   width: 150,
      //   textAlign: 'center',
      //   header: (header) => '扣數帳戶',
      //   cell: info => info.getValue()?.name
      // }),
      columnHelper.accessor('categoryAccount', {
        id: 'categoryAccount',
        width: 150,
        textAlign: 'center',
        header: (header) => '報銷類別',
        cell: info => info.getValue()?.name
      }),
      columnHelper.accessor('project', {
        id: 'project',
        width: 120,
        textAlign: 'center',
        header: (header) => '工程專案',
        cell: info => {
          let project = info.getValue();
          if(project) return <Button sx={{width: '100%'}} variant="contained" onClick={(e)=>onReviewProjectBtnClick(project.projectId, e)}>{project.projectId}</Button>
        }
      }),
      columnHelper.accessor('projectOrder', {
        id: 'projectOrder',
        width: 120,
        textAlign: 'center',
        header: (header) => '訂單',
        cell: info => {
          let projectOrder = info.getValue();
          if(projectOrder) return <Button sx={{width: '100%'}} variant="contained" onClick={(e)=>onReviewProjectBtnClick(info.row.original, e)}>{projectOrder.realId}</Button>
        }
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
    if(queryStatus.data?.claimForms.edges) {
      rows = queryStatus.data?.claimForms.edges.map((e)=>e.node);
      setTotalCount(queryStatus.data?.claimForms.totalCount);
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
				first: pageSize,
				skip: pageSize * (pageIndex - 1),
        staffId: staffId,
        deleted: false,
        sort: sorting[0]?.id,
        order: sorting[0]?.desc ? 'DESC' : 'ASC'
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
        staffId: staffId,
      },
      onCompleted: onCreateCompleted
     })
  }

	const onReviewBtnClick = (params, event) => {
    setOpenedModal({ 
      open: 'createModal',
      mode: 'edit',
      data: {
        id: params.id,
        staffId: params.staff.id,
        vendor: params.vendor,
        categoryAccountId: params.categoryAccount?.id??null,
        settlement: params.settlement,
        purchasedDate: params.purchasedDate,
        amount: parseFloat(params.amount),
        files: params.files,
        projectId: params.project?.id
      },
      onCompleted: onCreateCompleted
     })
  }

  const onSettledmentClick = (params, event) => {
    setOpenedModal({ 
      open: 'settledmentModal',
      mode: 'edit',
      staff: params.staff,
      data: {
        id: params.id,
        staffId: params.staff.id,
        vendor: params.vendor,
        categoryAccountId: params.categoryAccount?.id??null,
        settlement: params.settlement,
        purchasedDate: params.purchasedDate,
        amount: parseFloat(params.amount),
      },
      onCompleted: onCreateCompleted
     })
  }

  const onDeleteBtnClick = (params) => {
    formDataUpdateMutate({
      variables: {
        data : { 
          id: params.id,
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

  const onReviewProjectBtnClick = (projectId, event) => {
    let url = `/cms/project/${projectId}?tab=0`
    window.open(url, '_blank');
  }

  const onPageIndexChange = (e, pageIndex) => {
    setPagination({ pageIndex: pageIndex, pageSize: pageSize }); 
    navigate(`${location.pathname}?pageIndex=${pageIndex}&pageSize=${pageSize}`)
  }

  useLayoutEffect(() => {
    query();
  }, [pageIndex, pageSize, sorting]);

  return (
    <div style={{ height: height, width: '100%', padding: 0 }}>
      <ClaimFormModal
        open={openedModal.open == 'createModal'}
        data={openedModal.data}
        mode={openedModal.mode}
        onCloseClick={() => setOpenedModal({ open: '' })}
        onCompleted={onCreateCompleted}
      />
      <ClaimFormSettledmentModal
        open={openedModal.open == 'settledmentModal'}
        data={openedModal.data}
        mode={openedModal.mode}
        staff={openedModal.staff}
        onCloseClick={() => setOpenedModal({ open: '' })}
        onCompleted={onCreateCompleted}
      />
      {!staffId && <div style={{padding: 5, fontWeight: 'bold'}}>報銷申請列表</div>}
      <Divider/>
			<FilterBlock>
        <Stack direction="row" spacing={2}>
          <Grid container spacing={2}>
            <Grid item xs={'auto'}>
              <CreateBtn onClick={createBtnClick}>
                新增報銷申請
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
          {loading && <BackdropLoading />}
          <ReactSortableTable
            table={table}
            sorting={sorting}
            pageIndex={pageIndex}
            count={Math.ceil(totalCount / pageSize)}
            renderRow={(row, index) => <TableRow key={row.id} row={row} onDoubleClick={onReviewBtnClick}
            menuItems={[
                { label: '查看', onClick: () => { onReviewBtnClick(row.original) } },
                { label: '入帳', onClick: () => { onSettledmentClick(row.original) } },
                { label: '刪除', onClick: () => { 
                  if(row.original.lastChequeBook) onDeleteBtnClick(row.original)
                  else alert('沒有備用金資料')
                 }
                }
              ]}
            />}
            onPageIndexChange={onPageIndexChange}
          />
        </div>
      </div>
    </div>
  )
}
