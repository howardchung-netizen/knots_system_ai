import React, { useEffect, useLayoutEffect, useMemo, useState } from "react";
import { Divider, Grid, LinearProgress, Stack } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import { radioFiltetBtnUseStyles } from "../components/RadioFiltetBtn";
import FilterBlock from "../components/FilterBlock";
import { gql, useLazyQuery, useMutation } from "@apollo/client";
import DebouncedInput from "../components/DebouncedInput";
import { createColumnHelper, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable } from "@tanstack/react-table";
import { rankItem } from "@tanstack/match-sorter-utils";
import { CreateBtn, RefreshBtn, TableDelBtn, TableEditBtn, TableViewBtn } from "../components/TableActionBtn";
import { FaMobileAlt, FaWeixin } from 'react-icons/fa';
import { CLIENT_CONTACTS_QUERY, contactsQuery } from "../apollo/queries";
import { AiOutlineMail, AiOutlineWhatsApp } from "react-icons/ai";
import ReactTable from "../components/ReactTable";
import { TableRow } from "../components/TableRow";
import { baseClientContactFragment } from "../apollo/baseFragment";
import { appellation } from "../constants/InputOptions";
import ClientContactFormModal from "../components/clientContact/ClientContactFormModal";
import { useSnackbar } from "notistack";
import { CLIENT_CONTACT_DELETE } from "../apollo/mutations";

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
  const [dataUseQuery, queryStatus] = useLazyQuery(gql`${CLIENT_CONTACTS_QUERY} ${baseClientContactFragment}`, {fetchPolicy: 'network-only',});
  const [deleteMutation, deleteStatus] = useMutation(gql`${CLIENT_CONTACT_DELETE} ${baseClientContactFragment}`)
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

  const columns = React.useMemo(() => {
    let columns = [
      columnHelper.accessor('action', {
        id: 'action',
				width: 50,
        header: () => '操作',
        cell: info => {
          return (
            <div style={{display: 'flex'}}>
							<TableEditBtn onClick={()=>{onReviewBtnClick(info.row.original)}}/>
              <TableDelBtn onClick={()=>{onDeleteBtnClick(info.row.original)}}/>
            </div>
          )
        }
      }),
      columnHelper.accessor('name', {
        id: 'name',
        width: 200,
        header: (header) => '名稱',
        cell: info => {
          return <div>
            <div>{info.row.original.nameCht}</div>
            <div>{info.row.original.nameEn}</div>
          </div>
        }
      }),
      columnHelper.accessor('appellation', {
        id: 'appellation',
        width: 60,
        header: (header) => '稱謂',
        cell: info => {
          return appellation[info.getValue()]?.nameCht
        }
      }),
      columnHelper.accessor('tel', {
        id: 'tel',
        header: (header) => '電話',
        cell: info => {
          let data = info.row.original;
					if(data.tel)
          return <div className="flex-cell-div"><FaMobileAlt size={17} /> &nbsp;{data.telCode +" "+ data.tel}</div>
        }
      }),
      columnHelper.accessor('whatsapp', {
        id: 'whatsapp',
        header: (header) => 'Whatsapp',
        cell: info => {
          let data = info.row.original;
					if(data.whatsapp)
          return <div className="flex-cell-div"><AiOutlineWhatsApp size={17} /> &nbsp;{data.whatsappCode +" "+ data.whatsapp}</div>
        }
      }),
      columnHelper.accessor('wechat', {
        id: 'wechat',
        header: (header) => 'Wechat',
        cell: info => {
          let data = info.row.original;
					if(data.wechat)
          return <div className="flex-cell-div"><FaWeixin size={17} /> &nbsp;{data.wechatCode +" "+ data.wechat}</div>
        }
      }),
      columnHelper.accessor('email', {
        id: 'email',
        header: (header) => 'Email',
        cell: info => {
          let data = info.row.original;
					if(data.email)
          return <div className="flex-cell-div"><AiOutlineMail size={17} /> &nbsp;{data.email}</div>
        }
      })
    ]
    return columns
  })
   
  const rows = useMemo(()=>{
    let rows = [];
    if(queryStatus.data?.clientContacts.edges) {
      rows = queryStatus.data?.clientContacts.edges.map((e)=>e.node);
      setTotalCount(queryStatus.data?.clientContacts.totalCount);
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

  const onCreateBtnClick = () => {  
    setOpenedModal({open:'createModal', mode: "create"})
  }
  const onCreateCompleted = () => {
    setOpenedModal({ open: '' })
    query();
  }

	const onReviewBtnClick = (params, event) => {
    setOpenedModal({open:'createModal', mode: "update", data: params})
  }

  const onDeleteBtnClick = (params) => {
    deleteMutation({
      variables: {
        data: {
          id: params.id,
        }
      },
      onCompleted: (res) => {
        if (res.clientContactsDelete.userErrors.length) {
          res.clientContactsDelete.userErrors.map(e => {
            enqueueSnackbar(e.message, {
              variant: 'error'
            })
          })
        }
        else if (res.clientContactsDelete.clientContacts) {
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

  const onPageIndexChange = (e, pageIndex) => {
    setPagination({ pageIndex: pageIndex, pageSize: pageSize }); 
    navigate(`${location.pathname}?pageIndex=${pageIndex}&pageSize=${pageSize}`)
  }
  
  useLayoutEffect(() => { 
    navigate(`${location.pathname}?pageIndex=1&pageSize=${pageSize}`, { replace: true })
  },[])


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
      <ClientContactFormModal
        open={openedModal.open == 'createModal'}
        mode={openedModal.mode}
        data={openedModal.data}
        onCloseClick={()=>setOpenedModal({ open: '' })}
        onCompleted={onCreateCompleted}
      />
      <div style={{padding: 5, fontWeight: 'bold'}}>聯絡人列表</div>
      <Divider/>
			<FilterBlock>
        <Stack direction="row" spacing={2}>
          <Grid container spacing={2}>
            <Grid item xs={'auto'}>
              <CreateBtn onClick={onCreateBtnClick}>
                新增聯絡人
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
          <ReactTable
            table={table}
            sorting={sorting}
            pageIndex={pageIndex}
            count={Math.ceil(totalCount / pageSize)}
            renderRow={(row, index) => <TableRow key={row.id} row={row} />}
            onPageIndexChange={onPageIndexChange}
          />
        </div>
      </div>
    </div>
  )
}
