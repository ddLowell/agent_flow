import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Zap, 
  Save, 
  X, 
  Plus, 
  Trash2,
  Code,
  FileText,
  Settings,
  CheckCircle,
  AlertCircle,
  FileJson,
  Copy,
  Play,
  Terminal,
  Globe,
  Cpu,
  Sparkles,
  BookOpen,
  Wrench
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { cn } from '../utils/helpers'
import { Skill } from '../types'

// 接入方式配置
const integrationTypes = [
  {
    type: 'prompt',
    label: 'Prompt 模板',
    description: '通过系统提示词定义 Skill 行为和能力',
    icon: FileText,
    color: 'violet'
  },
  {
    type: 'function',
    label: 'Function Calling',
    description: '使用函数调用方式扩展 AI 能力',
    icon: Terminal,
    color: 'cyan'
  },
  {
    type: 'mcp',
    label: 'MCP Server',
    description: '通过 MCP 协议连接外部服务',
    icon: Globe,
    color: 'emerald'
  },
  {
    type: 'api',
    label: 'API 集成',
    description: '直接调用 REST API 或 GraphQL',
    icon: Cpu,
    color: 'amber'
  }
]



// 分类配置
const categories = [
  { id: 'text', label: '文本处理', icon: FileText },
  { id: 'code', label: '代码处理', icon: Code },
  { id: 'analysis', label: '数据分析', icon: Zap },
  { id: 'vision', label: '视觉处理', icon: Settings },
]

export const SkillCreate: React.FC = () => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<'basic' | 'config' | 'integration' | 'preview'>('basic')
  const [integrationType, setIntegrationType] = useState<string>('prompt')
  
  const [skill, setSkill] = useState<Partial<Skill>>({
    id: '',
    name: '',
    description: '',
    version: '1.0.0',
    author: 'Demo User',
    category: 'text',
    tags: [],
    rating: 0,
    downloads: 0,
    price: 0,
    status: 'draft',
    config: {
      systemPrompt: '',
      tools: [],
      examples: [],
      parameters: {}
    }
  })

  const [newTool, setNewTool] = useState('')
  const [newTag, setNewTag] = useState('')
  const [validationErrors, setValidationErrors] = useState<string[]>([])

  // 添加工具
  const addTool = () => {
    if (newTool.trim()) {
      setSkill(prev => ({
        ...prev,
        config: {
          ...prev.config,
          tools: [...(prev.config?.tools || []), { name: newTool.trim(), description: '' }]
        }
      }))
      setNewTool('')
    }
  }

  // 删除工具
  const removeTool = (index: number) => {
    setSkill(prev => ({
      ...prev,
      config: {
        ...prev.config,
        tools: prev.config?.tools?.filter((_, i) => i !== index) || []
      }
    }))
  }

  // 添加标签
  const addTag = () => {
    if (newTag.trim() && !skill.tags?.includes(newTag.trim())) {
      setSkill(prev => ({
        ...prev,
        tags: [...(prev.tags || []), newTag.trim()]
      }))
      setNewTag('')
    }
  }

  // 删除标签
  const removeTag = (index: number) => {
    setSkill(prev => ({
      ...prev,
      tags: prev.tags?.filter((_, i) => i !== index) || []
    }))
  }

  // 验证配置
  const validateConfig = () => {
    const errors: string[] = []
    if (!skill.name) errors.push('Skill 名称不能为空')
    if (!skill.description) errors.push('描述不能为空')
    if (!skill.config?.systemPrompt) errors.push('系统提示词不能为空')
    if (!skill.tags?.length) errors.push('至少需要添加一个标签')
    
    setValidationErrors(errors)
    return errors.length === 0
  }

  // 生成配置 JSON
  const generateJSON = () => {
    return JSON.stringify({
      skill_version: '1.0.0',
      skill: {
        name: skill.name,
        description: skill.description,
        version: skill.version,
        author: skill.author,
        category: skill.category,
        tags: skill.tags,
        price: skill.price,
        integration: {
          type: integrationType,
          config: skill.config
        }
      }
    }, null, 2)
  }

  // 复制到剪贴板
  const copyToClipboard = () => {
    navigator.clipboard.writeText(generateJSON())
  }

  const handleSave = () => {
    if (validateConfig()) {
      console.log('Saving skill:', skill)
      navigate('/skills/market')
    }
  }

  const tabs = [
    { id: 'basic', label: '基本信息', icon: FileText },
    { id: 'config', label: '能力配置', icon: Wrench },
    { id: 'integration', label: '接入方式', icon: Globe },
    { id: 'preview', label: '预览', icon: Sparkles }
  ]

  return (
    <div className="h-full overflow-y-auto bg-[#0a0a0f]">
      {/* 科技感背景 */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(139,92,246,0.03),transparent_50%)]" />
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(rgba(139,92,246,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.02) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }} />
      </div>

      <div className="relative z-10 p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* 页面头部 */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500/20 to-purple-600/20 border border-violet-500/30 flex items-center justify-center">
                  <Plus className="w-8 h-8 text-violet-400" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-[#0a0a0f] flex items-center justify-center">
                  <Zap className="w-3 h-3 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white mb-1">
                  <span className="bg-gradient-to-r from-violet-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                    创建 Skill
                  </span>
                </h1>
                <p className="text-slate-400 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-violet-500 animate-pulse" />
                  构建自定义 AI Agent 技能
                </p>
              </div>
            </div>
          </div>

          {/* Tab 导航 */}
          <div className="flex gap-2 mb-8 p-1 bg-slate-900/50 border border-slate-800 rounded-xl">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  'flex items-center gap-2 px-5 py-2.5 rounded-lg transition-all duration-200',
                  activeTab === tab.id
                    ? 'bg-violet-500/10 text-violet-400 border border-violet-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                )}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* 内容区域 */}
          <div className="max-w-4xl">
            {/* 基本信息 */}
            {activeTab === 'basic' && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800">
                  <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-violet-400" />
                    Skill 信息
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm text-slate-400">Skill 名称 *</label>
                      <input
                        type="text"
                        value={skill.name}
                        onChange={(e) => setSkill(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="my-awesome-skill"
                        className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/30 transition-all"
                      />
                      <p className="text-xs text-slate-500">使用有意义的名称，如：smart-summarizer</p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm text-slate-400">版本号 *</label>
                      <input
                        type="text"
                        value={skill.version}
                        onChange={(e) => setSkill(prev => ({ ...prev, version: e.target.value }))}
                        placeholder="1.0.0"
                        className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-violet-500/50 transition-all"
                      />
                    </div>

                    <div className="col-span-2 space-y-2">
                      <label className="text-sm text-slate-400">描述 *</label>
                      <textarea
                        value={skill.description}
                        onChange={(e) => setSkill(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="描述这个 Skill 的功能和用途..."
                        rows={3}
                        className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-violet-500/50 transition-all resize-none"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm text-slate-400">作者 *</label>
                      <input
                        type="text"
                        value={skill.author}
                        onChange={(e) => setSkill(prev => ({ ...prev, author: e.target.value }))}
                        placeholder="Your Name"
                        className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-violet-500/50 transition-all"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm text-slate-400">定价 (USD/次)</label>
                      <input
                        type="number"
                        value={skill.price}
                        onChange={(e) => setSkill(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                        placeholder="0"
                        min="0"
                        step="0.001"
                        className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-violet-500/50 transition-all"
                      />
                      <p className="text-xs text-slate-500">设为 0 表示免费</p>
                    </div>

                    <div className="col-span-2 space-y-2">
                      <label className="text-sm text-slate-400">分类</label>
                      <div className="grid grid-cols-4 gap-3">
                        {categories.map((category) => (
                          <button
                            key={category.id}
                            onClick={() => setSkill(prev => ({ ...prev, category: category.id as any }))}
                            className={cn(
                              'flex items-center gap-2 px-4 py-3 rounded-xl transition-all duration-200 border',
                              skill.category === category.id
                                ? 'bg-violet-500/10 text-violet-400 border-violet-500/30'
                                : 'bg-slate-800/50 text-slate-400 border-slate-700 hover:border-slate-600'
                            )}
                          >
                            <category.icon className="w-4 h-4" />
                            <span className="text-sm font-medium">{category.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="col-span-2 space-y-2">
                      <label className="text-sm text-slate-400">标签</label>
                      <div className="space-y-3">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={newTag}
                            onChange={(e) => setNewTag(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && addTag()}
                            placeholder="输入标签名称，按回车添加"
                            className="flex-1 px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-violet-500/50 transition-all"
                          />
                          <button
                            onClick={addTag}
                            className="px-4 py-3 bg-violet-500/10 text-violet-400 border border-violet-500/30 rounded-xl hover:bg-violet-500/20 transition-all"
                          >
                            <Plus className="w-5 h-5" />
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {skill.tags?.map((tag, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-2 px-3 py-1.5 bg-violet-500/10 text-violet-400 border border-violet-500/30 rounded-full"
                            >
                              <span>{tag}</span>
                              <button
                                onClick={() => removeTag(index)}
                                className="hover:text-rose-400 transition-colors"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* 能力配置 */}
            {activeTab === 'config' && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                {/* 系统提示词 */}
                <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-violet-400" />
                    系统提示词 *
                  </h3>
                  <textarea
                    value={skill.config?.systemPrompt || ''}
                    onChange={(e) => setSkill(prev => ({
                      ...prev,
                      config: { ...prev.config, systemPrompt: e.target.value }
                    }))}
                    placeholder="定义 AI Agent 的角色和行为...&#10;&#10;例如：&#10;You are an expert document summarizer. Your task is to..."
                    rows={8}
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-violet-500/50 transition-all resize-none font-mono text-sm"
                  />
                  <p className="text-xs text-slate-500 mt-2">
                    系统提示词定义了 Skill 的核心行为和知识边界
                  </p>
                </div>

                {/* 工具配置 */}
                <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                      <Wrench className="w-5 h-5 text-violet-400" />
                      可用工具
                      <span className="px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-400 text-sm">
                        {skill.config?.tools?.length || 0}
                      </span>
                    </h3>
                  </div>

                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newTool}
                        onChange={(e) => setNewTool(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && addTool()}
                        placeholder="输入工具名称"
                        className="flex-1 px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-violet-500/50 transition-all"
                      />
                      <button
                        onClick={addTool}
                        className="px-4 py-3 bg-violet-500/10 text-violet-400 border border-violet-500/30 rounded-xl hover:bg-violet-500/20 transition-all flex items-center gap-2"
                      >
                        <Plus className="w-5 h-5" />
                        添加工具
                      </button>
                    </div>

                    <div className="space-y-3">
                      {skill.config?.tools?.map((tool: any, index: number) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="p-4 rounded-xl bg-slate-800/30 border border-slate-700/50"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1 space-y-3">
                              <div className="flex items-center gap-3">
                                <span className="w-8 h-8 rounded-lg bg-violet-500/10 text-violet-400 text-sm flex items-center justify-center font-mono">
                                  {index + 1}
                                </span>
                                <input
                                  type="text"
                                  value={tool.name || tool}
                                  onChange={(e) => {
                                    const newTools = [...(skill.config?.tools || [])]
                                    newTools[index] = { ...tool, name: e.target.value }
                                    setSkill(prev => ({
                                      ...prev,
                                      config: { ...prev.config, tools: newTools }
                                    }))
                                  }}
                                  placeholder="工具名称"
                                  className="flex-1 px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-violet-500/50"
                                />
                              </div>
                              <input
                                type="text"
                                value={tool.description || ''}
                                onChange={(e) => {
                                  const newTools = [...(skill.config?.tools || [])]
                                  newTools[index] = { ...tool, description: e.target.value }
                                  setSkill(prev => ({
                                    ...prev,
                                    config: { ...prev.config, tools: newTools }
                                  }))
                                }}
                                placeholder="工具描述"
                                className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-violet-500/50"
                              />
                            </div>
                            <button
                              onClick={() => removeTool(index)}
                              className="ml-3 p-2 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </motion.div>
                      ))}

                      {(!skill.config?.tools || skill.config.tools.length === 0) && (
                        <div className="p-8 rounded-xl bg-slate-800/30 border border-slate-700/50 border-dashed text-center">
                          <Wrench className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                          <p className="text-slate-400 mb-4">还没有定义任何工具</p>
                          <button
                            onClick={addTool}
                            className="px-4 py-2 bg-violet-500/10 text-violet-400 border border-violet-500/30 rounded-lg hover:bg-violet-500/20 transition-all"
                          >
                            添加第一个工具
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* 接入方式 */}
            {activeTab === 'integration' && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-2 gap-4">
                  {integrationTypes.map((integration) => (
                    <button
                      key={integration.type}
                      onClick={() => setIntegrationType(integration.type)}
                      className={cn(
                        'p-5 rounded-xl border text-left transition-all duration-200',
                        integrationType === integration.type
                          ? `bg-${integration.color}-500/10 border-${integration.color}-500/30`
                          : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
                      )}
                    >
                      <integration.icon className={cn(
                        'w-8 h-8 mb-3',
                        integrationType === integration.type ? `text-${integration.color}-400` : 'text-slate-500'
                      )} />
                      <h4 className={cn(
                        'font-semibold mb-1',
                        integrationType === integration.type ? 'text-white' : 'text-slate-300'
                      )}>
                        {integration.label}
                      </h4>
                      <p className="text-sm text-slate-500">{integration.description}</p>
                    </button>
                  ))}
                </div>

                {/* 接入方式详情 */}
                <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-violet-400" />
                    接入说明
                  </h3>
                  
                  {integrationType === 'prompt' && (
                    <div className="space-y-4 text-slate-400">
                      <p>Prompt 模板是最简单的 Skill 接入方式，通过定义系统提示词来指导 AI 的行为。</p>
                      <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700">
                        <p className="text-sm font-mono text-violet-400 mb-2">使用示例：</p>
                        <pre className="text-sm text-slate-300 overflow-x-auto">
{`{
  "integration": {
    "type": "prompt",
    "config": {
      "systemPrompt": "You are an expert...",
      "temperature": 0.7,
      "maxTokens": 2000
    }
  }
}`}
                        </pre>
                      </div>
                    </div>
                  )}

                  {integrationType === 'function' && (
                    <div className="space-y-4 text-slate-400">
                      <p>Function Calling 允许 Skill 调用预定义的函数来扩展 AI 的能力。</p>
                      <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700">
                        <p className="text-sm font-mono text-cyan-400 mb-2">函数定义示例：</p>
                        <pre className="text-sm text-slate-300 overflow-x-auto">
{`{
  "integration": {
    "type": "function",
    "config": {
      "functions": [
        {
          "name": "get_weather",
          "description": "获取天气信息",
          "parameters": { ... }
        }
      ]
    }
  }
}`}
                        </pre>
                      </div>
                    </div>
                  )}

                  {integrationType === 'mcp' && (
                    <div className="space-y-4 text-slate-400">
                      <p>通过 MCP (Model Context Protocol) 协议连接外部服务，实现更强大的功能。</p>
                      <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700">
                        <p className="text-sm font-mono text-emerald-400 mb-2">MCP 配置示例：</p>
                        <pre className="text-sm text-slate-300 overflow-x-auto">
{`{
  "integration": {
    "type": "mcp",
    "config": {
      "server": "mcp-server-name",
      "transport": "stdio",
      "tools": ["tool1", "tool2"]
    }
  }
}`}
                        </pre>
                      </div>
                    </div>
                  )}

                  {integrationType === 'api' && (
                    <div className="space-y-4 text-slate-400">
                      <p>直接调用 REST API 或 GraphQL 端点，集成第三方服务。</p>
                      <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700">
                        <p className="text-sm font-mono text-amber-400 mb-2">API 配置示例：</p>
                        <pre className="text-sm text-slate-300 overflow-x-auto">
{`{
  "integration": {
    "type": "api",
    "config": {
      "endpoint": "https://api.example.com/v1",
      "method": "POST",
      "headers": { ... },
      "timeout": 30000
    }
  }
}`}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* 预览 */}
            {activeTab === 'preview' && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                {/* 验证结果 */}
                {validationErrors.length > 0 && (
                  <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30">
                    <div className="flex items-center gap-2 mb-3">
                      <AlertCircle className="w-5 h-5 text-rose-400" />
                      <h4 className="text-rose-400 font-medium">验证错误</h4>
                    </div>
                    <ul className="space-y-1">
                      {validationErrors.map((error, idx) => (
                        <li key={idx} className="text-rose-300 text-sm flex items-center gap-2">
                          <span className="w-1 h-1 rounded-full bg-rose-400" />
                          {error}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {validationErrors.length === 0 && skill.name && (
                  <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-emerald-400" />
                      <span className="text-emerald-400 font-medium">配置验证通过</span>
                    </div>
                  </div>
                )}

                {/* Skill 预览卡片 */}
                <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800">
                  <h3 className="text-lg font-semibold text-white mb-4">Skill 预览</h3>
                  <div className="p-6 rounded-xl bg-slate-800/50 border border-slate-700">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500/20 to-purple-600/20 border border-violet-500/30 flex items-center justify-center">
                          <Zap className="w-7 h-7 text-violet-400" />
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold text-white">{skill.name || 'Skill 名称'}</h4>
                          <p className="text-slate-400 text-sm">v{skill.version} • {skill.author}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-white">
                          {skill.price === 0 ? '免费' : `$${skill.price}`}
                        </p>
                        <p className="text-slate-500 text-sm">/ 次调用</p>
                      </div>
                    </div>
                    <p className="text-slate-400 mb-4">{skill.description || '描述这个 Skill 的功能...'}</p>
                    <div className="flex flex-wrap gap-2">
                      {skill.tags?.map((tag) => (
                        <span key={tag} className="px-3 py-1 rounded-full bg-violet-500/10 text-violet-400 text-sm border border-violet-500/20">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* JSON 预览 */}
                <div className="rounded-2xl bg-slate-900/50 border border-slate-800 overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 bg-slate-800/50 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <FileJson className="w-4 h-4 text-violet-400" />
                      <span className="text-sm text-slate-300">skill-config.json</span>
                    </div>
                    <button
                      onClick={copyToClipboard}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-700 text-slate-300 hover:text-white text-sm transition-colors"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      复制
                    </button>
                  </div>
                  <pre className="p-4 overflow-x-auto text-sm text-slate-300 font-mono">
                    {generateJSON()}
                  </pre>
                </div>

                {/* 操作按钮 */}
                <div className="flex gap-3">
                  <button
                    onClick={handleSave}
                    className="flex-1 py-3 bg-violet-500 text-white rounded-xl font-medium hover:bg-violet-600 transition-colors flex items-center justify-center gap-2"
                  >
                    <Save className="w-5 h-5" />
                    保存 Skill
                  </button>
                  <button
                    onClick={() => {
                      if (validateConfig()) {
                        alert('正在测试 Skill...')
                      }
                    }}
                    disabled={validationErrors.length > 0}
                    className="flex-1 py-3 bg-slate-800 text-slate-300 rounded-xl font-medium hover:bg-slate-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Play className="w-5 h-5" />
                    测试运行
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
