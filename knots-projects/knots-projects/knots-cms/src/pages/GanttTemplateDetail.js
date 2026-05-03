import React, { useCallback, useState, useEffect, useMemo } from 'react';
import { Box, Typography, Button, TextField, Drawer, Select, MenuItem, InputLabel, FormControl, IconButton } from '@mui/material';
import { ReactFlow, MiniMap, Controls, Background, useNodesState, useEdgesState, addEdge, applyNodeChanges, applyEdgeChanges } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client';
import { GET_GANTT_TEMPLATES } from '../apollo/queries';
import { CREATE_GANTT_TEMPLATE, UPDATE_GANTT_TEMPLATE } from '../apollo/mutations';
import TaskNode from '../components/GanttTemplateNode';
import CloseIcon from '@mui/icons-material/Close';

const initialNodes = [
  { id: 'node-1', type: 'task', position: { x: 250, y: 100 }, data: { label: 'New Task', duration: 1, parentId: null } },
];
const initialEdges = [];

export default function GanttTemplateDetail() {
  const { templateId } = useParams();
  const navigate = useNavigate();
  const isNew = templateId === 'new';

  const nodeTypes = useMemo(() => ({ task: TaskNode }), []);

  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);
  const [templateName, setTemplateName] = useState('New Gantt Template');
  const [selectedNode, setSelectedNode] = useState(null);

  // Queries & Mutations (Assuming we load if not new, we will skip fetching for now to build UI)
  const [createTemplate] = useMutation(CREATE_GANTT_TEMPLATE);
  const [updateTemplate] = useMutation(UPDATE_GANTT_TEMPLATE);

  const onNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );
  const onEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );
  const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), []);

  const onNodeClick = (event, node) => {
    setSelectedNode(node);
  };

  const onPaneClick = () => {
    setSelectedNode(null);
  };

  const handleAddNode = () => {
    const newNode = {
      id: `node-${Date.now()}`,
      type: 'task',
      position: { x: Math.random() * 200 + 100, y: Math.random() * 200 + 100 },
      data: { label: 'New Task', duration: 1, parentId: null },
    };
    setNodes((nds) => nds.concat(newNode));
  };

  const handleSave = async () => {
    const data = {
      name: templateName,
      type: 'general',
      nodes: JSON.stringify(nodes),
      edges: JSON.stringify(edges)
    };

    try {
      if (isNew) {
        await createTemplate({ variables: { data } });
        alert('Saved successfully!');
        navigate('/cms/gantt_templates');
      } else {
        data.id = templateId;
        await updateTemplate({ variables: { data } });
        alert('Updated successfully!');
      }
    } catch (e) {
      console.error(e);
      alert('Failed to save (Ensure Backend is running).');
    }
  };

  // Node Property Update
  const updateSelectedNodeData = (field, value) => {
    setNodes((nds) =>
      nds.map((n) => {
        if (n.id === selectedNode.id) {
          const newData = { ...n.data, [field]: value };
          
          // update parentName for visual display if parentId changes
          if (field === 'parentId') {
            const parent = nds.find(p => p.id === value);
            newData.parentName = parent ? parent.data.label : null;
          }

          n.data = newData;
          setSelectedNode(n); // update local state
        }
        return n;
      })
    );
  };

  return (
    <Box sx={{ display: 'flex', height: 'calc(100vh - 64px)', width: '100%', overflow: 'hidden' }}>
      
      {/* Main Flow Editor */}
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', borderBottom: '1px solid #ddd' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <TextField 
              size="small" 
              value={templateName} 
              onChange={(e) => setTemplateName(e.target.value)} 
              label="Template Name"
            />
            <Button variant="outlined" onClick={handleAddNode}>Add Task Node</Button>
          </Box>
          <Button variant="contained" color="primary" onClick={handleSave}>Save Template</Button>
        </Box>
        <Box sx={{ flexGrow: 1, position: 'relative' }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            colorMode="dark"
            fitView
          >
            <Controls />
            <MiniMap />
            <Background variant="dots" gap={12} size={1} />
          </ReactFlow>
        </Box>
      </Box>

      {/* Property Sidebar */}
      {selectedNode && (
        <Box sx={{ width: 300, borderLeft: '1px solid #ddd', backgroundColor: '#fafafa', p: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Node Properties</Typography>
            <IconButton onClick={() => setSelectedNode(null)} size="small"><CloseIcon /></IconButton>
          </Box>

          <TextField
            fullWidth
            label="Task Name"
            value={selectedNode.data.label}
            onChange={(e) => updateSelectedNodeData('label', e.target.value)}
          />

          <TextField
            fullWidth
            type="number"
            label="Duration (Days)"
            value={selectedNode.data.duration}
            onChange={(e) => updateSelectedNodeData('duration', parseInt(e.target.value) || 1)}
          />

          <FormControl fullWidth>
            <InputLabel>Parent Task (WBS)</InputLabel>
            <Select
              value={selectedNode.data.parentId || ''}
              label="Parent Task (WBS)"
              onChange={(e) => updateSelectedNodeData('parentId', e.target.value)}
            >
              <MenuItem value=""><em>None (Root)</em></MenuItem>
              {nodes.filter(n => n.id !== selectedNode.id).map(n => (
                <MenuItem key={n.id} value={n.id}>{n.data.label}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      )}
    </Box>
  );
}
