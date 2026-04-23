/**
 * Flow Node Component - 可视化节点
 */

import React from 'react'
import { Handle, Position, NodeProps } from 'reactflow'
import { getNodeTypeColor } from '@/utils'
import { cn } from '@/utils'
import { Play, Square, Code, Database, GitBranch, Refresh, Users, Zap, Repeat, Globe } from 'lucide-react'

interface FlowNodeData extends NodeProps {
  data: {
    id: string
    type: string
    name?: string
    status?: 'pending' | 'running' | 'completed' | 'failed'
    config?: Record<string, any>
  }
}

export const FlowNode: React.FC<FlowNodeData> = ({ data, selected }) => {
  const nodeType = data.data.type
  const nodeColor = getNodeTypeColor(nodeType)

  // 节点图标映射
  const getNodeIcon = (type: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      script: <Code size={16} />,
      mcp_server: <Globe size={16} />,
      agent_skill: <Zap size={16} />,
      rag: <Database size={16} />,
      conditional: <GitBranch size={16} />,
      loop: <Repeat size={16} />,
      parallel: <Users size={16} />,
      human: <Users size={16} />,
      retry: <Refresh size={16} />,
      transform: <Square size={16} />,
      http: <Globe size={16} />,
    }
    return iconMap[type] || <Square size={16} />
  }

  // 状态指示器
  const getStatusIndicator = (status?: string) => {
    if (!status) return null

    const statusColors = {
      pending: 'bg-gray-400',
      running: 'bg-blue-500 animate-pulse',
      completed: 'bg-green-500',
      failed: 'bg-red-500',
    }

    return (
      <div
        className={cn(
          'absolute top-2 right-2 w-3 h-3 rounded-full border-2 border-white',
          statusColors[status as keyof typeof statusColors]
        )}
      />
    )
  }

  return (
    <div
      className={cn(
        'relative min-w-[200px] rounded-lg shadow-lg border-2',
        'transition-all duration-200',
        selected ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200',
        'hover:shadow-xl hover:border-gray-300',
        'bg-white'
      )}
    >
      {/* 顶部颜色条 */}
      <div className={cn('h-1.5 rounded-t-lg', nodeColor)} />

      {/* 输入 Handle */}
      {data.data.depends_on && data.data.depends_on.length > 0 && (
        <Handle
          type="target"
          position={Position.Left}
          className="!w-3 !h-3 !bg-gray-400 !border-2 !border-gray-500"
        />
      )}

      {/* 输出 Handle */}
      <Handle
        type="source"
        position={Position.Right}
        className="!w-3 !h-3 !bg-blue-500 !border-2 !border-blue-600"
      />

      {/* 节点内容 */}
      <div className="p-3">
        <div className="flex items-center gap-3">
          {/* 节点图标 */}
          <div className={cn('p-2 rounded-lg', nodeColor)}>
            <div className="text-white">
              {getNodeIcon(nodeType)}
            </div>
          </div>

          {/* 节点信息 */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-semibold text-sm text-gray-900 truncate">
                {data.data.name || data.data.id}
              </h3>
              {getStatusIndicator(data.data.status)}
            </div>

            {/* 节点类型标签 */}
            <div className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
              {nodeType}
            </div>
          </div>
        </div>

        {/* 节点配置信息 */}
        {data.data.config && Object.keys(data.data.config).length > 0 && (
          <div className="mt-2 pt-2 border-t border-gray-100">
            <div className="text-xs text-gray-500 space-y-1">
              {Object.entries(data.data.config).slice(0, 3).map(([key, value]) => (
                <div key={key} className="flex items-center gap-2">
                  <span className="font-medium">{key}:</span>
                  <span className="truncate">
                    {typeof value === 'string'
                      ? value
                      : JSON.stringify(value).slice(0, 30)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 选中指示器 */}
      {selected && (
        <div className="absolute -top-1 -left-1 -right-1 -bottom-1 border-2 border-blue-500 rounded-lg pointer-events-none" />
      )}
    </div>
  )
}