import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Server, 
  Zap, 
  Search,
  Filter,
  Database,
  Code,
  Globe,
  CheckCircle,
  Info,
  Download,
  Terminal,
  Box,
  Layers,
  Activity,
  Settings,
  Trash2,
  ExternalLink
} from 'lucide-react'
import { cn } from '../utils/helpers'
import { MCPServer } from '../types/mcp'

// 模拟 MCP Server 数据
const mockMCPServers: MCPServer[] = [
  {
    id: '1',
    name: 'weather-server',
    version: '1.0.0',
    description: '提供全球城市天气查询和预报服务，支持实时天气、3天预报和空气质量指数查询',
    author: 'AgentFlow Team',
    license: 'MIT',
    homepage: 'https://github.com/agentflow/mcp-weather',
    repository: 'https://github.com/agentflow/mcp-weather.git',
    tags: ['weather', 'forecast', 'location'],
    icon: '🌤️',
    transport: {
      type: 'stdio',
      config: {
        command: 'python',
        args: ['weather_server.py']
      }
    },
    tools: [
      {
        name: 'get_weather',
        description: '获取指定城市的当前天气信息',
        parameters: {
          type: 'object',
          properties: {
            city: { type: 'string', description: '城市名称' },
            unit: { type: 'string', description: '温度单位', enum: ['celsius', 'fahrenheit'] }
          },
          required: ['city']
        }
      },
      {
        name: 'get_forecast',
        description: '获取指定城市未来 3 天的天气预报',
        parameters: {
          type: 'object',
          properties: {
            city: { type: 'string', description: '城市名称' },
            unit: { type: 'string', description: '温度单位' }
          },
          required: ['city']
        }
      },
      {
        name: 'get_air_quality',
        description: '获取指定城市的空气质量指数 (AQI)',
        parameters: {
          type: 'object',
          properties: {
            city: { type: 'string', description: '城市名称' }
          },
          required: ['city']
        }
      }
    ],
    status: 'active',
    installed: true,
    installDate: '2026-01-15',
    lastUsed: '2026-01-20',
    usageCount: 128
  },
  {
    id: '2',
    name: 'search-server',
    version: '1.0.0',
    description: '提供网络搜索、新闻查询和知识图谱检索服务，支持多语言和实时新闻',
    author: 'AgentFlow Team',
    license: 'MIT',
    homepage: 'https://github.com/agentflow/mcp-search',
    repository: 'https://github.com/agentflow/mcp-search.git',
    tags: ['search', 'web', 'news', 'knowledge'],
    icon: '🔍',
    transport: {
      type: 'http',
      config: {
        baseUrl: 'https://api.search.example.com/v1',
        timeout: 30000
      }
    },
    tools: [
      {
        name: 'web_search',
        description: '执行网络搜索，返回相关网页结果',
        parameters: {
          type: 'object',
          properties: {
            query: { type: 'string', description: '搜索关键词' },
            limit: { type: 'integer', description: '返回结果数量' },
            language: { type: 'string', description: '搜索结果语言' }
          },
          required: ['query']
        }
      },
      {
        name: 'news_search',
        description: '搜索最新新闻资讯',
        parameters: {
          type: 'object',
          properties: {
            query: { type: 'string', description: '新闻搜索关键词' },
            days: { type: 'integer', description: '搜索最近几天的新闻' }
          },
          required: ['query']
        }
      },
      {
        name: 'knowledge_graph',
        description: '查询知识图谱获取实体信息',
        parameters: {
          type: 'object',
          properties: {
            entity: { type: 'string', description: '要查询的实体名称' },
            type: { type: 'string', description: '实体类型' }
          },
          required: ['entity']
        }
      }
    ],
    status: 'active',
    installed: true,
    installDate: '2026-01-18',
    lastUsed: '2026-01-22',
    usageCount: 256
  },
  {
    id: '3',
    name: 'database-server',
    version: '1.0.0',
    description: '提供数据库查询、数据操作和 Schema 管理服务，支持 SQL 查询和数据分析',
    author: 'AgentFlow Team',
    license: 'MIT',
    homepage: 'https://github.com/agentflow/mcp-database',
    repository: 'https://github.com/agentflow/mcp-database.git',
    tags: ['database', 'sql', 'query', 'data'],
    icon: '🗄️',
    transport: {
      type: 'stdio',
      config: {
        command: 'python',
        args: ['db_server.py']
      }
    },
    tools: [
      {
        name: 'execute_query',
        description: '执行 SQL 查询语句（SELECT 操作）',
        parameters: {
          type: 'object',
          properties: {
            query: { type: 'string', description: 'SQL SELECT 查询语句' },
            limit: { type: 'integer', description: '最大返回行数' }
          },
          required: ['query']
        }
      },
      {
        name: 'execute_command',
        description: '执行 SQL 命令（INSERT, UPDATE, DELETE 操作）',
        parameters: {
          type: 'object',
          properties: {
            command: { type: 'string', description: 'SQL 命令语句' }
          },
          required: ['command']
        }
      },
      {
        name: 'get_schema',
        description: '获取数据库表结构信息',
        parameters: {
          type: 'object',
          properties: {
            table: { type: 'string', description: '表名' }
          }
        }
      }
    ],
    status: 'active',
    installed: false,
    usageCount: 0
  },
  {
    id: '4',
    name: 'file-system-server',
    version: '1.0.0',
    description: '提供文件系统操作、文件读写和目录管理服务，支持安全的文件访问控制',
    author: 'AgentFlow Team',
    license: 'MIT',
    homepage: 'https://github.com/agentflow/mcp-filesystem',
    repository: 'https://github.com/agentflow/mcp-filesystem.git',
    tags: ['filesystem', 'file', 'directory', 'io'],
    icon: '📁',
    transport: {
      type: 'stdio',
      config: {
        command: 'python',
        args: ['fs_server.py']
      }
    },
    tools: [
      {
        name: 'read_file',
        description: '读取文件内容',
        parameters: {
          type: 'object',
          properties: {
            path: { type: 'string', description: '文件路径' },
            encoding: { type: 'string', description: '文件编码' }
          },
          required: ['path']
        }
      },
      {
        name: 'write_file',
        description: '写入文件内容',
        parameters: {
          type: 'object',
          properties: {
            path: { type: 'string', description: '文件路径' },
            content: { type: 'string', description: '文件内容' }
          },
          required: ['path', 'content']
        }
      },
      {
        name: 'list_directory',
        description: '列出目录内容',
        parameters: {
          type: 'object',
          properties: {
            path: { type: 'string', description: '目录路径' },
            recursive: { type: 'boolean', description: '是否递归列出子目录' }
          },
          required: ['path']
        }
      }
    ],
    status: 'inactive',
    installed: true,
    installDate: '2026-01-10',
    lastUsed: '2026-01-19',
    usageCount: 89
  },
  {
    id: '5',
    name: 'code-executor-server',
    version: '1.0.0',
    description: '提供安全的代码执行环境，支持 Python、JavaScript 和 Shell 脚本',
    author: 'AgentFlow Team',
    license: 'MIT',
    homepage: 'https://github.com/agentflow/mcp-code-executor',
    repository: 'https://github.com/agentflow/mcp-code-executor.git',
    tags: ['code', 'execution', 'python', 'javascript', 'sandbox'],
    icon: '💻',
    transport: {
      type: 'stdio',
      config: {
        command: 'python',
        args: ['executor_server.py']
      }
    },
    tools: [
      {
        name: 'execute_python',
        description: '在沙箱环境中执行 Python 代码',
        parameters: {
          type: 'object',
          properties: {
            code: { type: 'string', description: 'Python 代码' },
            timeout: { type: 'integer', description: '执行超时时间（秒）' }
          },
          required: ['code']
        }
      },
      {
        name: 'execute_javascript',
        description: '在沙箱环境中执行 JavaScript 代码',
        parameters: {
          type: 'object',
          properties: {
            code: { type: 'string', description: 'JavaScript 代码' }
          },
          required: ['code']
        }
      },
      {
        name: 'analyze_code',
        description: '分析代码质量和安全性',
        parameters: {
          type: 'object',
          properties: {
            code: { type: 'string', description: '要分析的代码' },
            language: { type: 'string', description: '编程语言' }
          },
          required: ['code', 'language']
        }
      }
    ],
    status: 'active',
    installed: false,
    usageCount: 0
  }
]

// 分类配置
const categories = [
  { id: 'all', label: '全部', icon: Layers },
  { id: 'data', label: '数据服务', icon: Database },
  { id: 'search', label: '搜索查询', icon: Search },
  { id: 'utility', label: '工具服务', icon: Box },
  { id: 'execution', label: '代码执行', icon: Terminal },
]

// 传输类型图标
const transportIcons = {
  stdio: Terminal,
  http: Globe,
  sse: Activity
}

// 获取分类
const getCategory = (tags: string[]) => {
  if (tags.includes('database') || tags.includes('file')) return 'data'
  if (tags.includes('search') || tags.includes('web')) return 'search'
  if (tags.includes('code') || tags.includes('execution')) return 'execution'
  return 'utility'
}

export const MCPMarket: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedServer, setSelectedServer] = useState<MCPServer | null>(null)
  const [servers, setServers] = useState<MCPServer[]>(mockMCPServers)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  // 筛选服务器
  const filteredServers = servers.filter(server => {
    const matchesCategory = selectedCategory === 'all' || getCategory(server.tags) === selectedCategory
    const matchesSearch = server.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        server.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        server.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    return matchesCategory && matchesSearch
  })

  // 安装/卸载服务器
  const toggleInstall = (serverId: string) => {
    setServers(prev => prev.map(server => {
      if (server.id === serverId) {
        return {
          ...server,
          installed: !server.installed,
          installDate: !server.installed ? new Date().toISOString().split('T')[0] : undefined
        }
      }
      return server
    }))
  }

  // 获取状态颜色
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
      case 'inactive': return 'bg-amber-500/20 text-amber-400 border-amber-500/30'
      case 'error': return 'bg-rose-500/20 text-rose-400 border-rose-500/30'
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30'
    }
  }

  // 获取传输类型颜色
  const getTransportColor = (type: string) => {
    switch (type) {
      case 'stdio': return 'text-cyan-400 bg-cyan-500/10'
      case 'http': return 'text-violet-400 bg-violet-500/10'
      case 'sse': return 'text-pink-400 bg-pink-500/10'
      default: return 'text-slate-400 bg-slate-500/10'
    }
  }

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
          {/* 页面头部 - 科技感设计 */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 flex items-center justify-center">
                  <Server className="w-8 h-8 text-cyan-400" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-[#0a0a0f] animate-pulse" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white mb-1">
                  <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-violet-400 bg-clip-text text-transparent">
                    MCP Market
                  </span>
                </h1>
                <p className="text-slate-400 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
                  Model Context Protocol Server 市场
                  <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 text-xs border border-cyan-500/20">
                    v1.0.0
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* 统计卡片 */}
          <div className="grid grid-cols-4 gap-4 mb-8">
            {[
              { label: '可用服务器', value: servers.length, icon: Server, color: 'cyan' },
              { label: '已安装', value: servers.filter(s => s.installed).length, icon: CheckCircle, color: 'emerald' },
              { label: '总工具数', value: servers.reduce((acc, s) => acc + s.tools.length, 0), icon: Zap, color: 'violet' },
              { label: '活跃连接', value: servers.filter(s => s.status === 'active').length, icon: Activity, color: 'amber' },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="relative group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative p-5 rounded-xl bg-slate-900/50 border border-slate-800 hover:border-cyan-500/30 transition-all">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-500 text-sm">{stat.label}</p>
                      <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
                    </div>
                    <div className={`w-12 h-12 rounded-xl bg-${stat.color}-500/10 flex items-center justify-center`}>
                      <stat.icon className={`w-6 h-6 text-${stat.color}-400`} />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* 搜索和筛选 */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                type="text"
                placeholder="搜索 MCP Server..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-slate-900/50 border border-slate-800 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition-all"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                <kbd className="px-2 py-1 rounded bg-slate-800 text-slate-400 text-xs">⌘K</kbd>
              </div>
            </div>
            <button className="px-5 py-3 bg-slate-900/50 border border-slate-800 rounded-xl text-slate-300 hover:text-white hover:border-cyan-500/30 transition-all duration-200 flex items-center gap-2">
              <Filter className="w-5 h-5" />
              筛选
            </button>
            <div className="flex bg-slate-900/50 border border-slate-800 rounded-xl p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={cn(
                  'px-4 py-2 rounded-lg transition-all',
                  viewMode === 'grid' ? 'bg-cyan-500/20 text-cyan-400' : 'text-slate-400 hover:text-white'
                )}
              >
                网格
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={cn(
                  'px-4 py-2 rounded-lg transition-all',
                  viewMode === 'list' ? 'bg-cyan-500/20 text-cyan-400' : 'text-slate-400 hover:text-white'
                )}
              >
                列表
              </button>
            </div>
          </div>

          {/* 分类筛选 */}
          <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
            {categories.map((category) => (
              <motion.button
                key={category.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2 }}
                onClick={() => setSelectedCategory(category.id)}
                className={cn(
                  'flex items-center gap-2 px-5 py-2.5 rounded-xl whitespace-nowrap transition-all duration-200 border',
                  selectedCategory === category.id
                    ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30 shadow-lg shadow-cyan-500/10'
                    : 'bg-slate-900/50 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
                )}
              >
                <category.icon className="w-4 h-4" />
                {category.label}
              </motion.button>
            ))}
          </div>

          {/* 服务器列表 */}
          <div className={cn(
            viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5'
              : 'flex flex-col gap-3'
          )}>
            <AnimatePresence>
              {filteredServers.map((server, index) => (
                <motion.div
                  key={server.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  onClick={() => setSelectedServer(server)}
                  className={cn(
                    'group relative cursor-pointer',
                    viewMode === 'list' && 'flex items-center'
                  )}
                >
                  {/* 卡片光效背景 */}
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-cyan-500/5 to-blue-500/0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  <div className={cn(
                    'relative bg-slate-900/50 border border-slate-800 hover:border-cyan-500/30 rounded-2xl overflow-hidden transition-all duration-300',
                    viewMode === 'grid' ? 'p-6' : 'p-4 flex-1 flex items-center gap-4',
                    server.installed && 'border-emerald-500/20'
                  )}>
                    {/* 安装状态指示器 */}
                    {server.installed && (
                      <div className="absolute top-4 right-4">
                        <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          <span className="text-xs text-emerald-400">已安装</span>
                        </div>
                      </div>
                    )}

                    {/* 图标 */}
                    <div className={cn(
                      'flex-shrink-0 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/20 flex items-center justify-center',
                      viewMode === 'grid' ? 'w-14 h-14 mb-4 text-3xl' : 'w-12 h-12 text-2xl'
                    )}>
                      {server.icon || '🔌'}
                    </div>

                    {/* 内容 */}
                    <div className={viewMode === 'list' ? 'flex-1' : ''}>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-semibold text-white group-hover:text-cyan-400 transition-colors">
                          {server.name}
                        </h3>
                        <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 text-xs">
                          v{server.version}
                        </span>
                      </div>
                      
                      <p className={cn(
                        'text-slate-400 text-sm mb-3',
                        viewMode === 'grid' && 'line-clamp-2'
                      )}>
                        {server.description}
                      </p>

                      {/* 标签 */}
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {server.tags.slice(0, 3).map(tag => (
                          <span key={tag} className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 text-xs">
                            {tag}
                          </span>
                        ))}
                        {server.tags.length > 3 && (
                          <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 text-xs">
                            +{server.tags.length - 3}
                          </span>
                        )}
                      </div>

                      {/* 元信息 */}
                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        <div className="flex items-center gap-1.5">
                          {React.createElement(transportIcons[server.transport.type], { className: "w-3.5 h-3.5" })}
                          <span className={cn('px-1.5 py-0.5 rounded', getTransportColor(server.transport.type))}>
                            {server.transport.type.toUpperCase()}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Zap className="w-3.5 h-3.5" />
                          <span>{server.tools.length} 工具</span>
                        </div>
                        {server.usageCount > 0 && (
                          <div className="flex items-center gap-1.5">
                            <Activity className="w-3.5 h-3.5" />
                            <span>{server.usageCount} 次使用</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* 操作按钮 */}
                    <div className={cn(
                      'flex gap-2',
                      viewMode === 'grid' ? 'mt-4 pt-4 border-t border-slate-800' : 'ml-auto'
                    )}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleInstall(server.id)
                        }}
                        className={cn(
                          'flex-1 py-2 rounded-lg font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2',
                          server.installed
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20'
                            : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 hover:bg-cyan-500/20'
                        )}
                      >
                        {server.installed ? (
                          <>
                            <Trash2 className="w-4 h-4" />
                            卸载
                          </>
                        ) : (
                          <>
                            <Download className="w-4 h-4" />
                            安装
                          </>
                        )}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedServer(server)
                        }}
                        className="px-3 py-2 bg-slate-800 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-all"
                      >
                        <Info className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* 空状态 */}
          {filteredServers.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-slate-900/50 border border-slate-800 flex items-center justify-center">
                <Server className="w-12 h-12 text-slate-600" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">未找到相关服务器</h3>
              <p className="text-slate-500">尝试调整搜索条件或选择其他分类</p>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* 详情弹窗 */}
      <AnimatePresence>
        {selectedServer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setSelectedServer(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-3xl max-h-[85vh] overflow-y-auto bg-[#0f1117] border border-slate-800 rounded-2xl shadow-2xl"
            >
              {/* 弹窗头部 */}
              <div className="sticky top-0 z-10 bg-[#0f1117]/95 backdrop-blur border-b border-slate-800 p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 flex items-center justify-center text-4xl">
                      {selectedServer.icon || '🔌'}
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h2 className="text-2xl font-bold text-white">{selectedServer.name}</h2>
                        <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 text-sm">
                          v{selectedServer.version}
                        </span>
                        <span className={cn('px-2 py-0.5 rounded-full text-xs border', getStatusColor(selectedServer.status))}>
                          {selectedServer.status === 'active' ? '运行中' : selectedServer.status === 'inactive' ? '已停止' : '错误'}
                        </span>
                      </div>
                      <p className="text-slate-400">{selectedServer.description}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedServer(null)}
                    className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-colors"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* 弹窗内容 */}
              <div className="p-6 space-y-6">
                {/* 基本信息 */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800">
                    <p className="text-slate-500 text-sm mb-1">作者</p>
                    <p className="text-white font-medium">{selectedServer.author}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800">
                    <p className="text-slate-500 text-sm mb-1">许可证</p>
                    <p className="text-white font-medium">{selectedServer.license}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800">
                    <p className="text-slate-500 text-sm mb-1">传输类型</p>
                    <div className="flex items-center gap-2">
                      {React.createElement(transportIcons[selectedServer.transport.type], { className: "w-4 h-4 text-cyan-400" })}
                      <span className="text-white font-medium uppercase">{selectedServer.transport.type}</span>
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800">
                    <p className="text-slate-500 text-sm mb-1">工具数量</p>
                    <p className="text-white font-medium">{selectedServer.tools.length} 个</p>
                  </div>
                </div>

                {/* 标签 */}
                <div>
                  <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                    <Box className="w-4 h-4 text-cyan-400" />
                    标签
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedServer.tags.map(tag => (
                      <span key={tag} className="px-3 py-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 text-sm border border-cyan-500/20">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* 工具列表 */}
                <div>
                  <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-violet-400" />
                    可用工具
                  </h3>
                  <div className="space-y-3">
                    {selectedServer.tools.map((tool, idx) => (
                      <div key={tool.name} className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 hover:border-slate-700 transition-colors">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="w-6 h-6 rounded-lg bg-violet-500/10 text-violet-400 text-xs flex items-center justify-center font-mono">
                            {idx + 1}
                          </span>
                          <h4 className="text-white font-medium">{tool.name}</h4>
                        </div>
                        <p className="text-slate-400 text-sm mb-3">{tool.description}</p>
                        <div className="flex flex-wrap gap-2">
                          {tool.parameters.required?.map(param => (
                            <span key={param} className="px-2 py-1 rounded bg-rose-500/10 text-rose-400 text-xs">
                              {param} *
                            </span>
                          ))}
                          {Object.keys(tool.parameters.properties).filter(p => !tool.parameters.required?.includes(p)).map(param => (
                            <span key={param} className="px-2 py-1 rounded bg-slate-800 text-slate-400 text-xs">
                              {param}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 链接 */}
                <div className="flex gap-3">
                  {selectedServer.homepage && (
                    <a
                      href={selectedServer.homepage}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                      主页
                    </a>
                  )}
                  {selectedServer.repository && (
                    <a
                      href={selectedServer.repository}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
                    >
                      <Code className="w-4 h-4" />
                      源码
                    </a>
                  )}
                </div>

                {/* 操作按钮 */}
                <div className="flex gap-3 pt-4 border-t border-slate-800">
                  <button
                    onClick={() => {
                      toggleInstall(selectedServer.id)
                      setSelectedServer(null)
                    }}
                    className={cn(
                      'flex-1 py-3 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2',
                      selectedServer.installed
                        ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20'
                        : 'bg-cyan-500 text-white hover:bg-cyan-600'
                    )}
                  >
                    {selectedServer.installed ? (
                      <>
                        <Trash2 className="w-5 h-5" />
                        卸载服务器
                      </>
                    ) : (
                      <>
                        <Download className="w-5 h-5" />
                        安装服务器
                      </>
                    )}
                  </button>
                  {selectedServer.installed && (
                    <button className="px-4 py-3 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors">
                      <Settings className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
