import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Database, 
  Check, 
  X, 
  Save,
  Brain,
  Eye,
  MessageSquare,
  Image,
  Plus,
  Trash2
} from 'lucide-react'
import { cn } from '../utils/helpers'
import { Model } from '../types'

export const ModelCreate: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    provider: 'openai',
    type: 'llm',
    apiKey: '',
    capabilities: ['text-generation'],
    description: '',
  })

  const [loading, setLoading] = useState(false)

  const providers = [
    { id: 'openai', name: 'OpenAI', icon: Brain },
    { id: 'anthropic', name: 'Anthropic', icon: MessageSquare },
    { id: 'google', name: 'Google', icon: Eye },
  ]

  const modelTypes = [
    { id: 'llm', name: '语言模型', icon: Brain },
    { id: 'embedding', name: '嵌入模型', icon: Database },
    { id: 'vision', name: '视觉模型', icon: Image },
  ]

  const capabilities = [
    'text-generation',
    'code-generation',
    'embedding',
    'image-generation',
    'vision',
    'audio',
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    // TODO: 调用API保存模型
    console.log('Submitting model:', formData)
    
    setTimeout(() => {
      setLoading(false)
      alert('模型注册成功！')
    }, 1000)
  }

  const toggleCapability = (cap: string) => {
    setFormData(prev => ({
      ...prev,
      capabilities: prev.capabilities.includes(cap)
        ? prev.capabilities.filter(c => c !== cap)
        : [...prev.capabilities, cap]
    }))
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
          <h1 className="text-3xl font-bold text-white mb-2">注册新模型</h1>
          <p className="text-white/60">添加新的AI模型到模型库</p>
        </div>

        {/* 注册表单 */}
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 基本信息 */}
            <div className="glass-effect rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                <Database className="w-5 h-5" />
                基本信息
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">模型名称</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-primary-500 transition-all duration-200"
                    placeholder="例如: GPT-4 Turbo"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">描述</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-primary-500 transition-all duration-200"
                    placeholder="描述模型的功能和用途"
                    rows={3}
                  />
                </div>
              </div>
            </div>

            {/* 服务提供商 */}
            <div className="glass-effect rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                <Brain className="w-5 h-5" />
                服务提供商
              </h2>

              <div className="grid grid-cols-3 gap-4">
                {providers.map((provider) => (
                  <motion.button
                    key={provider.id}
                    type="button"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    onClick={() => setFormData(prev => ({ ...prev, provider: provider.id }))}
                    className={cn(
                      'flex flex-col items-center gap-3 p-6 rounded-xl border-2 transition-all duration-200',
                      formData.provider === provider.id
                        ? 'bg-gradient-primary border-primary-500 text-white'
                        : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                    )}
                  >
                    <provider.icon className="w-8 h-8" />
                    <span className="font-medium">{provider.name}</span>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* 模型类型 */}
            <div className="glass-effect rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                <Database className="w-5 h-5" />
                模型类型
              </h2>

              <div className="grid grid-cols-3 gap-4">
                {modelTypes.map((type) => (
                  <motion.button
                    key={type.id}
                    type="button"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    onClick={() => setFormData(prev => ({ ...prev, type: type.id as any }))}
                    className={cn(
                      'flex flex-col items-center gap-3 p-6 rounded-xl border-2 transition-all duration-200',
                      formData.type === type.id
                        ? 'bg-gradient-accent border-accent-500 text-white'
                        : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                    )}
                  >
                    <type.icon className="w-8 h-8" />
                    <span className="font-medium">{type.name}</span>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* 能力选择 */}
            <div className="glass-effect rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                <Zap className="w-5 h-5" />
                模型能力
              </h2>

              <div className="flex flex-wrap gap-3">
                {capabilities.map((cap) => (
                  <button
                    key={cap}
                    type="button"
                    onClick={() => toggleCapability(cap)}
                    className={cn(
                      'px-4 py-2 rounded-full border-2 transition-all duration-200 flex items-center gap-2',
                      formData.capabilities.includes(cap)
                        ? 'bg-primary-500/20 border-primary-500 text-primary-400'
                        : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                    )}
                  >
                    {formData.capabilities.includes(cap) && <Check className="w-4 h-4" />}
                    {cap}
                  </button>
                ))}
              </div>
            </div>

            {/* API 配置 */}
            <div className="glass-effect rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                <Settings className="w-5 h-5" />
                API 配置
              </h2>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">API Key</label>
                <input
                  type="password"
                  value={formData.apiKey}
                  onChange={(e) => setFormData(prev => ({ ...prev, apiKey: e.target.value }))}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-primary-500 transition-all duration-200"
                  placeholder="输入API密钥"
                  required
                />
              </div>
            </div>

            {/* 操作按钮 */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gradient-primary rounded-xl text-white font-medium hover:shadow-glow transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    注册中...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    注册模型
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => window.history.back()}
                className="px-6 py-4 bg-white/10 rounded-xl text-white font-medium hover:bg-white/20 transition-all duration-200"
              >
                取消
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  )
}