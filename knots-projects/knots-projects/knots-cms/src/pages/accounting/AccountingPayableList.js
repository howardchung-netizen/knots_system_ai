import React from 'react';
import { Box, Typography, Card, CircularProgress, Chip } from '@mui/material';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import { gql, useQuery } from '@apollo/client';
import { DataGrid } from '@mui/x-data-grid';

const GET_AP_LIST = gql`
  query getApList {
    projectOrders(pagination: { limit: 1000, offset: 0 }) {
      orders {
        id
        realId
        supplier
        amount
        orderedDate
        settlement
        desc
      }
    }
  }
`;

export default function AccountingPayableList() {
  const { data, loading, error } = useQuery(GET_AP_LIST, {
    fetchPolicy: "network-only"
  });

  if (loading) return <Box sx={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center' }}><CircularProgress /></Box>;
  if (error) return <Typography color="error">無法載入應付清單數據</Typography>;

  // Filter out fully settled orders
  const rows = data?.projectOrders?.orders?.filter(order => !order.settlement) || [];

  const columns = [
    { field: 'realId', headerName: '訂單/憑證號', width: 150 },
    { field: 'orderedDate', headerName: '採購日期', width: 140 },
    { field: 'supplier', headerName: '供應商', width: 220 },
    { field: 'desc', headerName: '品項說明', width: 300 },
    { 
      field: 'amount', 
      headerName: '應付未拆總額 (Amount)', 
      width: 180,
      renderCell: (params) => (
        <Typography sx={{ fontWeight: 'bold', color: '#1976d2' }}>
          $ {params.value ? params.value.toLocaleString() : 0}
        </Typography>
      )
    },
    { 
      field: 'settlement', 
      headerName: '狀態', 
      width: 120,
      renderCell: () => <Chip label="未結清" color="error" size="small" />
    },
  ];

  return (
    <Box sx={{ p: 4, pt: 6, height: '90vh', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 4, display: 'flex', alignItems: 'center', color: '#333' }}>
        <FormatListNumberedIcon sx={{ mr: 2, fontSize: 36, color: '#1976d2' }} /> 應付帳款 (AP) 清單
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
