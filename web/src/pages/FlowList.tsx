import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  FileText, 
  Play, 
  Trash2, 
  Edit, 
  MoreHorizontal,
  Clock,
  CheckCircle,
  XCircle,
  Calendar
} from 'lucide-react'
import { cn, formatDate, getStatusColor } from '../utils/helpers'
import { Flow } from '../types'

export const FlowList: React.FC = () => {
  const [flows, setFlows] = useState<Flow[]>([])
  const [loading, setLoading] = useState(true)

  // 模拟数据
  useEffect(() => {
    const mockFlows: Flow[] = [
      {
        id: '1',
        name: '文档处理流程',
        description: '自动化文档分析和摘要生成的智能流程',
        version: '1.0.0',
        status: 'published',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        updatedAt: new Date().toISOString(),
        author: 'Demo User',
        tags: ['文档', '自动化', 'AI'],
        steps: [],
        metadata: {}
      },
      {
        id: '2',
        name: '代码审查机器人',
        description: '基于 AI 的代码质量检查和建议流程',
        version: '1.2.0',
        status: 'published',
        createdAt: new Date(Date.now() - 172800000).toISOString(),
        updatedAt: new Date().toISOString(),
        author: 'Demo User',
        tags: ['代码', '审查', '质量'],
        steps: [],
        metadata: {}
      },
      {
        id: '3',
        name: '数据分析流程',
        description: '处理和分析大量数据的智能流程',
        version: '0.8.0',
        status: 'draft',
        createdAt: new Date(Date.now() - 259200000).toISOString(),
        updatedAt: new Date().toISOString(),
        author: 'Demo User',
        tags: ['数据', '分析', '统计'],
        steps: [],
        metadata: {}
      },
    ]
    setFlows(mockFlows)
    setLoading(false)
  }, [])

  const handleExecute = (flowId: string) => {
    console.log('Executing flow:', flowId)
    // TODO: 实现执行逻辑
  }

  const handleDelete = (flowId: string) => {
    if (confirm('确定要删除这个 Flow 吗？')) {
      setFlows(flows.filter(f => f.id !== flowId))
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-white/60">加载中...</div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="h-full p-8 overflow-y-auto"
    >
      {/* 页面头部 */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Flow 列表</h1>
          <p className="text-white/60">管理和查看所有工作流</p>
        </div>
        <button className="px-6 py-3 bg-gradient-primary rounded-xl text-white font-medium hover:shadow-glow transition-all duration-300">
          + 新建 Flow
        </button>
      </div>

      {/* Flow 列表 */}
      <div className="space-y-4">
        {flows.map((flow, index) => (
          <motion.div
            key={flow.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="glass-effect rounded-2xl p-6 hover:shadow-glow transition-all duration-300 cursor-pointer"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{flow.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', flow.status === 'published' ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400')}>
                        {flow.status === 'published' ? '已发布' : '草稿'}
                      </span>
                      <span className="text-white/60 text-sm">v{flow.version}</span>
                    </div>
                  </div>
                </div>
                
                <p className="text-white/70 mb-4 ml-15">{flow.description}</p>
                
                <div className="flex items-center gap-6 ml-15">
                  <div className="flex items-center gap-2 text-white/60 text-sm">
                    <Calendar className="w-4 h-4" />
                    {formatDate(flow.createdAt)}
                  </div>
                  <div className="flex items-center gap-2 text-white/60 text-sm">
                    <FileText className="w-4 h-4" />
                    {flow.tags.join(', ')}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleExecute(flow.id)}
                  className="p-2 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-all duration-200"
                  title="执行"
                >
                  <Play className="w-5 h-5" />
                </button>
                <button
                  className="p-2 rounded-lg bg-white/10 text-white/70 hover:bg-white/20 transition-all duration-200"
                  title="编辑"
                >
                  <Edit className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleDelete(flow.id)}
                  className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all duration-200"
                  title="删除"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
                <button className="p-2 rounded-lg bg-white/10 text-white/70 hover:bg-white/20 transition-all duration-200">
                  <MoreHorizontal className="w-5 h-5" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
