import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setNodes } from '../store/store'
import {
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Chip,
  Divider,
} from '@mui/material'
import { Edit, Category, Palette } from '@mui/icons-material'

const PropertyPanel = () => {
  const dispatch = useDispatch()
  const { nodes, selectedNode } = useSelector(state => state.workflow)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'general',
    color: '#2196f3',
  })

  useEffect(() => {
    if (selectedNode) {
      setFormData({
        name: selectedNode.data.name || selectedNode.data.label || '',
        description: selectedNode.data.description || '',
        category: selectedNode.data.category || 'general',
        color: selectedNode.data.color || '#2196f3',
      })
    }
  }, [selectedNode])

  const handleSave = () => {
    if (!selectedNode) return

    const updatedNodes = nodes.map(node =>
      node.id === selectedNode.id
        ? {
            ...node,
            data: {
              ...node.data,
              ...formData,
              label: formData.name || node.data.label,
            },
          }
        : node
    )

    dispatch(setNodes(updatedNodes))
  }

  const handleCancel = () => {
    if (selectedNode) {
      setFormData({
        name: selectedNode.data.name || selectedNode.data.label || '',
        description: selectedNode.data.description || '',
        category: selectedNode.data.category || 'general',
        color: selectedNode.data.color || '#2196f3',
      })
    }
  }

  const getNodeTypeInfo = (type) => {
    const types = {
      start: { label: 'Start Node', color: '#4caf50' },
      end: { label: 'End Node', color: '#f44336' },
      process: { label: 'Process Node', color: '#2196f3' },
      decision: { label: 'Decision Node', color: '#ff9800' }
    }
    return types[type] || { label: 'Node', color: '#666' }
  }

  if (!selectedNode) {
    return (
      <Paper 
        className="properties-panel" 
        elevation={2} 
        sx={{ 
          backgroundColor: '#fafafa',
          height: '100%',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <Box sx={{ 
          p: 3, 
          textAlign: 'center',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <Edit sx={{ fontSize: 48, color: '#ccc', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Node Properties
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Select a node to edit its properties
          </Typography>
        </Box>
      </Paper>
    )
  }

  const nodeTypeInfo = getNodeTypeInfo(selectedNode.data.type || selectedNode.data.nodeType)

  return (
    <Paper 
      className="properties-panel" 
      elevation={2} 
      sx={{ 
        backgroundColor: '#fafafa',
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <Box sx={{ 
        p: 2,
        flex: 1,
        overflow: 'auto',
      }}>
        <Box sx={{ mb: 2 }}>
          <Chip 
            label={nodeTypeInfo.label}
            sx={{ 
              backgroundColor: nodeTypeInfo.color,
              color: 'white',
              fontWeight: 'bold',
              mb: 1
            }}
          />
          <Typography variant="caption" display="block" sx={{ color: '#666' }}>
            ID: {selectedNode.id}
          </Typography>
        </Box>

        <Divider sx={{ my: 2 }} />
        
        <TextField
          fullWidth
          label="Node Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          margin="normal"
          variant="outlined"
          size="small"
          sx={{ mb: 2 }}
        />
        
        <TextField
          fullWidth
          label="Description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          margin="normal"
          variant="outlined"
          multiline
          rows={3}
          size="small"
          placeholder="Describe what this node does..."
          sx={{ mb: 2 }}
        />
        
        <FormControl fullWidth margin="normal" size="small" sx={{ mb: 2 }}>
          <InputLabel id="category-label">
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Category sx={{ fontSize: 18, mr: 1 }} />
              Category
            </Box>
          </InputLabel>
          <Select
            labelId="category-label"
            value={formData.category}
            label={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Category sx={{ fontSize: 18, mr: 1 }} />
                Category
              </Box>
            }
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          >
            <MenuItem value="general">General</MenuItem>
            <MenuItem value="business">Business</MenuItem>
            <MenuItem value="technical">Technical</MenuItem>
            <MenuItem value="approval">Approval</MenuItem>
            <MenuItem value="validation">Validation</MenuItem>
          </Select>
        </FormControl>

        <FormControl fullWidth margin="normal" size="small" sx={{ mb: 2 }}>
          <InputLabel id="color-label">
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Palette sx={{ fontSize: 18, mr: 1 }} />
              Color
            </Box>
          </InputLabel>
          <Select
            labelId="color-label"
            value={formData.color}
            label={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Palette sx={{ fontSize: 18, mr: 1 }} />
                Color
              </Box>
            }
            onChange={(e) => setFormData({ ...formData, color: e.target.value })}
          >
            <MenuItem value="#4caf50">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 20, height: 20, backgroundColor: '#4caf50', borderRadius: '4px' }} />
                Green
              </Box>
            </MenuItem>
            <MenuItem value="#2196f3">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 20, height: 20, backgroundColor: '#2196f3', borderRadius: '4px' }} />
                Blue
              </Box>
            </MenuItem>
            <MenuItem value="#ff9800">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 20, height: 20, backgroundColor: '#ff9800', borderRadius: '4px' }} />
                Orange
              </Box>
            </MenuItem>
            <MenuItem value="#f44336">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 20, height: 20, backgroundColor: '#f44336', borderRadius: '4px' }} />
                Red
              </Box>
            </MenuItem>
            <MenuItem value="#9c27b0">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 20, height: 20, backgroundColor: '#9c27b0', borderRadius: '4px' }} />
                Purple
              </Box>
            </MenuItem>
            <MenuItem value="#607d8b">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 20, height: 20, backgroundColor: '#607d8b', borderRadius: '4px' }} />
                Gray
              </Box>
            </MenuItem>
          </Select>
        </FormControl>

        {/* Custom Color Picker */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
            Custom Color
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <input
              type="color"
              value={formData.color}
              onChange={(e) => setFormData({ ...formData, color: e.target.value })}
              style={{
                width: '60px',
                height: '40px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            />
            <TextField
              size="small"
              value={formData.color}
              onChange={(e) => setFormData({ ...formData, color: e.target.value })}
              placeholder="#000000"
              sx={{ flex: 1 }}
            />
          </Box>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
            Choose any color using the color picker or enter a hex code
          </Typography>
        </Box>

        <Box sx={{ mt: 'auto', pt: 2, display: 'flex', gap: 1 }}>
          <Button 
            variant="contained" 
            onClick={handleSave} 
            fullWidth
            sx={{ py: 1 }}
          >
            Save Changes
          </Button>
          <Button 
            variant="outlined" 
            onClick={handleCancel} 
            fullWidth
            sx={{ py: 1 }}
          >
            Cancel
          </Button>
        </Box>
      </Box>
    </Paper>
  )
}

export default PropertyPanel
