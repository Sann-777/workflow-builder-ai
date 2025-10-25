import React from 'react'
import { Paper, Typography, Box, Card, CardContent } from '@mui/material'
import { PlayArrow, Settings, AccountTree, Flag } from '@mui/icons-material'

const nodeTypes = [
  { type: 'start', label: 'Start', icon: <Flag />, color: '#4caf50' },
  { type: 'end', label: 'End', icon: <Flag />, color: '#f44336' },
  { type: 'process', label: 'Process', icon: <Settings />, color: '#2196f3' },
  { type: 'decision', label: 'Decision', icon: <AccountTree />, color: '#ff9800' },
]

const Sidebar = () => {
  const onDragStart = (event, nodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType)
    event.dataTransfer.effectAllowed = 'move'
  }

  return (
    <Paper className="sidebar" elevation={2} sx={{ 
      width: 250,
      backgroundColor: '#fafafa',
      borderRight: '1px solid #e0e0e0',
      overflow: 'auto'
    }}>
      <Typography variant="h6" gutterBottom sx={{ p: 2, pb: 1, color: '#333' }}>
        Workflow Nodes
      </Typography>
      <Typography variant="body2" sx={{ px: 2, color: '#666', mb: 2 }}>
        Drag to canvas to add
      </Typography>
      
      <Box sx={{ p: 1 }}>
        {nodeTypes.map((nodeType) => (
          <Card
            key={nodeType.type}
            className="draggable-node"
            onDragStart={(event) => onDragStart(event, nodeType.type)}
            draggable
            sx={{
              m: 1,
              cursor: 'grab',
              transition: 'all 0.2s',
              border: `2px dashed ${nodeType.color}40`,
              backgroundColor: `${nodeType.color}10`,
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: 3,
                backgroundColor: `${nodeType.color}15`,
              },
              '&:active': {
                cursor: 'grabbing',
              }
            }}
          >
            <CardContent sx={{ textAlign: 'center', p: 2, '&:last-child': { pb: 2 } }}>
              <Box sx={{ color: nodeType.color, mb: 1 }}>
                {nodeType.icon}
              </Box>
              <Typography variant="body2" fontWeight="bold" sx={{ color: nodeType.color }}>
                {nodeType.label}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>

      <Box sx={{ p: 2, mt: 2 }}>
        <Typography variant="body2" color="text.secondary">
          <strong>Instructions:</strong>
          <br />
          • Drag nodes to canvas
          <br />
          • Connect nodes from handles
          <br />
          • Click nodes to edit properties
          <br />
          • Hover for actions
        </Typography>
      </Box>
    </Paper>
  )
}

export default Sidebar
