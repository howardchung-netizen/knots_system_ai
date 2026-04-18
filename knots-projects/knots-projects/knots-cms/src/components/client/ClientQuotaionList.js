import React, { useLayoutEffect, useMemo, useState } from "react";
import { Grid, Stack, Tooltip } from "@mui/material";
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { radioFiltetBtnUseStyles } from "../../components/RadioFiltetBtn";
import FilterBlock from "../../components/FilterBlock";
import { gql, useLazyQuery } from "@apollo/client";
import { quotationsQuery } from "../../apollo/queries";
import { quotationListFragment } from "../../apollo/fragments";
// import DebouncedInput from "../../components/DebouncedInput";
import { createColumnHelper, flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable } from "@tanstack/react-table";
import { rankItem } from "@tanstack/match-sorter-utils";
import { RefreshBtn, TableViewBtn } from "../../components/TableActionBtn";
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import ReactTable from "../ReactTable";
import parse from 'html-react-parser';
import ChatBubbleIcon from '@mui/icons-material/ChatBubble';
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
          return info.getValue()?.projectId
        }
      }),
      columnHelper.accessor('code', {
        id: 'code',
        width: 150,
        textAlign: 'center',
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
				width: 50,
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
      columnHelper.accessor('remark', {
        id: 'remark',
				width: 50,
        textAlign: 'center',
        header: (header) => '備註',
        cell: info => {
					const htmlString = info.getValue();
					if(htmlString) return <Tooltip title={<React.Fragment>{parse(htmlString)}</React.Fragment>} placement="right" arrow>
						<div style={{display: 'flex', justifyContent: 'center',alignItems: 'center', width: '100%'}}>
						<ChatBubbleIcon fontSize="small" />
						</div>
					</Tooltip>
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
				clientId: clientId,
				first: pageSize,
				skip: pageSize * (pageIndex - 1)
      }
    });
  }
  
  const loading = queryStatus.loading;

	const onReviewBtnClick = (params, event) => {
    let url = `/cms/quotation/${params.id}?tab=0`
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
            renderRow={(row, index) => <TableRow key={row.id} row={row} onDoubleClick={()=>{onReviewBtnClick(row.original)}}/>}
            onPageIndexChange={onPageIndexChange}
						loading={loading}
          />
        </div>
      </div>
    </div>
  )
}
