import React, {useContext, useLayoutEffect, useMemo, useState } from "react";
import moment from "moment";
import { Divider, Grid, Stack, Tooltip } from "@mui/material";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import FilterBlock from "../components/FilterBlock";
import { gql, useLazyQuery, useMutation } from "@apollo/client";
import { TENDER_FORMS_QUERY } from "../apollo/queries";
import DebouncedInput from "../components/DebouncedInput";
import { createColumnHelper, flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable } from "@tanstack/react-table";
import { useDrag, useDrop } from "react-dnd";
import { rankItem } from "@tanstack/match-sorter-utils";
import { CreateBtn, RefreshBtn, TableDelBtn, TableViewBtn } from "../components/TableActionBtn";
import BackdropLoading from "../components/BackdropLoading";
import { OptionsContext } from "../contexts/OptionsContextProvider";
import ReactSortableTable from "../components/ReactSortableTable";
import { TableRow } from "../components/TableRow";
import { TENDER_FORM_DELETE, TENDER_FORM_IMPORT } from "../apollo/mutations";
import ConfirmModal from "../components/ConfirmModal";
import { useSnackbar } from "notistack";
import { tenderFormFragment } from "../apollo/fragments";
import TenderFormModal from "../components/user/TenderFormModal";
import * as XLSX from 'xlsx';
import { isNumber } from "underscore";
import Input from "../components/Input";

function combineExcelDateTime(inputDate, inputTime) {
  // 确保输入的日期是一个数字
  if (typeof inputDate !== 'number') return null;

  const millisecondsInADay = 24 * 60 * 60 * 1000;
  const millisecondsInAnHour = 60 * 60 * 1000;

  // 将 Excel 的日期值转换为日期对象
  const date = new Date((inputDate - 25569) * millisecondsInADay);

  if (!inputTime) {
    date.setHours(0, 0, 0, 0);
    return moment(date).format('YYYY-MM-DD');
  } else {
    // 将 Excel 的时间值转换为毫秒，并乘以24小时
    const timeInMilliseconds = inputTime * millisecondsInADay;

    // 合并日期和时间，并考虑时区差值（这里假设时区差值为8小时）
    const excelDateTime = new Date(date.getTime() + timeInMilliseconds - millisecondsInAnHour * 8);
    return moment(excelDateTime).format('YYYY-MM-DD HH:mm:ss');
  }
}

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

  const [optionsContext, optionsContextDispatch, {clientOptions}] = useContext(OptionsContext);
  const { enqueueSnackbar } = useSnackbar();
  const [openedModal, setOpenedModal] = React.useState({});
  const navigate = useNavigate();
  const location = useLocation();
  const importInputRef = React.useRef();
  const [formDataCreateMutate, createStatus] = useMutation(TENDER_FORM_IMPORT);
  const queryParam = new URLSearchParams(window.location.search);
  const [dataUseQuery, queryStatus] = useLazyQuery(gql`${TENDER_FORMS_QUERY} ${tenderFormFragment}`, {fetchPolicy: 'network-only',});
  const [deleteMutation, deleteStatus] = useMutation(TENDER_FORM_DELETE);
  const [receivedDateStart, setReceivedDateStart] = useState(queryParam.get('receivedDateStart') ?? moment().add(1, 'week').format('YYYY-MM-DD'));
  const [receivedDateEnd, setReceivedDateEnd] = useState(null);
  const [myConfirmModalOpen, setMyConfirmModalOpen] = React.useState({
    open: false,
    title: null,
    content: null,
    onConfirm: ()=>{},
  });
  const [globalFilter, setGlobalFilter] = React.useState('')
  const [sorting, setSorting] = React.useState([]);
	const [searchParams, setSearchParams] = useSearchParams();
  const [{ pageIndex, pageSize }, setPagination] = React.useState({
    pageIndex: searchParams.get("pageIndex") ? parseInt(searchParams.get("pageIndex")): 1,
    pageSize: searchParams.get("pageSize") ? parseInt(searchParams.get("pageSize")): 9999,
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

  const handleMyConfirmModalOpen = (title, content, onConfirm) => setMyConfirmModalOpen({
    open: true,
    title: title,
    content: content,
    onConfirm: onConfirm,
    onClose: handleMyConfirmModalClose
  });

  const handleMyConfirmModalClose = () => setMyConfirmModalOpen({
    open: false,
    title: null,
    content: null,
    onConfirm: ()=>{},
    onClose: handleMyConfirmModalClose
  });

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
      columnHelper.accessor('tenderNo', {
        id: 'tenderNo',
        width: 150,
        header: (header) => '編號',
        cell: info => {
          return info.getValue()
        }
      }),
      columnHelper.accessor('siteVisitTime', {
        id: 'siteVisitTime',
        minWidth: 150,
        width: 150,
        header: (header) => '開始',
        cell: info => {
          if(info.getValue()) return moment(info.getValue()).format('YYYY-MM-DD HH:MM')
        }
      }),
      columnHelper.accessor('deadlineTime', {
        id: 'deadlineTime',
        minWidth: 150,
        width: 150,
        header: (header) => '結束',
        cell: info => {
          if(info.getValue()) return moment(info.getValue()).format('YYYY-MM-DD HH:MM')
        }
      }),
      columnHelper.accessor('receivedDate', {
        id: 'receivedDate',
        minWidth: 120,
        width: 120,
        header: (header) => '接收日期',
        cell: info => {
          return info.getValue();
        }
      }),
      columnHelper.accessor('details', {
        id: 'details',
        width: 250,
        header: (header) => '內容',
        cell: info => {
          return <div className="ellipsis" style={{maxWidth: 250, }}>{info.getValue()}</div>;
        }
      }),
      columnHelper.accessor('client', {
        id: 'client',
        width: 250,
        header: (header) => '客戶',
        cell: info => info.getValue()
      }),
      columnHelper.accessor('action', {
        id: 'action',
				width: 100,
        textAlign: 'center',
        header: () => '操作',
        cell: info => {
          return (
            <div style={{display: 'flex'}}>
							<TableViewBtn title={"查看"} onClick={()=>{onReviewBtnClick(info.row.original)}}/>
              <TableDelBtn onClick={()=>{onDelBtnClick(info.row.original)}}/>
            </div>
          )
        }
      }),
      columnHelper.accessor('submitMethod', {
        id: 'submitMethod',
        width: 150,
        header: (header) => '接收方式',
        cell: info => {
          return info.getValue();
        }
      }),
      columnHelper.accessor('personInCharge', {
        id: 'personInCharge',
        width: 200,
        header: (header) => '員工',
        cell: info => {
          if(!info.getValue()) return
          let { username } = info.getValue();
          return username;
        }
      }),
      columnHelper.accessor('createdAt', {
        id: 'createdAt',
        width: 110,
        style: {
          whiteSpace: 'nowrap'
        },
        header: (header) => '建立',
        cell: info => {
          return <div>
            <div style={{textAlign: 'right', fontWeight: 400}}>{moment(info.getValue()).format('YYYY-MM-DD')}</div>
          </div>
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
    if(queryStatus.data?.tenderForms.edges) {
      rows = queryStatus.data?.tenderForms.edges.map((e)=>e.node);
      setTotalCount(queryStatus.data?.tenderForms.totalCount);
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
				skip: pageSize * (pageIndex - 1),
        receivedDateStart,
        receivedDateEnd,
      }
    });
  }
  
  const loading = queryStatus.loading || deleteStatus.loading || createStatus.loading;

  const onCreateCompleted = () => {
    setOpenedModal({ open: '' })
    queryStatus.refetch();
    handleMyConfirmModalClose()
  }

  const createBtnClick = () => { 
    setOpenedModal({ 
      open: 'createModal',
      mode: 'create',
      onCompleted: onCreateCompleted
     })
  }

  const importBtnClick = () => { 
    importInputRef.current.click();
  }

  const onImportFileChange = (e) => {
    const fileInput = document.getElementById('excelInput');
    const file = fileInput.files[0];
    const reader = new FileReader();

    reader.onload = function (event) {
      const data = new Uint8Array(event.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0]; // Assuming the first sheet
      const sheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1}); // 将所有值转换为字符串

      let tenderForms = [];
      for(let i in jsonData) {
        if(i < 1) continue;
        let row = jsonData[i];
        tenderForms.push({
          details: row[8],
          siteVisitTime: isNumber(row[3]) ? combineExcelDateTime(row[3], row[4]) : null,
          deadlineTime: isNumber(row[5]) ? combineExcelDateTime(row[5], row[6]) : null,
          receivedDate: combineExcelDateTime(row[0]),
          submitMethod: row[7],
          client: row[1],
          tenderNo: row[2],
        })
      }

      try {
        formDataCreateMutate({
          variables: {
            data: {
              tenders: tenderForms
            }
          },
          onCompleted: (res) => {
            if (res.tenderFormImport.userErrors.length) {
              res.tenderFormImport.userErrors.map(e => {
                enqueueSnackbar(e.message, {
                  variant: 'error'
                })
              })
            }
            else if (res.tenderFormImport.result) {
              queryStatus.refetch();
              enqueueSnackbar(`導入成功`, {
                variant: 'success'
              })
            }
            else {
              enqueueSnackbar(`導入失敗`, {
                variant: 'error'
              })
            }
          }
        })
      } catch (error) {
        alert(error.message);
      }

    };

    reader.readAsArrayBuffer(file);
  }

	const onReviewBtnClick = (params, event) => {
    setOpenedModal({ 
      open: 'createModal',
      mode: 'update',
      data: {
        id: params.id,
        personInChargeId: params.personInCharge?.id,
        details: params.details,
        siteVisitTime: params.siteVisitTime? moment(params.siteVisitTime).format('YYYY-MM-DD'): null,
        deadlineTime: moment(params.deadlineTime).format('YYYY-MM-DD'),
        receivedDate: params.receivedDate,
        submitMethod: params.submitMethod,
        client: params.client,
        tenderNo: params.tenderNo,
      },
      onCompleted: onCreateCompleted
     })
  }

  const onDelBtnClick = (params, event) => {
    deleteMutation({
      variables: {
        data: {
          id: params.id,
        }
      },
      onCompleted: (res) => {
        if (res.tenderFormDelete.userErrors.length) {
          res.tenderFormDelete.userErrors.map(e => {
            enqueueSnackbar(e.message, {
              variant: 'error'
            })
          })
        }
        else if (res.tenderFormDelete.result) {
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
    query();
  }, [pageIndex, pageSize]);

  return (
    <div style={{ height: height??'85vh', width: '100%', padding: 0 }}>
      <TenderFormModal
        open={openedModal.open == 'createModal'}
        data={openedModal.data}
        mode={openedModal.mode}
        onCloseClick={() => setOpenedModal({ open: '' })}
        onCompleted={onCreateCompleted}
      />
      <ConfirmModal
        mode={'confirm'}
        open={myConfirmModalOpen.open}
        title={myConfirmModalOpen.title}
        content={myConfirmModalOpen.content}
        onCloseClick={myConfirmModalOpen.onClose}
        onConfirmClick={myConfirmModalOpen.onConfirm}
      />
      <div style={{padding: 5, fontWeight: 'bold'}}>Tender列表</div>
      <Divider/>
			<FilterBlock>
        <Stack direction="row" spacing={2}>
          <Grid container spacing={2}>
            <Grid item xs={'auto'}>
              <CreateBtn onClick={createBtnClick}>
                新增
              </CreateBtn>
            </Grid>
            <Grid item xs={'auto'}>
              <CreateBtn onClick={importBtnClick}>
                Excel導入
              </CreateBtn>
              <input
                ref={importInputRef}
                id={"excelInput"}
                type="file" style={{ display: 'none' }}
                accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                onChange={onImportFileChange} />
            </Grid>
            <Grid item xs={'auto'} sm={'auto'}>
             <RefreshBtn onClick={()=>query()}/>
            </Grid>
            <Grid item xs={12} sm={2} minWidth={200}>
              <Input
                variant="standard"
                label="接收日期(開始)"
                type="date"
                value={receivedDateStart}
                onChange={(e) => setReceivedDateStart(e.target.value)}
                onBlur={(e) => {
                  query();
                }}
              ></Input>
            </Grid>
            <Grid item xs={12} sm={2} minWidth={200}>
            <Input
                variant="standard"
                label="接收日期(結束)"
                type="date"
                value={receivedDateEnd}
                onChange={(e) => setReceivedDateEnd(e.target.value)}
                onBlur={(e) => {
                  query();
                }}
              ></Input>
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
                { label: '刪除', onClick: () => { onDelBtnClick(row.original) }, mode: 'warning', title: '確認刪除?' }
              ]}
            />}
            onPageIndexChange={onPageIndexChange}
          />
        </div>
      </div>
    </div>
  )
}
