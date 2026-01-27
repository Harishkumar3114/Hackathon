import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, ThemeProvider, createTheme, CssBaseline, Container, Typography, 
  Grid, Paper, Table, TableBody, TableCell, TableHead, TableRow, Stack, 
  TableContainer, CircularProgress, IconButton, Button
} from '@mui/material';
import { ShowChart, Mouse, Public, Assessment, ArrowBack } from '@mui/icons-material';
import api from '../api/axios';

const spaceTheme = createTheme({
  palette: {
    mode: 'dark',
    background: { default: '#000000', paper: '#0a0a0a' },
    primary: { main: '#22c55e' }, 
    text: { primary: '#ffffff' },
  },
  typography: { fontFamily: '"Inter", sans-serif' },
});

const Analytics = () => {
  const { editToken } = useParams(); // Using editToken from URL
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        // Calling your working endpoint
        const res = await api.get(`/hub/edit/${editToken}`);
        setData(res.data);
      } catch (err) {
        console.error("❌ Intelligence fetch failed:", err);
      } finally {
        setLoading(false);
      }
    };
    if (editToken) fetchAnalytics();
  }, [editToken]);

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#000' }}>
        <CircularProgress color="primary" />
      </Box>
    );
  }

  if (!data) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', bgcolor: '#000' }}>
        <Typography color="error" mb={2}>Failed to load hub intelligence.</Typography>
        <Button variant="outlined" onClick={() => navigate(-1)}>Go Back</Button>
      </Box>
    );
  }

  // Logic to calculate Top Performer locally from the array
  const topLink = data.detailedAnalytics?.length > 0 
    ? [...data.detailedAnalytics].sort((a, b) => b.totalClicks - a.totalClicks)[0]
    : null;

  return (
    <ThemeProvider theme={spaceTheme}>
      <CssBaseline />
      <Box sx={{ 
        minHeight: '100vh', 
        width: '98vw',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: { xs: 'flex-start', md: 'center' }, 
        bgcolor: 'background.default',
        py: { xs: 4, md: 6 } 
      }}>
        <Container maxWidth="lg">
          
          {/* Header Section */}
          <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 6 }}>
             <IconButton onClick={() => navigate(-1)} sx={{ color: 'primary.main', border: '1px solid #1a1a1a' }}>
              <ArrowBack />
            </IconButton>
            <Box sx={{ borderLeft: '4px solid #22c55e', pl: 3 }}>
              <Typography variant="h4" sx={{ fontWeight: 900, color: 'primary.main', textTransform: 'uppercase' }}>
                Analytics Command
              </Typography>
              <Typography variant="body2" sx={{ color: 'gray' }}>
                Intelligence for: {data.hubSummary.title}
              </Typography>
            </Box>
          </Stack>

          {/* Grid for KPI Cards */}
          <Grid container spacing={3} sx={{ mb: 6 }}>
            <Grid item xs={12} sm={6} md={4}>
              <Paper variant="outlined" sx={{ p: 4, borderRadius: 4, border: '1px solid #1a1a1a' }}>
                <Stack direction="row" spacing={2} alignItems="center" mb={1}>
                  <ShowChart color="primary" />
                  <Typography variant="caption" color="gray" fontWeight="bold">TOTAL VISITS</Typography>
                </Stack>
                <Typography variant="h3" fontWeight="900">{data.hubSummary.totalVisits || 0}</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Paper variant="outlined" sx={{ p: 4, borderRadius: 4, border: '1px solid #1a1a1a' }}>
                <Stack direction="row" spacing={2} alignItems="center" mb={1}>
                  <Mouse color="primary" />
                  <Typography variant="caption" color="gray" fontWeight="bold">TOTAL CLICKS</Typography>
                </Stack>
                <Typography variant="h3" fontWeight="900">{data.hubSummary.totalClicks || 0}</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper variant="outlined" sx={{ p: 4, borderRadius: 4, bgcolor: '#0f1a12', border: '1px solid #22c55e' }}>
                <Stack direction="row" spacing={2} alignItems="center" mb={1}>
                  <Public color="primary" />
                  <Typography variant="caption" color="primary" fontWeight="bold">TOP PERFORMER</Typography>
                </Stack>
                <Typography variant="h5" fontWeight="bold" noWrap>
                  {topLink ? topLink.label : "N/A"}
                </Typography>
              </Paper>
            </Grid>
          </Grid>

          {/* Table for Structured Data Output */}
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 1 }}>
            <Assessment color="primary" /> Performance Tiers
          </Typography>
          
          <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 4, bgcolor: '#0a0a0a', border: '1px solid #1a1a1a' }}>
            <Table sx={{ minWidth: { xs: 500, md: '100%' } }}>
              <TableHead sx={{ bgcolor: '#111' }}>
                <TableRow>
                  <TableCell sx={{ color: 'primary.main', fontWeight: 'bold' }}>LABEL</TableCell>
                  <TableCell align="center" sx={{ color: 'primary.main', fontWeight: 'bold' }}>CLICKS</TableCell>
                  <TableCell align="center" sx={{ color: 'primary.main', fontWeight: 'bold' }}>CTR (%)</TableCell>
                  <TableCell align="right" sx={{ color: 'primary.main', fontWeight: 'bold' }}>STATUS</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.detailedAnalytics.map((link, idx) => (
                  <TableRow key={idx}>
                    <TableCell sx={{ fontWeight: 'bold' }}>{link.label}</TableCell>
                    <TableCell align="center">{link.totalClicks}</TableCell>
                    <TableCell align="center">{link.ctr}</TableCell>
                    <TableCell align="right">
                      <Box sx={{ 
                        display: 'inline-block', px: 2, py: 0.5, borderRadius: 10, fontSize: '0.7rem', fontWeight: 'bold',
                        border: '1px solid',
                        borderColor: link.performance === 'High' ? '#22c55e' : (link.performance === 'Average' ? '#3b82f6' : '#ef4444'),
                        color: link.performance === 'High' ? '#22c55e' : (link.performance === 'Average' ? '#3b82f6' : '#ef4444'),
                        textTransform: 'uppercase'
                      }}>
                        {link.performance}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default Analytics;