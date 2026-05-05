import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, Plus, Filter, MoreVertical, Play, Edit, Trash2, Clock, CheckCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { cn, formatDate, getStatusColor } from '../../utils/helpers'
import { Flow } from '../../types'

export default function FlowList() {
  const navigate = useNavigate()
  const [flows, setFlows] = useState<Flow[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'published' | 'draft'>('all')

  useEffect(() => {
    // 模拟数据
    setFlows([
      {
        id: '1',
        name: '文档处理流程',
        description: '自动化文档处理和摘要生成',
        version: '1.2.0',
        status: 'published',
        createdAt: '2024-01-15',
        updatedAt: '2024-01-20',
        author: 'Demo User',
        tags: ['文档', 'AI', '自动化'],
        steps: [
          { id: 's1', name: '文档上传', type: 'input', status: 'completed', config: {}, inputs: {}, outputs: {}, position: { x: 0, y: 0 } },
          { id: 's2', name: '文本提取', type: 'process', status: 'completed', config: {}, inputs: {}, outputs: {}, position: { x: 0, y: 0 } },
          { id: 's3', name: '摘要生成', type: 'ai', status: 'completed', config: {}, inputs: {}, outputs: {}, position: { x: 0, y: 0 } },
        ],
        metadata: {},
      },
      {
        id: '2',
        name: '代码审查机器人',
        description: '自动化代码审查和质量检查',
        version: '2.0.1',
        status: 'published',
        createdAt: '2024-01-10',
        updatedAt: '2024-01-18',
        author: 'Demo User',
        tags: ['代码', '质量', 'CI/CD'],
        steps: [
          { id: 's1', name: '代码获取', type: 'input', status: 'pending', config: {}, inputs: {}, outputs: {}, position: { x: 0, y: 0 } },
          { id: 's2', name: '静态分析', type: 'process', status: 'pending', config: {}, inputs: {}, outputs: {}, position: { x: 0, y: 0 } },
        ],
        metadata: {},
      },
      {
        id: '3',
        name: '数据分析流程',
        description: '复杂数据分析和可视化',
        version: '0.5.0',
        status: 'draft',
        createdAt: '2024-01-18',
        updatedAt: '2024-01-19',
        author: 'Demo User',
        tags: ['数据', '分析', '可视化'],
        steps: [],
        metadata: {},
      },
    ])
  }, [])

  const filteredFlows = flows.filter(flow => {
    const matchesSearch = flow.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         flow.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = filterStatus === 'all' || flow.status === filterStatus
    return matchesSearch && matchesFilter
  })

  return (
    <div className="h-full p-8 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* 页面头部 */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Flow 列表</h1>
            <p className="text-white/60">管理您的所有 AI 工作流</p>
          </div>
          <button
            onClick={() => navigate('/flows/create')}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-primary text-white rounded-xl hover:shadow-glow transition-all duration-300"
          >
            <Plus className="w-5 h-5" />
            创建 Flow
          </button>
        </div>

        {/* 搜索和过滤 */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <input
              type="text"
              placeholder="搜索 Flows..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/50 transition-all"
            />
          </div>
          <div className="flex items-center gap-2 bg-white/10 border border-white/20 rounded-xl p-1">
            {['all', 'published', 'draft'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status as any)}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                  filterStatus === status
                    ? 'bg-gradient-primary text-white'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                )}
              >
                {status === 'all' ? '全部' : status === 'published' ? '已发布' : '草稿'}
              </button>
            ))}
          </div>
        </div>

        {/* Flow 列表 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredFlows.map((flow, index) => (
            <motion.div
              key={flow.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="glass-effect rounded-2xl p-6 hover:shadow-glow transition-all duration-300 cursor-pointer group"
              onClick={() => navigate(`/flows/${flow.id}`)}
            >
              {/* 状态标签 */}
              <div className="flex items-center justify-between mb-4">
                <span className={cn(
                  'px-3 py-1 rounded-full text-xs font-medium',
                  flow.status === 'published'
                    ? 'bg-green-500/20 text-green-400'
                    : 'bg-blue-500/20 text-blue-400'
                )}>
                  {flow.status === 'published' ? '已发布' : '草稿'}
                </span>
                <button
                  onClick={(e) => e.stopPropagation()}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreVertical className="w-5 h-5 text-white/40 hover:text-white" />
                </button>
              </div>

              {/* Flow 信息 */}
              <h3 className="text-xl font-semibold text-white mb-2">{flow.name}</h3>
              <p className="text-white/60 text-sm mb-4 line-clamp-2">{flow.description}</p>

              {/* 标签 */}
              <div className="flex flex-wrap gap-2 mb-4">
                {flow.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-white/10 rounded-lg text-xs text-white/80"
                  >
                    {tag}
                  </span>
                ))}
                {flow.tags.length > 3 && (
                  <span className="px-2 py-1 bg-white/10 rounded-lg text-xs text-white/80">
                    +{flow.tags.length - 3}
                  </span>
                )}
              </div>

              {/* 底部信息 */}
              <div className="flex items-center justify-between pt-4 border-t border-white/10">
                <div className="flex items-center gap-4 text-sm text-white/60">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    <span>{flow.steps.length} 步骤</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>v{flow.version}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      navigate(`/flows/${flow.id}/edit`)
                    }}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4 text-white/60 hover:text-white" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      // 触发执行
                    }}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <Play className="w-4 h-4 text-white/60 hover:text-white" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* 空状态 */}
        {filteredFlows.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-effect rounded-2xl p-12 text-center"
          >
            <div className="w-20 h-20 mx-auto mb-6 bg-white/10 rounded-2xl flex items-center justify-center">
              <Filter className="w-10 h-10 text-white/40" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">没有找到 Flows</h3>
            <p className="text-white/60 mb-6">尝试调整搜索条件或创建新的 Flow</p>
            <button
              onClick={() => navigate('/flows/create')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-primary text-white rounded-xl hover:shadow-glow transition-all duration-300"
            >
              <Plus className="w-5 h-5" />
              创建第一个 Flow
            </button>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}