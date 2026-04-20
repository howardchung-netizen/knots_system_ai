import React from 'react';
import { Box, Typography, Card, CircularProgress, Chip } from '@mui/material';
import TableViewIcon from '@mui/icons-material/TableView';
import { gql, useQuery } from '@apollo/client';
import { DataGrid } from '@mui/x-data-grid';

const GET_PROJECTS_PROFIT = gql`
  query getProjectsProfit {
    projects {
      projects {
        id
        code
        case
        address
        grossProfit
        profitMargin
      }
    }
  }
`;

export default function AccountingMain() {
  const { data, loading, error } = useQuery(GET_PROJECTS_PROFIT, {
    fetchPolicy: "network-only"
  });

  if (loading) return <Box sx={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center' }}><CircularProgress /></Box>;
  if (error) return <Typography color="error">無法載入毛利表數據</Typography>;

  const rows = data?.projects?.projects || [];

  const columns = [
    { field: 'code', headerName: '專案編號', width: 150 },
    { field: 'case', headerName: '案件代號', width: 120 },
    { field: 'address', headerName: '專案地址及名稱', width: 300 },
    { 
      field: 'grossProfit', 
      headerName: '毛利 Gross Profit', 
      width: 180,
      renderCell: (params) => (
        <Typography sx={{ fontWeight: 'bold', color: params.value >= 0 ? '#2e7d32' : '#d32f2f' }}>
          $ {params.value ? params.value.toLocaleString() : 0}
        </Typography>
      )
    },
    { 
      field: 'profitMargin', 
      headerName: '利潤率 Margin %', 
      width: 150,
      renderCell: (params) => {
        const val = params.value || 0;
        let color = "default";
        if (val > 20) color = "success";
        else if (val > 0) color = "primary";
        else if (val < 0) color = "error";
        
        return <Chip label={`${val} %`} color={color} size="small" sx={{ fontWeight: 'bold' }} />;
      }
    },
  ];

  return (
    <Box sx={{ p: 4, pt: 6, height: '90vh', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 4, display: 'flex', alignItems: 'center', color: '#333' }}>
        <TableViewIcon sx={{ mr: 2, fontSize: 36, color: '#1976d2' }} /> 專案毛利總表 (MAIN)
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
