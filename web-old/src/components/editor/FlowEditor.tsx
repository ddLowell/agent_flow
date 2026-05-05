/**
 * Flow Editor - 可视化流程编辑器
 */

import React, { useCallback, useEffect } from 'react'
import ReactFlow, {
  Controls,
  Background,
  MiniMap,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  addEdge,
  NodeTypes,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { useFlowEditorStore } from '@/hooks/useFlowEditor'
import { FlowNode } from './FlowNode'
import { FlowControls } from './FlowControls'
import { cn } from '@/utils'

interface FlowEditorProps {
  className?: string
}

const FlowEditor: React.FC<FlowEditorProps> = ({ className }) => {
  const { currentFlow } = useFlowEditorStore()
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])

  // 节点类型定义
  const nodeTypes: NodeTypes = {
    script: FlowNode,
    mcp_server: FlowNode,
    agent_skill: FlowNode,
    rag: FlowNode,
    conditional: FlowNode,
    loop: FlowNode,
    parallel: FlowNode,
  }

  // 处理节点连接
  const onConnect = useCallback((connection: any) => {
    setEdges((eds) => addEdge(connection, eds))
  }, [setEdges])

  // 初始化示例 Flow
  useEffect(() => {
    if (!currentFlow) {
      // 创建一个默认的示例 flow
      const initialNodes = [
        {
          id: '1',
          type: 'script',
          position: { x: 250, y: 25 },
          data: {
            id: '1',
            type: 'script',
            name: 'Hello World',
            status: 'pending',
            config: { language: 'python', code: 'print("Hello, World!")' }
          },
        },
      ]
      setNodes(initialNodes)
    }
  }, [currentFlow, setNodes])

  // 处理 FlowControls 操作
  const handleNewFlow = useCallback(() => {
    setNodes([])
    setEdges([])
    const { reset } = useFlowEditorStore.getState()
    reset()
  }, [setNodes, setEdges])

  const handleOpenFlow = useCallback(() => {
    // TODO: 实现打开文件对话框
    alert('Open Flow - Feature coming soon!')
  }, [])

  const handleSaveFlow = useCallback(() => {
    // TODO: 实现保存功能
    alert('Save Flow - Feature coming soon!')
  }, [])

  const handleValidateFlow = useCallback(() => {
    // TODO: 实现验证功能
    alert('Validate Flow - Feature coming soon!')
  }, [])

  return (
    <div className={cn('w-full h-full flex flex-col', className)}>
      {/* 工具栏 */}
      <FlowControls
        onNewFlow={handleNewFlow}
        onOpenFlow={handleOpenFlow}
        onSaveFlow={handleSaveFlow}
        onValidateFlow={handleValidateFlow}
      />

      {/* 画布 */}
      <div className="flex-1 relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
          snapToGrid={true}
          snapGrid={[15, 15]}
          defaultViewport={{ x: 0, y: 0, zoom: 1 }}
        >
          <Background
            variant={BackgroundVariant.Dots}
            gap={15}
            size={1}
            color="#e5e7eb"
          />
          
          <Controls
            className="flex flex-col gap-1"
          />

          <MiniMap
            nodeColor="#3b82f6"
            nodeStrokeWidth={2}
            nodeStrokeColor="#ffffff"
            className="!bg-white !border border-gray-200"
            position="bottom-right"
          />
        </ReactFlow>
      </div>
    </div>
  )
}

export { FlowEditor }
