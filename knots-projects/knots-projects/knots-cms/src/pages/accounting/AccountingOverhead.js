import React, { useState } from 'react';
import { Box, Typography, Card, CircularProgress, MenuItem, Select, FormControl, InputLabel } from '@mui/material';
import LayersIcon from '@mui/icons-material/Layers';
import { gql, useQuery } from '@apollo/client';
import { DataGrid } from '@mui/x-data-grid';

const GET_OVERHEAD_SUMMARY = gql`
  query getOverheadSummary($year: Int!) {
    overheadSummary(year: $year) {
      categoryName
      categoryTotal
      monthlyData {
        month
        totalAmount
      }
    }
  }
`;

export default function AccountingOverhead() {
  const [year, setYear] = useState(new Date().getFullYear());

  const { data, loading, error } = useQuery(GET_OVERHEAD_SUMMARY, {
    variables: { year },
    fetchPolicy: "network-only"
  });

  if (loading) return <Box sx={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center' }}><CircularProgress /></Box>;
  if (error) return <Typography color="error">無法載入營運開銷樞紐數據</Typography>;

  const responseData = data?.overheadSummary || [];

  // Transform Nested GraphQL structure to Flat Rows for DataGrid Match Grid
  const rows = responseData.map((category, index) => {
    let row = {
      id: index,
      categoryName: category.categoryName,
      categoryTotal: category.categoryTotal
    };
    category.monthlyData.forEach(m => {
      row[m.month] = m.totalAmount;
    });
    return row;
  });

  // Dynamically generate column headers based on month names
  const columns = [
    { field: 'categoryName', headerName: '費用科目', width: 200 },
    { 
      field: 'categoryTotal', 
      headerName: '全年度加總', 
      width: 150,
      renderCell: (params) => <Typography sx={{ fontWeight: 'bold' }}>$ {params.value.toLocaleString()}</Typography>
    },
    { field: 'Jan', headerName: '一月', width: 120, renderCell: (p) => `$ ${p.value || 0}` },
    { field: 'Feb', headerName: '二月', width: 120, renderCell: (p) => `$ ${p.value || 0}` },
    { field: 'Mar', headerName: '三月', width: 120, renderCell: (p) => `$ ${p.value || 0}` },
    { field: 'Apr', headerName: '四月', width: 120, renderCell: (p) => `$ ${p.value || 0}` },
    { field: 'May', headerName: '五月', width: 120, renderCell: (p) => `$ ${p.value || 0}` },
    { field: 'Jun', headerName: '六月', width: 120, renderCell: (p) => `$ ${p.value || 0}` },
    //... 截短以加速雛型展示
  ];

  return (
    <Box sx={{ p: 4, pt: 6, height: '90vh', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', color: '#333' }}>
          <LayersIcon sx={{ mr: 2, fontSize: 36, color: '#1976d2' }} /> 營運開銷矩陣 (Overhead)
        </Typography>
        
        <FormControl variant="outlined" size="small" sx={{ minWidth: 120 }}>
          <InputLabel>選擇年度</InputLabel>
          <Select value={year} onChange={(e) => setYear(e.target.value)} label="選擇年度">
            <MenuItem value={2026}>2026 年度</MenuItem>
            <MenuItem value={2027}>2027 年度</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Card sx={{ flexGrow: 1, boxShadow: '0 8px 24px rgba(0,0,0,0.05)', borderRadius: 3, p: 2 }}>
        <DataGrid 
          rows={rows} 
          columns={columns} 
          pageSizeOptions={[10, 25, 50]}
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
