import React, { useState, useEffect, useRef } from 'react'
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Box, Typography, LinearProgress, Paper, List, ListItem, ListItemText
} from '@mui/material'
import { PlayArrow, Stop } from '@mui/icons-material'
import { useDispatch } from 'react-redux'
import { setExecutingNode, addCompletedNode, clearExecutionState } from '../store/store'

const ExecutionDialog = ({ open, onClose, nodes = [], edges = [] }) => {
  const dispatch = useDispatch()
  const [log, setLog] = useState([])
  const [progress, setProgress] = useState(0)
  const [executing, setExecuting] = useState(false)
  const cancelRef = useRef(false)

  useEffect(() => {
    if (!open) {
      cancelRef.current = false
      setLog([])
      setProgress(0)
      setExecuting(false)
      dispatch(clearExecutionState())
    }
  }, [open, dispatch])

  const simulateExecution = async () => {
    if (nodes.length === 0) {
      alert('No nodes to execute. Please add nodes to the workflow first.')
      return
    }

    cancelRef.current = false
    setLog([{ text: '🚀 Starting workflow execution...', type: 'info' }])
    setProgress(0)
    setExecuting(true)

    // Find start node
    const startNode = nodes.find(node => 
      node.data?.nodeType === 'start' || node.data?.type === 'start'
    ) || nodes[0]
    
    if (!startNode) {
      setLog(prev => [...prev, { text: '❌ No start node found', type: 'error' }])
      setExecuting(false)
      return
    }

    // Build execution order using BFS
    const nodeMap = Object.fromEntries(nodes.map(n => [n.id, n]))
    const outgoing = {}
    edges.forEach(e => {
      outgoing[e.source] = outgoing[e.source] || []
      outgoing[e.source].push(e.target)
    })

    const visited = new Set()
    const executionOrder = []
    const queue = [startNode.id]

    while (queue.length > 0) {
      const nodeId = queue.shift()
      if (!nodeId || visited.has(nodeId)) continue
      
      visited.add(nodeId)
      executionOrder.push(nodeId)
      
      // Add connected nodes to queue
      const targets = outgoing[nodeId] || []
      targets.forEach(targetId => {
        if (!visited.has(targetId)) {
          queue.push(targetId)
        }
      })
    }

    // Execute nodes in order
    for (let i = 0; i < executionOrder.length; i++) {
      if (cancelRef.current) break

      const nodeId = executionOrder[i]
      const node = nodeMap[nodeId]
      const progressValue = Math.round(((i + 1) / executionOrder.length) * 100)

      // Set as executing
      dispatch(setExecutingNode(nodeId))
      setLog(prev => [...prev, { 
        text: `⚡ Executing: ${node.data.label || node.data.name} (${node.data.type || node.data.nodeType})`, 
        type: 'step' 
      }])
      setProgress(progressValue)

      // Simulate execution time
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Mark as completed
      dispatch(addCompletedNode(nodeId))
      dispatch(setExecutingNode(null))
    }

    if (!cancelRef.current) {
      setProgress(100)
      setLog(prev => [...prev, { text: '✅ Workflow execution completed successfully!', type: 'success' }])
      // Auto-close after completion
      setTimeout(() => {
        onClose()
      }, 1500)
    } else {
      setLog(prev => [...prev, { text: '❌ Execution cancelled by user', type: 'error' }])
    }

    setExecuting(false)
  }

  const handleCancel = () => {
    cancelRef.current = true
    setExecuting(false)
    onClose()
  }

  return (
    <Dialog open={open} onClose={handleCancel} fullWidth maxWidth="md">
      <DialogTitle>Workflow Execution</DialogTitle>
      <DialogContent>
        <Box mb={2}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
            <Typography variant="body2" fontWeight="bold">Progress</Typography>
            <Typography variant="body2" color="primary">{progress}%</Typography>
          </Box>
          <LinearProgress 
            variant="determinate" 
            value={progress} 
            sx={{ 
              height: 8, 
              borderRadius: 4,
              backgroundColor: '#e0e0e0',
              '& .MuiLinearProgress-bar': {
                borderRadius: 4,
                backgroundColor: executing ? '#2196f3' : '#4caf50',
              }
            }}
          />
        </Box>

        <Paper variant="outlined" sx={{ maxHeight: 300, overflow: 'auto', p: 2, backgroundColor: '#fafafa' }}>
          <List dense>
            {log.map((entry, index) => (
              <ListItem 
                key={index}
                sx={{
                  borderLeft: entry.type === 'success' ? '3px solid #4caf50' : 
                              entry.type === 'error' ? '3px solid #f44336' : 
                              entry.type === 'info' ? '3px solid #2196f3' : '3px solid #ff9800',
                  backgroundColor: 'white',
                  mb: 1,
                  borderRadius: 1,
                  pl: 2,
                }}
              >
                <ListItemText
                  primary={entry.text}
                  primaryTypographyProps={{
                    style: {
                      fontFamily: 'monospace',
                      fontSize: '0.9rem',
                    }
                  }}
                />
              </ListItem>
            ))}
            {log.length === 0 && (
              <Box textAlign="center" py={4}>
                <Typography variant="body2" color="textSecondary">
                  Click "Start Execution" to begin workflow execution
                </Typography>
              </Box>
            )}
          </List>
        </Paper>
      </DialogContent>
      <DialogActions>
        <Button
          startIcon={<PlayArrow />}
          onClick={simulateExecution}
          variant="contained"
          disabled={executing || nodes.length === 0}
        >
          {executing ? 'Running...' : 'Start Execution'}
        </Button>
        <Button
          startIcon={<Stop />}
          onClick={handleCancel}
          variant="outlined"
          color="error"
          disabled={!executing}
        >
          Cancel
        </Button>
        <Button onClick={handleCancel}>Close</Button>
      </DialogActions>
    </Dialog>
  )
}

export default ExecutionDialog
