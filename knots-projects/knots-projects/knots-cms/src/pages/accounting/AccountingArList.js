import React from 'react';
import { Box, Typography, Card, CircularProgress, Chip } from '@mui/material';
import BackupTableIcon from '@mui/icons-material/BackupTable';
import { gql, useQuery } from '@apollo/client';
import { DataGrid } from '@mui/x-data-grid';

const GET_AR_LIST = gql`
  query getArList {
    projectInvoices(pagination: { limit: 1000, offset: 0 }) {
      invoices {
        id
        invId
        project
        date
        totalAmount
        balance
        settlement
      }
    }
  }
`;

export default function AccountingArList() {
  const { data, loading, error } = useQuery(GET_AR_LIST, {
    fetchPolicy: "network-only"
  });

  if (loading) return <Box sx={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center' }}><CircularProgress /></Box>;
  if (error) return <Typography color="error">無法載入應收清單數據</Typography>;

  // Filter out fully settled invoices to only show Accounts Receivable
  const rows = data?.projectInvoices?.invoices?.filter(inv => !inv.settlement) || [];

  const columns = [
    { field: 'invId', headerName: '發票號碼', width: 180 },
    { field: 'date', headerName: '開立日期', width: 140 },
    { field: 'project', headerName: '關聯專案/業主', width: 300 },
    { 
      field: 'totalAmount', 
      headerName: '應收總額', 
      width: 150,
      renderCell: (params) => <Typography>$ {params.value ? params.value.toLocaleString() : 0}</Typography>
    },
    { 
      field: 'balance', 
      headerName: '未收欠款 (Balance)', 
      width: 180,
      renderCell: (params) => (
        <Typography sx={{ fontWeight: 'bold', color: '#d32f2f' }}>
          $ {params.value ? params.value.toLocaleString() : 0}
        </Typography>
      )
    },
    { 
      field: 'settlement', 
      headerName: '狀態', 
      width: 120,
      renderCell: () => <Chip label="未結清" color="warning" size="small" />
    },
  ];

  return (
    <Box sx={{ p: 4, pt: 6, height: '90vh', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 4, display: 'flex', alignItems: 'center', color: '#333' }}>
        <BackupTableIcon sx={{ mr: 2, fontSize: 36, color: '#1976d2' }} /> 應收帳款 (AR) 清單
      </Typography>

      <Card sx={{ flexGrow: 1, boxShadow: '0 8px 24px rgba(0,0,0,0.05)', borderRadius: 3, p: 2 }}>
        <DataGrid 
          rows={rows} 
          columns={columns} 
          pageSizeOptions={[10, 25, 50, 100]}
          initialState={{
            pagination: { paginationModel: { pageSize: 25 } },
          }}
          disableRowSelectionOnClick
          sx={{ border: 'none' }}
        />
      </Card>
    </Box>
  );
}
