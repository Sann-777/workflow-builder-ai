import React, { useState } from 'react'
import { Box, IconButton, Paper, Typography, Collapse, Chip } from '@mui/material'
import { Visibility, VisibilityOff, PlayArrow, CheckCircle } from '@mui/icons-material'
import { useSelector } from 'react-redux'

const ExecutionMonitor = () => {
  const [isVisible, setIsVisible] = useState(true)
  const executingNodeId = useSelector(state => state.workflow.executingNodeId)
  const completedNodeIds = useSelector(state => state.workflow.completedNodeIds)
  const nodes = useSelector(state => state.workflow.nodes)

  const isExecuting = executingNodeId !== null
  const completedCount = completedNodeIds.length
  const totalCount = nodes.length

  const getExecutingNodeName = () => {
    if (!executingNodeId) return ''
    const node = nodes.find(n => n.id === executingNodeId)
    return node?.data?.label || node?.data?.name || 'Unknown Node'
  }

  return (
    <Paper
      elevation={3}
      sx={{
        position: 'fixed',
        right: 20,
        bottom: 20,
        zIndex: 1000,
        minWidth: isVisible ? 280 : 60,
        transition: 'all 0.3s ease',
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 1,
          backgroundColor: isExecuting ? '#e3f2fd' : completedCount > 0 ? '#e8f5e9' : '#f5f5f5',
          borderBottom: isVisible ? '1px solid #ddd' : 'none',
        }}
      >
        <Box display="flex" alignItems="center" gap={1}>
          {isExecuting ? (
            <PlayArrow sx={{ color: '#2196f3', fontSize: 20 }} />
          ) : completedCount > 0 ? (
            <CheckCircle sx={{ color: '#4caf50', fontSize: 20 }} />
          ) : null}
          
          {isVisible && (
            <Typography variant="body2" fontWeight="bold">
              Execution Monitor
            </Typography>
          )}
        </Box>
        
        <IconButton 
          size="small" 
          onClick={() => setIsVisible(!isVisible)}
          title={isVisible ? 'Hide Monitor' : 'Show Monitor'}
        >
          {isVisible ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
        </IconButton>
      </Box>
      
      <Collapse in={isVisible}>
        <Box p={2}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
            <Typography variant="caption" color="text.secondary">
              Status:
            </Typography>
            <Chip 
              label={isExecuting ? 'Executing' : completedCount > 0 ? 'Completed' : 'Ready'} 
              size="small"
              color={isExecuting ? 'primary' : completedCount > 0 ? 'success' : 'default'}
            />
          </Box>
          
          <Box mb={1}>
            <Typography variant="caption" display="block" color="text.secondary">
              Progress: {completedCount} / {totalCount} nodes
            </Typography>
          </Box>
          
          {isExecuting && (
            <Box mt={1}>
              <Typography variant="caption" fontWeight="bold" display="block">
                Currently Executing:
              </Typography>
              <Typography variant="caption" color="primary" display="block">
                {getExecutingNodeName()}
              </Typography>
            </Box>
          )}
          
          {completedCount > 0 && !isExecuting && (
            <Box mt={1}>
              <Chip 
                icon={<CheckCircle />}
                label={`${completedCount} nodes completed`}
                size="small"
                color="success"
                variant="outlined"
              />
            </Box>
          )}
        </Box>
      </Collapse>
    </Paper>
  )
}

export default ExecutionMonitor
