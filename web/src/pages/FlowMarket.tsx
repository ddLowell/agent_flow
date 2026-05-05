import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Workflow, 
  Star, 
  Download, 
  DollarSign,
  Search,
  Filter,
  Play,
  Eye,
  Copy
} from 'lucide-react'
import { cn } from '../../utils/helpers'
import { Flow } from '../../types'

export const FlowMarket: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')

  const categories = [
    { id: 'all', label: '全部' },
    { id: 'document', label: '文档处理' },
    { id: 'code', label: '代码处理' },
    { id: 'data', label: '数据分析' },
    { id: 'automation', label: '自动化' },
    { id: 'ai', label: 'AI 智能体' },
  ]

  // 模拟数据
  const flows: Flow[] = [
    {
      id: '1',
      name: '智能文档处理流程',
      description: '完整的文档上传、解析、分析和摘要生成流程',
      version: '2.0.0',
      status: 'published',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
      author: 'AgentFlow Team',
      tags: ['文档', '自动化', 'AI', '摘要'],
      steps: [],
      metadata: {
        downloads: 12580,
        rating: 4.8,
        price: 0.01,
        category: 'document'
      }
    },
    {
      id: '2',
      name: '代码质量检查机器人',
      description: '自动化的代码审查、安全检查和最佳实践验证',
      version: '3.1.0',
      status: 'published',
      createdAt: new Date(Date.now() - 172800000).toISOString(),
      updatedAt: new Date().toISOString(),
      author: 'CodeMaster',
      tags: ['代码', '审查', '安全', '质量'],
      steps: [],
      metadata: {
        downloads: 8960,
        rating: 4.9,
        price: 0.02,
        category: 'code'
      }
    },
    {
      id: '3',
      name: '数据清洗管道',
      description: '智能的数据清洗、转换和标准化处理流程',
      version: '1.5.0',
      status: 'published',
      createdAt: new Date(Date.now() - 259200000).toISOString(),
      updatedAt: new Date().toISOString(),
      author: 'DataAI',
      tags: ['数据', '清洗', 'ETL', '自动化'],
      steps: [],
      metadata: {
        downloads: 6540,
        rating: 4.7,
        price: 0.015,
        category: 'data'
      }
    },
    {
      id: '4',
      name: 'AI 写作助手流程',
      description: '从选题到发布的完整 AI 写作工作流',
      version: '2.2.0',
      status: 'published',
      createdAt: new Date(Date.now() - 345600000).toISOString(),
      updatedAt: new Date().toISOString(),
      author: 'ContentPro',
      tags: ['写作', 'AI', '内容创作', '自动化'],
      steps: [],
      metadata: {
        downloads: 23450,
        rating: 4.9,
        price: 0.025,
        category: 'ai'
      }
    },
  ]

  const filteredFlows = flows.filter(flow => {
    const matchesCategory = selectedCategory === 'all' || flow.metadata.category === selectedCategory
    const matchesSearch = flow.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        flow.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        flow.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    return matchesCategory && matchesSearch
  })

  const handleInstall = (flowId: string) => {
    console.log('Installing flow:', flowId)
    alert('Flow 安装成功！')
  }

  const handlePreview = (flowId: string) => {
    console.log('Previewing flow:', flowId)
    alert('预览功能开发中...')
  }

  const handleCopy = (flowId: string) => {
    console.log('Copying flow:', flowId)
    alert('Flow 复制成功！')
  }

  return (
    <div className="h-full overflow-y-auto p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* 页面头部 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Flow Market</h1>
          <p className="text-white/60">发现和安装专业的工作流模板</p>
        </div>

        {/* 搜索和筛选 */}
        <div className="flex gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <input
              type="text"
              placeholder="搜索 Flows..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-primary-500 transition-all duration-200"
            />
          </div>
          <button className="px-6 py-3 bg-white/10 border border-white/20 rounded-xl text-white hover:bg-white/20 transition-all duration-200 flex items-center gap-2">
            <Filter className="w-5 h-5" />
            筛选
          </button>
        </div>

        {/* 分类标签 */}
        <div className="flex gap-3 mb-8 overflow-x-auto pb-2">
          {categories.map((category) => (
            <motion.button
              key={category.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
              onClick={() => setSelectedCategory(category.id)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-xl whitespace-nowrap transition-all duration-200',
                selectedCategory === category.id
                  ? 'bg-gradient-primary text-white shadow-glow'
                  : 'bg-white/10 text-white/70 hover:bg-white/20'
              )}
            >
              {category.label}
            </motion.button>
          ))}
        </div>

        {/* Flow 列表 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFlows.map((flow, index) => (
            <motion.div
              key={flow.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="glass-effect rounded-2xl p-6 hover:shadow-glow transition-all duration-300 group"
            >
              {/* Flow 图标和标题 */}
              <div className="flex items-start justify-between mb-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-primary flex items-center justify-center">
                  <Workflow className="w-7 h-7 text-white" />
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  <span className="text-white font-semibold">{flow.metadata.rating}</span>
                </div>
              </div>

              {/* Flow 信息 */}
              <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-primary-400 transition-colors">
                {flow.name}
              </h3>
              <p className="text-white/70 text-sm mb-4 line-clamp-2">{flow.description}</p>

              {/* 标签 */}
              <div className="flex flex-wrap gap-2 mb-4">
                {flow.tags.slice(0, 3).map(tag => (
                  <span key={tag} className="px-2 py-1 bg-white/10 rounded-full text-xs text-white/70">
                    {tag}
                  </span>
                ))}
                {flow.tags.length > 3 && (
                  <span className="px-2 py-1 bg-white/10 rounded-full text-xs text-white/70">
                    +{flow.tags.length - 3}
                  </span>
                )}
              </div>

              {/* 统计信息 */}
              <div className="flex items-center justify-between text-sm mb-4">
                <div className="flex items-center gap-1 text-white/60">
                  <Download className="w-4 h-4" />
                  <span>{flow.metadata.downloads.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-1 text-white/60">
                  <DollarSign className="w-4 h-4" />
                  <span>{flow.metadata.price === 0 ? '免费' : `$${flow.metadata.price}/次`}</span>
                </div>
              </div>

              {/* 作者信息 */}
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 rounded-full bg-gradient-accent flex items-center justify-center">
                  <span className="text-white text-xs font-bold">{flow.author[0]}</span>
                </div>
                <span className="text-white/60 text-sm">{flow.author}</span>
              </div>

              {/* 操作按钮 */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleInstall(flow.id)}
                  className="flex-1 py-2 bg-gradient-primary rounded-xl text-white font-medium hover:shadow-glow transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <Play className="w-4 h-4" />
                  安装
                </button>
                <button
                  onClick={() => handlePreview(flow.id)}
                  className="px-3 py-2 bg-white/10 rounded-xl text-white/70 hover:bg-white/20 transition-all duration-200"
                  title="预览"
                >
                  <Eye className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleCopy(flow.id)}
                  className="px-3 py-2 bg-white/10 rounded-xl text-white/70 hover:bg-white/20 transition-all duration-200"
                  title="复制"
                >
                  <Copy className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* 空状态 */}
        {filteredFlows.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <Workflow className="w-16 h-16 text-white/20 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">未找到相关 Flows</h3>
            <p className="text-white/60">尝试调整搜索条件或选择其他分类</p>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}