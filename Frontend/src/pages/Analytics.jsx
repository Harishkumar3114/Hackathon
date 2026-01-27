import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Box, ThemeProvider, createTheme, CssBaseline, Container, Typography, Grid, Paper, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import { BarChart, TrendingUp, Mouse } from '@mui/icons-material';
import api from '../api/axios';

const spaceTheme = createTheme({
  palette: { mode: 'dark', background: { default: '#000000', paper: '#0a0a0a' }, primary: { main: '#22c55e' } },
});

const Analytics = () => {
  const { token } = useParams();
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      const res = await api.get(`/hub/edit/${token}`);
      setData(res.data);
    };
    fetchStats();
  }, [token]);

  if (!data) return <Typography color="primary" sx={{ p: 4 }}>Loading Analytics...</Typography>;

  return (
    <ThemeProvider theme={spaceTheme}>
      <CssBaseline />
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Typography variant="h3" fontWeight="900" color="primary" sx={{ mb: 4 }}>DASHBOARD</Typography>
        
        <Grid container spacing={3} sx={{ mb: 6 }}>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, border: '1px solid #22c55e33' }}>
              <TrendingUp color="primary" />
              <Typography variant="h6">Total Visits</Typography>
              <Typography variant="h3" fontWeight="bold">{data.hubSummary.totalVisits}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, border: '1px solid #1a1a1a' }}>
              <Mouse color="primary" />
              <Typography variant="h6">Total Clicks</Typography>
              <Typography variant="h3" fontWeight="bold">{data.hubSummary.totalClicks}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, border: '1px solid #1a1a1a' }}>
              <BarChart color="primary" />
              <Typography variant="h6">Top Performer</Typography>
              <Typography variant="body1" noWrap>{data.hubSummary.topPerformingLink || 'None'}</Typography>
            </Paper>
          </Grid>
        </Grid>

        <Table border={1} sx={{ borderColor: '#1a1a1a' }}>
          <TableHead sx={{ bgcolor: '#111' }}>
            <TableRow>
              <TableCell sx={{ color: '#22c55e', fontWeight: 'bold' }}>LINK LABEL</TableCell>
              <TableCell align="center" sx={{ color: '#22c55e', fontWeight: 'bold' }}>CTR (%)</TableCell>
              <TableCell align="right" sx={{ color: '#22c55e', fontWeight: 'bold' }}>STATUS</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.detailedAnalytics.map((link, i) => (
              <TableRow key={i}>
                <TableCell>{link.label}</TableCell>
                <TableCell align="center">{link.ctr}</TableCell>
                <TableCell align="right" sx={{ color: link.performance === 'High' ? '#22c55e' : 'gray' }}>
                  {link.performance}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Container>
    </ThemeProvider>
  );
};

export default Analytics;