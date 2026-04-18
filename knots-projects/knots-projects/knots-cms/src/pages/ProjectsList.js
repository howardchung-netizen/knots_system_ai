import React, {useContext, useLayoutEffect, useMemo, useState } from "react";
import moment from "moment";
import { Avatar, Button, Chip, Divider, Grid, IconButton, LinearProgress, Pagination, Stack, Tooltip } from "@mui/material";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { radioFiltetBtnUseStyles } from "../components/RadioFiltetBtn";
import FilterBlock from "../components/FilterBlock";
import { gql, useLazyQuery, useQuery } from "@apollo/client";
import { projectsQuery, projectStatussQuery } from "../apollo/queries";
import { projectListFragment } from "../apollo/fragments";
import DebouncedInput from "../components/DebouncedInput";
import { createColumnHelper, flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable } from "@tanstack/react-table";
import { useDrag, useDrop } from "react-dnd";
import { rankItem } from "@tanstack/match-sorter-utils";
import { CreateBtn, RefreshBtn, TableViewBtn } from "../components/TableActionBtn";
import parse from 'html-react-parser';
import { InfoCard, InfoRow } from "../components/InfoCard";
import RoomIcon from '@mui/icons-material/Room';
import ChatBubbleIcon from '@mui/icons-material/ChatBubble';
import ArrowRightAltIcon from '@mui/icons-material/ArrowRightAlt';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import PhoneAndroidIcon from '@mui/icons-material/PhoneAndroid';
import GroupIcon from '@mui/icons-material/Group';
import AccessibilityNewIcon from '@mui/icons-material/AccessibilityNew';
import StoreIcon from '@mui/icons-material/Store';
import SortIcon from "../assets/SortIcon";
import { OptionsContext } from "../contexts/OptionsContextProvider";
import CreateProjectModal from "../components/CreateProjectModal";
import ReactTable from "../components/ReactTable";
import { TableRow } from "../components/TableRow";
import ProjectFormFormModal from "../components/project/ProjectFormModal";
import ReactSortableTable from "../components/ReactSortableTable";
import { MultipleSelectCheckmarks } from "../components/MultiSelect";

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

  const [optionsContext, optionsContextDispatch, {projectStautsIds}] = useContext(OptionsContext);
  const radioFiltetBtnClasses = radioFiltetBtnUseStyles();
  const [openedModal, setOpenedModal] = React.useState({});
  const navigate = useNavigate();
  const location = useLocation();
  const queryParam = new URLSearchParams(window.location.search);
  const [selectedMonth, setSelectedMonth] = useState(moment().format('YYYY-MM'));
  const localStorageProjectStatusValue = window.localStorage.getItem('projectListStatusValue');
  const [projectStatusValue, setProjectStatusValue] = useState(localStorageProjectStatusValue ? localStorageProjectStatusValue.split(',') : []);
  const [dataUseQuery, queryStatus] = useLazyQuery(gql`${projectsQuery} ${projectListFragment}`, {fetchPolicy: 'network-only',});
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
      keyword,
    }),
    [pageIndex, pageSize, keyword]
  );
  const [rowData, setData] = React.useState([]);
  const [totalCount, setTotalCount] = useState(0);

  const projectStatuss =  useQuery(projectStatussQuery)
  const projectStatussOptions = useMemo(() => {
    let projectStatussOptions = [];
    if(projectStatuss.data?.projectStatuss.edges?.length > 0){
      projectStatussOptions = projectStatuss.data.projectStatuss.edges.map((edge)=>{
        return {
          label: edge.node.nameCht,
          value: edge.node.id,
          key: edge.node.id
        }
      })
      if (!localStorageProjectStatusValue) setProjectStatusValue(projectStatussOptions.map(e => e.value));
     }
     return projectStatussOptions
  }, [projectStatuss.data])

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
          return (
            <div style={{display: 'flex'}}>
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
        textAlign: 'center',
        canSort: true,
        header: (header) => '編號',
        cell: info => {
          return info.getValue()
        }
      }),
      columnHelper.accessor('code', {
        id: 'code',
				width: 350,
        canSort: true,
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
        style: {
        minWidth: 120,
        },
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
        style: {
          minWidth: 120,
         },
        textAlign: 'center',
        header: (header) => '	狀態',
        cell: info => {
          return info.getValue().nameCht
        }
      }),
			columnHelper.accessor('projectType', {
        id: 'projectType',
				width: 180,
        style: { 
          minWidth: 180,
        },
        minWidth: 180,
        textAlign: 'center',
        header: (header) => '類型',
        cell: info => {
          return info.getValue()?.nameCht
        }
      }),
			columnHelper.accessor('address', {
        id: 'address',
				width: 50,
        textAlign: 'center',
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
			columnHelper.accessor('client', {
        id: 'client',
				width: 50,
        textAlign: 'center',
        header: (header) => '客戶',
        cell: info => {
					let client = info.getValue();
          if(client) return <Tooltip arrow componentsProps={{tooltip: {style:{backgroundColor:'none', padding: 0, border: 'none', minWidth: 300}}}} title={
						<InfoCard title={"客戶資料"}>
							{(client.companyCht??client.companyEn) && <InfoRow flexDirection='column' label={"名稱"} value={client.companyCht??client.companyEn}/>}
							{client.tel && <InfoRow label={"電話"} value={client.telCode +" "+ client.tel}/>}
              {client.fax && <InfoRow label={"傳真"} value={client.faxCode +" "+ client.fax}/>}
							{client.whatsapp && <InfoRow label={"Whatsapp"} value={client.whatsappCode +" "+ client.whatsapp}/>}
							{client.wechat && <InfoRow label={"Wechat"} value={client.wechatCode+" "+client.wechat}/>}
              {client.email && <InfoRow label={"電郵"} value={client.email}/>}
							{client.address && <InfoRow label={"地址"} value={client.address}/>}
						</InfoCard>
            } placement="right">
						<div style={{display: 'flex', justifyContent: 'center',alignItems: 'center', width: '100%'}}>
							<StoreIcon fontSize="small" />
						</div>
					</Tooltip>
        }
      }),
			columnHelper.accessor('contact', {
        id: 'contact',
				width: 50,
        textAlign: 'center',
        header: (header) => '聯絡人',
        cell: info => {
					let contact = info.getValue();
					if(contact)
          return <Tooltip arrow componentsProps={{tooltip: {style:{backgroundColor:'none', padding: 0, border: 'none', minWidth: 300}}}} title={
						<InfoCard title={"聯絡資料"}>
              {(contact.nameCht??contact.nameEn) && <InfoRow label={"名稱"} value={contact.nameCht??contact.nameEn}/>}
							{contact.tel && <InfoRow label={"電話"} value={contact.telCode+' '+contact.tel}/>}
							{contact.whatsapp && <InfoRow label={"Whatsapp"} value={contact.whatsappCode+' '+contact.whatsapp}/>}
							{contact.wechat && <InfoRow label={"Wechat"} value={contact.wechatCode+' '+contact.wechat}/>}
              {contact.email && <InfoRow label={"電郵"} value={contact.email}/>}
						</InfoCard>
            } placement="right">
						<div style={{display: 'flex', justifyContent: 'center',alignItems: 'center', width: '100%'}}>
							<PhoneAndroidIcon fontSize="small" />
						</div>
					</Tooltip>
        }
      }),
			columnHelper.accessor('manager', {
        id: 'manager',
				width: 50,
        textAlign: 'center',
        header: (header) => 'P.I.C.',
        cell: info => {
          let user = info.getValue();
					if(user)
          return <Tooltip arrow componentsProps={{tooltip: {style:{backgroundColor:'none', padding: 0, border: 'none', minWidth: 300}}}} title={
						<InfoCard title={"P.I.C."}>
              {(user.nameEn) && <InfoRow label={"名稱"} value={user.nameEn}/>}
							{user.email && <InfoRow label={"電郵"} value={user.email}/>}
							{user.tel2 && <InfoRow label={"電話"} value={user.tel1+' '+user.tel2}/>}
							{user.whatsapp2 && <InfoRow label={"Whatsapp"} value={user.whatsApp+' '+user.whatsapp2}/>}
							{user.wechat2 && <InfoRow label={"Wechat"} value={user.wechat+' '+user.wechat2}/>}
						</InfoCard>
            } placement="right">
						<div style={{display: 'flex', justifyContent: 'center',alignItems: 'center', width: '100%'}}>
							<AccessibilityNewIcon fontSize="small" />
						</div>
					</Tooltip>
        }
      }),
			columnHelper.accessor('assignee', {
        id: 'assignee',
				width: 50,
        textAlign: 'center',
        header: (header) => '成員',
        cell: info => {
          let users = info.getValue();
					if(users.length)
          return <Tooltip title={<div style={{maxWidth: 200}}>{
						users.map(e=> <Chip key={e.id} label={e.username} style={{margin: 2, backgroundColor: e.color, color:  e.color ? 'white': 'none'}}/>)
						}</div>} placement="right" arrow>
						<div style={{ display: 'flex', justifyContent: 'flex-start', position: 'relative' }}>
							{users.map((x, i)=>{
                let zIndex = users.length - i;
                let left = 0 - i * 20;
                return <Avatar sx={{ bgcolor: x.color, zIndex: zIndex, left: '-20px', marginRight: '2px', left  }}>{x.username?.[0]}</Avatar>
              })}
						</div>
					</Tooltip>
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
      columnHelper.accessor('hashtags', {
        id: 'hashtags',
        header: (header) => '標籤',
        cell: info => {
					let hashtags = info.getValue();
					if(hashtags.length)
          return hashtags.map(e=> <Chip key={e.id} label={e.nameCht} style={{margin: 2}}/>)
        }
      })
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
				statusArray: projectStautsIds,
				first: pageSize,
				skip: pageSize * (pageIndex - 1),
        keyword: keyword,
        statusArray: projectStatusValue.length ? projectStatusValue : null,
        sort: sorting[0]?.id,
        order: sorting[0]?.desc ? 'DESC' : 'ASC'
      }
    });
  }
  
  const loading = queryStatus.loading;

  const createProjectClick = () => {
    setOpenedModal({ 
      open: 'createProject',
      onCompleted: (project)=> navigate(`/cms/project/${project.id}?tab=0`)
     })
  }

  const onGanttChartBtnClick = (params, event) => {
		let url = `/cms/gantt_chart/project/${params.realId}?projectName=${params.code}&language=chi`
    // window.open(url, '_blank');
    navigate(url);
  }

	const onReviewBtnClick = (params, event) => {
    let url = `/cms/project/${params.projectId}?tab=0`
    // window.open(url, '_blank');
    navigate(url);
  }

  
  const onPageIndexChange = (e, pageIndex) => {
    setPagination({ pageIndex: pageIndex, pageSize: pageSize, keyword: keyword}); 
    navigate(`${location.pathname}?pageIndex=${pageIndex}&pageSize=${pageSize}&keyword=${keyword}`)
  }

  useLayoutEffect(() => {
    query();
  }, [pageIndex, pageSize, keyword, sorting])

  return (
    <div style={{ height: height??'85vh', width: '100%', padding: 0 }}>
      <ProjectFormFormModal
        open={openedModal.open == 'createProject'}
        mode={'create'}
        onCompleted={openedModal.onCompleted}
        onCloseClick={()=>setOpenedModal({ open: '' })}
      />
      <div style={{padding: 5, fontWeight: 'bold'}}>工程專案列表</div>
      <Divider/>
			<FilterBlock>
        <Stack direction="row" spacing={2}>
          <Grid container spacing={2}>
            <Grid item xs={'auto'}>
              <CreateBtn onClick={createProjectClick}>
                新增工程專案
              </CreateBtn>
            </Grid>
            <Grid item xs={'auto'} sm={'auto'}>
             <RefreshBtn onClick={()=>query()}/>
            </Grid>
            <Grid item xs={12} sm={2} minWidth={200} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <MultipleSelectCheckmarks
                labelId={'projectStatus'}
                label={'工程狀態'}
                items={projectStatussOptions}
                onChange={(e) => {
                  setProjectStatusValue(e)
                  localStorage.setItem('projectListStatusValue', e)
                }}
                value={projectStatusValue}
                onClose={query}
              />
            </Grid>
            <Grid item xs={12} sm={1} minWidth={200} sx={{display:'flex', justifyContent: 'center', alignItems: 'center'}}>
              <DebouncedInput
                sx={{'& .MuiInputBase-root': {
                  borderBottom: 'none',
                },}}
                value={globalFilter ?? ''}
                onChange={value => {
                  setPagination({ pageIndex: 1, pageSize: pageSize, keyword: value});
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
                { label: '編輯', onClick: () => { onReviewBtnClick(row.original) } },
                { label: '工程進度表', onClick: () => { onGanttChartBtnClick(row.original) } },
              ]}
            />}
            onPageIndexChange={onPageIndexChange}
          />
        </div>
      </div>
    </div>
  )
}
