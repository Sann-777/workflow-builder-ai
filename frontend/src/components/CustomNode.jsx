import React, { useState } from 'react'
import { Handle } from 'reactflow'
import { Card, CardContent, IconButton, Typography, Box } from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import { useDispatch, useSelector } from 'react-redux'
import { deleteNode } from '../store/store'

export default function CustomNode({ id, data }) {
  const dispatch = useDispatch()
  const [isHovered, setIsHovered] = useState(false)
  const nodeColor = data?.color || '#2196f3'
  
  const executingNodeId = useSelector(s => s.workflow.executingNodeId)
  const completedNodeIds = useSelector(s => s.workflow.completedNodeIds)
  
  const isExecuting = executingNodeId === id
  const isCompleted = completedNodeIds.includes(id)
  
  return (
    <Card 
      variant="outlined"
      className={`custom-node ${isExecuting ? 'executing-node' : ''} ${isCompleted ? 'completed-node' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ 
        minWidth: 180,
        borderColor: isExecuting ? '#2196f3' : isCompleted ? '#4caf50' : nodeColor,
        borderWidth: isExecuting ? 3 : 2,
        backgroundColor: isExecuting ? '#e3f2fd' : isCompleted ? '#e8f5e9' : `${nodeColor}15`,
        transition: 'all 0.3s ease',
        transform: isExecuting ? 'scale(1.05)' : 'scale(1)',
        boxShadow: isExecuting ? '0 0 20px rgba(33, 150, 243, 0.6)' : 
                   isCompleted ? '0 0 10px rgba(76, 175, 80, 0.4)' : 'none',
      }}
    >
      <CardContent style={{ padding: 12 }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={0.5}>
          <Box display="flex" alignItems="center" gap={0.5}>
            <Typography variant="subtitle2" fontWeight="bold" style={{ color: nodeColor }}>
              {data?.name || 'Node'}
            </Typography>
            {isCompleted && (
              <CheckCircleIcon 
                fontSize="small" 
                style={{ color: '#4caf50' }}
              />
            )}
            {isExecuting && (
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  backgroundColor: '#2196f3',
                  animation: 'pulse 1s ease-in-out infinite',
                }}
              />
            )}
          </Box>
          <Box 
            className="node-actions"
            display="flex" 
            gap={0.5}
            sx={{
              opacity: isHovered && !isExecuting ? 1 : 0,
              transition: 'opacity 0.2s ease',
              pointerEvents: isHovered && !isExecuting ? 'auto' : 'none',
            }}
          >
            <IconButton 
              size="small" 
              onClick={(e) => {
                e.stopPropagation()
                dispatch(deleteNode(id))
              }} 
              title="Delete node"
              sx={{ 
                padding: '2px',
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                '&:hover': {
                  backgroundColor: '#ffebee',
                  color: '#f44336',
                }
              }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
            <IconButton 
              size="small" 
              onClick={(e) => {
                e.stopPropagation()
                alert('Run single node not implemented')
              }} 
              title="Run node"
              sx={{ 
                padding: '2px',
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                '&:hover': {
                  backgroundColor: '#e3f2fd',
                  color: '#2196f3',
                }
              }}
            >
              <PlayArrowIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>
        {data?.description && (
          <Typography variant="caption" color="textSecondary" display="block">
            {data.description}
          </Typography>
        )}
        {data?.category && (
          <Typography variant="caption" style={{ 
            color: nodeColor, 
            fontWeight: 500,
            fontSize: '0.65rem'
          }}>
            {data.category}
          </Typography>
        )}
      </CardContent>
      
      {/* Input handles - different based on node type */}
      {data?.nodeType !== 'start' && (
        <>
          <Handle 
            type="target" 
            position="top" 
            id="input-top"
            style={{ 
              background: nodeColor,
              width: 12,
              height: 12,
              border: '2px solid white'
            }} 
          />
          <Handle 
            type="target" 
            position="left" 
            id="input-left"
            style={{ 
              background: nodeColor,
              width: 12,
              height: 12,
              border: '2px solid white'
            }} 
          />
        </>
      )}
      
      {/* Output handles - different based on node type */}
      {data?.nodeType !== 'end' && (
        <>
          <Handle 
            type="source" 
            position="bottom" 
            id="output-bottom"
            style={{ 
              background: nodeColor,
              width: 12,
              height: 12,
              border: '2px solid white'
            }} 
          />
          <Handle 
            type="source" 
            position="right" 
            id="output-right"
            style={{ 
              background: nodeColor,
              width: 12,
              height: 12,
              border: '2px solid white'
            }} 
          />
        </>
      )}
      
      {/* Decision nodes get two distinct output handles */}
      {data?.nodeType === 'decision' && (
        <Handle 
          type="source" 
          position="bottom" 
          id="output-yes"
          style={{ 
            background: '#4caf50',
            width: 12,
            height: 12,
            border: '2px solid white',
            left: '30%'
          }} 
        />
      )}
      {data?.nodeType === 'decision' && (
        <Handle 
          type="source" 
          position="bottom" 
          id="output-no"
          style={{ 
            background: '#f44336',
            width: 12,
            height: 12,
            border: '2px solid white',
            left: '70%'
          }} 
        />
      )}
    </Card>
  )
}
