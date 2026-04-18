import React, { useMemo, useState, useContext, useCallback } from 'react';
import { GraphQLClient } from 'graphql-request'
import { useParams, useNavigate } from "react-router-dom";
import { SnackbarContext } from './SnackbarProvider';
import { useMutation } from '@apollo/client';
import MaterialReactTable from 'material-react-table';
import {
  IconButton, Tooltip, CircularProgress, Backdrop,
  TextField,
  Stack,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@mui/material';
import { Delete } from '@mui/icons-material';
import CompareIcon from '@mui/icons-material/Compare';
import IosShareIcon from '@mui/icons-material/IosShare';
import {
  QueryClient,
  QueryClientProvider,
  useQuery as useReactQuery,
} from '@tanstack/react-query';
import { GET_PDFS } from '../apollo/queries';
import { PDFCreate, PDFDelete, PDFShareCode, PDFShareCodeDelete } from '../apollo/mutations';
import PDFShareModal from './PDFShare';
import UploadIcon from '@mui/icons-material/Upload';
import DownloadIcon from '@mui/icons-material/Download';
import PDFDownloadModal from './PDFDownload';
import { MRT_Localization_ZH_HANT } from 'material-react-table/locales/zh-Hant';
import { UserContext } from '../contexts/UserContext';

const List = (props) => {
  const [user, userDispatch] = React.useContext(UserContext);
  const graphQLClient = new GraphQLClient(props.webEndpoint, {
    headers: {
      authorization: `Bearer ${user.token}`,
    },
  });
  const params = useParams();
  const navigate = useNavigate();
  const Snackbar = useContext(SnackbarContext);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [columnFilters, setColumnFilters] = useState([]);
  const [projectName, setProjectName] = useState('');
  const [sorting, setSorting] = useState([]);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [pdfShareModalOpen, setPdfShareModalOpen] = useState(false);
  const [rowCount, setRowCount] = useState(0);
  const [pdfSharePdfId, setPdfSharePdfId] = useState(null);

  const [pdfDownloadModalOpen, setPdfDownloadModalOpen] = useState(false);
  const [pageHistories, setPageHistories] = useState([]);

  const closePdfShareModal = () => {
    setPdfShareModalOpen(false);
  }

  const closePdfDownloadModal = () => {
    setPdfDownloadModalOpen(false);
  }

  const getCommonEditTextFieldProps = useCallback(
    (cell) => {
      return {
        error: !!validationErrors[cell.id],
        helperText: validationErrors[cell.id],
        onBlur: (event) => {
          const isValid = validateRequired(event.target.value);
          if (!isValid) {
            //set validation error for cell if invalid
            setValidationErrors({
              ...validationErrors,
              [cell.id]: `${cell.column.columnDef.header} is required`,
            });
          } else {
            //remove validation error for cell if valid
            delete validationErrors[cell.id];
            setValidationErrors({
              ...validationErrors,
            });
          }
        },
      };
    },
    [validationErrors],
  );
  
  const columns = useMemo(
    () => [
      {
        accessorKey: 'name',
        header: '名稱',
        muiTableBodyCellEditTextFieldProps: ({ cell }) => ({
          ...getCommonEditTextFieldProps(cell),
        }),
      },
      {
        accessorKey: 'remarks',
        enableHiding: false,
        header: '備註',
        muiTableBodyCellEditTextFieldProps: ({ cell }) => ({
          ...getCommonEditTextFieldProps(cell),
        }),
      },
      {
        accessorKey: 'id',
        header: '對比',
        enableEditing: false,
        enableSorting: false,
        Cell: ({ cell, row }) => (
          <>
            <IconButton onClick={() => compareHandle(row.original?.id)}>
              <CompareIcon />
            </IconButton>
          </>
        ),
      },
      {
        accessorKey: 'upload',
        header: '上傳',
        enableEditing: false,
        enableSorting: false,
        Cell: ({ cell, row }) => (
          <>
            <IconButton onClick={() => uploadHandle(row.original?.id)}>
              <UploadIcon />
            </IconButton>
          </>
        ),
      },
      {
        accessorKey: 'generate',
        header: '分享',
        enableSorting: false,
        enableEditing: false,
        Cell: ({ cell, row }) => (
          <>
            <IconButton onClick={() => shareHandle(row.original?.id)}>
              <IosShareIcon />
            </IconButton>
          </>
        ),
      },
      {
        accessorKey: 'download',
        header: '下載',
        enableSorting: false,
        enableEditing: false,
        Cell: ({ cell, row }) => (
          <>
            <IconButton onClick={() => handleDownload(row.original?.pageHistories)}>
              <DownloadIcon />
            </IconButton>
          </>
        ),
      },
    ],
    [getCommonEditTextFieldProps],
  );

  const { data, isError, isFetching, isLoading, refetch } = useReactQuery({
    queryKey: [
      'pdfs',
      //columnFilters, //refetch when globalFilter changes
      pagination.pageIndex, //refetch when pagination.pageIndex changes
      pagination.pageSize, //refetch when pagination.pageSize changes
      sorting, //refetch when sorting changes
    ],
    queryFn: async () => {
      const result = await graphQLClient.request(
        GET_PDFS,
        // variables are type-checked too!
        {
          projectId: Number(params.projectId) || undefined,
          first: pagination.pageSize,
          skip: (pagination.pageIndex * pagination.pageSize),
          sortField: sorting?.[0]?.id === 'name' ? 'NAME'
              : sorting?.[0]?.id === 'remarks' ? 'REMARKS' : undefined,
          sortOrder: sorting?.[0]?.desc === undefined ? 'DESC' : sorting?.[0]?.desc ? 'DESC' : 'ASC',
        },
      );
      const resultData = result?.pdfs?.edges?.map(x => ({
        id: x.node.id,
        name: x.node.name,
        project: x.node.project.code,
        remarks: x.node.remarks,
        fileUrl: x.node.pdfSources?.[0]?.fileUrl,
        pageHistories: x.node.pdfSources?.[0]?.pdfSourceHistories,
      })) || [];
      if (resultData.length) setProjectName(resultData[0]?.project);
      const totalCount = result?.pdfs?.totalCount;
      setRowCount(totalCount);
      return {
        data: resultData,
        meta: {
          totalRowCount: totalCount
        }
      };
    },
    keepPreviousData: true,
  });

  const [pdfCreate, { data: pdfCreateData, loading: pdfCreateLoading }] = useMutation(PDFCreate, {
    onCompleted: data => {
      const userErrors = data?.pdfCreate?.userErrors;
      if (userErrors.length > 0) {
        Snackbar.open({ alertProps: { severity: 'error' }, title: '新增失敗', message: userErrors.map(v => v.message) });
      } else {
        Snackbar.open({ alertProps: { severity: 'success' }, message: '新增成功' });
      }
    },
    onError: error => {
      Snackbar.open({ alertProps: { severity: 'error' }, title: '新增失敗', message: error.graphQLErrors.length ? error.graphQLErrors.map(v => v.message) : '新增失敗' });
    },
  });

  const [pdfDelete, { data: pdfDeleteData, loading: pdfDeleteLoading }] = useMutation(PDFDelete, {
    onCompleted: data => {
      const userErrors = data?.pdfDelete?.userErrors;
      if (userErrors.length > 0) {
        Snackbar.open({ alertProps: { severity: 'error' }, title: '刪除失敗', message: userErrors.map(v => v.message) });
      } else {
        Snackbar.open({ alertProps: { severity: 'success' }, message: '刪除成功' });
      }
    },
    onError: error => {
      Snackbar.open({ alertProps: { severity: 'error' }, title: '刪除失敗', message: error.graphQLErrors.length ? error.graphQLErrors.map(v => v.message) : '刪除失敗' });
    },
  });

  const [shareCode, { data: shareCodeData, loading: shareCodeLoading }] = useMutation(PDFShareCode, {
    onCompleted: data => {
      const userErrors = data?.pdfShareCode?.userErrors;
      if (userErrors.length > 0) {
        Snackbar.open({ alertProps: { severity: 'error' }, title: '分享失敗', message: userErrors.map(v => v.message) });
      } else {
        Snackbar.open({ alertProps: { severity: 'success' }, message: '分享成功, 已複製到剪貼簿' });
      }
    },
    onError: error => {
      Snackbar.open({ alertProps: { severity: 'error' }, title: '分享失敗', message: error.graphQLErrors.length ? error.graphQLErrors.map(v => v.message) : '分享失敗' });
    },
  });

  const [shareCodeDelete, { data: shareCodeDeleteData, loading: shareCodeDeleteLoading }] = useMutation(PDFShareCodeDelete, {
    onCompleted: data => {
      const userErrors = data?.pdfShareCodeDelete?.userErrors;
      if (userErrors.length > 0) {
        Snackbar.open({ alertProps: { severity: 'error' }, title: '刪除失敗', message: userErrors.map(v => v.message) });
      } else {
        Snackbar.open({ alertProps: { severity: 'success' }, message: '刪除成功' });
      }
    },
    onError: error => {
      Snackbar.open({ alertProps: { severity: 'error' }, title: '刪除失敗', message: error.graphQLErrors.length ? error.graphQLErrors.map(v => v.message) : '刪除失敗' });
    },
  });

  const compareHandle = async (id) => {
    navigate(`/cms/pdf_compare/${params.projectId}/${id}`);
  }

  const uploadHandle = async (id) => {
    navigate(`/cms/pdf_compare/upload/${id}`)
  }

  const shareHandle = async (id) => {
    setPdfSharePdfId(id);
    setPdfShareModalOpen(true);
  }

  const shareDeleteHandle = async (id) => {
    const result = await shareCodeDelete({
      variables: {
        data: {
          pdfId: id,
        }
      }
    });
    if (!result?.data?.pdfShareCodeDelete?.userErrors.length) {
      refetch();
    }
  }

  const handleDownload = async (data) => {
    //console.log('download',data)
    setPageHistories(data);
    setPdfDownloadModalOpen(true);
  }

  const handleCreateNewRow = async (values) => {
    const result = await pdfCreate({
      variables: {
        data: {
          projectId: Number(params.projectId),
          name: values?.name,
          remarks: values?.remarks || undefined,
        }
      }
    });
    if (!result?.data?.pdfCreate?.userErrors.length) {
      refetch();
    }
  };

  const handleDeleteRow = useCallback(
    async (row) => {
      if (
        !window.confirm(`確定要刪除 ${row.getValue('name')}?`)
      ) {
        return;
      }
      const result = await pdfDelete({
        variables: {
          data: {
            id: row.original.id,
          }
        }
      });
      if (!result?.data?.pdfDelete?.userErrors.length) {
        refetch();
      }
    },
    //[tableData],
  );

  const CreateNewAccountModal = ({ open, columns, onClose, onSubmit }) => {
    const [values, setValues] = useState(() =>
      columns.reduce((acc, column) => {
        if (column.accessorKey === 'id' || column.accessorKey === 'upload') return acc;
        acc[column.accessorKey ?? ''] = '';
        return acc;
      }, {}),
    );

    const handleSubmit = () => {
      //put your validation logic here
      let isError = false;
      //console.log(values)
      Object.entries(values).forEach(([key, value]) => {
        if (['name'].includes(key) && (!value)) {
          isError = true;
        }
      });
      if (isError) return;
      onSubmit(values);
      onClose();
    };

    return (
      <Dialog open={open}>
        <DialogTitle textAlign="center">新增記錄</DialogTitle>
        <DialogContent>
          <form onSubmit={(e) => e.preventDefault()}>
            <Stack
              sx={{
                width: '100%',
                minWidth: { xs: '300px', sm: '360px', md: '400px' },
                gap: '1.5rem',
              }}
            >
              <TextField
                key={'name'}
                label={'名稱'}
                name={'name'}
                onChange={(e) =>
                  setValues({ ...values, [e.target.name]: e.target.value })
                }
                InputProps={{
                  style: {
                    fontSize: 16,
                  }
                }}
              />
              <TextField
                key={'remarks'}
                label={'備註'}
                name={'remarks'}
                onChange={(e) =>
                  setValues({ ...values, [e.target.name]: e.target.value })
                }
                InputProps={{
                  style: {
                    fontSize: 16,
                  }
                }}
              />
            </Stack>
          </form>
        </DialogContent>
        <DialogActions sx={{ p: '1.25rem' }}>
          <Button onClick={onClose}>取消</Button>
          <Button
            //color="secondary"
            onClick={handleSubmit} variant="contained">
            儲存
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  return (
    <>
      <MaterialReactTable
        localization={MRT_Localization_ZH_HANT}
        displayColumnDefOptions={{
          'mrt-row-actions': {
            muiTableHeadCellProps: {
              align: 'center',
            },
            size: 30,
          },
        }}
        muiTableHeadCellProps={{
          sx: {
            fontSize: 14,
          }
        }}
        muiTableBodyCellProps={{
          sx: {
            fontSize: 14,
            color: 'rgba(0, 0, 0, 0.87)',
            '& button': {
              fontSize: 16,
              '& svg': {
                fontSize: 16,
              }
            },
            '& a': {
              fontSize: 20,
              '& svg': {
                fontSize: 20,
              }
            }
          }}
        }
        muiTopToolbarProps={{
          sx: {
            fontSize: 14,
          }
        }}
        muiTableFooterCellProps={{
          sx: {
            fontSize: 14
          }
        }}
        muiTablePaginationProps={{
          sx: {
            '& p': {
              fontSize: 14,
            },
            '& div': {
              fontSize: 14,
            },
          },
        }}
        columns={columns}
        data={data?.data ?? []} //data is undefined on first render
        initialState={{
          isFullScreen: false,
          density: 'compact',
          columnOrder: [
            'name',
            'remarks',
            'id',
            'upload',
            'generate',
            'download',
            'mrt-row-actions',
          ]
        }}
        //manualFiltering
        editingMode="modal"
        enableEditing
        manualPagination
        rowCount={rowCount}
        manualSorting
        enableGlobalFilter={false}
        enableDensityToggle={false}
        enableFullScreenToggle={false}
        enableHiding={false}
        muiToolbarAlertBannerProps={
          isError
            ? {
              color: 'error',
              children: 'Error loading data',
            }
            : undefined
        }
        onColumnFiltersChange={setColumnFilters}
        onPaginationChange={setPagination}
        onSortingChange={setSorting}
        renderRowActions={({ row, table }) => (
          <Box sx={{ display: 'flex', gap: '1rem' }}>
            <Tooltip arrow placement="right" title="Delete">
              <IconButton color="error" onClick={() => handleDeleteRow(row)}>
                <Delete />
              </IconButton>
            </Tooltip>
          </Box>
        )}
        renderTopToolbarCustomActions={() => (
          <>
            <Button
              //color="secondary"
              onClick={() => setCreateModalOpen(true)}
              variant="contained"
              style={{fontSize:14}}
            >
              新增
            </Button>
            <div>{projectName}</div>
          </>
        )}
        state={{
          columnFilters,
          isLoading,
          pagination,
          showAlertBanner: isError,
          showProgressBars: isFetching,
          sorting,
        }}
      />
      <Backdrop
        open={shareCodeLoading || shareCodeDeleteLoading}
        sx={{ color: '#fff', zIndex: (theme) => 1300 + 1 }}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
      <PDFShareModal
        open={pdfShareModalOpen}
        closeModal={() => closePdfShareModal()}
        projectId={params.projectId}
        pdfSharePdfId={pdfSharePdfId}
        appToken={props.appToken}
        webEndpoint={props.webEndpoint}
        shareLink={props.shareLink}
      />
      <PDFDownloadModal
        open={pdfDownloadModalOpen}
        closeModal={() => closePdfDownloadModal()}
        pageHistories={pageHistories}
      />
      <CreateNewAccountModal
        columns={columns}
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSubmit={handleCreateNewRow}
      />
    </>
  );
};

const validateRequired = (value) => !!value.length;

const queryClient = new QueryClient();

const PDFList = (props) => {
  return (
  <QueryClientProvider client={queryClient}>
    <List appToken={props.appToken} webEndpoint={props.webEndpoint} shareLink={props.shareLink} />
  </QueryClientProvider>
)};

export default PDFList;
