import React, { useEffect, useMemo, useState, useContext, useCallback } from 'react';
import { GraphQLClient } from 'graphql-request'
import { SnackbarContext } from './SnackbarProvider';
import { useMutation } from '@apollo/client';
import MaterialReactTable, { MRT_ToggleFiltersButton } from 'material-react-table';
import {
  IconButton,
  Tooltip,
  Modal,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
} from '@mui/material';
import { Delete } from '@mui/icons-material';
import {
  useQuery,
} from '@tanstack/react-query';
import { GET_PDF_SHARES } from '../apollo/queries';
import { PDFShareDisable, PDFShareGenerate } from '../apollo/mutations';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import moment from 'moment';
import ShareIcon from '@mui/icons-material/Share';
import { MRT_Localization_ZH_HANT } from 'material-react-table/locales/zh-Hant';
import { UserContext } from '../contexts/UserContext';
import { deDE } from '@mui/x-date-pickers/locales';
import Input from './Input';

const PDFShareModal = (props) => {
  const [user, userDispatch] = React.useContext(UserContext);
  const graphQLClient = new GraphQLClient(props.webEndpoint, {
    headers: {
      authorization: `Bearer ${user.token}`,
    },
  });
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const Snackbar = useContext(SnackbarContext);
  //const [columnFilters, setColumnFilters] = useState([]);
  const [sorting, setSorting] = useState([]);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [rowCount, setRowCount] = useState(0);

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
        accessorKey: 'remark',
        header: '備註',
      },
      {
        accessorKey: 'expiredTime',
        header: '到期時間',
        Cell: ({ cell, row }) => (
          <>{moment(row.original?.expiredTime).format('YYYY-MM-DD')}</>
        ),
      },
      {
        accessorKey: 'share',
        header: '分享連結',
        Cell: ({ cell, row }) => (
          <>
            <IconButton onClick={() => shareHandle(row.original?.code)}>
              <ShareIcon />
            </IconButton>
          </>
        ),
      },
    ],
    [getCommonEditTextFieldProps],
  );

  const shareHandle = (code) => {
    navigator.clipboard.writeText(`${props.shareLink}/${code}`);
    Snackbar.open({ alertProps: { severity: 'success' }, message: '分享成功, 已複製到剪貼簿' });
  }

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

  const { data, isError, isFetching, isLoading, refetch: refetchShares } = useQuery({
    queryKey: [
      'pdfShares',
      //columnFilters, //refetch when globalFilter changes
      pagination.pageIndex, //refetch when pagination.pageIndex changes
      pagination.pageSize, //refetch when pagination.pageSize changes
      sorting, //refetch when sorting changes
    ],
    queryFn: async ({ pageParam = 0 }) => {
      const result = await graphQLClient.request(
        GET_PDF_SHARES,
        // variables are type-checked too!
        {
          projectId: Number(props.projectId),
          pdfId: props.pdfSharePdfId ? props.pdfSharePdfId : undefined,
          first: pagination.pageSize,
          skip: (pagination.pageIndex * pagination.pageSize),
          sortOrder: sorting?.[0]?.desc ? 'DESC' : 'ASC',
        },
      );
      const resultData = result?.pdfShares?.edges?.map(x => ({
        id: x.node.id,
        expiredTime: x.node.expiredTime,
        code: x.node.code,
        remark: x.node.remark,
      })) || [];
      const totalCount = result?.pdfShares?.totalCount;
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

  useEffect(()=>{
    if (props.open) refetchShares();
  },[props.open]);

  const [pdfShareGenerate, { data: pdfShareGenerateData, loading: pdfShareGenerateLoading }] = useMutation(PDFShareGenerate, {
    onCompleted: data => {
      const userErrors = data?.pdfShareGenerate?.userErrors;
      if (userErrors.length > 0) {
        Snackbar.open({ alertProps: { severity: 'error' }, title: '新增失敗', message: userErrors.map(v => v.message) });
      } else {
        Snackbar.open({ alertProps: { severity: 'success' }, message: '新增成功' });
      }
    },
    onError: error => {
      console.error(error);
      Snackbar.open({ alertProps: { severity: 'error' }, title: '新增失敗', message: error.graphQLErrors.length ? error.graphQLErrors.map(v => v.message) : '新增失敗' });
    },
  });

  const [pdfShareDisable, { data: PDFShareDisableData, loading: PDFShareDisableLoading }] = useMutation(PDFShareDisable, {
    onCompleted: data => {
      const userErrors = data?.pdfShareDisable?.userErrors;
      if (userErrors.length > 0) {
        Snackbar.open({ alertProps: { severity: 'error' }, title: '刪除失敗', message: userErrors.map(v => v.message) });
      } else {
        Snackbar.open({ alertProps: { severity: 'success' }, message: '刪除成功' });
      }
    },
    onError: error => {
      console.error(error);
      Snackbar.open({ alertProps: { severity: 'error' }, title: '刪除失敗', message: error.graphQLErrors.length ? error.graphQLErrors.map(v => v.message) : '刪除失敗' });
    },
  });

  const handleCreateNewRow = async(values) => {
    const result = await pdfShareGenerate({
      variables: {
        data: {
          remark: values?.remark,
          expiredDate: values?.expiredTime,
          pdfId: props.pdfSharePdfId,
        }
      }
    });
    if (!result?.data?.pdfShareGenerate?.userErrors.length) {
      refetchShares();
    }
  };

  const handleDeleteRow = useCallback(
    async(row) => {
      if (
        !window.confirm(`確定要刪除 ${row.getValue('remark')}?`)
      ) {
        return;
      }
      const result = await pdfShareDisable({
        variables: {
          data: {
            id: row.original.id,
          }
        }
      });
      if (!result?.data?.pdfShareDisable?.userErrors.length) {
        refetchShares();
      }
    },
    //[tableData],
  );

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
          displayColumnDefOptions={{
            'mrt-row-actions': {
              muiTableHeadCellProps: {
                align: 'center',
              },
              size: 30,
            },
          }}
          columns={columns}
          data={data?.data ?? []} //data is undefined on first render
          initialState={{
            isFullScreen: false,
            density: 'compact',
            columnOrder: [
              'remark',
              'expiredTime',
              'share',
              'mrt-row-actions',
            ],
          }}
          editingMode="modal"
          enableEditing
          onPaginationChange={setPagination}
          rowCount={rowCount}
          manualPagination
          manualSorting
          renderRowActions={({ row, table }) => (
            <Box sx={{ display: 'flex', gap: '1rem' }}>
              <Tooltip arrow placement="right" title="Delete">
                <IconButton color="error" onClick={() => handleDeleteRow(row)}>
                  <Delete />
                </IconButton>
              </Tooltip>
            </Box>
          )}
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
          renderTopToolbarCustomActions={() => (
            <>
              <Button
                //color="secondary"
                onClick={() => setCreateModalOpen(true)}
                variant="contained"
              >
                新增
              </Button>
            </>
          )}
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
        <CreateNewAccountModal
          columns={columns}
          open={createModalOpen}
          onClose={() => setCreateModalOpen(false)}
          onSubmit={handleCreateNewRow}
        />
      </Box>
    </Modal>
  )
}

export const CreateNewAccountModal = ({ open, columns, onClose, onSubmit }) => {
  const [values, setValues] = useState(() =>
    columns.reduce((acc, column) => {
      if (column.accessorKey === 'share') return acc;
      acc[column.accessorKey ?? ''] = '';
      return acc;
    }, {}),
  );

  const handleSubmit = () => {
    //put your validation logic here
    let isError = false;
    Object.entries(values).forEach(([key, value]) => {
      if (!value) isError = true;
    });
    if (isError) return;
    onSubmit(values);
    onClose();
  };

  const handleDateChange = (name, e) => {
    setValues((prev) => ({ ...prev, [name]: e }));
  };

  return (
    <Dialog open={open}>
      <DialogTitle textAlign="center">Add Share</DialogTitle>
      <DialogContent>
        <form onSubmit={(e) => e.preventDefault()}>
          <Stack
            sx={{
              width: '100%',
              minWidth: { xs: '300px', sm: '360px', md: '400px' },
              gap: '1.5rem',
            }}
          >
            {columns.filter(e=>e.accessorKey !== 'share').map((column) => (
              column.accessorKey === 'expiredTime' ?
              <LocalizationProvider
                key={`local_${column.accessorKey}`}
                dateAdapter={AdapterMoment}>
                <Input
                  type="date"
                  key={column.accessorKey}
                  format="YYYY-MM-DD"
                  label="Expired Date"
                  name={column.accessorKey}
                  value={values[column.accessorKey]}
                  onChange={(e) => handleDateChange(column.accessorKey, e.target.value)}
                  minDate={moment()}
                  InputProps={{
                    style: {
                      fontSize: 16,
                    }
                  }}
                  slotProps={{ textField: { variant: 'outlined' } }}
                />
              </LocalizationProvider>
              :
              <TextField
                key={column.accessorKey}
                label={column.header}
                name={column.accessorKey}
                onChange={(e) =>
                  setValues({ ...values, [e.target.name]: e.target.value })
                }
                InputProps={{
                  style: {
                    fontSize: 16,
                  }
                }}
              />
            ))}
          </Stack>
        </form>
      </DialogContent>
      <DialogActions sx={{ p: '1.25rem' }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          //color="secondary"
          onClick={handleSubmit} variant="contained">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const validateRequired = (value) => !!value.length;

export default PDFShareModal;