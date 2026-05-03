import React from 'react';
import { Box, Typography, Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { useQuery } from '@apollo/client';
import { GET_GANTT_TEMPLATES } from '../apollo/queries';
import { useNavigate } from 'react-router-dom';

export default function GanttTemplateList() {
  const { data, loading, error } = useQuery(GET_GANTT_TEMPLATES, { variables: { skip: 0, first: 100 } });
  const navigate = useNavigate();

  const templates = data?.ganttTemplates?.edges?.map(e => e.node) || [];

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" gutterBottom>Gantt Templates</Typography>
        <Button variant="contained" color="primary" onClick={() => navigate('/cms/gantt_template/new')}>
          + New Template
        </Button>
      </Box>
      
      {loading ? <Typography>Loading...</Typography> : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Type</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {templates.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">No templates found.</TableCell>
                </TableRow>
              ) : templates.map((template) => (
                <TableRow key={template.id}>
                  <TableCell>{template.id}</TableCell>
                  <TableCell>{template.name}</TableCell>
                  <TableCell>{template.type}</TableCell>
                  <TableCell align="right">
                    <Button variant="outlined" size="small" onClick={() => navigate(`/cms/gantt_template/${template.id}`)}>
                      Edit Editor
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
