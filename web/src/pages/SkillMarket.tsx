import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Zap, 
  Star, 
  Download, 
  DollarSign,
  TrendingUp,
  Search,
  Filter,
  Code,
  MessageSquare,
  FileText,
  Image,
  CheckCircle,
  Info,
  Layers,
  Activity,
  Server,
  Trash2
} from 'lucide-react'
import { cn } from '../utils/helpers'
import { Skill } from '../types'

// 模拟 Skill 数据
const mockSkills: Skill[] = [
  {
    id: '1',
    name: '智能摘要生成',
    description: '基于 AI 的文档摘要生成，支持多语言和自定义长度，可处理长文本并提取关键信息',
    version: '1.2.0',
    author: 'AgentFlow Team',
    category: 'document',
    tags: ['文档', '摘要', 'AI', '多语言', 'NLP'],
    rating: 4.8,
    downloads: 12580,
    price: 0.01,
    status: 'published',
    installed: true,
    installDate: '2026-01-15',
    lastUsed: '2026-01-20',
    usageCount: 328,
    config: {
      systemPrompt: 'You are an expert document summarizer...',
      tools: ['summarize', 'extract_keywords'],
    }
  },
  {
    id: '2',
    name: '代码审查专家',
    description: '专业的代码质量检查和建议系统，支持多种编程语言和最佳实践检测',
    version: '2.1.0',
    author: 'CodeMaster',
    category: 'code',
    tags: ['代码', '审查', '质量', '最佳实践'],
    rating: 4.9,
    downloads: 8960,
    price: 0.02,
    status: 'published',
    installed: true,
    installDate: '2026-01-18',
    lastUsed: '2026-01-22',
    usageCount: 156,
    config: {
      systemPrompt: 'You are a code review expert...',
      tools: ['analyze_code', 'suggest_improvements'],
    }
  },
  {
    id: '3',
    name: '数据分析助手',
    description: '强大的数据分析和可视化能力，支持统计分析、图表生成和数据洞察',
    version: '1.5.0',
    author: 'DataAI',
    category: 'analysis',
    tags: ['数据', '分析', '可视化', '统计'],
    rating: 4.7,
    downloads: 6540,
    price: 0.015,
    status: 'published',
    installed: false,
    usageCount: 0,
    config: {
      systemPrompt: 'You are a data analysis expert...',
      tools: ['analyze_data', 'create_charts'],
    }
  },
  {
    id: '4',
    name: '多语言翻译',
    description: '支持 100+ 语言的高质量翻译，保留语境和专业术语准确性',
    version: '3.0.0',
    author: 'TranslatePro',
    category: 'text',
    tags: ['翻译', '多语言', 'AI', '实时'],
    rating: 4.6,
    downloads: 23450,
    price: 0.005,
    status: 'published',
    installed: true,
    installDate: '2026-01-10',
    lastUsed: '2026-01-19',
    usageCount: 892,
    config: {
      systemPrompt: 'You are a professional translator...',
      tools: ['translate', 'detect_language'],
    }
  },
  {
    id: '5',
    name: '图像识别分析',
    description: '先进的计算机视觉能力，支持物体检测、OCR、场景理解和图像描述',
    version: '1.8.0',
    author: 'VisionAI',
    category: 'vision',
    tags: ['视觉', '图像', 'OCR', '识别'],
    rating: 4.8,
    downloads: 11200,
    price: 0.025,
    status: 'published',
    installed: false,
    usageCount: 0,
    config: {
      systemPrompt: 'You are a computer vision expert...',
      tools: ['analyze_image', 'extract_text', 'detect_objects'],
    }
  },
  {
    id: '6',
    name: '智能客服助手',
    description: '企业级客服自动化解决方案，支持多轮对话和知识库检索',
    version: '2.3.0',
    author: 'ServiceBot',
    category: 'text',
    tags: ['客服', '对话', '自动化', '企业'],
    rating: 4.5,
    downloads: 15600,
    price: 0.03,
    status: 'published',
    installed: false,
    usageCount: 0,
    config: {
      systemPrompt: 'You are a customer service expert...',
      tools: ['answer_question', 'escalate_issue', 'search_knowledge'],
    }
  },
]

// 分类配置
const categories = [
  { id: 'all', label: '全部', icon: Layers },
  { id: 'text', label: '文本处理', icon: MessageSquare },
  { id: 'code', label: '代码处理', icon: Code },
  { id: 'analysis', label: '数据分析', icon: TrendingUp },
  { id: 'vision', label: '视觉处理', icon: Image },
  { id: 'document', label: '文档处理', icon: FileText },
]

// 获取分类
const getCategory = (categoryId: string) => {
  return categories.find(c => c.id === categoryId) || categories[0]
}

export const SkillMarket: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null)
  const [skills, setSkills] = useState<Skill[]>(mockSkills)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  // 筛选 Skills
  const filteredSkills = skills.filter(skill => {
    const matchesCategory = selectedCategory === 'all' || skill.category === selectedCategory
    const matchesSearch = skill.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        skill.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        skill.tags.some((tag: string) => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    return matchesCategory && matchesSearch
  })

  // 安装/卸载 Skill
  const toggleInstall = (skillId: string) => {
    setSkills(prev => prev.map(skill => {
      if (skill.id === skillId) {
        return {
          ...skill,
          installed: !skill.installed,
          installDate: !skill.installed ? new Date().toISOString().split('T')[0] : undefined
        }
      }
      return skill
    }))
  }

  // 获取状态颜色
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
      case 'draft': return 'bg-amber-500/20 text-amber-400 border-amber-500/30'
      case 'deprecated': return 'bg-rose-500/20 text-rose-400 border-rose-500/30'
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30'
    }
  }

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
          {/* 页面头部 - 科技感设计 */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500/20 to-purple-600/20 border border-violet-500/30 flex items-center justify-center">
                  <Zap className="w-8 h-8 text-violet-400" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-[#0a0a0f] animate-pulse" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white mb-1">
                  <span className="bg-gradient-to-r from-violet-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                    Skill Market
                  </span>
                </h1>
                <p className="text-slate-400 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-violet-500 animate-pulse" />
                  发现和安装强大的 AI Agent Skills
                  <span className="px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-400 text-xs border border-violet-500/20">
                    v2.0.0
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* 统计卡片 */}
          <div className="grid grid-cols-4 gap-4 mb-8">
            {[
              { label: '可用 Skills', value: skills.length, icon: Zap, color: 'violet' },
              { label: '已安装', value: skills.filter(s => s.installed).length, icon: CheckCircle, color: 'emerald' },
              { label: '总下载量', value: skills.reduce((acc, s) => acc + s.downloads, 0).toLocaleString(), icon: Download, color: 'blue' },
              { label: '平均评分', value: (skills.reduce((acc, s) => acc + s.rating, 0) / skills.length).toFixed(1), icon: Star, color: 'amber' },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="relative group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-violet-500/10 to-purple-500/10 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative p-5 rounded-xl bg-slate-900/50 border border-slate-800 hover:border-violet-500/30 transition-all">
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
                placeholder="搜索 Skills..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-slate-900/50 border border-slate-800 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/30 transition-all"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                <kbd className="px-2 py-1 rounded bg-slate-800 text-slate-400 text-xs">⌘K</kbd>
              </div>
            </div>
            <button className="px-5 py-3 bg-slate-900/50 border border-slate-800 rounded-xl text-slate-300 hover:text-white hover:border-violet-500/30 transition-all duration-200 flex items-center gap-2">
              <Filter className="w-5 h-5" />
              筛选
            </button>
            <div className="flex bg-slate-900/50 border border-slate-800 rounded-xl p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={cn(
                  'px-4 py-2 rounded-lg transition-all',
                  viewMode === 'grid' ? 'bg-violet-500/20 text-violet-400' : 'text-slate-400 hover:text-white'
                )}
              >
                网格
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={cn(
                  'px-4 py-2 rounded-lg transition-all',
                  viewMode === 'list' ? 'bg-violet-500/20 text-violet-400' : 'text-slate-400 hover:text-white'
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
                    ? 'bg-violet-500/10 text-violet-400 border-violet-500/30 shadow-lg shadow-violet-500/10'
                    : 'bg-slate-900/50 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
                )}
              >
                <category.icon className="w-4 h-4" />
                {category.label}
              </motion.button>
            ))}
          </div>

          {/* Skills 列表 */}
          <div className={cn(
            viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5'
              : 'flex flex-col gap-3'
          )}>
            <AnimatePresence>
              {filteredSkills.map((skill, index) => (
                <motion.div
                  key={skill.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  onClick={() => setSelectedSkill(skill)}
                  className={cn(
                    'group relative cursor-pointer',
                    viewMode === 'list' && 'flex items-center'
                  )}
                >
                  {/* 卡片光效背景 */}
                  <div className="absolute inset-0 bg-gradient-to-r from-violet-500/0 via-violet-500/5 to-purple-500/0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  <div className={cn(
                    'relative bg-slate-900/50 border border-slate-800 hover:border-violet-500/30 rounded-2xl overflow-hidden transition-all duration-300',
                    viewMode === 'grid' ? 'p-6' : 'p-4 flex-1 flex items-center gap-4',
                    skill.installed && 'border-emerald-500/20'
                  )}>
                    {/* 安装状态指示器 */}
                    {skill.installed && (
                      <div className="absolute top-4 right-4">
                        <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          <span className="text-xs text-emerald-400">已安装</span>
                        </div>
                      </div>
                    )}

                    {/* 图标 */}
                    <div className={cn(
                      'flex-shrink-0 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-600/20 border border-violet-500/20 flex items-center justify-center',
                      viewMode === 'grid' ? 'w-14 h-14 mb-4 text-3xl' : 'w-12 h-12 text-2xl'
                    )}>
                      {React.createElement(getCategory(skill.category).icon, { className: "w-6 h-6 text-violet-400" })}
                    </div>

                    {/* 内容 */}
                    <div className={viewMode === 'list' ? 'flex-1' : ''}>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-semibold text-white group-hover:text-violet-400 transition-colors">
                          {skill.name}
                        </h3>
                        <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 text-xs">
                          v{skill.version}
                        </span>
                      </div>
                      
                      <p className={cn(
                        'text-slate-400 text-sm mb-3',
                        viewMode === 'grid' && 'line-clamp-2'
                      )}>
                        {skill.description}
                      </p>

                      {/* 标签 */}
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {skill.tags.slice(0, 3).map((tag: string) => (
                          <span key={tag} className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 text-xs">
                            {tag}
                          </span>
                        ))}
                        {skill.tags.length > 3 && (
                          <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 text-xs">
                            +{skill.tags.length - 3}
                          </span>
                        )}
                      </div>

                      {/* 元信息 */}
                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        <div className="flex items-center gap-1.5">
                          <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                          <span className="text-white">{skill.rating}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Download className="w-3.5 h-3.5" />
                          <span>{skill.downloads.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <DollarSign className="w-3.5 h-3.5" />
                          <span>{skill.price === 0 ? '免费' : `$${skill.price}/次`}</span>
                        </div>
                        {skill.usageCount && skill.usageCount > 0 && (
                          <div className="flex items-center gap-1.5">
                            <Activity className="w-3.5 h-3.5" />
                            <span>{skill.usageCount} 次使用</span>
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
                          toggleInstall(skill.id)
                        }}
                        className={cn(
                          'flex-1 py-2 rounded-lg font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2',
                          skill.installed
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20'
                            : 'bg-violet-500/10 text-violet-400 border border-violet-500/20 hover:bg-violet-500/20'
                        )}
                      >
                        {skill.installed ? (
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
                          setSelectedSkill(skill)
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
          {filteredSkills.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-slate-900/50 border border-slate-800 flex items-center justify-center">
                <Zap className="w-12 h-12 text-slate-600" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">未找到相关 Skills</h3>
              <p className="text-slate-500">尝试调整搜索条件或选择其他分类</p>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* 详情弹窗 */}
      <AnimatePresence>
        {selectedSkill && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setSelectedSkill(null)}
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
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500/20 to-purple-600/20 border border-violet-500/30 flex items-center justify-center">
                      {React.createElement(getCategory(selectedSkill.category).icon, { className: "w-8 h-8 text-violet-400" })}
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h2 className="text-2xl font-bold text-white">{selectedSkill.name}</h2>
                        <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 text-sm">
                          v{selectedSkill.version}
                        </span>
                        <span className={cn('px-2 py-0.5 rounded-full text-xs border', getStatusColor(selectedSkill.status))}>
                          {selectedSkill.status === 'published' ? '已发布' : selectedSkill.status === 'draft' ? '草稿' : '已弃用'}
                        </span>
                      </div>
                      <p className="text-slate-400">{selectedSkill.description}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedSkill(null)}
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
                    <p className="text-white font-medium">{selectedSkill.author}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800">
                    <p className="text-slate-500 text-sm mb-1">分类</p>
                    <p className="text-white font-medium">{getCategory(selectedSkill.category).label}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800">
                    <p className="text-slate-500 text-sm mb-1">评分</p>
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                      <span className="text-white font-medium">{selectedSkill.rating}</span>
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800">
                    <p className="text-slate-500 text-sm mb-1">下载量</p>
                    <p className="text-white font-medium">{selectedSkill.downloads.toLocaleString()}</p>
                  </div>
                </div>

                {/* 标签 */}
                <div>
                  <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-violet-400" />
                    标签
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedSkill.tags.map((tag: string) => (
                      <span key={tag} className="px-3 py-1.5 rounded-lg bg-violet-500/10 text-violet-400 text-sm border border-violet-500/20">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* 配置信息 */}
                <div>
                  <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                    <Code className="w-4 h-4 text-violet-400" />
                    配置信息
                  </h3>
                  <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800">
                    <p className="text-slate-400 text-sm mb-2">可用工具</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedSkill.config?.tools?.map((tool: string) => (
                        <span key={tool} className="px-2 py-1 rounded bg-slate-800 text-slate-300 text-sm font-mono">
                          {tool}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 使用统计 */}
                {selectedSkill.installed && (
                  <div>
                    <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                      <Activity className="w-4 h-4 text-violet-400" />
                      使用统计
                    </h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800">
                        <p className="text-slate-500 text-sm mb-1">安装日期</p>
                        <p className="text-white font-medium">{selectedSkill.installDate}</p>
                      </div>
                      <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800">
                        <p className="text-slate-500 text-sm mb-1">最后使用</p>
                        <p className="text-white font-medium">{selectedSkill.lastUsed}</p>
                      </div>
                      <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800">
                        <p className="text-slate-500 text-sm mb-1">使用次数</p>
                        <p className="text-white font-medium">{selectedSkill.usageCount} 次</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* 定价 */}
                <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-500 text-sm mb-1">定价</p>
                      <p className="text-2xl font-bold text-white">
                        {selectedSkill.price === 0 ? '免费' : `$${selectedSkill.price}`}
                        <span className="text-sm text-slate-400 font-normal"> / 次调用</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-slate-500 text-sm mb-1">计费方式</p>
                      <p className="text-white">按调用次数计费</p>
                    </div>
                  </div>
                </div>

                {/* 操作按钮 */}
                <div className="flex gap-3 pt-4 border-t border-slate-800">
                  <button
                    onClick={() => {
                      toggleInstall(selectedSkill.id)
                      setSelectedSkill(null)
                    }}
                    className={cn(
                      'flex-1 py-3 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2',
                      selectedSkill.installed
                        ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20'
                        : 'bg-violet-500 text-white hover:bg-violet-600'
                    )}
                  >
                    {selectedSkill.installed ? (
                      <>
                        <Trash2 className="w-5 h-5" />
                        卸载 Skill
                      </>
                    ) : (
                      <>
                        <Download className="w-5 h-5" />
                        安装 Skill
                      </>
                    )}
                  </button>
                  {selectedSkill.installed && (
                    <button className="px-4 py-3 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors">
                      <Server className="w-5 h-5" />
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
