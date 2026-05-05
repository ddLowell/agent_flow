import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  ArrowLeft, 
  Play, 
  Edit, 
  Trash2, 
  MoreHorizontal,
  Clock,
  CheckCircle,
  XCircle,
  Settings,
  Zap,
  Code,
  Database,
  GitBranch,
  Repeat,
  Users,
  ChevronDown,
  ChevronRight,
  Plus
} from 'lucide-react'
import { cn, formatDate, getStatusColor } from '../../utils/helpers'
import { Flow, FlowStep } from '../../types'
import { useAppStore } from '../../store'

export const FlowDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const { setCurrentFlow } = useAppStore()
  const [flow, setFlow] = useState<Flow | null>(null)
  const [loading, setLoading] = useState(true)
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set())

  // 节点类型图标映射
  const getStepIcon = (type: string) => {
    const iconMap: Record<string, any> = {
      script: Code,
      mcp_server: Zap,
      agent_skill: Users,
      rag: Database,
      conditional: GitBranch,
      loop: Repeat,
      parallel: Users,
    }
    return iconMap[type] || Code
  }

  // 模拟数据加载
  useEffect(() => {
    const mockFlow: Flow = {
      id: id || '1',
      name: '文档处理流程',
      description: '自动化文档分析和摘要生成的智能流程，包含文档提取、内容分析、摘要生成等步骤',
      version: '1.0.0',
      status: 'published',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
      author: 'Demo User',
      tags: ['文档', '自动化', 'AI'],
      steps: [
        {
          id: 'step-1',
          name: '文档提取',
          type: 'script',
          description: '从指定URL提取文档内容',
          config: {
            script: 'python',
            timeout: 30,
            max_retries: 3,
          },
          inputs: {
            url: 'https://example.com/document.pdf',
            format: 'pdf',
          },
          outputs: {
            content: '提取的文档内容',
            metadata: '文档元数据',
          },
          status: 'completed',
          position: { x: 100, y: 100 },
        },
        {
          id: 'step-2',
          name: '内容分析',
          type: 'agent_skill',
          description: '使用AI模型分析文档内容',
          config: {
            skill: 'content-analyzer',
            model: 'gpt-4',
            temperature: 0.7,
          },
          inputs: {
            content: '${step-1.outputs.content}',
          },
          outputs: {
            analysis: '分析结果',
            keywords: '关键词提取',
            entities: '实体识别',
          },
          status: 'running',
          dependsOn: ['step-1'],
          position: { x: 400, y: 100 },
        },
        {
          id: 'step-3',
          name: '摘要生成',
          type: 'agent_skill',
          description: '生成文档摘要',
          config: {
            skill: 'summarizer',
            model: 'gpt-4',
            max_length: 500,
          },
          inputs: {
            analysis: '${step-2.outputs.analysis}',
            content: '${step-1.outputs.content}',
          },
          outputs: {
            summary: '文档摘要',
            key_points: '关键点',
          },
          status: 'pending',
          dependsOn: ['step-2'],
          position: { x: 700, y: 100 },
        },
        {
          id: 'step-4',
          name: '质量检查',
          type: 'conditional',
          description: '检查摘要质量是否符合要求',
          config: {
            condition: 'quality_score > 0.8',
            true_branch: 'step-5',
            false_branch: 'step-3',
          },
          inputs: {
            score: '${step-3.outputs.quality_score}',
          },
          outputs: {
            result: '检查结果',
            branch: '选择的分支',
          },
          status: 'pending',
          dependsOn: ['step-3'],
          position: { x: 1000, y: 100 },
        },
        {
          id: 'step-5',
          name: '结果保存',
          type: 'script',
          description: '保存最终结果到数据库',
          config: {
            script: 'python',
            database: 'postgres',
          },
          inputs: {
            summary: '${step-3.outputs.summary}',
            metadata: '${step-2.outputs.analysis}',
          },
          outputs: {
            id: '保存的记录ID',
            timestamp: '保存时间',
          },
          status: 'pending',
          dependsOn: ['step-4'],
          position: { x: 1300, y: 100 },
        },
      ],
      metadata: {
        total_executions: 156,
        success_rate: 94,
        avg_duration: 45.2,
        last_execution: new Date().toISOString(),
      },
    }
    setFlow(mockFlow)
    setCurrentFlow(mockFlow)
    setLoading(false)
  }, [id, setCurrentFlow])

  const toggleStepExpand = (stepId: string) => {
    setExpandedSteps((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(stepId)) {
        newSet.delete(stepId)
      } else {
        newSet.add(stepId)
      }
      return newSet
    })
  }

  const handleExecute = () => {
    console.log('Executing flow:', flow?.id)
    // TODO: 实现执行逻辑
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-white/60">加载中...</div>
      </div>
    )
  }

  if (!flow) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-white/60">Flow 不存在</div>
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
        <div className="flex items-center gap-4">
          <button className="p-2 rounded-lg bg-white/10 text-white/70 hover:bg-white/20 transition-all duration-200">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">{flow.name}</h1>
            <div className="flex items-center gap-3">
              <span className={cn('px-3 py-1 rounded-full text-sm font-medium', flow.status === 'published' ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400')}>
                {flow.status === 'published' ? '已发布' : '草稿'}
              </span>
              <span className="text-white/60 text-sm">v{flow.version}</span>
              <span className="text-white/60 text-sm">By {flow.author}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExecute}
            className="px-6 py-3 bg-gradient-primary rounded-xl text-white font-medium hover:shadow-glow transition-all duration-300 flex items-center gap-2"
          >
            <Play className="w-5 h-5" />
            执行 Flow
          </button>
          <button className="px-6 py-3 rounded-xl text-white font-medium bg-white/10 hover:bg-white/20 transition-all duration-300 flex items-center gap-2">
            <Edit className="w-5 h-5" />
            编辑
          </button>
          <button className="p-3 rounded-xl bg-white/10 text-white/70 hover:bg-white/20 transition-all duration-200">
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Flow 描述 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="glass-effect rounded-2xl p-6 mb-6"
      >
        <p className="text-white/80">{flow.description}</p>
        <div className="flex items-center gap-6 mt-4 pt-4 border-t border-white/10">
          <div className="flex items-center gap-2 text-white/60 text-sm">
            <Clock className="w-4 h-4" />
            更新于 {formatDate(flow.updatedAt)}
          </div>
          <div className="flex items-center gap-2 text-white/60 text-sm">
            <CheckCircle className="w-4 h-4" />
            成功率 {flow.metadata?.success_rate || 0}%
          </div>
          <div className="flex items-center gap-2 text-white/60 text-sm">
            <Play className="w-4 h-4" />
            执行次数 {flow.metadata?.total_executions || 0}
          </div>
        </div>
        <div className="flex items-center gap-2 mt-4">
          {flow.tags.map((tag) => (
            <span key={tag} className="px-3 py-1 rounded-full bg-white/10 text-white/80 text-sm">
              {tag}
            </span>
          ))}
        </div>
      </motion.div>

      {/* Steps 区域 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mb-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold text-white">Steps</h2>
          <button className="px-4 py-2 rounded-lg bg-white/10 text-white/70 hover:bg-white/20 transition-all duration-200 flex items-center gap-2">
            <Plus className="w-4 h-4" />
            添加 Step
          </button>
        </div>

        <div className="space-y-3">
          {flow.steps.map((step, index) => {
            const StepIcon = getStepIcon(step.type)
            const isExpanded = expandedSteps.has(step.id)

            return (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.3 + index * 0.1 }}
                className="glass-effect rounded-2xl overflow-hidden"
              >
                {/* Step 头部 */}
                <div className="p-6 cursor-pointer hover:bg-white/5 transition-all duration-200">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center text-white font-bold">
                          {index + 1}
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
                          <StepIcon className="w-6 h-6 text-white" />
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-white">{step.name}</h3>
                          <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', step.status === 'completed' ? 'bg-green-500/20 text-green-400' : step.status === 'running' ? 'bg-blue-500/20 text-blue-400' : step.status === 'failed' ? 'bg-red-500/20 text-red-400' : 'bg-gray-500/20 text-gray-400')}>
                            {step.status}
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-white/10 text-white/60 text-xs font-mono uppercase">
                            {step.type}
                          </span>
                        </div>
                        <p className="text-white/60 text-sm">{step.description}</p>
                        {step.dependsOn && step.dependsOn.length > 0 && (
                          <div className="flex items-center gap-2 mt-2 text-white/40 text-xs">
                            <span>依赖:</span>
                            {step.dependsOn.map((dep) => (
                              <span key={dep} className="px-2 py-0.5 rounded bg-white/10">
                                {dep}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => toggleStepExpand(step.id)}
                      className="p-2 rounded-lg bg-white/10 text-white/70 hover:bg-white/20 transition-all duration-200"
                    >
                      {isExpanded ? (
                        <ChevronDown className="w-5 h-5" />
                      ) : (
                        <ChevronRight className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Step 详情 */}
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="border-t border-white/10 p-6"
                  >
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* 配置信息 */}
                      <div>
                        <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                          <Settings className="w-4 h-4" />
                          配置
                        </h4>
                        <div className="bg-white/5 rounded-xl p-4">
                          <div className="space-y-2">
                            {Object.entries(step.config).map(([key, value]) => (
                              <div key={key} className="flex items-center justify-between text-sm">
                                <span className="text-white/60">{key}</span>
                                <span className="text-white font-mono text-xs">
                                  {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* 输入输出 */}
                      <div className="space-y-4">
                        <div>
                          <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                            <ArrowLeft className="w-4 h-4 rotate-180" />
                            输入
                          </h4>
                          <div className="bg-white/5 rounded-xl p-4">
                            <div className="space-y-2">
                              {Object.entries(step.inputs).map(([key, value]) => (
                                <div key={key} className="flex items-center justify-between text-sm">
                                  <span className="text-white/60">{key}</span>
                                  <span className="text-white/80 font-mono text-xs max-w-[200px] truncate">
                                    {typeof value === 'string' && value.startsWith('${') ? (
                                      <span className="text-blue-400">{value}</span>
                                    ) : (
                                      String(value)
                                    )}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                            <ArrowLeft className="w-4 h-4" />
                            输出
                          </h4>
                          <div className="bg-white/5 rounded-xl p-4">
                            <div className="space-y-2">
                              {Object.entries(step.outputs).map(([key, value]) => (
                                <div key={key} className="flex items-center justify-between text-sm">
                                  <span className="text-white/60">{key}</span>
                                  <span className="text-white/80 text-xs">{value}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 操作按钮 */}
                    <div className="flex items-center gap-3 mt-6 pt-4 border-t border-white/10">
                      <button className="px-4 py-2 rounded-lg bg-white/10 text-white/70 hover:bg-white/20 transition-all duration-200 flex items-center gap-2">
                        <Edit className="w-4 h-4" />
                        编辑
                      </button>
                      <button className="px-4 py-2 rounded-lg bg-white/10 text-white/70 hover:bg-white/20 transition-all duration-200 flex items-center gap-2">
                        <Play className="w-4 h-4" />
                        单独执行
                      </button>
                      <button className="px-4 py-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all duration-200 flex items-center gap-2">
                        <Trash2 className="w-4 h-4" />
                        删除
                      </button>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )
          })}
        </div>
      </motion.div>

      {/* 执行历史 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="glass-effect rounded-2xl p-6"
      >
        <h2 className="text-xl font-semibold text-white mb-4">执行历史</h2>
        <div className="space-y-3">
          {[
            { id: 'exec-1', status: 'completed', duration: '45s', date: '2分钟前' },
            { id: 'exec-2', status: 'completed', duration: '42s', date: '1小时前' },
            { id: 'exec-3', status: 'failed', duration: '15s', date: '2小时前' },
          ].map((exec) => (
            <div key={exec.id} className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-200">
              <div className="flex items-center gap-4">
                <div className={cn('w-3 h-3 rounded-full', exec.status === 'completed' ? 'bg-green-500' : 'bg-red-500')} />
                <div>
                  <p className="text-white font-medium">执行 #{exec.id}</p>
                  <p className="text-white/60 text-sm">{exec.date}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className={cn('px-2 py-1 rounded-full text-xs font-medium', exec.status === 'completed' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400')}>
                  {exec.status === 'completed' ? '成功' : '失败'}
                </span>
                <span className="text-white/60 text-sm">{exec.duration}</span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}

export default FlowDetail