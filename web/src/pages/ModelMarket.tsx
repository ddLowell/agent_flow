import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Database, 
  Zap, 
  Search,
  Filter,
  Brain,
  Eye,
  Mic,
  CheckCircle,
  Info
} from 'lucide-react'
import { cn } from '../utils/helpers'
import { Model } from '../types'

export const ModelMarket: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedProvider, setSelectedProvider] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')

  const categories = [
    { id: 'all', label: '全部', icon: Database },
    { id: 'llm', label: '大语言模型', icon: Brain },
    { id: 'embedding', label: '嵌入模型', icon: Zap },
    { id: 'vision', label: '视觉模型', icon: Eye },
    { id: 'audio', label: '音频模型', icon: Mic },
  ]

  const providers = [
    { id: 'all', label: '全部供应商' },
    { id: 'openai', label: 'OpenAI' },
    { id: 'anthropic', label: 'Anthropic' },
    { id: 'google', label: 'Google' },
    { id: 'meta', label: 'Meta' },
    { id: 'open-source', label: '开源' },
  ]

  // 模拟数据
  const models: Model[] = [
    {
      id: '1',
      name: 'GPT-4 Turbo',
      provider: 'openai',
      type: 'llm',
      capabilities: ['文本生成', '代码生成', '推理', '多模态'],
      pricing: {
        input: 0.01,
        output: 0.03,
        unit: '1K tokens'
      },
      status: 'active',
      description: '最强大的多模态 AI 模型，支持文本、图像和代码理解'
    },
    {
      id: '2',
      name: 'Claude 3.5 Sonnet',
      provider: 'anthropic',
      type: 'llm',
      capabilities: ['文本生成', '推理', '长文本', '安全'],
      pricing: {
        input: 0.003,
        output: 0.015,
        unit: '1K tokens'
      },
      status: 'active',
      description: '平衡性能和成本，适合大多数应用场景'
    },
    {
      id: '3',
      name: 'text-embedding-3-large',
      provider: 'openai',
      type: 'embedding',
      capabilities: ['文本嵌入', '相似度计算', '聚类'],
      pricing: {
        input: 0.00013,
        output: 0,
        unit: '1K tokens'
      },
      status: 'active',
      description: '高质量的文本嵌入模型，支持 3072 维向量'
    },
    {
      id: '4',
      name: 'GPT-4 Vision',
      provider: 'openai',
      type: 'vision',
      capabilities: ['图像理解', 'OCR', '视觉问答'],
      pricing: {
        input: 0.01,
        output: 0.03,
        unit: '1K tokens'
      },
      status: 'active',
      description: '强大的视觉理解能力，支持图像分析和描述'
    },
    {
      id: '5',
      name: 'Whisper Large V3',
      provider: 'open-source',
      type: 'audio',
      capabilities: ['语音识别', '翻译', '多语言'],
      pricing: {
        input: 0,
        output: 0,
        unit: '免费'
      },
      status: 'active',
      description: '开源的语音识别模型，支持 99 种语言'
    },
    {
      id: '6',
      name: 'Llama 3.1 70B',
      provider: 'meta',
      type: 'llm',
      capabilities: ['文本生成', '推理', '代码', '开源'],
      pricing: {
        input: 0,
        output: 0,
        unit: '免费'
      },
      status: 'active',
      description: 'Meta 最新开源的大语言模型，性能接近 GPT-4'
    },
  ]

  const filteredModels = models.filter(model => {
    const matchesCategory = selectedCategory === 'all' || model.type === selectedCategory
    const matchesProvider = selectedProvider === 'all' || model.provider === selectedProvider
    const matchesSearch = model.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        model.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        model.capabilities.some(cap => cap.toLowerCase().includes(searchTerm.toLowerCase()))
    return matchesCategory && matchesProvider && matchesSearch
  })

  const getCategoryIcon = (type: string) => {
    const categoryData = categories.find(c => c.id === type)
    return categoryData?.icon || Database
  }

  const getProviderColor = (provider: string) => {
    const colors: Record<string, string> = {
      'openai': 'bg-green-500/20 text-green-400 border-green-500/30',
      'anthropic': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      'google': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      'meta': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      'open-source': 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    }
    return colors[provider] || 'bg-white/10 text-white/70'
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
          <h1 className="text-3xl font-bold text-white mb-2">模型 Market</h1>
          <p className="text-white/60">发现和配置强大的 AI 模型</p>
        </div>

        {/* 搜索和筛选 */}
        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <input
              type="text"
              placeholder="搜索模型..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-primary-500 transition-all duration-200"
            />
          </div>
          <button className="px-6 py-3 bg-white/10 border border-white/20 rounded-xl text-white hover:bg-white/20 transition-all duration-200 flex items-center gap-2">
            <Filter className="w-5 h-5" />
            高级筛选
          </button>
        </div>

        {/* 分类和供应商筛选 */}
        <div className="flex gap-6 mb-8">
          {/* 分类筛选 */}
          <div className="flex-1">
            <h3 className="text-white/80 text-sm mb-3">模型类型</h3>
            <div className="flex gap-2 overflow-x-auto pb-2">
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
                  <category.icon className="w-4 h-4" />
                  {category.label}
                </motion.button>
              ))}
            </div>
          </div>

          {/* 供应商筛选 */}
          <div className="flex-1">
            <h3 className="text-white/80 text-sm mb-3">供应商</h3>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {providers.map((provider) => (
                <motion.button
                  key={provider.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2 }}
                  onClick={() => setSelectedProvider(provider.id)}
                  className={cn(
                    'px-4 py-2 rounded-xl whitespace-nowrap transition-all duration-200',
                    selectedProvider === provider.id
                      ? 'bg-gradient-accent text-white shadow-glow'
                      : 'bg-white/10 text-white/70 hover:bg-white/20'
                  )}
                >
                  {provider.label}
                </motion.button>
              ))}
            </div>
          </div>
        </div>

        {/* 模型列表 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredModels.map((model, index) => (
            <motion.div
              key={model.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="glass-effect rounded-2xl p-6 hover:shadow-glow transition-all duration-300 group"
            >
              {/* 模型图标和状态 */}
              <div className="flex items-start justify-between mb-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-primary flex items-center justify-center">
                  {React.createElement(getCategoryIcon(model.type), { className: "w-7 h-7 text-white" })}
                </div>
                <div className="flex items-center gap-2">
                  <div className={cn('px-2 py-1 rounded-lg text-xs font-medium border', getProviderColor(model.provider))}>
                    {model.provider}
                  </div>
                  {model.status === 'active' && (
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  )}
                </div>
              </div>

              {/* 模型信息 */}
              <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-primary-400 transition-colors">
                {model.name}
              </h3>
              <p className="text-white/70 text-sm mb-4 line-clamp-2">{model.description}</p>

              {/* 能力标签 */}
              <div className="flex flex-wrap gap-2 mb-4">
                {model.capabilities.map(capability => (
                  <span key={capability} className="px-2 py-1 bg-white/10 rounded-full text-xs text-white/70">
                    {capability}
                  </span>
                ))}
              </div>

              {/* 定价信息 */}
              <div className="p-4 bg-white/5 rounded-xl mb-4">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-white/60">输入</span>
                  <span className="text-white font-medium">
                    {model.pricing.input === 0 ? '免费' : `$${model.pricing.input}/${model.pricing.unit}`}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/60">输出</span>
                  <span className="text-white font-medium">
                    {model.pricing.output === 0 ? '免费' : `$${model.pricing.output}/${model.pricing.unit}`}
                  </span>
                </div>
              </div>

              {/* 操作按钮 */}
              <div className="flex gap-2">
                <button className="flex-1 py-2 bg-gradient-primary rounded-xl text-white font-medium hover:shadow-glow transition-all duration-200">
                  配置
                </button>
                <button className="px-3 py-2 bg-white/10 rounded-xl text-white/70 hover:bg-white/20 transition-all duration-200">
                  <Info className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* 空状态 */}
        {filteredModels.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <Database className="w-16 h-16 text-white/20 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">未找到相关模型</h3>
            <p className="text-white/60">尝试调整搜索条件或选择其他分类</p>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}