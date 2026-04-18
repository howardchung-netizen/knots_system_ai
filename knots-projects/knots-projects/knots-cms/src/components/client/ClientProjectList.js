import React, { useLayoutEffect, useMemo, useState } from "react";
import { Grid, IconButton, Stack, Tooltip } from "@mui/material";
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { radioFiltetBtnUseStyles } from "../../components/RadioFiltetBtn";
import FilterBlock from "../../components/FilterBlock";
import { gql, useLazyQuery } from "@apollo/client";
import { projectsQuery } from "../../apollo/queries";
import { clientProjectListFragment, projectListFragment } from "../../apollo/fragments";
// import DebouncedInput from "../../components/DebouncedInput";
import { createColumnHelper, flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable } from "@tanstack/react-table";
import { rankItem } from "@tanstack/match-sorter-utils";
import { RefreshBtn, TableViewBtn } from "../../components/TableActionBtn";
import RoomIcon from '@mui/icons-material/Room';
import ChatBubbleIcon from '@mui/icons-material/ChatBubble';
import ArrowRightAltIcon from '@mui/icons-material/ArrowRightAlt';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import ReactTable from "../ReactTable";
import parse from 'html-react-parser';
import { TableRow } from "../TableRow";

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

export default ({height, projectId}) => {

  const radioFiltetBtnClasses = radioFiltetBtnUseStyles();
  const navigate = useNavigate();
	const location = useLocation();
	const { clientId } = useParams();
  const queryParam = new URLSearchParams(window.location.search);
  const [dataUseQuery, queryStatus] = useLazyQuery(gql`${projectsQuery} ${clientProjectListFragment}`, {fetchPolicy: 'network-only',});
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
				width: 120,
        header: () => '操作',
        cell: info => {
          return (
            <div>
							<TableViewBtn onClick={()=>{onReviewBtnClick(info.row.original)}}/>
							<Tooltip title={'工程進度表'} >
								<IconButton onClick={()=> onGanttChartBtnClick(info.row.original)}>
									<AccountTreeIcon />
								</IconButton>
							</Tooltip>
            </div>
          )
        }
      }),
      columnHelper.accessor('projectId', {
        id: 'projectId',
        width: 120,
        header: (header) => '編號',
        cell: info => {
          return info.getValue()
        }
      }),
      columnHelper.accessor('code', {
        id: 'code',
				width: 350,
        header: (header) => '專案名稱',
        cell: info => {
					return <div style={{ display: 'flex', alignItems: 'center', width: 500}}>
						<div className='spotlight-color' style={{ backgroundColor: info.row.original.spotlight }}></div>
						<div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{info.getValue()}</div>
					</div>
        }
      }),
			columnHelper.accessor('dateRange', {
        id: 'dateRange',
				width: 200,
        header: (header) => '	時間',
        cell: info => {
					if (info.row.original.end && info.row.original.start) return <div style={{display: 'flex', alignItems: 'center', fontSize: 10}}>{info.row.original.start}  <ArrowRightAltIcon sx={{fontSize: 13}} />  {info.row.original.end} </div>;
					else if(info.row.original.start) return info.row.original.start;
					else if(info.row.original.end) return info.row.original.end;
        }
      }),
			columnHelper.accessor('status', {
        id: 'status',
				width: 120,
        header: (header) => '	狀態',
        cell: info => {
          return info.getValue().nameCht
        }
      }),
			columnHelper.accessor('projectType', {
        id: 'projectType',
				width: 180,
        header: (header) => '類型',
        cell: info => {
          return info.getValue()?.nameCht
        }
      }),
			columnHelper.accessor('address', {
        id: 'address',
				width: 80,
        header: (header) => '地址',
        cell: info => {
					if(info.getValue())
          return <Tooltip title={info.getValue()} placement="right" arrow>
						<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
							<RoomIcon fontSize="small" />
						</div>
					</Tooltip>
        }
      }),
      columnHelper.accessor('remark', {
        id: 'remark',
        header: (header) => '備註',
        cell: info => {
					const htmlString = info.getValue();
					if(htmlString) return <Tooltip title={<React.Fragment>{parse(htmlString)}</React.Fragment>} placement="right" arrow>
							<ChatBubbleIcon fontSize="small" />
					</Tooltip>
        }
      }),
      // columnHelper.accessor('empty', {
      //   id: 'empty',
      //   header: (header) => '',
      //   cell: info => {
      //   }
      // })
    ]
    return columns
  })

  const rows = useMemo(()=>{
    let rows = [];
    if(queryStatus.data?.projects.edges) {
      rows = queryStatus.data?.projects.edges.map((e)=>e.node);
      setTotalCount(queryStatus.data?.projects.totalCount);
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
				clientId: clientId,
				first: pageSize,
				skip: pageSize * (pageIndex - 1)
      }
    });
  }
  
  const loading = queryStatus.loading;

	const onReviewBtnClick = (params, event) => {
    let url = `/cms/project/${params.projectId}?tab=0`
    // window.open(url, '_blank');
    navigate(url);
  }

  const onGanttChartBtnClick = (params, event) => {
		let url = `/cms/gantt_chart/project/${params.id}?projectName=${params.code}&language=chi`
    // window.open(url, '_blank');
    navigate(url);
  }

	const onPageIndexChange = (e, pageIndex) => {
    setPagination({ pageIndex: pageIndex, pageSize: pageSize }); 
    // navigate(`${location.pathname}?pageIndex=${pageIndex}&pageSize=${pageSize}`)
  }

  useLayoutEffect(() => {
    query();
  }, [pageIndex, pageSize])

  return (
    <div style={{ width: '100%', padding: 0 }}>
			<FilterBlock>
        <Stack direction="row" spacing={2}>
          <Grid container spacing={2}>
            <Grid item xs={'auto'} sm={'auto'} sx={{minHeight: 58}}>
             <RefreshBtn onClick={()=>query()}/>
            </Grid>
            {/* <Grid item xs={12} sm={1} minWidth={200} sx={{display:'flex', justifyContent: 'center', alignItems: 'center'}}>
              <DebouncedInput
                sx={{'& .MuiInputBase-root': {
                  borderBottom: 'none',
                },}}
                value={globalFilter ?? ''}
                onChange={value => setGlobalFilter(value)}
                className="p-2 font-lg shadow border border-block"
                placeholder="Search..."
              />
            </Grid> */}
          </Grid>
        </Stack>
			</FilterBlock>
      <div style={{ width: '100%' }}>
        <div style={{ height: 'auto', width: '100%', padding: 0, position: 'relative' }}>
					<ReactTable
            table={table}
            sorting={sorting}
            pageIndex={pageIndex}
            count={Math.ceil(totalCount / pageSize)}
            renderRow={(row, index) => <TableRow key={row.id} row={row}/>}
            onPageIndexChange={onPageIndexChange}
						loading={loading}
          />
        </div>
      </div>
    </div>
  )
}
