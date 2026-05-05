import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Server,
  Plus,
  Trash2,
  Code,
  Terminal,
  Globe,
  Activity,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  Save,
  Play,
  Settings,
  FileJson,
  Shield,
  Copy,
  ExternalLink
} from 'lucide-react'
import { cn } from '../utils/helpers'
import { MCPServer, MCPTool, MCPTransport } from '../types/mcp'

// 传输类型配置
const transportTypes = [
  {
    type: 'stdio',
    label: 'STDIO',
    description: '通过标准输入输出进行通信，适合本地脚本',
    icon: Terminal,
    color: 'cyan'
  },
  {
    type: 'http',
    label: 'HTTP',
    description: '通过 HTTP API 进行通信，适合远程服务',
    icon: Globe,
    color: 'violet'
  },
  {
    type: 'sse',
    label: 'SSE',
    description: '通过 Server-Sent Events 进行实时通信',
    icon: Activity,
    color: 'pink'
  }
]

// 参数类型
const paramTypes = [
  { value: 'string', label: '字符串' },
  { value: 'integer', label: '整数' },
  { value: 'number', label: '浮点数' },
  { value: 'boolean', label: '布尔值' },
  { value: 'array', label: '数组' },
  { value: 'object', label: '对象' }
]

export const MCPCreate: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'basic' | 'transport' | 'tools' | 'preview'>('basic')
  const [serverConfig, setServerConfig] = useState<Partial<MCPServer>>({
    name: '',
    version: '1.0.0',
    description: '',
    author: '',
    license: 'MIT',
    tags: [],
    transport: {
      type: 'stdio',
      config: {}
    },
    tools: []
  })
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [showPreview, setShowPreview] = useState(false)

  // 添加工具
  const addTool = () => {
    const newTool: MCPTool = {
      name: '',
      description: '',
      parameters: {
        type: 'object',
        properties: {},
        required: []
      }
    }
    setServerConfig(prev => ({
      ...prev,
      tools: [...(prev.tools || []), newTool]
    }))
  }

  // 更新工具
  const updateTool = (index: number, updates: Partial<MCPTool>) => {
    setServerConfig(prev => ({
      ...prev,
      tools: prev.tools?.map((tool, i) => i === index ? { ...tool, ...updates } : tool) || []
    }))
  }

  // 删除工具
  const removeTool = (index: number) => {
    setServerConfig(prev => ({
      ...prev,
      tools: prev.tools?.filter((_, i) => i !== index) || []
    }))
  }

  // 添加参数
  const addParameter = (toolIndex: number) => {
    setServerConfig(prev => ({
      ...prev,
      tools: prev.tools?.map((tool, i) => {
        if (i === toolIndex) {
          const paramName = `param${Object.keys(tool.parameters.properties).length + 1}`
          return {
            ...tool,
            parameters: {
              ...tool.parameters,
              properties: {
                ...tool.parameters.properties,
                [paramName]: {
                  type: 'string',
                  description: ''
                }
              }
            }
          }
        }
        return tool
      }) || []
    }))
  }

  // 更新参数
  const updateParameter = (toolIndex: number, paramName: string, updates: any) => {
    setServerConfig(prev => ({
      ...prev,
      tools: prev.tools?.map((tool, i) => {
        if (i === toolIndex) {
          return {
            ...tool,
            parameters: {
              ...tool.parameters,
              properties: {
                ...tool.parameters.properties,
                [paramName]: {
                  ...tool.parameters.properties[paramName],
                  ...updates
                }
              }
            }
          }
        }
        return tool
      }) || []
    }))
  }

  // 删除参数
  const removeParameter = (toolIndex: number, paramName: string) => {
    setServerConfig(prev => ({
      ...prev,
      tools: prev.tools?.map((tool, i) => {
        if (i === toolIndex) {
          const { [paramName]: _, ...rest } = tool.parameters.properties
          return {
            ...tool,
            parameters: {
              ...tool.parameters,
              properties: rest,
              required: tool.parameters.required?.filter(p => p !== paramName) || []
            }
          }
        }
        return tool
      }) || []
    }))
  }

  // 切换必填
  const toggleRequired = (toolIndex: number, paramName: string) => {
    setServerConfig(prev => ({
      ...prev,
      tools: prev.tools?.map((tool, i) => {
        if (i === toolIndex) {
          const required = tool.parameters.required || []
          const isRequired = required.includes(paramName)
          return {
            ...tool,
            parameters: {
              ...tool.parameters,
              required: isRequired
                ? required.filter(p => p !== paramName)
                : [...required, paramName]
            }
          }
        }
        return tool
      }) || []
    }))
  }

  // 验证配置
  const validateConfig = () => {
    const errors: string[] = []
    if (!serverConfig.name) errors.push('服务器名称不能为空')
    if (!serverConfig.version) errors.push('版本号不能为空')
    if (!serverConfig.description) errors.push('描述不能为空')
    if (!serverConfig.author) errors.push('作者不能为空')
    if (!serverConfig.tools?.length) errors.push('至少需要定义一个工具')
    
    serverConfig.tools?.forEach((tool, index) => {
      if (!tool.name) errors.push(`工具 ${index + 1} 名称不能为空`)
      if (!tool.description) errors.push(`工具 ${index + 1} 描述不能为空`)
    })

    setValidationErrors(errors)
    return errors.length === 0
  }

  // 生成 JSON
  const generateJSON = () => {
    return JSON.stringify({
      mcp_version: '1.0.0',
      server: {
        name: serverConfig.name,
        version: serverConfig.version,
        description: serverConfig.description,
        author: serverConfig.author,
        license: serverConfig.license,
        tags: serverConfig.tags
      },
      transport: serverConfig.transport,
      tools: serverConfig.tools
    }, null, 2)
  }

  // 复制到剪贴板
  const copyToClipboard = () => {
    navigator.clipboard.writeText(generateJSON())
  }

  const tabs = [
    { id: 'basic', label: '基本信息', icon: Server },
    { id: 'transport', label: '传输配置', icon: Globe },
    { id: 'tools', label: '工具定义', icon: Code },
    { id: 'preview', label: '预览', icon: FileJson }
  ]

  return (
    <div className="h-full overflow-y-auto bg-[#0a0a0f]">
      {/* 科技感背景 */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(56,189,248,0.03),transparent_50%)]" />
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(rgba(56,189,248,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(56,189,248,0.02) 1px, transparent 1px)`,
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
                  <Server className="w-3 h-3 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white mb-1">
                  <span className="bg-gradient-to-r from-violet-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                    创建 MCP Server
                  </span>
                </h1>
                <p className="text-slate-400 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-violet-500 animate-pulse" />
                  定义新的 Model Context Protocol 服务器
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
                    <Server className="w-5 h-5 text-violet-400" />
                    服务器信息
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm text-slate-400">服务器名称 *</label>
                      <input
                        type="text"
                        value={serverConfig.name}
                        onChange={(e) => setServerConfig(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="my-mcp-server"
                        className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/30 transition-all"
                      />
                      <p className="text-xs text-slate-500">使用小写字母和连字符，如：weather-server</p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm text-slate-400">版本号 *</label>
                      <input
                        type="text"
                        value={serverConfig.version}
                        onChange={(e) => setServerConfig(prev => ({ ...prev, version: e.target.value }))}
                        placeholder="1.0.0"
                        className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-violet-500/50 transition-all"
                      />
                    </div>

                    <div className="col-span-2 space-y-2">
                      <label className="text-sm text-slate-400">描述 *</label>
                      <textarea
                        value={serverConfig.description}
                        onChange={(e) => setServerConfig(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="描述这个 MCP Server 的功能和用途..."
                        rows={3}
                        className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-violet-500/50 transition-all resize-none"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm text-slate-400">作者 *</label>
                      <input
                        type="text"
                        value={serverConfig.author}
                        onChange={(e) => setServerConfig(prev => ({ ...prev, author: e.target.value }))}
                        placeholder="Your Name"
                        className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-violet-500/50 transition-all"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm text-slate-400">许可证</label>
                      <select
                        value={serverConfig.license}
                        onChange={(e) => setServerConfig(prev => ({ ...prev, license: e.target.value }))}
                        className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-violet-500/50 transition-all"
                      >
                        <option value="MIT">MIT</option>
                        <option value="Apache-2.0">Apache-2.0</option>
                        <option value="GPL-3.0">GPL-3.0</option>
                        <option value="BSD-3-Clause">BSD-3-Clause</option>
                        <option value="Proprietary">Proprietary</option>
                      </select>
                    </div>

                    <div className="col-span-2 space-y-2">
                      <label className="text-sm text-slate-400">标签</label>
                      <input
                        type="text"
                        value={serverConfig.tags?.join(', ')}
                        onChange={(e) => setServerConfig(prev => ({ 
                          ...prev, 
                          tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean)
                        }))}
                        placeholder="weather, api, data (用逗号分隔)"
                        className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-violet-500/50 transition-all"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* 传输配置 */}
            {activeTab === 'transport' && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-3 gap-4">
                  {transportTypes.map((transport) => (
                    <button
                      key={transport.type}
                      onClick={() => setServerConfig(prev => ({
                        ...prev,
                        transport: { type: transport.type as any, config: {} }
                      }))}
                      className={cn(
                        'p-5 rounded-xl border text-left transition-all duration-200',
                        serverConfig.transport?.type === transport.type
                          ? `bg-${transport.color}-500/10 border-${transport.color}-500/30`
                          : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
                      )}
                    >
                      <transport.icon className={cn(
                        'w-8 h-8 mb-3',
                        serverConfig.transport?.type === transport.type ? `text-${transport.color}-400` : 'text-slate-500'
                      )} />
                      <h4 className={cn(
                        'font-semibold mb-1',
                        serverConfig.transport?.type === transport.type ? 'text-white' : 'text-slate-300'
                      )}>
                        {transport.label}
                      </h4>
                      <p className="text-sm text-slate-500">{transport.description}</p>
                    </button>
                  ))}
                </div>

                {/* STDIO 配置 */}
                {serverConfig.transport?.type === 'stdio' && (
                  <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800">
                    <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                      <Terminal className="w-5 h-5 text-cyan-400" />
                      STDIO 配置
                    </h3>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm text-slate-400">命令</label>
                        <input
                          type="text"
                          value={serverConfig.transport.config?.command || ''}
                          onChange={(e) => setServerConfig(prev => ({
                            ...prev,
                            transport: { ...prev.transport!, config: { ...prev.transport!.config, command: e.target.value } }
                          }))}
                          placeholder="python"
                          className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50 transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm text-slate-400">参数（每行一个）</label>
                        <textarea
                          value={(serverConfig.transport.config?.args || []).join('\n')}
                          onChange={(e) => setServerConfig(prev => ({
                            ...prev,
                            transport: { ...prev.transport!, config: { ...prev.transport!.config, args: e.target.value.split('\n').filter(Boolean) } }
                          }))}
                          placeholder="server.py&#10;--port&#10;8080"
                          rows={4}
                          className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50 transition-all resize-none font-mono text-sm"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* HTTP 配置 */}
                {serverConfig.transport?.type === 'http' && (
                  <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800">
                    <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                      <Globe className="w-5 h-5 text-violet-400" />
                      HTTP 配置
                    </h3>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm text-slate-400">基础 URL</label>
                        <input
                          type="text"
                          value={serverConfig.transport.config?.baseUrl || ''}
                          onChange={(e) => setServerConfig(prev => ({
                            ...prev,
                            transport: { ...prev.transport!, config: { ...prev.transport!.config, baseUrl: e.target.value } }
                          }))}
                          placeholder="https://api.example.com"
                          className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-violet-500/50 transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm text-slate-400">超时时间（毫秒）</label>
                        <input
                          type="number"
                          value={serverConfig.transport.config?.timeout || 30000}
                          onChange={(e) => setServerConfig(prev => ({
                            ...prev,
                            transport: { ...prev.transport!, config: { ...prev.transport!.config, timeout: parseInt(e.target.value) } }
                          }))}
                          className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-violet-500/50 transition-all"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* SSE 配置 */}
                {serverConfig.transport?.type === 'sse' && (
                  <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800">
                    <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                      <Activity className="w-5 h-5 text-pink-400" />
                      SSE 配置
                    </h3>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm text-slate-400">端点 URL</label>
                        <input
                          type="text"
                          value={serverConfig.transport.config?.endpoint || ''}
                          onChange={(e) => setServerConfig(prev => ({
                            ...prev,
                            transport: { ...prev.transport!, config: { ...prev.transport!.config, endpoint: e.target.value } }
                          }))}
                          placeholder="https://api.example.com/events"
                          className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-pink-500/50 transition-all"
                        />
                      </div>
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={serverConfig.transport.config?.reconnect || false}
                          onChange={(e) => setServerConfig(prev => ({
                            ...prev,
                            transport: { ...prev.transport!, config: { ...prev.transport!.config, reconnect: e.target.checked } }
                          }))}
                          className="w-5 h-5 rounded border-slate-700 bg-slate-800 text-pink-500 focus:ring-pink-500/30"
                        />
                        <label className="text-slate-300">自动重连</label>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* 工具定义 */}
            {activeTab === 'tools' && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Code className="w-5 h-5 text-violet-400" />
                    工具列表
                    <span className="px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-400 text-sm">
                      {serverConfig.tools?.length || 0}
                    </span>
                  </h3>
                  <button
                    onClick={addTool}
                    className="flex items-center gap-2 px-4 py-2 bg-violet-500/10 text-violet-400 border border-violet-500/30 rounded-lg hover:bg-violet-500/20 transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    添加工具
                  </button>
                </div>

                <div className="space-y-4">
                  {serverConfig.tools?.map((tool, toolIndex) => (
                    <motion.div
                      key={toolIndex}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <span className="w-8 h-8 rounded-lg bg-violet-500/10 text-violet-400 text-sm flex items-center justify-center font-mono">
                            {toolIndex + 1}
                          </span>
                          <h4 className="text-white font-medium">工具定义</h4>
                        </div>
                        <button
                          onClick={() => removeTool(toolIndex)}
                          className="p-2 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="space-y-2">
                          <label className="text-sm text-slate-400">工具名称 *</label>
                          <input
                            type="text"
                            value={tool.name}
                            onChange={(e) => updateTool(toolIndex, { name: e.target.value })}
                            placeholder="get_weather"
                            className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:border-violet-500/50 transition-all"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm text-slate-400">描述 *</label>
                          <input
                            type="text"
                            value={tool.description}
                            onChange={(e) => updateTool(toolIndex, { description: e.target.value })}
                            placeholder="获取天气信息"
                            className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:border-violet-500/50 transition-all"
                          />
                        </div>
                      </div>

                      {/* 参数列表 */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-sm text-slate-400">参数</label>
                          <button
                            onClick={() => addParameter(toolIndex)}
                            className="text-sm text-violet-400 hover:text-violet-300 flex items-center gap-1"
                          >
                            <Plus className="w-3 h-3" />
                            添加参数
                          </button>
                        </div>

                        {Object.entries(tool.parameters.properties).map(([paramName, param]) => (
                          <div key={paramName} className="p-4 rounded-xl bg-slate-800/30 border border-slate-700/50">
                            <div className="grid grid-cols-12 gap-3 items-start">
                              <div className="col-span-3 space-y-1">
                                <label className="text-xs text-slate-500">参数名</label>
                                <input
                                  type="text"
                                  value={paramName}
                                  readOnly
                                  className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white text-sm"
                                />
                              </div>
                              <div className="col-span-2 space-y-1">
                                <label className="text-xs text-slate-500">类型</label>
                                <select
                                  value={param.type}
                                  onChange={(e) => updateParameter(toolIndex, paramName, { type: e.target.value })}
                                  className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white text-sm"
                                >
                                  {paramTypes.map(t => (
                                    <option key={t.value} value={t.value}>{t.label}</option>
                                  ))}
                                </select>
                              </div>
                              <div className="col-span-5 space-y-1">
                                <label className="text-xs text-slate-500">描述</label>
                                <input
                                  type="text"
                                  value={param.description}
                                  onChange={(e) => updateParameter(toolIndex, paramName, { description: e.target.value })}
                                  placeholder="参数描述"
                                  className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white text-sm placeholder:text-slate-600"
                                />
                              </div>
                              <div className="col-span-1 pt-5">
                                <button
                                  onClick={() => toggleRequired(toolIndex, paramName)}
                                  className={cn(
                                    'w-full py-2 rounded-lg text-xs font-medium transition-colors',
                                    tool.parameters.required?.includes(paramName)
                                      ? 'bg-rose-500/20 text-rose-400'
                                      : 'bg-slate-700 text-slate-400'
                                  )}
                                  title={tool.parameters.required?.includes(paramName) ? '必填' : '可选'}
                                >
                                  {tool.parameters.required?.includes(paramName) ? '必填' : '可选'}
                                </button>
                              </div>
                              <div className="col-span-1 pt-5">
                                <button
                                  onClick={() => removeParameter(toolIndex, paramName)}
                                  className="w-full py-2 rounded-lg bg-slate-700 text-slate-400 hover:bg-rose-500/20 hover:text-rose-400 transition-colors"
                                >
                                  <Trash2 className="w-4 h-4 mx-auto" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}

                        {Object.keys(tool.parameters.properties).length === 0 && (
                          <div className="p-4 rounded-xl bg-slate-800/30 border border-slate-700/50 border-dashed text-center">
                            <p className="text-slate-500 text-sm">暂无参数，点击上方按钮添加</p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}

                  {(!serverConfig.tools || serverConfig.tools.length === 0) && (
                    <div className="p-12 rounded-2xl bg-slate-900/50 border border-slate-800 border-dashed text-center">
                      <Code className="w-12 h-12 text-slate-600 mx-auto mb-4" />
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

                {validationErrors.length === 0 && serverConfig.name && (
                  <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-emerald-400" />
                      <span className="text-emerald-400 font-medium">配置验证通过</span>
                    </div>
                  </div>
                )}

                {/* JSON 预览 */}
                <div className="rounded-2xl bg-slate-900/50 border border-slate-800 overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 bg-slate-800/50 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <FileJson className="w-4 h-4 text-violet-400" />
                      <span className="text-sm text-slate-300">mcp-server.json</span>
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
                    onClick={() => {
                      if (validateConfig()) {
                        // TODO: 保存到后端
                        alert('MCP Server 配置已保存！')
                      }
                    }}
                    className="flex-1 py-3 bg-violet-500 text-white rounded-xl font-medium hover:bg-violet-600 transition-colors flex items-center justify-center gap-2"
                  >
                    <Save className="w-5 h-5" />
                    保存配置
                  </button>
                  <button
                    onClick={() => {
                      if (validateConfig()) {
                        // TODO: 测试连接
                        alert('正在测试连接...')
                      }
                    }}
                    disabled={validationErrors.length > 0}
                    className="flex-1 py-3 bg-slate-800 text-slate-300 rounded-xl font-medium hover:bg-slate-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Play className="w-5 h-5" />
                    测试连接
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
