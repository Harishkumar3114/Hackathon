import React, { useState } from 'react';
import { 
  Box, ThemeProvider, createTheme, CssBaseline, Container, Typography, 
  TextField, Button, Paper, MenuItem, IconButton, Divider, Stack, Dialog 
} from '@mui/material';
import { Add, Delete, RocketLaunch, Warning, Hub, Link as LinkIcon, Speed } from '@mui/icons-material';
import api from '../api/axios';
import { COUNTRIES, HOURS } from '../utils/constants';

// Mandatory Color Scheme: Black Background, Green Accents [cite: 60, 61]
const spaceTheme = createTheme({
  palette: {
    mode: 'dark',
    background: { default: '#000000', paper: '#0a0a0a' },
    primary: { main: '#22c55e' }, // The mandatory Green [cite: 61]
    text: { primary: '#ffffff' },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", sans-serif', // Formal typography [cite: 64]
  },
});

const Admin = () => {
  const [hubData, setHubData] = useState({ title: '', description: '' });
  const [links, setLinks] = useState([{ label: '', url: '', priority: 0, rules: [] }]);
  const [showPopup, setShowPopup] = useState(false);
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleAddLink = () => setLinks([...links, { label: '', url: '', priority: 0, rules: [] }]);

  const updateLink = (index, field, value) => {
    const newLinks = [...links];
    newLinks[index][field] = value;
    setLinks(newLinks);
  };

  const addRule = (index, type) => {
    const newLinks = [...links];
    let config = {};
    if (type === 'device') config = { allowedDevice: 'mobile' };
    if (type === 'location') config = { allowedCountry: 'IN' };
    if (type === 'time') config = { startHour: 9, endHour: 17 };
    newLinks[index].rules.push({ type, config });
    setLinks(newLinks);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const hubRes = await api.post('/hub/create', hubData);
      const token = hubRes.data.editToken;
      await api.put(`/hub/edit/${token}/sync`, { links });
      setResponse(hubRes.data);
      setShowPopup(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemeProvider theme={spaceTheme}>
      <CssBaseline />
      <Container maxWidth="md" sx={{ py: 8 }}>
        {/* Header - Problem Understanding [cite: 72] */}
        <Box sx={{ borderLeft: '4px solid #22c55e', pl: 3, mb: 6 }}>
          <Typography variant="h3" sx={{ fontWeight: 900, color: 'primary.main', letterSpacing: '-2px' }}>
            HUB INITIALIZATION
          </Typography>
          <Typography variant="overline" color="gray">ADVITIYA SPACE ODYSSEY • 2026 [cite: 2, 4]</Typography>
        </Box>

        {/* Section 1: Hub Identity [cite: 24] */}
        <Paper elevation={0} sx={{ p: 4, mb: 4, border: '1px solid #1a1a1a', borderRadius: 4 }}>
          <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 4 }}>
            <Hub color="primary" />
            <Typography variant="h6" fontWeight="bold">01 GLOBAL IDENTITY</Typography>
          </Stack>
          <Stack spacing={4}>
            <TextField 
              fullWidth label="HUB TITLE" variant="standard" 
              onChange={(e) => setHubData({...hubData, title: e.target.value})}
              InputProps={{ style: { fontSize: 24, fontWeight: 700 } }}
            />
            <TextField 
              fullWidth label="MISSION DESCRIPTION" multiline rows={2} variant="standard"
              onChange={(e) => setHubData({...hubData, description: e.target.value})}
            />
          </Stack>
        </Paper>

        {/* Section 2: Smart Links [cite: 28, 29] */}
        <Typography variant="h6" fontWeight="bold" sx={{ mb: 3, mt: 6, display: 'flex', alignItems: 'center', gap: 1 }}>
          <LinkIcon color="primary" /> 02 LINK INTELLIGENCE
        </Typography>

        {links.map((link, lIdx) => (
          <Paper key={lIdx} sx={{ p: 4, mb: 3, borderRadius: 4, border: '1px solid #1a1a1a', position: 'relative' }}>
            <Typography variant="caption" color="primary" fontWeight="bold">SUBLINK {lIdx + 1}</Typography>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} sx={{ mt: 2, mb: 3 }}>
              <TextField fullWidth label="Label" variant="outlined" onChange={(e) => updateLink(lIdx, 'label', e.target.value)} />
              <TextField fullWidth label="Destination URL" variant="outlined" onChange={(e) => updateLink(lIdx, 'url', e.target.value)} />
            </Stack>

            {/* Rules UI [cite: 29] */}
            <Box>
              <TextField 
                select size="small" label="+ Add Rule" value="" sx={{ width: 200 }}
                onChange={(e) => addRule(lIdx, e.target.value)}
              >
                <MenuItem value="location">Location-based [cite: 32]</MenuItem>
                <MenuItem value="time">Time-based [cite: 30]</MenuItem>
                <MenuItem value="device">Device-based [cite: 31]</MenuItem>
              </TextField>

              <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                {link.rules.map((rule, rIdx) => (
                  <Box key={rIdx} sx={{ p: 2, bgcolor: '#000', border: '1px solid #22c55e33', borderRadius: 2 }}>
                    <Typography variant="caption" color="primary" sx={{ display: 'block', mb: 1, fontWeight: 800 }}>
                      {rule.type.toUpperCase()}
                    </Typography>
                    {rule.type === 'location' && (
                      <TextField select size="small" variant="standard" value={rule.config.allowedCountry} sx={{ minWidth: 120 }}>
                        {COUNTRIES.map(c => <MenuItem key={c.value} value={c.value}>{c.label}</MenuItem>)}
                      </TextField>
                    )}
                    {rule.type === 'device' && (
                      <TextField select size="small" variant="standard" value={rule.config.allowedDevice} sx={{ minWidth: 120 }}>
                        <MenuItem value="mobile">Mobile</MenuItem>
                        <MenuItem value="desktop">Desktop</MenuItem>
                      </TextField>
                    )}
                  </Box>
                ))}
              </Box>
            </Box>
          </Paper>
        ))}

        <Button 
          fullWidth variant="outlined" sx={{ py: 2, borderStyle: 'dashed' }} 
          onClick={handleAddLink}
        >
          + Append Intelligent Sublink
        </Button>

        <Button 
          fullWidth variant="contained" size="large" color="primary"
          startIcon={<RocketLaunch />}
          sx={{ mt: 6, py: 2, borderRadius: 10, fontWeight: 900 }}
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? 'Transmitting...' : 'Register Hub & Generate Odyssey'}
        </Button>

        {/* Success Popup - UI/UX Requirement [cite: 62] */}
        <Dialog open={showPopup} PaperProps={{ sx: { bgcolor: '#0a0a0a', border: '1px solid #22c55e', borderRadius: 6, p: 3 } }}>
          <Box sx={{ textAlign: 'center' }}>
            <Speed sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
            <Typography variant="h5" fontWeight="black" color="primary">MISSION SUCCESS</Typography>
            <Typography variant="body2" sx={{ color: 'gray', mb: 4 }}>Access credentials generated. Token loss is permanent. [cite: 108]</Typography>
            
            <Stack spacing={3} textAlign="left">
              <Box>
                <Typography variant="caption" fontWeight="bold">PUBLIC URL</Typography>
                <Paper sx={{ p: 2, bgcolor: '#000', mt: 1 }}>
                  <Typography variant="body2" color="primary" sx={{ fontFamily: 'monospace' }}>
                    {window.location.origin}/{response?.slug}
                  </Typography>
                </Paper>
              </Box>
              <Box>
                <Typography variant="caption" fontWeight="bold">EDITOR TOKEN (KEEP SAFE)</Typography>
                <Paper sx={{ p: 2, bgcolor: '#000', mt: 1, border: '1px dashed #22c55e' }}>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>
                    {response?.editToken}
                  </Typography>
                </Paper>
              </Box>
              <Button variant="contained" fullWidth onClick={() => window.location.reload()}>
                I Have Stored These Safely
              </Button>
            </Stack>
          </Box>
        </Dialog>
      </Container>
    </ThemeProvider>
  );
};

export default Admin;