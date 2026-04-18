import React, {useContext, useEffect, useLayoutEffect, useMemo, useState } from "react";
import { Divider, Grid, Stack, Tooltip } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import { radioFiltetBtnUseStyles } from "../components/RadioFiltetBtn";
import FilterBlock from "../components/FilterBlock";
import { gql, useLazyQuery, useMutation } from "@apollo/client";
import DebouncedInput from "../components/DebouncedInput";
import { createColumnHelper, flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable } from "@tanstack/react-table";
import { useDrag, useDrop } from "react-dnd";
import { rankItem } from "@tanstack/match-sorter-utils";
import { CreateBtn, RefreshBtn, TableDelBtn, TableViewBtn } from "../components/TableActionBtn";
import BackdropLoading from "../components/BackdropLoading";
import RoomIcon from '@mui/icons-material/Room';
import { FaMobileAlt, FaUserCircle, FaWeixin } from 'react-icons/fa';
import { OptionsContext } from "../contexts/OptionsContextProvider";
import { CLIENTS_QUERY } from "../apollo/queries";
import { clientFragment } from "../apollo/fragments";
import { AiOutlineMail, AiOutlineWhatsApp } from "react-icons/ai";
import ContactChip from "../components/ContactChip";
import CreateClientModal from "../components/client/CreateClientModal";
import ReactTable from "../components/ReactTable";
import { TableRow } from "../components/TableRow";
import ClientContactInfo from "../components/ClientContactInfo";
import { useSnackbar } from "notistack";
import { CLIENT_DELETE } from "../apollo/mutations";

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
  const [openedModal, setOpenedModal] = React.useState({});
  const navigate = useNavigate();
  const location = useLocation();
  const [dataUseQuery, queryStatus] = useLazyQuery(gql`${CLIENTS_QUERY} ${clientFragment}`, {fetchPolicy: 'network-only',});
  const [deleteMutation, deleteStatus] = useMutation(gql`${CLIENT_DELETE} ${clientFragment}`)
  const [globalFilter, setGlobalFilter] = React.useState('')
  const [sorting, setSorting] = React.useState([]);
  const queryParam = new URLSearchParams(window.location.search);
  const [{ pageIndex, pageSize }, setPagination] = React.useState({
    pageIndex: queryParam.get("pageIndex") ? parseInt(queryParam.get("pageIndex")): 1,
    pageSize: queryParam.get("pageSize") ? parseInt(queryParam.get("pageSize")): 10,
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
				width: 50,
        header: () => '操作',
        cell: info => {
          return (
            <div style={{display: 'flex'}}>
							<TableViewBtn onClick={()=>{onReviewBtnClick(info.row.original)}}/>
              <TableDelBtn onClick={()=>{onDeleteBtnClick(info.row.original)}}/>
            </div>
          )
        }
      }),
      columnHelper.accessor('client', {
        id: 'prefix',
				width: 150,
        header: (header) => '代號',
        cell: info => {
					return <div style={{ alignItems: 'center', width: 150, }}>
						<div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{info.row.original.prefix}</div>
					</div>
        }
      }),
      columnHelper.accessor('client', {
        id: 'client',
				width: 350,
        header: (header) => '客戶',
        cell: info => {
					return <div style={{ alignItems: 'center', width: 350, }}>
						<div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{info.row.original.companyCht}</div>
            <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{info.row.original.companyEn}</div>
					</div>
        }
      }),
      columnHelper.accessor('address', {
        id: 'address',
				width: 50,
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
			columnHelper.accessor('contact', {
        id: 'contact',
        header: (header) => '聯絡資料',
        cell: info => {
					let contact = info.row.original;
          return (
						<div title={"客戶資料"} style={{padding: 3}}>
              {contact.tel && <div className="flex-cell-div"><FaMobileAlt size={17} /> &nbsp;{contact.telCode +" "+ contact.tel}</div>}
              {contact.whatsapp && <div className="flex-cell-div"><AiOutlineWhatsApp size={17} /> &nbsp;{contact.whatsappCode +" "+ contact.whatsapp}</div>}
              {contact.wechat && <div className="flex-cell-div"><FaWeixin size={17} /> &nbsp;{contact.wechatCode+" "+contact.wechat}</div>}
              {contact.email && <div className="flex-cell-div"><AiOutlineMail size={17} /> &nbsp;{contact.email}</div>}
						</div>
            )
        }
      }),
      columnHelper.accessor('mainContact', {
        id: 'mainContact',
        header: (header) => '主要聯絡人',
        cell: info => {
					let client = info.row.original.mainContact;
          if(client)
          return (
						<div title={"聯絡人資料"} style={{padding: 3}}>
             <ClientContactInfo client={client}/>
						</div>
            )
        }
      }),
      columnHelper.accessor('contacts', {
        id: 'contacts',
        header: (header) => '其他聯絡人',
        cell: info => {
					let constants = info.getValue();
          if(constants?.length > 0)
          return (
						<Stack direction="row" spacing={1} title={"客戶資料"} style={{padding: 3}}>
              {constants?.map(e=> <ContactChip key={e.id} {...e}/>)}
						</Stack>
            )
        }
      })
    ]
    return columns
  })
   
  const rows = useMemo(()=>{
    let rows = [];
    if(queryStatus.data?.clients.edges) {
      rows = queryStatus.data?.clients.edges.map((e)=>e.node);
      setTotalCount(queryStatus.data?.clients.totalCount);
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
        deleted: false,
				first: pageSize,
				skip: pageSize * (pageIndex - 1)
      }
    });
  }
  
  const loading = queryStatus.loading || deleteStatus.loading;

  const onCreateCompleted = () => {
    setOpenedModal({ open: '' })
    query();
  }

	const onReviewBtnClick = (params, event) => {
    let url = `/cms/client/${params.id}?tab=0`
    // window.open(url, '_blank');
    navigate(url);
  }

  const onDeleteBtnClick = (params) => {
    deleteMutation({
      variables: {
        data: {
          id: params.id,
        }
      },
      onCompleted: (res) => {
        if (res.clientDelete.userErrors.length) {
          res.clientDelete.userErrors.map(e => {
            enqueueSnackbar(e.message, {
              variant: 'error'
            })
          })
        }
        else if (res.clientDelete.client) {
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
      pageSize: queryParam.get("pageSize") ? parseInt(queryParam.get("pageSize")): 10,
    }); 
  }, [location]);
  
  useLayoutEffect(() => {
    query();
  }, [pageIndex, pageSize])

  return (
    <div style={{ height: height??'85vh', width: '100%', padding: 0 }}>
      <CreateClientModal
        open={openedModal.open == 'createModal'}
        onCloseClick={()=>setOpenedModal({ open: '' })}
        onCompleted={onCreateCompleted}
      />
      <div style={{padding: 5, fontWeight: 'bold'}}>客戶列表</div>
      <Divider/>
			<FilterBlock>
        <Stack direction="row" spacing={2}>
          <Grid container spacing={2}>
            <Grid item xs={'auto'}>
              <CreateBtn onClick={()=>setOpenedModal({open:'createModal'})}>
                新增客戶
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
          <ReactTable
            table={table}
            sorting={sorting}
            pageIndex={pageIndex}
            count={Math.ceil(totalCount / pageSize)}
            renderRow={(row, index) => <TableRow key={row.id} row={row} reorderRow={reorderRow} onDoubleClick={onReviewBtnClick}/>}
            onPageIndexChange={onPageIndexChange}
          />
        </div>
      </div>
    </div>
  )
}
