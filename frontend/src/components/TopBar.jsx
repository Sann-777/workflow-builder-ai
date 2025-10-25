import React, { useState } from 'react'
import { 
  AppBar, 
  Toolbar, 
  Button, 
  Box, 
  Typography,
  Chip,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  TextField,
} from '@mui/material'
import { 
  PlayArrow, 
  FolderOpen, 
  SmartToy, 
  Delete,
  BugReport,
  Code,
  ContentCopy,
  Download
} from '@mui/icons-material'
import { useDispatch, useSelector } from 'react-redux'
import { clearWorkflow, setNodes, setEdges } from '../store/store'

const TopBar = ({ onOpenExecution, onOpenGenerate }) => {
  const dispatch = useDispatch()
  const { nodes, edges } = useSelector(state => state.workflow)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' })
  const [importDialogOpen, setImportDialogOpen] = useState(false)
  const [exportDialogOpen, setExportDialogOpen] = useState(false)
  const [importCode, setImportCode] = useState('')
  const [activeTab, setActiveTab] = useState(0)

  const showSnackbar = (message, severity = 'info') => {
    setSnackbar({ open: true, message, severity })
  }

  const generateExportCode = () => {
    const workflow = { 
      nodes, 
      edges, 
      version: '1.0', 
      exportedAt: new Date().toISOString() 
    }
    return JSON.stringify(workflow, null, 2)
  }

  const handleExport = () => {
    const workflowJson = generateExportCode()
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(workflowJson)
    
    const exportFileDefaultName = `workflow-${Date.now()}.json`
    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
    showSnackbar('Workflow exported successfully!', 'success')
  }

  const openExportDialog = () => {
    setExportDialogOpen(true)
  }

  const copyToClipboard = () => {
    const exportCode = generateExportCode()
    navigator.clipboard.writeText(exportCode)
    showSnackbar('JSON copied to clipboard!', 'success')
  }

  const importWorkflow = (workflowData) => {
    try {
      const workflow = typeof workflowData === 'string' ? JSON.parse(workflowData) : workflowData
      
      if (workflow.nodes && workflow.edges) {
        dispatch(setNodes(workflow.nodes))
        dispatch(setEdges(workflow.edges))
        setImportDialogOpen(false)
        setImportCode('')
        showSnackbar('Workflow imported successfully!', 'success')
      } else {
        showSnackbar('Invalid workflow file format: missing nodes or edges', 'error')
      }
    } catch (error) {
      showSnackbar('Error importing workflow: Invalid JSON format', 'error')
    }
  }

  const handleFileImport = (event) => {
    const file = event.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      importWorkflow(e.target.result)
    }
    reader.readAsText(file)
    event.target.value = ''
  }

  const handleCodeImport = () => {
    if (!importCode.trim()) {
      showSnackbar('Please enter JSON code to import', 'error')
      return
    }
    importWorkflow(importCode)
  }

  const validateWorkflow = () => {
    const errors = []
    
    const startNodes = nodes.filter(node => 
      node.data?.nodeType === 'start' || node.data?.type === 'start' || node.type === 'start'
    )
    
    if (startNodes.length === 0) {
      errors.push('No start node found. Add a start node to begin the workflow.')
    }
    if (startNodes.length > 1) {
      errors.push('Multiple start nodes found. There should be only one start node.')
    }
    
    const endNodes = nodes.filter(node => 
      node.data?.nodeType === 'end' || node.data?.type === 'end' || node.type === 'end'
    )
    
    if (endNodes.length === 0) {
      errors.push('No end node found. Add an end node to complete the workflow.')
    }
    
    const connectedNodeIds = new Set()
    edges.forEach(edge => {
      connectedNodeIds.add(edge.source)
      connectedNodeIds.add(edge.target)
    })
    
    const disconnectedNodes = nodes.filter(node => {
      const nodeType = node.data?.nodeType || node.data?.type || node.type
      if (nodeType === 'start') return false
      return !connectedNodeIds.has(node.id)
    })

    disconnectedNodes.forEach(node => {
      const nodeName = node.data?.label || node.data?.name || node.id
      errors.push(`Node "${nodeName}" is disconnected from the workflow`)
    })

    const decisionNodes = nodes.filter(node => 
      node.data?.nodeType === 'decision' || node.data?.type === 'decision' || node.type === 'decision'
    )
    
    decisionNodes.forEach(node => {
      const outgoingEdges = edges.filter(edge => edge.source === node.id)
      if (outgoingEdges.length !== 2) {
        const nodeName = node.data?.label || node.data?.name || node.id
        errors.push(`Decision node "${nodeName}" must have exactly 2 outgoing edges (currently has ${outgoingEdges.length})`)
      }
    })

    if (errors.length === 0) {
      showSnackbar('Workflow validation passed! All checks completed successfully.', 'success')
    } else {
      showSnackbar(
        `Found ${errors.length} issue(s):\n${errors.map(err => `• ${err}`).join('\n')}`,
        'error'
      )
    }
  }

  const handleClearWorkflow = () => {
    if (window.confirm('Are you sure you want to clear the entire workflow? This action cannot be undone.')) {
      dispatch(clearWorkflow())
      showSnackbar('Workflow cleared successfully', 'info')
    }
  }

  return (
    <>
      <AppBar position="static" color="default" elevation={2}>
        <Toolbar>
          <Typography variant="h5" sx={{ flexGrow: 0, mr: 5, fontWeight: 'bold' }}>
            Workflow Builder
          </Typography>
          
          <Box sx={{ flexGrow: 1, display: 'flex', gap: 1, alignItems: 'center' }}>
            <Button
              variant="contained"
              startIcon={<SmartToy />}
              onClick={onOpenGenerate}
              sx={{ backgroundColor: '#9c27b0' }}
            >
              AI Generate
            </Button>
            
            <Button
              variant="contained"
              startIcon={<PlayArrow />}
              onClick={onOpenExecution}
              disabled={nodes.length === 0}
              sx={{ backgroundColor: '#4caf50' }}
            >
              Run Workflow
            </Button>

            <Button
              variant="outlined"
              startIcon={<BugReport />}
              onClick={validateWorkflow}
              disabled={nodes.length === 0}
            >
              Validate
            </Button>
            
            <Button
              variant="outlined"
              startIcon={<Download />}
              onClick={openExportDialog}
              disabled={nodes.length === 0}
            >
              Export
            </Button>
            
            <Button
              variant="outlined"
              startIcon={<FolderOpen />}
              onClick={() => setImportDialogOpen(true)}
            >
              Import
            </Button>

            <Button
              variant="outlined"
              color="error"
              startIcon={<Delete />}
              onClick={handleClearWorkflow}
              disabled={nodes.length === 0}
            >
              Clear
            </Button>
          </Box>

          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Chip 
              label={`${nodes.length} Nodes`} 
              variant="outlined" 
              size="small" 
              color="primary"
            />
            <Chip 
              label={`${edges.length} Edges`} 
              variant="outlined" 
              size="small" 
              color="secondary"
            />
          </Box>
        </Toolbar>
      </AppBar>

      {/* Import Dialog */}
      <Dialog 
        open={importDialogOpen} 
        onClose={() => setImportDialogOpen(false)} 
        maxWidth="md" 
        fullWidth
        PaperProps={{ sx: { minHeight: '500px' } }}
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <FolderOpen color="primary" />
            Import Workflow
          </Box>
        </DialogTitle>
        <DialogContent>
          <Tabs 
            value={activeTab} 
            onChange={(e, newValue) => setActiveTab(newValue)} 
            sx={{ mb: 2 }}
          >
            <Tab label="Upload File" />
            <Tab label="Paste JSON Code" />
          </Tabs>

          {activeTab === 0 && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <input 
                id="file-import" 
                type="file" 
                accept=".json" 
                style={{ display: 'none' }} 
                onChange={handleFileImport}
              />
              <label htmlFor="file-import">
                <Button 
                  variant="contained" 
                  component="span"
                  startIcon={<FolderOpen />}
                  size="large"
                >
                  Choose JSON File
                </Button>
              </label>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Select a .json file containing your workflow data
              </Typography>
            </Box>
          )}

          {activeTab === 1 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" sx={{ mb: 2 }}>
                Paste your workflow JSON code below:
              </Typography>
              <TextField
                multiline
                rows={12}
                fullWidth
                value={importCode}
                onChange={(e) => setImportCode(e.target.value)}
                placeholder={`Paste your workflow JSON here...\n\nExample:\n{\n  "nodes": [...],\n  "edges": [...]\n}`}
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    fontFamily: 'monospace',
                    fontSize: '14px',
                  }
                }}
              />
              <Button 
                onClick={handleCodeImport}
                variant="contained"
                disabled={!importCode.trim()}
                sx={{ mt: 2 }}
                fullWidth
                size="large"
              >
                Import from Code
              </Button>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setImportDialogOpen(false)}>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      {/* Export Dialog */}
      <Dialog 
        open={exportDialogOpen} 
        onClose={() => setExportDialogOpen(false)} 
        maxWidth="md" 
        fullWidth
        PaperProps={{ sx: { minHeight: '500px' } }}
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <Code color="primary" />
            Export Workflow
          </Box>
        </DialogTitle>
        <DialogContent>
          <Tabs 
            value={activeTab} 
            onChange={(e, newValue) => setActiveTab(newValue)} 
            sx={{ mb: 2 }}
          >
            <Tab label="Download File" />
            <Tab label="Copy JSON Code" />
          </Tabs>

          {activeTab === 0 && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Button 
                variant="contained" 
                onClick={handleExport}
                startIcon={<Download />}
                size="large"
                sx={{ mb: 2 }}
              >
                Download JSON File
              </Button>
              <Typography variant="body2" color="text.secondary">
                Download your workflow as a .json file that you can import later
              </Typography>
            </Box>
          )}

          {activeTab === 1 && (
            <Box sx={{ mt: 2 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="body2">
                  Copy the JSON code below:
                </Typography>
                <Button 
                  startIcon={<ContentCopy />}
                  onClick={copyToClipboard}
                  variant="contained"
                  size="small"
                >
                  Copy to Clipboard
                </Button>
              </Box>
              <TextField
                multiline
                rows={12}
                fullWidth
                value={generateExportCode()}
                InputProps={{
                  readOnly: true,
                }}
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    fontFamily: 'monospace',
                    fontSize: '14px',
                    backgroundColor: '#f5f5f5'
                  }
                }}
              />
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                Use this JSON code to import your workflow in other instances
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setExportDialogOpen(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          sx={{ whiteSpace: 'pre-line' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  )
}

export default TopBar
