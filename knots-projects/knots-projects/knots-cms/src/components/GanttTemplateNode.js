import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Box, Typography } from '@mui/material';

const handleStyle = { width: 8, height: 8, background: '#555' };

export default function TaskNode({ data }) {
  return (
    <Box sx={{
      padding: '10px 15px',
      borderRadius: '8px',
      background: '#2e2e2e',
      border: '1px solid #555',
      color: '#fff',
      minWidth: 150,
      textAlign: 'center',
      boxShadow: '0 4px 6px rgba(0,0,0,0.3)'
    }}>
      <Handle type="target" position={Position.Top} style={handleStyle} />
      <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
        {data.label || 'New Task'}
      </Typography>
      <Typography variant="caption" sx={{ color: '#aaa' }}>
        {data.duration || 1} Days
      </Typography>
      {data.parentName && (
        <Typography variant="caption" sx={{ display: 'block', color: '#ff9800', mt: 0.5 }}>
          Parent: {data.parentName}
        </Typography>
      )}
      <Handle type="source" position={Position.Bottom} style={handleStyle} />
    </Box>
  );
}
