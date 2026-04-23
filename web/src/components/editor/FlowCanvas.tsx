/**
 * Flow Canvas - 基于 React Flow 的可视化画布
 */

import React, { useCallback } from 'react'
import { Background, Controls, ReactFlow, addEdge, useNodesState, useEdgesState, Connection, Edge } from 'reactflow'
import 'reactflow/dist/style.css'
import { FlowNode } from './FlowNode'

export const FlowCanvas: React.FC = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])

  const onConnect = useCallback(
    (params: Connection | Edge) => {
      setEdges((eds) => addEdge({ ...params, animated: true }, eds))
    },
    [setEdges]
  )

  return (
    <div className="w-full h-screen bg-gray-50">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
      >
        <Background />
        <Controls />
        {nodes.map((node) => (
          <FlowNode key={node.id} data={node} />
        ))}
      </ReactFlow>
    </div>
  )
}
