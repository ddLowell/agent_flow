/**
 * Flow Canvas - 基于 React Flow 的可视化画布
 */

import React, { useCallback } from 'react'
import { Background, Controls, ReactFlow, addEdge, useNodesState, useEdgesState, Connection, Edge, NodeTypes } from 'reactflow'
import 'reactflow/dist/style.css'
import { FlowNode } from './FlowNode'

export const FlowCanvas: React.FC = () => {
  const [nodes, , onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])

  const onConnect = useCallback(
    (params: Connection | Edge) => {
      setEdges((eds) => addEdge({ ...params, animated: true }, eds))
    },
    [setEdges]
  )

  const nodeTypes: NodeTypes = {
    script: (props: any) => <FlowNode {...props} type="script" />,
    mcp_server: (props: any) => <FlowNode {...props} type="mcp_server" />,
    agent_skill: (props: any) => <FlowNode {...props} type="agent_skill" />,
    rag: (props: any) => <FlowNode {...props} type="rag" />,
    conditional: (props: any) => <FlowNode {...props} type="conditional" />,
    loop: (props: any) => <FlowNode {...props} type="loop" />,
    parallel: (props: any) => <FlowNode {...props} type="parallel" />,
  }

  return (
    <div className="w-full h-screen bg-gray-50">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  )
}
