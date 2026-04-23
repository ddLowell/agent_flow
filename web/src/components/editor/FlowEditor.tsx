/**
 * Flow Editor - 可视化流程编辑器
 */

import React, { useCallback, useEffect } from 'react'
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  MiniMap,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  addEdge,
  NodeTypes,
  MarkerType,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { useFlowEditorStore } from '@/hooks/useFlowEditor'
import FlowNode from './FlowNode'
import FlowControls from './FlowControls'
import { cn } from '@/utils'

interface FlowEditorProps {
  className?: string
}

const FlowEditor: React.FC<FlowEditorProps> = ({ className }) => {
  const { nodes, edges, onNodesChange, onEdgesChange, addNode } = useFlowEditorStore()
  const [reactFlowInstance, setReactFlowInstance] = React.useState<any>(null)

  // 节点类型定义
  const nodeTypes: NodeTypes = {
    script: (props: any) => <FlowNode {...props} type="script" />,
    mcp_server: (props: any) => <FlowNode {...props} type="mcp_server" />,
    agent_skill: (props: any) => <FlowNode {...props} type="agent_skill" />,
    rag: (props: any) => <FlowNode {...props} type="rag" />,
    conditional: (props: any) => <FlowNode {...props} type="conditional" />,
    loop: (props: any) => <FlowNode {...props} type="loop" />,
    parallel: (props: any) => <FlowNode {...props} type="parallel" />,
  }

  // 处理节点连接
  const onConnect = useCallback((connection: any) => {
    addEdge(connection)
  }, [addEdge])

  // 处理双击画布（添加节点）
  const onPaneClick = useCallback((event: React.MouseEvent) => {
    // 可以在这里实现右键菜单
  }, [])

  // 处理键盘事件
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl+S 保存
      if ((event.ctrlKey || event.metaKey) && event.key === 's') {
        event.preventDefault()
        // 触发保存
      }
      
      // Delete 删除选中的节点
      if (event.key === 'Delete' || event.key === 'Backspace') {
        // 删除选中的节点
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  return (
    <div className={cn('w-full h-full flex flex-col', className)}>
      {/* 工具栏 */}
      <FlowControls />

      {/* 画布 */}
      <div className="flex-1 relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onPaneClick={onPaneClick}
          nodeTypes={nodeTypes}
          fitView
          snapToGrid={true}
          snapGrid={[15, 15]}
          defaultViewport={{ x: 0, y: 0, zoom: 1 }}
          onInit={setReactFlowInstance}
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

export default FlowEditor