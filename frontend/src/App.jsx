import React, { useCallback, useEffect, useState, useRef } from 'react'
import ReactFlow, {
  addEdge,
  Controls,
  MiniMap,
  Background,
  applyNodeChanges,
  applyEdgeChanges,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { Box } from '@mui/material'
import TopBar from './components/TopBar'
import Sidebar from './components/Sidebar'
import CustomNode from './components/CustomNode'
import CustomEdge from './components/CustomEdge'
import PropertyPanel from './components/PropertyPanel'
import ExecutionDialog from './components/ExecutionDialog'
import GenerateDialog from './components/GenerateDialog'
import ExecutionMonitor from './components/ExecutionMonitor'
import { useDispatch, useSelector } from 'react-redux'
import { setNodes, setEdges, addNode, setSelectedNode } from './store/store'

const nodeTypes = { custom: CustomNode }
const edgeTypes = { default: CustomEdge }

let nodeIdCounter = 0

export default function App() {
  const dispatch = useDispatch()
  const { nodes, edges } = useSelector(s => s.workflow)
  const [rfInstance, setRfInstance] = useState(null)
  const [execOpen, setExecOpen] = useState(false)
  const [genOpen, setGenOpen] = useState(false)
  const [showExecutionMonitor, setShowExecutionMonitor] = useState(false)
  const reactFlowWrapper = useRef(null)

  const onNodesChange = useCallback((changes) => {
    dispatch(setNodes(applyNodeChanges(changes, nodes)))
  }, [dispatch, nodes])

  const onEdgesChange = useCallback((changes) => {
    dispatch(setEdges(applyEdgeChanges(changes, edges)))
  }, [dispatch, edges])

  const onConnect = useCallback((params) => {
    dispatch(setEdges(addEdge(params, edges)))
  }, [dispatch, edges])

  const onNodeClick = useCallback((event, node) => {
    dispatch(setSelectedNode(node))
  }, [dispatch])

  const onPaneClick = useCallback(() => {
    dispatch(setSelectedNode(null))
  }, [dispatch])

  const onDragOver = useCallback((event) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
  }, [])

  const onDrop = useCallback(
    (event) => {
      event.preventDefault()

      if (!rfInstance) return

      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect()
      const type = event.dataTransfer.getData('application/reactflow')

      if (typeof type === 'undefined' || !type) {
        return
      }

      const position = rfInstance.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      })

      const nodeColors = {
        start: '#4caf50',
        end: '#f44336',
        process: '#2196f3',
        decision: '#ff9800',
      }

      const nodeLabels = {
        start: 'Start',
        end: 'End',
        process: 'Process',
        decision: 'Decision',
      }

      const newNode = {
        id: `node_${nodeIdCounter++}_${Date.now()}`,
        type: 'custom',
        position,
        data: {
          name: nodeLabels[type] || 'Node',
          description: `${nodeLabels[type] || 'Node'} description`,
          category: 'General',
          color: nodeColors[type] || '#2196f3',
          nodeType: type,
          type: type,
        },
      }

      dispatch(addNode(newNode))
    },
    [rfInstance, dispatch]
  )
  
  // Handle execution flow
  const handleExecutionStart = () => {
    setExecOpen(true)
  }

  const handleExecutionClose = () => {
    setExecOpen(false)
  }

  // Show execution monitor when execution starts
  useEffect(() => {
    if (execOpen) {
      setShowExecutionMonitor(true)
    }
  }, [execOpen])

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', width: '100%' }}>
      <TopBar
        onOpenExecution={handleExecutionStart}
        onOpenGenerate={() => setGenOpen(true)}
      />
      <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden', width: '100%' }}>
        <Sidebar />
        
        <Box ref={reactFlowWrapper} sx={{ flex: 1, height: '100%', width: '100%' }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onInit={setRfInstance}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            onDrop={onDrop}
            onDragOver={onDragOver}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            fitView={false}
            defaultEdgeOptions={{
              type: 'default',
              animated: false,
              style: { stroke: '#555', strokeWidth: 3 }
            }}
            snapToGrid={true}
            snapGrid={[15, 15]}
            minZoom={0.5}
            maxZoom={2}
          >
            <MiniMap />
            <Controls />
            <Background gap={16} />
          </ReactFlow>
        </Box>

        <Box style={{ 
          width: '300px', 
          borderLeft: '1px solid #eee', 
          height: '100%', 
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <PropertyPanel />
        </Box>
      </Box>
      
      <ExecutionDialog
        open={execOpen}
        onClose={handleExecutionClose}
        nodes={nodes}
        edges={edges}
      />

      <GenerateDialog
        open={genOpen}
        onClose={() => setGenOpen(false)}
        onApply={(workflow) => {
          dispatch(setNodes(workflow.nodes || []))
          dispatch(setEdges(workflow.edges || []))
          setGenOpen(false)
        }}
      />

      {showExecutionMonitor && <ExecutionMonitor />}
    </Box>
  )
}
