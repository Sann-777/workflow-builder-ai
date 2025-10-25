import React, { useState } from 'react'
import { getBezierPath, EdgeLabelRenderer, BaseEdge } from 'reactflow'
import { IconButton } from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import { useDispatch, useSelector } from 'react-redux'
import { setEdges } from '../store/store'

export default function CustomEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
}) {
  const dispatch = useDispatch()
  const edges = useSelector(s => s.workflow.edges)
  const [isHovered, setIsHovered] = useState(false)
  
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  })

  const handleDelete = (e) => {
    e.stopPropagation()
    dispatch(setEdges(edges.filter((edge) => edge.id !== id)))
  }

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          strokeWidth: isHovered ? 4 : 3,
          stroke: isHovered ? '#f44336' : '#555',
          transition: 'all 0.2s ease',
        }}
      />
      <path
        d={edgePath}
        fill="none"
        strokeWidth={30}
        stroke="transparent"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{ cursor: 'pointer' }}
      />
      <EdgeLabelRenderer>
        {isHovered && (
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: 'all',
            }}
            className="nodrag nopan"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <IconButton
              size="small"
              onClick={handleDelete}
              sx={{
                backgroundColor: 'white',
                border: '2px solid #f44336',
                padding: '4px',
                '&:hover': {
                  backgroundColor: '#ffebee',
                  transform: 'scale(1.1)',
                },
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              }}
              title="Delete connection"
            >
              <DeleteIcon fontSize="small" style={{ color: '#f44336' }} />
            </IconButton>
          </div>
        )}
      </EdgeLabelRenderer>
    </>
  )
}
