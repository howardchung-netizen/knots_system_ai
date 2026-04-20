import React from 'react';
import { Box, Card, Typography, Grid, CircularProgress } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import PaymentsIcon from '@mui/icons-material/Payments';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import { gql, useQuery } from '@apollo/client';

const GET_ACCOUNTING_DASHBOARD_STATS = gql`
  query getAccountingDashboardStats {
    accountingDashboardStats {
      totalArBalance
      totalApBalance
      bankBalance
      totalDebtGap
    }
  }
`;

export default function AccountingDashboard() {
  const { data, loading, error } = useQuery(GET_ACCOUNTING_DASHBOARD_STATS, {
    fetchPolicy: "network-only"
  });

  if (loading) return <Box sx={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center' }}><CircularProgress /></Box>;
  if (error) return <Typography color="error">無法載入儀表板數據</Typography>;

  const stats = data?.accountingDashboardStats || { totalArBalance: 0, totalApBalance: 0, bankBalance: 0, totalDebtGap: 0 };

  return (
    <Box sx={{ p: 4, pt: 6 }}>
      <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 4, display: 'flex', alignItems: 'center', color: '#333' }}>
        <DashboardIcon sx={{ mr: 2, fontSize: 36, color: '#1976d2' }} /> 財務生存導航 (Dashboard)
      </Typography>

      <Grid container spacing={4}>
        <Grid item xs={12} md={3}>
          <Card sx={{ p: 3, borderRadius: 3, boxShadow: '0 8px 24px rgba(0,0,0,0.05)', background: 'linear-gradient(135deg, #1976d2, #1565c0)', color: 'white' }}>
            <Typography variant="h6" sx={{ opacity: 0.9 }}>銀行資本 Bank Balance</Typography>
            <Typography variant="h3" sx={{ fontWeight: 'bold', mt: 2 }}>$ {stats.bankBalance.toLocaleString()}</Typography>
            <AccountBalanceIcon sx={{ fontSize: 48, opacity: 0.2, position: 'absolute', right: 20, top: 40 }}/>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Card sx={{ p: 3, borderRadius: 3, boxShadow: '0 8px 24px rgba(0,0,0,0.05)', bgcolor: '#fff', position: 'relative' }}>
            <Typography variant="h6" sx={{ color: '#666' }}>應收帳款 AR</Typography>
            <Typography variant="h3" sx={{ fontWeight: 'bold', mt: 2, color: '#2e7d32' }}>$ {stats.totalArBalance.toLocaleString()}</Typography>
            <Typography variant="body2" sx={{ color: '#999', mt: 1 }}>期待收回的收入總額</Typography>
            <AttachMoneyIcon sx={{ fontSize: 48, color: '#2e7d32', opacity: 0.2, position: 'absolute', right: 20, top: 40 }}/>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Card sx={{ p: 3, borderRadius: 3, boxShadow: '0 8px 24px rgba(0,0,0,0.05)', bgcolor: '#fff', position: 'relative' }}>
            <Typography variant="h6" sx={{ color: '#666' }}>應付帳款 AP</Typography>
            <Typography variant="h3" sx={{ fontWeight: 'bold', mt: 2, color: '#d32f2f' }}>$ {stats.totalApBalance.toLocaleString()}</Typography>
            <Typography variant="body2" sx={{ color: '#999', mt: 1 }}>尚未結清供應商尾款</Typography>
            <PaymentsIcon sx={{ fontSize: 48, color: '#d32f2f', opacity: 0.2, position: 'absolute', right: 20, top: 40 }}/>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card sx={{ p: 3, borderRadius: 3, boxShadow: '0 8px 24px rgba(0,0,0,0.05)', bgcolor: '#fff' }}>
            <Typography variant="h6" sx={{ color: '#666' }}>動態生存缺口 Debt Gap</Typography>
            <Typography variant="h3" sx={{ fontWeight: 'bold', mt: 2, color: stats.totalDebtGap >= 0 ? '#1976d2' : '#d32f2f' }}>
              $ {stats.totalDebtGap.toLocaleString()}
            </Typography>
            <Typography variant="body2" sx={{ color: '#999', mt: 1 }}>(銀行 + 應收) - 應付</Typography>
          </Card>
        </Grid>
      </Grid>
      
      {/* 可以在這裡加入額外的圖表 (Chart.js / Recharts) */}
      <Box sx={{ mt: 6, p: 4, bgcolor: '#fff', borderRadius: 3, boxShadow: '0 8px 24px rgba(0,0,0,0.05)' }}>
        <Typography variant="h6" sx={{ color: '#666', mb: 2 }}>未來三個月現金流預測</Typography>
        <Typography variant="body1" sx={{ color: '#aaa', fontStyle: 'italic' }}>
          * 等待後端排程引擎補足歷史資料點後解鎖。
        </Typography>
      </Box>
    </Box>
  );
}
