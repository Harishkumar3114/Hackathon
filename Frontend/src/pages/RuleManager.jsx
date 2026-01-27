import React from 'react';
import { Box, Typography, TextField, MenuItem, Stack, IconButton, Paper } from '@mui/material';
import { Delete } from '@mui/icons-material';
import { COUNTRIES, HOURS } from '../utils/constants';

const RuleManager = ({ rules, onUpdate, onRemove, onAdd }) => {
  return (
    <Box>
      <TextField 
        select 
        size="small" 
        label="Add Intelligent Rule" 
        value="" 
        sx={{ width: 220, mb: 3 }}
        onChange={(e) => onAdd(e.target.value)}
      >
        <MenuItem value="location">Location-based Rule</MenuItem>
        <MenuItem value="time">Time-based Rule</MenuItem>
        <MenuItem value="device">Device-based Rule</MenuItem>
      </TextField>

      <Stack direction="row" flexWrap="wrap" gap={2}>
        {rules.map((rule, rIdx) => (
          <Paper 
            key={rIdx} 
            sx={{ 
              p: 2, 
              bgcolor: '#000', 
              border: '1px solid #22c55e33', 
              borderRadius: 2, 
              minWidth: 200,
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
              <Typography variant="caption" color="primary" sx={{ fontWeight: 800, textTransform: 'uppercase' }}>
                {rule.type}
              </Typography>
              <IconButton 
                size="small" 
                onClick={() => onRemove(rIdx)} 
                sx={{ color: '#404040', '&:hover': { color: '#ef4444' } }}
              >
                <Delete sx={{ fontSize: 18 }} />
              </IconButton>
            </Stack>

            <Box sx={{ flexGrow: 1 }}>
              {rule.type === 'location' && (
                <TextField 
                  select 
                  size="small" 
                  variant="standard" 
                  fullWidth 
                  value={rule.config.allowedCountry}
                  onChange={(e) => onUpdate(rIdx, 'allowedCountry', e.target.value)}
                >
                  {COUNTRIES.map(c => <MenuItem key={c.value} value={c.value}>{c.label}</MenuItem>)}
                </TextField>
              )}

              {rule.type === 'device' && (
                <TextField 
                  select 
                  size="small" 
                  variant="standard" 
                  fullWidth 
                  value={rule.config.allowedDevice}
                  onChange={(e) => onUpdate(rIdx, 'allowedDevice', e.target.value)}
                >
                  <MenuItem value="mobile">Mobile</MenuItem>
                  <MenuItem value="desktop">Desktop</MenuItem>
                </TextField>
              )}

              {rule.type === 'time' && (
                <Stack spacing={1}>
                  <TextField 
                    select size="small" label="Start" variant="standard" value={rule.config.startHour}
                    onChange={(e) => onUpdate(rIdx, 'startHour', parseInt(e.target.value))}
                  >
                    {HOURS.map(h => <MenuItem key={h.value} value={h.value}>{h.label}</MenuItem>)}
                  </TextField>
                  <TextField 
                    select size="small" label="End" variant="standard" value={rule.config.endHour}
                    onChange={(e) => onUpdate(rIdx, 'endHour', parseInt(e.target.value))}
                  >
                    {HOURS.map(h => <MenuItem key={h.value} value={h.value}>{h.label}</MenuItem>)}
                  </TextField>
                </Stack>
              )}
            </Box>
          </Paper>
        ))}
      </Stack>
    </Box>
  );
};

export default RuleManager;