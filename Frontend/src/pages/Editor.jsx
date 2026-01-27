import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Box, ThemeProvider, createTheme, CssBaseline, Container, Typography, 
  TextField, Button, Paper, MenuItem, Stack, IconButton, Chip 
} from '@mui/material';
import { Save, Add, Delete, Settings } from '@mui/icons-material';
import api from '../api/axios';
import { COUNTRIES, HOURS } from '../utils/constants';

const spaceTheme = createTheme({
  palette: { mode: 'dark', background: { default: '#000000', paper: '#0a0a0a' }, primary: { main: '#22c55e' } },
});

const Editor = () => {
  const { token } = useParams();
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchHub = async () => {
      const res = await api.get(`/hub/edit/${token}`);
      setLinks(res.data.links || []);
    };
    fetchHub();
  }, [token]);

  const saveChanges = async () => {
    setLoading(true);
    try {
      await api.put(`/hub/edit/${token}/sync`, { links });
      alert("Intelligence Synced.");
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const updateRule = (lIdx, rIdx, field, value) => {
    const newLinks = [...links];
    newLinks[lIdx].rules[rIdx].config[field] = value;
    setLinks(newLinks);
  };

  return (
    <ThemeProvider theme={spaceTheme}>
      <CssBaseline />
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
          <Typography variant="h4" fontWeight="900" color="primary">LINK EDITOR</Typography>
          <Button variant="contained" startIcon={<Save />} onClick={saveChanges} disabled={loading}>
            {loading ? 'SYNCING...' : 'SYNC CHANGES'}
          </Button>
        </Stack>

        {links.map((link, lIdx) => (
          <Paper key={lIdx} sx={{ p: 3, mb: 3, border: '1px solid #1a1a1a' }}>
            <Stack spacing={2}>
              <TextField fullWidth label="Label" value={link.label} variant="standard" 
                onChange={(e) => { const nl = [...links]; nl[lIdx].label = e.target.value; setLinks(nl); }} />
              <TextField fullWidth label="URL" value={link.url} variant="standard" 
                onChange={(e) => { const nl = [...links]; nl[lIdx].url = e.target.value; setLinks(nl); }} />
              
              <Box>
                <Typography variant="caption" color="gray" sx={{ display: 'block', mb: 1 }}>ACTIVE RULES</Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  {link.rules.map((rule, rIdx) => (
                    <Chip key={rIdx} label={`${rule.type}: ${Object.values(rule.config)[0]}`} 
                      onDelete={() => { const nl = [...links]; nl[lIdx].rules.splice(rIdx,1); setLinks(nl); }}
                      color="primary" variant="outlined" size="small" />
                  ))}
                </Stack>
              </Box>
            </Stack>
          </Paper>
        ))}
      </Container>
    </ThemeProvider>
  );
};

export default Editor;