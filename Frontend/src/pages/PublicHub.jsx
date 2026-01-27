import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Box, ThemeProvider, createTheme, CssBaseline, Container, Typography, Button, Avatar, Stack } from '@mui/material';
import api from '../api/axios';

const spaceTheme = createTheme({
  palette: { mode: 'dark', background: { default: '#000000' }, primary: { main: '#22c55e' } },
});

const PublicHub = () => {
  const { slug } = useParams();
  const [hub, setHub] = useState(null);

  useEffect(() => {
    const loadHub = async () => {
      try {
        const res = await api.get(`/hub/${slug}`);
        setHub(res.data);
      } catch (e) { console.error("Invalid Slug"); }
    };
    loadHub();
  }, [slug]);

  const trackClick = async (id) => {
    await api.post(`/track/click/${id}`);
  };

  if (!hub) return <Box sx={{ bgcolor: 'black', h: '100vh' }} />;

  return (
    <ThemeProvider theme={spaceTheme}>
      <CssBaseline />
      <Container maxWidth="xs" sx={{ py: 10, textAlign: 'center' }}>
        <Avatar sx={{ bgcolor: 'primary.main', width: 80, height: 80, mx: 'auto', mb: 3, boxShadow: '0 0 20px #22c55e66' }}>
          {hub.title[0]}
        </Avatar>
        <Typography variant="h4" fontWeight="900" gutterBottom>{hub.title}</Typography>
        <Typography variant="body2" color="gray" sx={{ mb: 6 }}>{hub.description}</Typography>

        <Stack spacing={2.5}>
          {hub.links.map((link) => (
            <Button 
              key={link.id} 
              href={link.url} 
              target="_blank" 
              variant="outlined" 
              fullWidth
              onClick={() => trackClick(link.id)}
              sx={{ 
                py: 2, borderRadius: 8, borderWeight: 2, fontWeight: 'bold', fontSize: '1rem',
                '&:hover': { bgcolor: 'primary.main', color: 'black' } 
              }}
            >
              {link.label}
            </Button>
          ))}
        </Stack>

        <Typography variant="caption" color="#333" sx={{ mt: 10, display: 'block', letterSpacing: 4 }}>
          POWERED BY IPD INTELLIGENCE
        </Typography>
      </Container>
    </ThemeProvider>
  );
};

export default PublicHub;