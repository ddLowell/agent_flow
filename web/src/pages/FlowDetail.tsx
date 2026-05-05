import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Play, 
  Edit, 
  Trash2, 
  Settings, 
  Clock,
  Zap,
  Code,
  Database,
  GitBranch,
  ChevronRight,
  ChevronDown,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react'
import { cn, formatDate, getStatusColor } from '../utils/helpers'
import { Flow, FlowStep } from '../types'

export const FlowDetail: React.FC = () => {
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set())

  // 模拟 Flow 数据
  const flow: Flow = {
    id: '1',
    name: '文档处理流程',
    description: '自动化文档分析和摘要生成的智能流程',
    version: '1.0.0',
    status: 'published',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
    author: 'Demo User',
    tags: ['文档', '自动化', 'AI'],
    steps: [
      {
        id: 'step-1',
        name: '文本提取',
        type: 'script',
        description: '从输入文档中提取文本内容',
        config: { language: 'python', timeout: 30 },
        inputs: { document: 'input.pdf' },
        outputs: { text: 'extracted_text' },
        status: 'completed',
        position: { x: 100, y: 100 }
      },
      {
        id: 'step-2',
        name: 'AI 分析',
        type: 'agent_skill',
        description: '使用 AI 模型分析提取的文本',
        config: { model: 'gpt-4', temperature: 0.7 },
        inputs: { text: 'extracted_text' },
        outputs: { analysis: 'analysis_result' },
        status: 'completed',
        dependsOn: ['step-1'],
        position: { x: 300, y: 100 }
      },
      {
        id: 'step-3',
        name: '数据存储',
        type: 'mcp_server',
        description: '将分析结果存储到数据库',
        config: { database: 'postgres', table: 'analysis_results' },
        inputs: { result: 'analysis_result' },
        outputs: { success: 'stored_flag' },
        status: 'pending',
        dependsOn: ['step-2'],
        position: { x: 500, y: 100 }
      }
    ],
    metadata: { totalExecutions: 42, successRate: 0.95, avgDuration: 120 }
  }

  const toggleStep = (stepId: string) => {
    setExpandedSteps(prev => {
      const next = new Set(prev)
      if (next.has(stepId)) {
        next.delete(stepId)
      } else {
        next.add(stepId)
      }
      return next
    })
  }

  const getStepIcon = (type: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      script: <Code className="w-5 h-5" />,
      agent_skill: <Zap className="w-5 h-5" />,
      mcp_server: <Database className="w-5 h-5" />,
      conditional: <GitBranch className="w-5 h-5" />,
    }
    return iconMap[type] || <Zap className="w-5 h-5" />
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="h-full p-8 overflow-y-auto"
    >
      {/* 页面头部 */}
      <div className="glass-effect rounded-2xl p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-white">{flow.name}</h1>
              <span className={cn('px-3 py-1 rounded-full text-sm font-medium', flow.status === 'published' ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400')}>
                {flow.status === 'published' ? '已发布' : '草稿'}
              </span>
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-gradient-primary text-white">
                v{flow.version}
              </span>
            </div>
            <p className="text-white/70 mb-4">{flow.description}</p>
            
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-white/60 text-sm">
                <Clock className="w-4 h-4" />
                {formatDate(flow.updatedAt)}
              </div>
              <div className="flex items-center gap-2 text-white/60 text-sm">
                <span>作者: {flow.author}</span>
              </div>
              <div className="flex gap-2">
                {flow.tags.map(tag => (
                  <span key={tag} className="px-2 py-1 rounded-lg bg-white/10 text-white/80 text-xs">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button className="p-3 rounded-xl bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-all duration-200">
              <Play className="w-5 h-5" />
            </button>
            <button className="p-3 rounded-xl bg-white/10 text-white/70 hover:bg-white/20 transition-all duration-200">
              <Edit className="w-5 h-5" />
            </button>
            <button className="p-3 rounded-xl bg-white/10 text-white/70 hover:bg-white/20 transition-all duration-200">
              <Settings className="w-5 h-5" />
            </button>
            <button className="p-3 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all duration-200">
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 统计信息 */}
        <div className="grid grid-cols-4 gap-4 mt-6 pt-6 border-t border-white/10">
          {[
            { label: '总执行次数', value: flow.metadata.totalExecutions, icon: Play },
            { label: '成功率', value: `${(flow.metadata.successRate * 100).toFixed(1)}%`, icon: CheckCircle },
            { label: '平均时长', value: `${flow.metadata.avgDuration}s`, icon: Clock },
            { label: '步骤数', value: flow.steps.length, icon: Zap },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="text-center"
            >
              <div className="flex items-center justify-center gap-2 mb-2">
                <stat.icon className="w-4 h-4 text-primary-400" />
                <span className="text-white/60 text-sm">{stat.label}</span>
              </div>
              <div className="text-2xl font-bold text-white">{stat.value}</div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Flow 步骤 */}
      <div className="glass-effect rounded-2xl p-6">
        <h2 className="text-xl font-semibold text-white mb-6">流程步骤</h2>
        <div className="space-y-4">
          {flow.steps.map((step, index) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="border border-white/10 rounded-xl overflow-hidden"
            >
              {/* 步骤头部 */}
              <div
                onClick={() => toggleStep(step.id)}
                className="flex items-center gap-4 p-4 bg-white/5 hover:bg-white/10 transition-all duration-200 cursor-pointer"
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center">
                    {getStepIcon(step.type)}
                  </div>
                  <div>
                    <h3 className="text-white font-medium">{step.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-white/60 text-sm">{step.type}</span>
                      <div className={cn('w-2 h-2 rounded-full', getStatusColor(step.status))} />
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <span className={cn('px-3 py-1 rounded-full text-xs font-medium', step.status === 'completed' ? 'bg-green-500/20 text-green-400' : step.status === 'running' ? 'bg-blue-500/20 text-blue-400' : step.status === 'failed' ? 'bg-red-500/20 text-red-400' : 'bg-gray-500/20 text-gray-400')}>
                    {step.status === 'completed' ? '已完成' : step.status === 'running' ? '运行中' : step.status === 'failed' ? '失败' : '待执行'}
                  </span>
                  {expandedSteps.has(step.id) ? (
                    <ChevronDown className="w-5 h-5 text-white/60" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-white/60" />
                  )}
                </div>
              </div>

              {/* 步骤详情 */}
              {expandedSteps.has(step.id) && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  transition={{ duration: 0.3 }}
                  className="p-4 bg-black/20"
                >
                  {step.description && (
                    <div className="mb-4">
                      <h4 className="text-white/80 text-sm font-medium mb-2">描述</h4>
                      <p className="text-white/60 text-sm">{step.description}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <h4 className="text-white/80 text-sm font-medium mb-2">输入</h4>
                      <div className="space-y-1">
                        {Object.entries(step.inputs).map(([key, value]) => (
                          <div key={key} className="flex items-center gap-2 text-sm">
                            <span className="text-primary-400 font-medium">{key}:</span>
                            <span className="text-white/60">{String(value)}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-white/80 text-sm font-medium mb-2">输出</h4>
                      <div className="space-y-1">
                        {Object.entries(step.outputs).map(([key, value]) => (
                          <div key={key} className="flex items-center gap-2 text-sm">
                            <span className="text-accent-400 font-medium">{key}:</span>
                            <span className="text-white/60">{String(value)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-white/80 text-sm font-medium mb-2">配置</h4>
                    <div className="bg-black/30 rounded-lg p-3 font-mono text-sm text-white/70">
                      {JSON.stringify(step.config, null, 2)}
                    </div>
                  </div>

                  {step.dependsOn && step.dependsOn.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-white/80 text-sm font-medium mb-2">依赖步骤</h4>
                      <div className="flex gap-2">
                        {step.dependsOn.map(depId => (
                          <span key={depId} className="px-3 py-1 rounded-lg bg-white/10 text-white/80 text-sm">
                            {depId}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}
