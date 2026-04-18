import React, {useContext, useLayoutEffect, useMemo, useState } from "react";
import moment from "moment";
import { Button, Divider, Grid, LinearProgress, Pagination, Stack, Tooltip } from "@mui/material";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { radioFiltetBtnUseStyles } from "../components/RadioFiltetBtn";
import FilterBlock from "../components/FilterBlock";
import { gql, useLazyQuery, useMutation } from "@apollo/client";
import { quotationsQuery } from "../apollo/queries";
import { quotationListFragment } from "../apollo/fragments";
import DebouncedInput from "../components/DebouncedInput";
import { createColumnHelper, flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable } from "@tanstack/react-table";
import { useDrag, useDrop } from "react-dnd";
import { rankItem } from "@tanstack/match-sorter-utils";
import { CreateBtn, RefreshBtn, TableViewBtn } from "../components/TableActionBtn";
import parse from 'html-react-parser';
import ChatBubbleIcon from '@mui/icons-material/ChatBubble';
import SortIcon from "../assets/SortIcon";
import { OptionsContext } from "../contexts/OptionsContextProvider";
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import ReactSortableTable from "../components/ReactSortableTable";
import { TableRow } from "../components/TableRow";
import QuotationFormModal from "../components/quotation/QuotationFormModal";
import { QUOTATION_CREATE, QUOTATION_DUPLICATION, QUOTATION_TEMPLATE_UPDATE_ITEM } from "../apollo/mutations";
import ProjectFormModal from "../components/project/ProjectFormModal";
import { useSnackbar } from "notistack";

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
  const [formDataCreateMutate, createStatus] = useMutation(QUOTATION_CREATE);
  const [formDataDuplicationMutate, duplicationStatus] = useMutation(QUOTATION_DUPLICATION);
  const [dataUseQuery, queryStatus] = useLazyQuery(gql`${quotationsQuery} ${quotationListFragment}`, {fetchPolicy: 'network-only',});
  const [formDataUpdateMutate, updateItemStatus] = useMutation(QUOTATION_TEMPLATE_UPDATE_ITEM);
  const [globalFilter, setGlobalFilter] = React.useState('')
  const [sorting, setSorting] = React.useState([]);
	const [searchParams, setSearchParams] = useSearchParams();
  const [{ pageIndex, pageSize, keyword }, setPagination] = React.useState({
    pageIndex: searchParams.get("pageIndex") ? parseInt(searchParams.get("pageIndex")): 1,
    pageSize: searchParams.get("pageSize") ? parseInt(searchParams.get("pageSize")): 15,
    keyword: searchParams.get("keyword") ?? '',
  });
  const pagination = React.useMemo(
    () => ({
      pageIndex,
      pageSize,
      keyword: keyword,
    }),
    [pageIndex, pageSize, keyword]
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
          return (
            <div>
							<TableViewBtn title={"查看"} onClick={()=>{onReviewBtnClick(info.row.original)}}/>
            </div>
          )
        }
      }),
      columnHelper.accessor('project', {
        id: 'project',
        width: 100,
        textAlign: 'center',
        header: (header) => '工程',
        cell: info => {
          let project = info.getValue()
          if (project) return <Button
              variant="contained"
              onClick={() => { onReviewProjectBtnClick(project.projectId) }}>
              {info.row.original.project.projectId}
            </Button>
          return <Button
            sx={{width: '100%'}}
            color="warning"
            variant="contained"
            onClick={() => { createProjectClick(info.row.original) }}>
            建立
          </Button>
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
				width: 60,
        textAlign: 'center',
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
        textAlign: 'center',
        header: (header) => '進度',
        cell: info => {
          return info.getValue().nameCht
        }
      }),
      columnHelper.accessor('cmsRemark', {
        id: 'cmsRemark',
				width: 80,
        textAlign: 'center',
        header: (header) => '內部備註',
        cell: info => {
					const htmlString = info.getValue();
					if(htmlString) return <Tooltip title={<React.Fragment>{parse(htmlString)}</React.Fragment>} placement="right" arrow>
						<div style={{display: 'flex', justifyContent: 'center',alignItems: 'center', width: '100%'}}>
						<ChatBubbleIcon fontSize="small" />
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
				progressArray: quotationStautsIds,
				first: pageSize,
				skip: pageSize * (pageIndex - 1),
        keyword: keyword,
      }
    });
  }
  
  const loading = queryStatus.loading || duplicationStatus.loading;

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

  const createProjectClick = (quotation) => {
    setOpenedModal({ 
      open: 'createProject',
      data: {
        quotationId: quotation.id,
        clientId: quotation.client?.id,
        contactId: quotation.mainContact?.id,
      },
      onCompleted: (project)=> navigate(`/cms/project/${project.projectId}?tab=0`)
     })
  }

	const onReviewBtnClick = (params, event) => {
    let url = `/cms/quotation/${params.id}?tab=0`
    window.open(url, '_blank');
    // navigate(url);
  }

  const onReviewProjectBtnClick = (projectId, event) => {
    let url = `/cms/project/${projectId}?tab=0`
    navigate(url);
  }

  const onDuplicateBtnClick = (params, event) => {
    formDataDuplicationMutate({
      variables: {
        data: {
          id: params.id
        }
      },
      onCompleted: (data) => {
        if(data.quotationDuplicate.userErrors.length > 0) {
          enqueueSnackbar(data.quotationDuplicate.userErrors[0].message, {variant: 'error'})
        } else {
          enqueueSnackbar('已複製報價單:'+params.code, {variant: 'success'})
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
    navigate(`${location.pathname}?pageIndex=${pageIndex}&pageSize=${pageSize}&keyword=${keyword}`)
  }

  useLayoutEffect(() => {
    query();
  }, [pageIndex, pageSize, keyword])

  return (
    <div style={{ height: height??'85vh', width: '100%', padding: 0 }}>
      <QuotationFormModal
        open={openedModal.open == 'createModal'}
        data={openedModal.data}
        mode={openedModal.mode}
        onCloseClick={() => setOpenedModal({ open: '' })}
        onCompleted={onCreateCompleted}
      />
      <ProjectFormModal
        open={openedModal.open == 'createProject'}
        mode={'create'}
        data={openedModal.data}
        onCompleted={openedModal.onCompleted}
        onCloseClick={()=>setOpenedModal({ open: '' })}
      />
      <div style={{padding: 5, fontWeight: 'bold'}}>報價單列表</div>
      <Divider/>
			<FilterBlock>
        <Stack direction="row" spacing={2}>
          <Grid container spacing={2}>
            <Grid item xs={'auto'}>
              <CreateBtn onClick={createBtnClick}>
                新增報價單
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
          {loading && <LinearProgress />}
          <ReactSortableTable
            table={table}
            sorting={sorting}
            pageIndex={pageIndex}
            count={Math.ceil(totalCount / pageSize)}
            renderRow={(row, index) => <TableRow key={row.id} row={row} onDoubleClick={onReviewBtnClick}
              menuItems={[
                { label: '查看', onClick: () => { onReviewBtnClick(row.original) } },
                { label: '複製', onClick: () => { onDuplicateBtnClick(row.original) } },
              ]}
            />}
            onPageIndexChange={onPageIndexChange}
          />
        </div>
      </div>
    </div>
  )
}
