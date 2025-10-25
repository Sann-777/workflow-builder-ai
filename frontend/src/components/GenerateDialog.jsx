import React, { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  CircularProgress,
  Typography,
  Alert,
} from '@mui/material'
import { SmartToy } from '@mui/icons-material'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const GenerateDialog = ({ open, onClose, onApply }) => {
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleGenerate = async () => {
    if (!description.trim()) {
      setError('Please enter a workflow description')
      return
    }

    setLoading(true)
    setError('')
    
    try {
      const response = await axios.post(`${API_URL}/generate_workflow`, {
        description: description.trim()
      })

      if (response.data && response.data.nodes && response.data.edges) {
        // Transform backend response to match frontend format
        const transformedWorkflow = {
          nodes: response.data.nodes.map(node => ({
            ...node,
            type: 'custom',
            data: {
              ...node.data,
              nodeType: node.data.type || node.type,
              type: node.data.type || node.type,
            }
          })),
          edges: response.data.edges
        }
        onApply(transformedWorkflow)
        setDescription('')
      } else {
        setError('Invalid response from server')
      }
    } catch (err) {
      console.error('Failed to generate workflow:', err)
      setError(err.response?.data?.detail || 'Failed to generate workflow. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <SmartToy color="primary" />
          <Typography variant="h6">Generate Workflow with AI</Typography>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Alert severity="info" sx={{ mb: 2 }}>
          Describe the workflow you want to create in natural language
        </Alert>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <TextField
          label="Workflow Description"
          fullWidth
          multiline
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Example: Create an order processing workflow with payment verification and shipping steps..."
          disabled={loading}
        />
        
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
          The AI will generate a complete workflow based on your description
        </Typography>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleGenerate}
          variant="contained"
          disabled={loading || !description.trim()}
          startIcon={loading ? <CircularProgress size={16} /> : <SmartToy />}
        >
          {loading ? 'Generating...' : 'Generate Workflow'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default GenerateDialog
