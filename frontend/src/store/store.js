import { configureStore, createSlice } from '@reduxjs/toolkit'

const workflowSlice = createSlice({
  name: 'workflow',
  initialState: {
    nodes: [],
    edges: [],
    selectedNode: null,
    executingNodeId: null,
    completedNodeIds: [],
  },
  reducers: {
    setNodes: (state, action) => {
      state.nodes = action.payload
      localStorage.setItem('workflowNodes', JSON.stringify(action.payload))
    },
    setEdges: (state, action) => {
      state.edges = action.payload
      localStorage.setItem('workflowEdges', JSON.stringify(action.payload))
    },
    addNode: (state, action) => {
      state.nodes.push(action.payload)
      localStorage.setItem('workflowNodes', JSON.stringify(state.nodes))
    },
    updateNode: (state, action) => {
      const index = state.nodes.findIndex(node => node.id === action.payload.id)
      if (index !== -1) {
        state.nodes[index] = action.payload
        localStorage.setItem('workflowNodes', JSON.stringify(state.nodes))
      }
    },
    deleteNode: (state, action) => {
      const nodeId = action.payload
      state.nodes = state.nodes.filter(node => node.id !== nodeId)
      state.edges = state.edges.filter(edge => 
        edge.source !== nodeId && edge.target !== nodeId
      )
      localStorage.setItem('workflowNodes', JSON.stringify(state.nodes))
      localStorage.setItem('workflowEdges', JSON.stringify(state.edges))
    },
    setSelectedNode: (state, action) => {
      state.selectedNode = action.payload
    },
    setExecutingNode: (state, action) => {
      state.executingNodeId = action.payload
    },
    addCompletedNode: (state, action) => {
      if (!state.completedNodeIds.includes(action.payload)) {
        state.completedNodeIds.push(action.payload)
      }
    },
    clearExecutionState: (state) => {
      state.executingNodeId = null
      state.completedNodeIds = []
    },
    clearWorkflow: (state) => {
      state.nodes = []
      state.edges = []
      state.selectedNode = null
      state.executingNodeId = null
      state.completedNodeIds = []
      localStorage.removeItem('workflowNodes')
      localStorage.removeItem('workflowEdges')
    },
    loadFromStorage: (state) => {
      const savedNodes = localStorage.getItem('workflowNodes')
      const savedEdges = localStorage.getItem('workflowEdges')
      if (savedNodes) state.nodes = JSON.parse(savedNodes)
      if (savedEdges) state.edges = JSON.parse(savedEdges)
    }
  }
})

export const { 
  setNodes, setEdges, addNode, updateNode, deleteNode, 
  setSelectedNode, setExecutingNode, addCompletedNode, 
  clearExecutionState, clearWorkflow, loadFromStorage 
} = workflowSlice.actions

export const store = configureStore({
  reducer: {
    workflow: workflowSlice.reducer,
  },
})
