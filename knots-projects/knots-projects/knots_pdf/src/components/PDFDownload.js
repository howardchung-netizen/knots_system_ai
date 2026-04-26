import React, { useEffect, useMemo, useState } from 'react';
import MaterialReactTable, { MRT_ToggleFiltersButton } from 'material-react-table';
import {
  Modal,
  Box,
} from '@mui/material';
import {
  useQuery,
} from '@tanstack/react-query';
import moment from 'moment';
import DownloadIcon from '@mui/icons-material/Download';
import { MRT_Localization_ZH_HANT } from 'material-react-table/locales/zh-Hant';

const PDFDownloadModal = (props) => {
  //const [columnFilters, setColumnFilters] = useState([]);
  const [sorting, setSorting] = useState([]);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [rowCount, setRowCount] = useState(0);

  const columns = useMemo(
    () => [
      {
        accessorKey: 'fileUrl',
        header: '版本',
        Cell: ({ cell, row }) => (
          <div style={{display:'flex', alignItems:'center'}}>
            <a href={row.original?.fileUrl || ""} download target="_blank" >
              <DownloadIcon />
            </a>
            &nbsp;{row.original?.version}
          </div>
        ),
      },
      {
        accessorKey: 'compareUrl',
        header: '比較差別',
        Cell: ({ cell, row }) => (
          <>
            {row.original?.compareUrl ?
            <a href={row.original?.compareUrl} download target="_blank" >
              <DownloadIcon />
            </a>
            : <></> }
          </>
        ),
      },
      {
        accessorKey: 'pages',
        header: '頁數',
        Cell: ({ cell, row }) => (
          <>
            {row.original?.pages}
          </>
        ),
      },
      {
        accessorKey: 'createdAt',
        header: '創建時間',
        Cell: ({ cell, row }) => (
          <>{moment(row.original?.createdAt).format('YYYY-MM-DD HH:mm')}</>
        ),
      },
    ],
  );

  const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '50%',
    height: '50%',
    overflow: 'auto',
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 0,
  };

  const { data, isError, isFetching, isLoading, refetch: refetchHistory } = useQuery({
    queryKey: [
      'pageHistories',
      //columnFilters, //refetch when globalFilter changes
      pagination.pageIndex, //refetch when pagination.pageIndex changes
      pagination.pageSize, //refetch when pagination.pageSize changes
      sorting, //refetch when sorting changes
    ],
    queryFn: async ({ pageParam = 0 }) => {
      const totalCount = props.pageHistories?.length || 0;
      setRowCount(totalCount);
      //console.log('data',props.pageHistories)
      return {
        data: props.pageHistories,
        meta: {
          totalRowCount: totalCount
        }
      };
    },
    keepPreviousData: true,
  });

  useEffect(()=>{
    if (props.open) refetchHistory();
  },[props.open]);

  return (
    <Modal
      open={props.open}
      onClose={() => { props.closeModal() }}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box sx={style}>
        <MaterialReactTable
          localization={MRT_Localization_ZH_HANT}
          columns={columns}
          data={data?.data ?? []} //data is undefined on first render
          initialState={{
            isFullScreen: false,
            density: 'compact',
            columnOrder: [
              'fileUrl',
              'compareUrl',
              'createdAt',
            ],
          }}
          editingMode="modal"
          enableEditing
          onPaginationChange={setPagination}
          rowCount={rowCount}
          manualPagination
          manualSorting
          muiToolbarAlertBannerProps={
            isError
              ? {
                color: 'error',
                children: 'Error loading data',
              }
              : undefined
          }
          onSortingChange={setSorting}
          enableGlobalFilter={false}
          enableDensityToggle={false}
          enableFullScreenToggle={false}
          enableHiding={false}
          renderToolbarInternalActions={({ table }) => (
            <>
              {/* add your own custom print button or something */}
              <MRT_ToggleFiltersButton table={table} />
            </>
          )}
          state={{
            //columnFilters,
            isLoading,
            pagination,
            showAlertBanner: isError,
            showProgressBars: isFetching,
            sorting,
          }}
        />
      </Box>
    </Modal>
  )
}

export default PDFDownloadModal;