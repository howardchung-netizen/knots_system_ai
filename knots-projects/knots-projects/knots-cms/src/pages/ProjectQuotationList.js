import React, {useContext, useLayoutEffect, useMemo, useState } from "react";
import moment from "moment";
import { Grid, LinearProgress, Stack } from "@mui/material";
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { radioFiltetBtnUseStyles } from "../components/RadioFiltetBtn";
import FilterBlock from "../components/FilterBlock";
import { gql, useLazyQuery, useMutation } from "@apollo/client";
import { quotationsQuery } from "../apollo/queries";
import { quotationListFragment } from "../apollo/fragments";
import DebouncedInput from "../components/DebouncedInput";
import { createColumnHelper, flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable } from "@tanstack/react-table";
import { useDrag, useDrop } from "react-dnd";
import { rankItem } from "@tanstack/match-sorter-utils";
import { CreateBtn, CustomActionBtn, PrintBtn, RefreshBtn, TableViewBtn } from "../components/TableActionBtn";
import BackdropLoading from "../components/BackdropLoading";
import { OptionsContext } from "../contexts/OptionsContextProvider";
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import { TableRow } from "../components/TableRow";
import ReactSortableTable from "../components/ReactSortableTable";
import { ModalContext } from "../contexts/ModalContextProvider";
import { UserContext } from "../contexts/UserContext";
import { useSnackbar } from "notistack";
import { insertItemToGanttTask } from "../utils";
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import QuotationFormModal from "../components/quotation/QuotationFormModal";
import { QUOTATION_DUPLICATION } from "../apollo/mutations";

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

export default () => {

  const[user] = useContext(UserContext);
  const [optionsContext, optionsContextDispatch, {quotationStautsIds}] = useContext(OptionsContext);
  const [openedModal, setOpenedModal] = React.useState({});
  const [myConfirmModalOpen, handleMyConfirmModalOpen, handleMyConfirmModalClose] = useContext(ModalContext);
  const { enqueueSnackbar } = useSnackbar();
  const radioFiltetBtnClasses = radioFiltetBtnUseStyles();
  const navigate = useNavigate();
  const location = useLocation();
  const { projectId } = useParams();
  const queryParam = new URLSearchParams(window.location.search);
  const [selectedMonth, setSelectedMonth] = useState(moment().format('YYYY-MM')); 
  const [formDataDuplicationMutate, duplicationStatus] = useMutation(QUOTATION_DUPLICATION);
  const [dataUseQuery, queryStatus] = useLazyQuery(gql`${quotationsQuery} ${quotationListFragment}`, {fetchPolicy: 'network-only',});
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

  const columns = React.useMemo(() => {
    let columns = [
			columnHelper.accessor('action', {
        id: 'action',
				width: 50,
        header: () => '操作',
        cell: info => {
          return (
            <div style={{display: 'flex'}}>
							<TableViewBtn title={"查看"} onClick={()=>{onReviewBtnClick(info.row.original)}}/>
              <PrintBtn onClick={()=>{onPrintClick(info.row.original)}}/>
              <CustomActionBtn title={"導入到工程進度表"} onClick={()=>{insertToGanttClick(info.row.original)}}><LibraryBooksIcon/></CustomActionBtn>
            </div>
          )
        }
      }),
      columnHelper.accessor('code', {
        id: 'code',
        width: 150,
        header: (header) => '編號',
        cell: info => {
          return info.getValue()
        }
      }),
      columnHelper.accessor('title', {
        id: 'title',
				width: 350,
        header: (header) => '標題',
        cell: info => {
          return info.getValue()
        }
      }),
			columnHelper.accessor('status', {
        id: 'status',
        textAlign: 'center',
				width: 60,
        header: (header) => '	狀態',
        cell: info => {
          return 	<div style={{display: 'flex', justifyContent: 'center',alignItems: 'center', width: '100%'}}>
            {
              info.getValue() ? <CheckCircleOutlineIcon sx={{color: 'green'}}/> :
              <RadioButtonUncheckedIcon sx={{color: 'grey'}}/> 
            }
          </div>
        }
      }),
      columnHelper.accessor('progress', {
        id: 'progress',
				width: 120,
        header: (header) => '進度',
        cell: info => {
          return info.getValue().nameCht
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
    if(queryStatus.data?.quotations.edges) {
      rows = queryStatus.data?.quotations.edges.map((e)=>e.node);
      setTotalCount(queryStatus.data?.quotations.totalCount);
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
				first: pageSize,
				skip: pageSize * (pageIndex - 1)
      }
    });
  }
  
  const loading = queryStatus.loading || duplicationStatus.loading;

  const onGanttChartBtnClick = (params, event) => {
		let url = `/cms/gantt_chart_en/project/${params.id}`
    // window.open(url, '_blank');
    navigate(url);
  }

	const onReviewBtnClick = (params, event) => {
    let url = `/cms/quotation/${params.id}?tab=0`
    window.open(url, '_blank');
    // navigate(url);
  }

  const insertToGanttClick = (quotation) => {
    let form = JSON.parse(quotation.form);

    handleMyConfirmModalOpen(
      '確認導入?',
      '',
      'confirm',
      () => {
        enqueueSnackbar("導入中...", {
          variant: 'info'
        })
        fetch(process.env.REACT_APP_TODO_HTTP_ENDPOINT + "/gantt-chart/insertTasks", {
          method: 'POST',
          headers:
          {
            'Authorization': `Bearer ${user.token}`,
            'Content-type': 'application/json',
          },
          json: true,
          body: JSON.stringify({
            project: quotation.project.realId,
            tasks: [{ "name": quotation.code, "subTasks": insertItemToGanttTask(form) }]
          })
        }).then(async (res) => {
          if (await res.json()) enqueueSnackbar('導入成功', {
            variant: 'success'
          })
          else enqueueSnackbar('導入失敗', {
            variant: 'error'
          })
        }).catch((error) => {
          console.log(error)
          enqueueSnackbar("error", {
            variant: 'error'
          })
        }).finally(() => {
          handleMyConfirmModalClose();
        })
      }
    )
  }

  const onPrintClick = (quotation) => { 
    let url = `/cms/quotation/${quotation.id}/print`
    // let url = 'https://pms.knotsltd.com/cms/quotation/pdf/'+lang+'/minTable=0&breakBeforeTerms=1&companyStamp=1/'+detail.code
    window.open(url, '_blank');
  }

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
      },
      onCompleted: onCreateCompleted
     })
  }

  const duplicateBtnClick = (quotation) => {
    formDataDuplicationMutate({
      variables: {
        data: {
          id: quotation.id
        }
      },
      onCompleted: (data) => {
        if(data.quotationDuplicate.userErrors.length > 0) {
          enqueueSnackbar(data.quotationDuplicate.userErrors[0].message, {variant: 'error'})
        } else {
          enqueueSnackbar('已複製報價單:'+quotation.code, {variant: 'success'})
          queryStatus.refetch();
        }
      },
      onError: (error) => {
        enqueueSnackbar(error.message, {variant: 'error'})
      }
    })
  }

  const onPageIndexChange = (e, pageIndex) => {
    setPagination({ pageIndex: pageIndex, pageSize: pageSize }); 
  }

  useLayoutEffect(() => {
    query();
  }, [pageIndex, pageSize])

  return (
    <div style={{ width: '100%', padding: 0 }}>
      {openedModal.open == 'createModal' && <QuotationFormModal
        open={openedModal.open == 'createModal'}
        data={openedModal.data}
        mode={openedModal.mode}
        onCloseClick={() => setOpenedModal({ open: '' })}
        onCompleted={onCreateCompleted}
      />}
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
          {loading && <LinearProgress />}
        <ReactSortableTable
            table={table}
            sorting={sorting}
            pageIndex={pageIndex}
            count={Math.ceil(totalCount / pageSize)}
            renderRow={(row, index) => <TableRow key={row.id} row={row} onDoubleClick={onReviewBtnClick}
              menuItems={[
                { label: '查看', onClick: () => { onReviewBtnClick(row.original) } },
                { label: '複製', onClick: () => { duplicateBtnClick(row.original) } },
              ]}
            />}
            onPageIndexChange={onPageIndexChange}
          />
        </div>
      </div>
    </div>
  )
}
